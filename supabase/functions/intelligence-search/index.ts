import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface SearchRequest {
  query: string;
  type?: "competitive" | "market" | "technical" | "general";
  search_recency?: "day" | "week" | "month" | "year";
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
    const PERPLEXITY_API_KEY = Deno.env.get("PERPLEXITY_API_KEY");

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !SUPABASE_ANON_KEY) {
      throw new Error("Configuration Supabase manquante");
    }

    // ============================================
    // AUTHENTICATION & AUTHORIZATION CHECK
    // ============================================
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.error("[Intelligence Search] Missing or invalid authorization header");
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
      console.error("[Intelligence Search] Invalid token:", claimsError?.message);
      return new Response(
        JSON.stringify({ error: "Token invalide ou expiré" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = claimsData.claims.sub;
    console.log(`[Intelligence Search] Authenticated user: ${userId}`);

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: hasOwnerRole, error: roleError } = await supabaseAdmin.rpc("has_role", {
      _user_id: userId,
      _role: "owner"
    });

    if (roleError || !hasOwnerRole) {
      console.error(`[Intelligence Search] User ${userId} lacks owner role`);
      return new Response(
        JSON.stringify({ error: "Permissions insuffisantes - rôle owner requis" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[Intelligence Search] User ${userId} authorized as owner`);
    // ============================================
    // END AUTHENTICATION CHECK
    // ============================================

    if (!PERPLEXITY_API_KEY) {
      console.error("[Intelligence Search] PERPLEXITY_API_KEY not configured");
      return new Response(
        JSON.stringify({ success: false, error: "Service temporarily unavailable" }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { query, type = "general", search_recency = "week" }: SearchRequest = await req.json();

    if (!query) {
      return new Response(
        JSON.stringify({ success: false, error: "Query requise" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Construire le prompt système selon le type de recherche
    const systemPrompts: Record<string, string> = {
      competitive: `Tu es un analyste de veille concurrentielle pour EMOTIONSCARE SASU, éditeur de logiciels applicatifs français. 
Analyse les résultats de recherche et fournis:
1. Les principaux concurrents identifiés
2. Leurs forces et faiblesses
3. Opportunités de différenciation pour EMOTIONSCARE
4. Recommandations stratégiques
Format: réponse structurée en français, professionnelle et actionnable.`,
      
      market: `Tu es un analyste de marché pour EMOTIONSCARE SASU, éditeur de logiciels applicatifs.
Analyse les tendances du marché et fournis:
1. Tendances actuelles du secteur
2. Évolutions technologiques pertinentes
3. Opportunités de croissance
4. Risques à surveiller
Format: réponse structurée en français, avec données chiffrées quand disponibles.`,
      
      technical: `Tu es un expert technique pour EMOTIONSCARE SASU.
Analyse les informations techniques et fournis:
1. État de l'art des technologies mentionnées
2. Meilleures pratiques identifiées
3. Recommandations d'implémentation
4. Points d'attention techniques
Format: réponse structurée en français, précise et technique.`,
      
      general: `Tu es un assistant exécutif pour EMOTIONSCARE SASU, éditeur de logiciels applicatifs français.
Réponds de manière:
- Claire et concise
- En français professionnel
- Avec des recommandations actionnables
- En citant tes sources quand pertinent`,
    };

    console.log(`Intelligence search: ${type} - "${query.slice(0, 50)}..."`);

    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PERPLEXITY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "sonar-pro", // Modèle premium avec plus de citations
        messages: [
          { role: "system", content: systemPrompts[type] },
          { role: "user", content: query },
        ],
        search_recency_filter: search_recency,
        return_citations: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Intelligence Search] External API error:", response.status, errorText);
      return new Response(
        JSON.stringify({ success: false, error: "Search service error. Please try again later." }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    
    const result = {
      success: true,
      query,
      type,
      response: data.choices?.[0]?.message?.content || "",
      citations: data.citations || [],
      model: data.model,
      searched_at: new Date().toISOString(),
    };

    console.log(`Intelligence search completed with ${result.citations.length} citations`);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[Intelligence Search] Unexpected error:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: "An unexpected error occurred. Please try again later." 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
