import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();
    const { name, email, phone, subject, message } = body;

    // Server-side validation
    if (!name || typeof name !== "string" || name.trim().length < 2 || name.trim().length > 100) {
      return new Response(JSON.stringify({ error: "Nom invalide" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(JSON.stringify({ error: "Email invalide" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!subject || typeof subject !== "string" || subject.trim().length < 2 || subject.trim().length > 200) {
      return new Response(JSON.stringify({ error: "Sujet invalide" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!message || typeof message !== "string" || message.trim().length < 10 || message.trim().length > 2000) {
      return new Response(JSON.stringify({ error: "Message invalide (10-2000 caractères)" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get client IP for rate limiting
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
               req.headers.get("cf-connecting-ip") || 
               "unknown";

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Rate limiting: max 5 messages per IP per hour
    if (ip !== "unknown") {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const { count, error: countError } = await supabase
        .from("contact_messages")
        .select("id", { count: "exact", head: true })
        .eq("ip_address", ip)
        .gte("created_at", oneHourAgo);

      if (!countError && count !== null && count >= 5) {
        console.warn(`[contact-form] Rate limit hit for IP: ${ip}`);
        return new Response(JSON.stringify({ error: "Trop de messages envoyés. Réessayez dans une heure." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const { error: insertError } = await supabase.from("contact_messages").insert({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim() || null,
      subject: subject.trim(),
      message: message.trim(),
      ip_address: ip !== "unknown" ? ip : null,
    });

    if (insertError) {
      console.error("[contact-form] Insert error:", insertError.message);
      return new Response(JSON.stringify({ error: "Service temporairement indisponible" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`[contact-form] Message saved from ${email.trim()}`);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[contact-form] Unexpected error:", err);
    return new Response(JSON.stringify({ error: "Service temporairement indisponible" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
