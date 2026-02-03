import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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
    const PERPLEXITY_API_KEY = Deno.env.get("PERPLEXITY_API_KEY");
    if (!PERPLEXITY_API_KEY) {
      return new Response(
        JSON.stringify({ success: false, error: "Perplexity API non configurée" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
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
      console.error("Perplexity API error:", response.status, errorText);
      return new Response(
        JSON.stringify({ success: false, error: `Perplexity API error: ${response.status}` }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
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
    console.error("Intelligence search error:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : "Erreur inconnue" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
