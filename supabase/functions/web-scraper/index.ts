import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ScrapeRequest {
  url: string;
  action: "scrape" | "search" | "map";
  options?: {
    formats?: string[];
    query?: string;
    limit?: number;
    onlyMainContent?: boolean;
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
    const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !SUPABASE_ANON_KEY) {
      throw new Error("Configuration Supabase manquante");
    }

    // ============================================
    // AUTHENTICATION & AUTHORIZATION CHECK
    // ============================================
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.error("[Web Scraper] Missing or invalid authorization header");
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
      console.error("[Web Scraper] Invalid token:", claimsError?.message);
      return new Response(
        JSON.stringify({ error: "Token invalide ou expiré" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = claimsData.claims.sub;
    console.log(`[Web Scraper] Authenticated user: ${userId}`);

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: hasOwnerRole, error: roleError } = await supabaseAdmin.rpc("has_role", {
      _user_id: userId,
      _role: "owner"
    });

    if (roleError || !hasOwnerRole) {
      console.error(`[Web Scraper] User ${userId} lacks owner role`);
      return new Response(
        JSON.stringify({ error: "Permissions insuffisantes - rôle owner requis" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[Web Scraper] User ${userId} authorized as owner`);
    // ============================================
    // END AUTHENTICATION CHECK
    // ============================================

    if (!FIRECRAWL_API_KEY) {
      console.error("[Web Scraper] FIRECRAWL_API_KEY not configured");
      return new Response(
        JSON.stringify({ success: false, error: "Service temporarily unavailable" }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { url, action = "scrape", options = {} }: ScrapeRequest = await req.json();

    if (action !== "search" && !url) {
      return new Response(
        JSON.stringify({ success: false, error: "URL requise" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let endpoint: string;
    let body: Record<string, any>;

    switch (action) {
      case "scrape":
        endpoint = "https://api.firecrawl.dev/v1/scrape";
        // Formater l'URL
        let formattedUrl = url.trim();
        if (!formattedUrl.startsWith("http://") && !formattedUrl.startsWith("https://")) {
          formattedUrl = `https://${formattedUrl}`;
        }
        body = {
          url: formattedUrl,
          formats: options.formats || ["markdown", "links"],
          onlyMainContent: options.onlyMainContent ?? true,
        };
        break;

      case "search":
        endpoint = "https://api.firecrawl.dev/v1/search";
        body = {
          query: options.query || url,
          limit: options.limit || 10,
          scrapeOptions: { formats: ["markdown"] },
        };
        break;

      case "map":
        endpoint = "https://api.firecrawl.dev/v1/map";
        let mapUrl = url.trim();
        if (!mapUrl.startsWith("http://") && !mapUrl.startsWith("https://")) {
          mapUrl = `https://${mapUrl}`;
        }
        body = {
          url: mapUrl,
          limit: options.limit || 100,
        };
        break;

      default:
        return new Response(
          JSON.stringify({ success: false, error: `Action inconnue: ${action}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    console.log(`Firecrawl ${action}: ${url || options.query}`);

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("[Web Scraper] External API error:", response.status, data);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Scraping service error. Please try again later." 
        }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Firecrawl ${action} completed successfully`);

    return new Response(
      JSON.stringify({
        success: true,
        action,
        ...data,
        scraped_at: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[Web Scraper] Unexpected error:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: "An unexpected error occurred. Please try again later." 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
