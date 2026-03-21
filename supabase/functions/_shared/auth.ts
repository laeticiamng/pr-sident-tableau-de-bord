/**
 * Shared authentication helper for edge functions.
 *
 * Validates Bearer token, extracts JWT claims, and optionally
 * verifies the caller has a specific role.
 */

import { createClient } from "npm:@supabase/supabase-js@2";

export interface AuthResult {
  userId: string;
  supabaseAdmin: ReturnType<typeof createClient>;
  supabaseAuth: ReturnType<typeof createClient>;
}

export interface AuthError {
  status: number;
  message: string;
}

/**
 * Validate a request's Authorization header and optionally check role.
 *
 * @param req        The incoming request
 * @param requiredRole  Role to verify (default: "owner"). Pass null to skip role check.
 * @returns AuthResult on success, AuthError on failure
 */
export async function validateAuth(
  req: Request,
  requiredRole: string | null = "owner"
): Promise<AuthResult | AuthError> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { status: 401, message: "Authorization requise" };
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  const supabaseAuth = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });

  const token = authHeader.replace("Bearer ", "");
  const { data: claimsData, error: claimsError } =
    await supabaseAuth.auth.getClaims(token);

  if (claimsError || !claimsData?.claims) {
    return { status: 401, message: "Token invalide ou expiré" };
  }

  const userId = claimsData.claims.sub as string;
  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  if (requiredRole) {
    const { data: hasRole, error: roleError } = await supabaseAdmin.rpc(
      "has_role",
      { _user_id: userId, _role: requiredRole }
    );

    if (roleError || !hasRole) {
      return { status: 403, message: "Permissions insuffisantes" };
    }
  }

  return { userId, supabaseAdmin, supabaseAuth };
}

/** Type guard to distinguish AuthError from AuthResult */
export function isAuthError(
  result: AuthResult | AuthError
): result is AuthError {
  return "status" in result && "message" in result && !("userId" in result);
}

/** Build an error Response from an AuthError */
export function authErrorResponse(
  error: AuthError,
  corsHeaders: Record<string, string>
): Response {
  return new Response(JSON.stringify({ error: error.message }), {
    status: error.status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
