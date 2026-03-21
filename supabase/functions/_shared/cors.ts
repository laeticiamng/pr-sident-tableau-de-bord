/**
 * Shared CORS configuration for all edge functions.
 *
 * Uses ALLOWED_ORIGIN env var when set (production),
 * falls back to "*" for local development.
 */

const ALLOWED_HEADERS =
  "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version";

export function getCorsHeaders(req?: Request): Record<string, string> {
  const allowedOrigin = Deno.env.get("ALLOWED_ORIGIN");

  let origin = allowedOrigin || "*";

  // If multiple origins are configured (comma-separated), validate against request
  if (allowedOrigin && allowedOrigin.includes(",") && req) {
    const requestOrigin = req.headers.get("Origin") || "";
    const allowed = allowedOrigin.split(",").map((o) => o.trim());
    origin = allowed.includes(requestOrigin) ? requestOrigin : allowed[0];
  }

  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Headers": ALLOWED_HEADERS,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  };
}

/** Pre-built headers for simple cases (backward compat) */
export const corsHeaders = getCorsHeaders();
