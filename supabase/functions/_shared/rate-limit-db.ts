/**
 * Database-backed rate limiting (Horizon 4).
 *
 * Persistent across Deno isolates via the `public.check_ip_rate_limit` RPC.
 * Use for public edge functions that need cross-instance rate limiting by IP.
 *
 * For in-memory per-isolate limits, use rate-limit.ts instead.
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

export interface DbRateLimitConfig {
  /** Unique key (typically `${functionName}:${ip}` or `${functionName}:${userId}`) */
  bucketKey: string;
  /** Maximum requests allowed within the window */
  maxRequests: number;
  /** Window duration in seconds */
  windowSeconds: number;
}

export interface DbRateLimitResult {
  allowed: boolean;
  current: number;
  max: number;
  remaining: number;
  resetAt: string;
  retryAfterSeconds: number;
}

/**
 * Extract client IP from a Request object.
 * Honors common proxy headers (Cloudflare, X-Forwarded-For).
 */
export function getClientIp(req: Request): string {
  return (
    req.headers.get("cf-connecting-ip") ||
    req.headers.get("x-real-ip") ||
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  );
}

/**
 * Check rate limit using the database (persistent across isolates).
 *
 * @example
 *   const ip = getClientIp(req);
 *   const result = await checkDbRateLimit({
 *     bucketKey: `contact-form:${ip}`,
 *     maxRequests: 5,
 *     windowSeconds: 3600,
 *   });
 *   if (!result.allowed) {
 *     return dbRateLimitResponse(result, corsHeaders);
 *   }
 */
export async function checkDbRateLimit(
  config: DbRateLimitConfig
): Promise<DbRateLimitResult> {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceKey) {
    // Fail-open if misconfigured (don't block legitimate traffic)
    console.warn("[rate-limit-db] Missing Supabase credentials, failing open");
    return {
      allowed: true,
      current: 0,
      max: config.maxRequests,
      remaining: config.maxRequests,
      resetAt: new Date(Date.now() + config.windowSeconds * 1000).toISOString(),
      retryAfterSeconds: 0,
    };
  }

  // deno-lint-ignore no-explicit-any
  const supabase: any = createClient(supabaseUrl, serviceKey);

  try {
    const { data, error } = await supabase.rpc("check_ip_rate_limit", {
      p_bucket_key: config.bucketKey,
      p_max_requests: config.maxRequests,
      p_window_seconds: config.windowSeconds,
    });

    if (error || !data) {
      console.error("[rate-limit-db] RPC error:", error);
      // Fail-open on DB errors
      return {
        allowed: true,
        current: 0,
        max: config.maxRequests,
        remaining: config.maxRequests,
        resetAt: new Date(Date.now() + config.windowSeconds * 1000).toISOString(),
        retryAfterSeconds: 0,
      };
    }

    return {
      allowed: data.allowed,
      current: data.current,
      max: data.max,
      remaining: data.remaining,
      resetAt: data.reset_at,
      retryAfterSeconds: data.retry_after_seconds ?? 0,
    };
  } catch (err) {
    console.error("[rate-limit-db] Unexpected error:", err);
    return {
      allowed: true,
      current: 0,
      max: config.maxRequests,
      remaining: config.maxRequests,
      resetAt: new Date(Date.now() + config.windowSeconds * 1000).toISOString(),
      retryAfterSeconds: 0,
    };
  }
}

/**
 * Build a 429 response from a DbRateLimitResult.
 */
export function dbRateLimitResponse(
  result: DbRateLimitResult,
  corsHeaders: Record<string, string>
): Response {
  return new Response(
    JSON.stringify({
      error: "Trop de requêtes. Réessayez dans quelques instants.",
      retryAfter: result.retryAfterSeconds,
      resetAt: result.resetAt,
    }),
    {
      status: 429,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "Retry-After": String(result.retryAfterSeconds),
        "X-RateLimit-Limit": String(result.max),
        "X-RateLimit-Remaining": String(result.remaining),
        "X-RateLimit-Reset": result.resetAt,
      },
    }
  );
}
