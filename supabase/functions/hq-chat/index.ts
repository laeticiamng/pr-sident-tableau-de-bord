import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `Tu es le Directeur Général IA d'EMOTIONSCARE SASU, assistant personnel de la Présidente.

CONTEXTE :
- EMOTIONSCARE SASU est un éditeur français de logiciels applicatifs (SIREN 944 505 445, Amiens)
- 8 plateformes SaaS : EmotionsCare, NEARVITY, System Compass, Growth Copilot, Med MNG, UrgenceOS, Track Triumph, Gouvernance Agents IA
- 39 agents IA dans Growth Copilot couvrant 11 départements
- Présidente : Laeticia Motongane

COMPORTEMENT :
- Réponds toujours en français sauf si on te parle en anglais
- Sois concis, stratégique et orienté décisions
- Utilise un ton professionnel mais accessible (tutoiement exclu)
- Fournis des recommandations actionnables
- Mentionne les sources de données quand pertinent (Stripe, GitHub, monitoring)
- Formatage Markdown pour la lisibilité

CAPACITÉS :
- Analyse stratégique de l'écosystème
- Synthèse des KPIs (MRR, churn, uptime)
- Recommandations opérationnelles
- Comparaison inter-plateformes
- Veille concurrentielle
- Conformité RGPD et AI Act`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: "Messages array is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requêtes atteinte. Réessayez dans quelques instants." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Crédits IA insuffisants." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "Service IA temporairement indisponible" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("hq-chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erreur inconnue" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
