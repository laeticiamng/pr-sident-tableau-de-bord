import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// URLs de monitoring des 5 plateformes (à configurer selon les déploiements réels)
const PLATFORM_ENDPOINTS: Record<string, string> = {
  emotionscare: "https://emotionscare.lovable.app",
  "pixel-perfect-replica": "https://pixel-perfect-replica.lovable.app",
  "system-compass": "https://system-compass.lovable.app",
  "growth-copilot": "https://growth-copilot.lovable.app",
  "med-mng": "https://med-mng.lovable.app",
};

interface HealthCheckResult {
  key: string;
  url: string;
  status: "green" | "amber" | "red";
  statusCode: number | null;
  responseTime: number | null;
  error: string | null;
  checkedAt: string;
}

async function checkPlatformHealth(key: string, url: string): Promise<HealthCheckResult> {
  const startTime = Date.now();
  
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const response = await fetch(url, {
      method: "HEAD",
      signal: controller.signal,
    });

    clearTimeout(timeout);
    
    const responseTime = Date.now() - startTime;
    const statusCode = response.status;

    // Déterminer le statut RAG
    let status: "green" | "amber" | "red";
    if (statusCode >= 200 && statusCode < 300 && responseTime < 2000) {
      status = "green";
    } else if (statusCode >= 200 && statusCode < 400 && responseTime < 5000) {
      status = "amber";
    } else {
      status = "red";
    }

    return {
      key,
      url,
      status,
      statusCode,
      responseTime,
      error: null,
      checkedAt: new Date().toISOString(),
    };
  } catch (error) {
    return {
      key,
      url,
      status: "red",
      statusCode: null,
      responseTime: null,
      error: error instanceof Error ? error.message : "Erreur inconnue",
      checkedAt: new Date().toISOString(),
    };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !SUPABASE_ANON_KEY) {
      throw new Error("Configuration Supabase manquante");
    }

    // ============================================
    // AUTHENTICATION & AUTHORIZATION CHECK
    // ============================================
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.error("[Platform Monitor] Missing or invalid authorization header");
      return new Response(
        JSON.stringify({ error: "Authorization requise" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseAuth = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } }
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseAuth.auth.getClaims(token);

    if (claimsError || !claimsData?.claims) {
      console.error("[Platform Monitor] Invalid token:", claimsError?.message);
      return new Response(
        JSON.stringify({ error: "Token invalide ou expiré" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = claimsData.claims.sub;
    console.log(`[Platform Monitor] Authenticated user: ${userId}`);

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: hasOwnerRole, error: roleError } = await supabaseAdmin.rpc("has_role", {
      _user_id: userId,
      _role: "owner"
    });

    if (roleError || !hasOwnerRole) {
      console.error(`[Platform Monitor] User ${userId} lacks owner role`);
      return new Response(
        JSON.stringify({ error: "Permissions insuffisantes - rôle owner requis" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[Platform Monitor] User ${userId} authorized as owner`);
    // ============================================
    // END AUTHENTICATION CHECK
    // ============================================

    const { platform_key } = await req.json().catch(() => ({}));

    let platformsToCheck = Object.entries(PLATFORM_ENDPOINTS);
    
    if (platform_key) {
      if (!PLATFORM_ENDPOINTS[platform_key]) {
        return new Response(
          JSON.stringify({ success: false, error: `Plateforme inconnue: ${platform_key}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      platformsToCheck = [[platform_key, PLATFORM_ENDPOINTS[platform_key]]];
    }

    console.log(`Checking health of ${platformsToCheck.length} platform(s)...`);

    // Check en parallèle
    const results = await Promise.all(
      platformsToCheck.map(([key, url]) => checkPlatformHealth(key, url))
    );

    // Générer le résumé
    const greenCount = results.filter(r => r.status === "green").length;
    const amberCount = results.filter(r => r.status === "amber").length;
    const redCount = results.filter(r => r.status === "red").length;

    const overallStatus: "green" | "amber" | "red" = 
      redCount > 0 ? "red" : 
      amberCount > 0 ? "amber" : "green";

    const avgResponseTime = results
      .filter(r => r.responseTime !== null)
      .reduce((sum, r) => sum + (r.responseTime || 0), 0) / 
      results.filter(r => r.responseTime !== null).length || 0;

    const summary = {
      checked_at: new Date().toISOString(),
      overall_status: overallStatus,
      platforms_total: results.length,
      platforms_green: greenCount,
      platforms_amber: amberCount,
      platforms_red: redCount,
      avg_response_time_ms: Math.round(avgResponseTime),
      platforms: results.map(r => ({
        key: r.key,
        status: r.status,
        response_time_ms: r.responseTime,
        error: r.error,
      })),
    };

    console.log(`Health check completed: ${overallStatus.toUpperCase()} (${greenCount}G/${amberCount}A/${redCount}R)`);

    return new Response(
      JSON.stringify({
        success: true,
        summary,
        details: results,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Platform monitor error:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : "Erreur inconnue" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
