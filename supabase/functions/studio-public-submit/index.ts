import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

/**
 * Public endpoint to submit a problem/opportunity from /studio.
 * - Honeypot: rejects requests where `website` field is filled.
 * - Rate limit: 5 submissions per hour per IP, via public.check_ip_rate_limit.
 * - Stores via SECURITY DEFINER RPC (insert_studio_public_submission).
 */

interface SubmissionBody {
  contact_name: string;
  contact_email: string;
  problem_statement: string;
  contact_org?: string | null;
  contact_role?: string | null;
  domain?: string | null;
  context?: string | null;
  desired_outcome?: string | null;
  website?: string; // honeypot
}

function isEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

function clamp(s: string | null | undefined, max: number): string | null {
  if (s === null || s === undefined) return null;
  const t = String(s).trim();
  if (!t.length) return null;
  return t.slice(0, max);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let body: SubmissionBody;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Honeypot: silently accept (return success) so bots don't retry
  if (body.website && body.website.trim().length > 0) {
    return new Response(JSON.stringify({ ok: true }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Validation
  const name = clamp(body.contact_name, 200);
  const email = clamp(body.contact_email, 320);
  const problem = clamp(body.problem_statement, 5000);
  if (!name || !email || !problem) {
    return new Response(JSON.stringify({ error: "Champs requis manquants" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  if (!isEmail(email)) {
    return new Response(JSON.stringify({ error: "Email invalide" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  if (problem.length < 10) {
    return new Response(JSON.stringify({ error: "Décrivez la problématique en quelques phrases" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const ip = req.headers.get("cf-connecting-ip")
    || req.headers.get("x-real-ip")
    || (req.headers.get("x-forwarded-for") ?? "").split(",")[0]?.trim()
    || null;
  const userAgent = req.headers.get("user-agent")?.slice(0, 500) ?? null;

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const admin: any = createClient(supabaseUrl, serviceKey);

  // Rate limit: 5 / hour / IP
  if (ip) {
    try {
      const { data: rl } = await admin.rpc("check_ip_rate_limit", {
        p_bucket_key: `studio-public-submit:${ip}`,
        p_max_requests: 5,
        p_window_seconds: 3600,
      });
      if (rl && rl.allowed === false) {
        return new Response(JSON.stringify({
          error: "Trop de soumissions. Réessayez plus tard.",
          retry_after_seconds: rl.retry_after_seconds,
        }), {
          status: 429,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
            "Retry-After": String(rl.retry_after_seconds ?? 60),
          },
        });
      }
    } catch (e) {
      console.warn("[studio-public-submit] rate-limit check failed", e);
    }
  }

  try {
    const { data, error } = await admin.rpc("insert_studio_public_submission", {
      p_contact_name: name,
      p_contact_email: email,
      p_problem_statement: problem,
      p_contact_org: clamp(body.contact_org, 200),
      p_contact_role: clamp(body.contact_role, 200),
      p_domain: clamp(body.domain, 100),
      p_context: clamp(body.context, 5000),
      p_desired_outcome: clamp(body.desired_outcome, 2000),
      p_ip: ip,
      p_user_agent: userAgent,
    });
    if (error) throw error;
    return new Response(JSON.stringify({ ok: true, id: data }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("[studio-public-submit] insert failed", e);
    return new Response(JSON.stringify({ error: "Impossible d'enregistrer la soumission" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});