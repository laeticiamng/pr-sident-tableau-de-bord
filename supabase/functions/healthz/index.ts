// Edge function : /healthz
// Endpoint public de santé (sans auth) pour monitoring externe (UptimeRobot, etc.)
// Retourne : statut DB, statut breaker AI Gateway, version, timestamp.
import { createClient } from "npm:@supabase/supabase-js@2";
import { getBreakerSnapshot } from "../_shared/circuit-breaker.ts";
import { checkDbRateLimit, dbRateLimitResponse, getClientIp } from "../_shared/rate-limit-db.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

const VERSION = "h2.1.0";
const STARTED_AT = Date.now();

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Rate-limit IP : 60 req/min/IP pour empêcher scraping/DoS
  const ip = getClientIp(req);
  const rl = await checkDbRateLimit({
    bucketKey: `healthz:${ip}`,
    maxRequests: 60,
    windowSeconds: 60,
  });
  if (!rl.allowed) {
    return dbRateLimitResponse(rl, corsHeaders);
  }

  const checks: Record<string, { ok: boolean; latency_ms?: number; detail?: string }> = {};

  // 1) DB ping (lecture publique simple)
  const dbStart = Date.now();
  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    // Petite requête : count sur analytics_events (publique en INSERT, mais SELECT bloqué — on test juste l'API REST)
    const { error } = await client.from("analytics_events").select("id", { count: "exact", head: true }).limit(0);
    // error attendue (RLS bloque SELECT anon), mais l'absence de timeout = DB up
    checks.database = {
      ok: true,
      latency_ms: Date.now() - dbStart,
      detail: error ? "rls_enforced" : "ok",
    };
  } catch (e) {
    checks.database = {
      ok: false,
      latency_ms: Date.now() - dbStart,
      detail: e instanceof Error ? e.message : "unknown",
    };
  }

  // 2) Circuit breaker AI Gateway (état mémoire de cette instance)
  try {
    const snap = getBreakerSnapshot("ai-gateway:lovable");
    checks.ai_gateway_breaker = {
      ok: snap.state !== "OPEN",
      detail: `${snap.state} (${snap.failures_in_window} failures in window)`,
    };
  } catch {
    checks.ai_gateway_breaker = { ok: true, detail: "fresh" };
  }

  // 3) Edge runtime
  checks.edge_runtime = {
    ok: true,
    detail: `up ${Math.round((Date.now() - STARTED_AT) / 1000)}s`,
  };

  const allOk = Object.values(checks).every((c) => c.ok);
  const status = allOk ? "healthy" : "degraded";

  return new Response(
    JSON.stringify({
      status,
      version: VERSION,
      timestamp: new Date().toISOString(),
      checks,
    }),
    {
      status: allOk ? 200 : 503,
      headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "no-store" },
    }
  );
});
