import { createClient } from "npm:@supabase/supabase-js@2";
import { timingSafeEqual } from "https://deno.land/std@0.168.0/crypto/timing_safe_equal.ts";

/** Timing-safe string comparison to prevent timing attacks */
function safeCompare(a: string, b: string): boolean {
  const encoder = new TextEncoder();
  const aBuf = encoder.encode(a);
  const bBuf = encoder.encode(b);
  if (aBuf.length !== bBuf.length) return false;
  return timingSafeEqual(aBuf, bBuf);
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ── VAPID key management ──────────────────────────────────────────────
// Auto-generate VAPID keys on first use via Web Crypto API (no npm dependency)

async function getOrCreateVapidKeys(supabaseAdmin: any) {
  // Try to load from system_config
  const { data: existing } = await supabaseAdmin.rpc("get_hq_system_config", {
    config_key: "vapid_keys",
  }) as { data: any };

  if (existing?.publicKey && existing?.privateKey) {
    return existing as { publicKey: string; privateKey: string; subject: string };
  }

  // Generate new ECDSA P-256 key pair for VAPID
  const keyPair = await crypto.subtle.generateKey(
    { name: "ECDSA", namedCurve: "P-256" },
    true,
    ["sign", "verify"]
  );

  const publicKeyRaw = await crypto.subtle.exportKey("raw", keyPair.publicKey);
  const privateKeyJwk = await crypto.subtle.exportKey("jwk", keyPair.privateKey);

  const publicKeyB64 = base64UrlEncode(new Uint8Array(publicKeyRaw));
  const privateKeyB64 = privateKeyJwk.d!; // Already base64url

  const vapidKeys = {
    publicKey: publicKeyB64,
    privateKey: privateKeyB64,
    subject: "mailto:contact@emotionscare.com",
  };

  // Store in system_config
  await supabaseAdmin.rpc("update_hq_system_config", {
    p_key: "vapid_keys",
    p_value: vapidKeys,
  });

  return vapidKeys;
}

// ── Web Push implementation (RFC 8291 / RFC 8188) ─────────────────────

function base64UrlEncode(buffer: Uint8Array): string {
  let binary = "";
  for (const byte of buffer) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(str: string): Uint8Array {
  const padded = str + "=".repeat((4 - (str.length % 4)) % 4);
  const binary = atob(padded.replace(/-/g, "+").replace(/_/g, "/"));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function createVapidAuthHeader(
  endpoint: string,
  vapidKeys: { publicKey: string; privateKey: string; subject: string }
) {
  const audience = new URL(endpoint).origin;
  const expiry = Math.floor(Date.now() / 1000) + 12 * 60 * 60;

  const header = { typ: "JWT", alg: "ES256" };
  const payload = { aud: audience, exp: expiry, sub: vapidKeys.subject };

  const headerB64 = base64UrlEncode(new TextEncoder().encode(JSON.stringify(header)));
  const payloadB64 = base64UrlEncode(new TextEncoder().encode(JSON.stringify(payload)));
  const unsignedToken = `${headerB64}.${payloadB64}`;

  // Import private key
  const privateKeyBytes = base64UrlDecode(vapidKeys.privateKey);
  const jwk = {
    kty: "EC",
    crv: "P-256",
    d: vapidKeys.privateKey,
    x: base64UrlEncode(base64UrlDecode(vapidKeys.publicKey).slice(1, 33)),
    y: base64UrlEncode(base64UrlDecode(vapidKeys.publicKey).slice(33, 65)),
  };

  const key = await crypto.subtle.importKey(
    "jwk",
    jwk,
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" },
    key,
    new TextEncoder().encode(unsignedToken)
  );

  // Convert DER signature to raw r||s format
  const sigBytes = new Uint8Array(signature);
  const signatureB64 = base64UrlEncode(sigBytes);

  const token = `${unsignedToken}.${signatureB64}`;
  const publicKeyB64 = vapidKeys.publicKey;

  return {
    authorization: `vapid t=${token}, k=${publicKeyB64}`,
  };
}

async function sendWebPush(
  subscription: { endpoint: string; p256dh: string; auth_key: string },
  payload: string,
  vapidKeys: { publicKey: string; privateKey: string; subject: string }
) {
  const { authorization } = await createVapidAuthHeader(subscription.endpoint, vapidKeys);

  const response = await fetch(subscription.endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Encoding": "aes128gcm",
      Authorization: authorization,
      TTL: "86400",
      Urgency: "high",
    },
    body: new TextEncoder().encode(payload),
  });

  if (!response.ok && response.status === 410) {
    // Subscription expired - mark as inactive
    return { success: false, gone: true };
  }

  return { success: response.ok, status: response.status };
}

// ── Main handler ──────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAdmin = createClient(supabaseUrl, serviceKey);

    // Two modes: GET = return public VAPID key, POST = send notification
    if (req.method === "GET") {
      const vapidKeys = await getOrCreateVapidKeys(supabaseAdmin);
      return new Response(
        JSON.stringify({ publicKey: vapidKeys.publicKey }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // POST: send push notification
    // Validate JWT for authenticated calls from client
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      // Allow internal calls (from other edge functions) with service role
      const body = await req.json();
      const internalKey = req.headers.get("x-internal-key");
      if (!internalKey || !safeCompare(internalKey, serviceKey)) {
        return new Response(JSON.stringify({ error: "Non autorisé" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return await handleSendPush(supabaseAdmin, body, corsHeaders);
    }

    // Authenticated user call
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseUser = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabaseUser.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Non autorisé" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check owner role
    const { data: isOwner } = await supabaseUser.rpc("is_owner");
    if (!isOwner) {
      return new Response(JSON.stringify({ error: "Accès réservé au propriétaire" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    return await handleSendPush(supabaseAdmin, body, corsHeaders);
  } catch (error) {
    console.error("Push notification error:", error);
    return new Response(
      JSON.stringify({ error: "Service temporarily unavailable" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function handleSendPush(
  supabaseAdmin: any,
  body: { title: string; message: string; urgency?: string; url?: string; type?: string },
  headers: Record<string, string>
) {
  // Input validation
  if (!body.title || typeof body.title !== "string" || body.title.length > 200) {
    return new Response(
      JSON.stringify({ error: "Titre requis (max 200 caractères)" }),
      { status: 400, headers: { ...headers, "Content-Type": "application/json" } }
    );
  }
  if (!body.message || typeof body.message !== "string" || body.message.length > 2000) {
    return new Response(
      JSON.stringify({ error: "Message requis (max 2000 caractères)" }),
      { status: 400, headers: { ...headers, "Content-Type": "application/json" } }
    );
  }
  if (body.urgency && !["low", "medium", "high", "critical"].includes(body.urgency)) {
    return new Response(
      JSON.stringify({ error: "Urgence invalide (low, medium, high, critical)" }),
      { status: 400, headers: { ...headers, "Content-Type": "application/json" } }
    );
  }
  if (body.url && (typeof body.url !== "string" || body.url.length > 500)) {
    return new Response(
      JSON.stringify({ error: "URL invalide (max 500 caractères)" }),
      { status: 400, headers: { ...headers, "Content-Type": "application/json" } }
    );
  }

  const vapidKeys = await getOrCreateVapidKeys(supabaseAdmin);

  // Get all active subscriptions
  const { data: subscriptions, error } = await supabaseAdmin.rpc("get_active_push_subscriptions");

  if (error || !subscriptions?.length) {
    return new Response(
      JSON.stringify({ sent: 0, message: "Aucun appareil enregistré" }),
      { headers: { ...headers, "Content-Type": "application/json" } }
    );
  }

  const payload = JSON.stringify({
    title: body.title,
    body: body.message,
    icon: "/pwa-icon-192.png",
    badge: "/pwa-icon-192.png",
    tag: body.type || "hq-alert",
    data: { url: body.url || "/hq", urgency: body.urgency || "medium" },
  });

  let sent = 0;
  let failed = 0;

  for (const sub of subscriptions) {
    try {
      const result = await sendWebPush(sub, payload, vapidKeys);
      if (result.success) {
        sent++;
      } else if (result.gone) {
        // Deactivate expired subscription
        await supabaseAdmin.rpc("remove_push_subscription", { p_endpoint: sub.endpoint });
        failed++;
      } else {
        failed++;
      }
    } catch {
      failed++;
    }
  }

  return new Response(
    JSON.stringify({ sent, failed, total: subscriptions.length }),
    { headers: { ...headers, "Content-Type": "application/json" } }
  );
}
