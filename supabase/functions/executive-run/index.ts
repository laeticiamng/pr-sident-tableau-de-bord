import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Model router configuration
const MODEL_CONFIG = {
  default: "google/gemini-3-flash-preview",
  reasoning: "google/gemini-2.5-pro",
  coding: "openai/gpt-5.2",
  summary: "google/gemini-2.5-flash",
};

// Run type configurations with system prompts
const RUN_TEMPLATES: Record<string, { 
  systemPrompt: string; 
  model: keyof typeof MODEL_CONFIG;
  steps: string[];
}> = {
  DAILY_EXECUTIVE_BRIEF: {
    systemPrompt: `Tu es le Directeur Général (CEO Agent) d'EMOTIONSCARE SASU.
Tu génères le briefing exécutif quotidien pour la Présidente.
Structure ton rapport ainsi:
1. Résumé exécutif (3 phrases max)
2. Statut RAG des 5 plateformes avec justification
3. Top 3 priorités du jour
4. Décisions en attente d'approbation
5. Alertes critiques (si applicable)

Utilise un ton professionnel, direct et factuel. Style HEC/Polytechnique.
Si des données manquent, indique "Données non disponibles - vérification requise".`,
    model: "reasoning",
    steps: ["Collecte données plateformes", "Analyse statuts", "Synthèse exécutive", "Recommandations"],
  },
  CEO_STANDUP_MEETING: {
    systemPrompt: `Tu es le Directeur Général (CEO Agent) conduisant le standup quotidien.
Génère un compte-rendu de réunion structuré:
1. Participants présents (agents)
2. Points clés discutés
3. Décisions prises
4. Actions à suivre avec responsables
5. Prochaine réunion

Sois concis et orienté action.`,
    model: "default",
    steps: ["Convocation agents", "Tour de table", "Synthèse", "Plan d'action"],
  },
  PLATFORM_STATUS_REVIEW: {
    systemPrompt: `Tu es le Directeur de Plateforme analysant l'état d'une plateforme.
Génère un rapport de statut incluant:
1. Statut global (RAG) avec justification
2. Métriques clés (uptime, performance)
3. Incidents en cours ou récents
4. Releases planifiées/récentes
5. Risques identifiés
6. Recommandations

Base-toi uniquement sur les données fournies.`,
    model: "summary",
    steps: ["Collecte métriques", "Analyse incidents", "Évaluation risques", "Rapport"],
  },
  SECURITY_AUDIT_RLS: {
    systemPrompt: `Tu es le CISO (Directeur Sécurité) effectuant un audit RLS.
Génère un rapport d'audit structuré:
1. Tables analysées
2. Politiques RLS en place
3. Vulnérabilités potentielles
4. Conformité (OK/NOK par table)
5. Recommandations de remédiation
6. Score de sécurité global

Adopte une approche rigoureuse et exhaustive.`,
    model: "reasoning",
    steps: ["Scan tables", "Analyse politiques", "Détection vulnérabilités", "Rapport"],
  },
  MARKETING_WEEK_PLAN: {
    systemPrompt: `Tu es le CMO (Directeur Marketing) planifiant la semaine marketing.
Génère un plan hebdomadaire:
1. Objectifs de la semaine
2. Campagnes actives
3. Contenu à produire
4. Canaux prioritaires
5. Budget alloué
6. KPIs à suivre

Sois créatif mais réaliste avec les ressources.`,
    model: "default",
    steps: ["Revue objectifs", "Planning campagnes", "Allocation ressources", "Validation"],
  },
  RELEASE_GATE_CHECK: {
    systemPrompt: `Tu es le CTO effectuant une vérification de gate de release.
Évalue la readiness d'une release:
1. Checklist technique (tests, code review, documentation)
2. Checklist sécurité (audit, vulnérabilités)
3. Checklist produit (specs, validation)
4. Risques identifiés
5. Décision: GO / NO-GO / CONDITIONAL
6. Conditions si applicable

Sois rigoureux et prudent.`,
    model: "reasoning",
    steps: ["Revue technique", "Revue sécurité", "Revue produit", "Décision"],
  },
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase configuration missing");
    }

    // Create Supabase client with service role for database operations
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { run_type, platform_key, context_data } = await req.json();

    console.log(`[Executive Run] Starting run: ${run_type}${platform_key ? ` for ${platform_key}` : ""}`);

    // Validate run type
    const template = RUN_TEMPLATES[run_type];
    if (!template) {
      return new Response(
        JSON.stringify({ error: `Unknown run type: ${run_type}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build context from database
    let additionalContext = "";

    // Fetch platform data using raw SQL for hq schema
    if (platform_key) {
      const { data: platform, error } = await supabaseAdmin.rpc("get_hq_platform", { 
        platform_key_param: platform_key 
      });
      if (platform && !error) {
        additionalContext += `\nPlateforme: ${platform.name || platform_key}`;
        additionalContext += `\nStatut: ${platform.status?.toUpperCase() || "INCONNU"}`;
        additionalContext += `\nUptime: ${platform.uptime_percent || "N/A"}%`;
      }
    }

    // Fetch all platforms for executive brief
    if (run_type === "DAILY_EXECUTIVE_BRIEF") {
      const { data: platforms, error } = await supabaseAdmin.rpc("get_all_hq_platforms");
      
      if (platforms && !error && Array.isArray(platforms)) {
        additionalContext += `\n\nStatut des plateformes:\n`;
        platforms.forEach((p: { name: string; status: string; status_reason: string; uptime_percent: number }) => {
          additionalContext += `- ${p.name}: ${p.status?.toUpperCase() || "INCONNU"} (${p.status_reason || "Pas de détails"}) - Uptime: ${p.uptime_percent || "N/A"}%\n`;
        });
      } else {
        additionalContext += `\n\nStatut des plateformes: Données non disponibles (fonction RPC non configurée)`;
      }

      // Note about pending approvals
      additionalContext += `\n\nNote: Les approbations en attente seront affichées une fois le système complet configuré.`;
    }

    // Add any context data passed by the client
    if (context_data) {
      additionalContext += `\n\nContexte supplémentaire:\n${JSON.stringify(context_data, null, 2)}`;
    }

    // Select model based on template
    const model = MODEL_CONFIG[template.model];

    // Build the prompt
    const userPrompt = `Date: ${new Date().toLocaleDateString("fr-FR", { 
      weekday: "long", 
      year: "numeric", 
      month: "long", 
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })}

Type de run: ${run_type}
${additionalContext}

Génère le rapport demandé en français.`;

    console.log(`[Executive Run] Calling AI model: ${model}`);

    // Call Lovable AI Gateway
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: template.systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error(`[Executive Run] AI Gateway error: ${aiResponse.status}`, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requêtes atteinte. Réessayez dans quelques instants." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "Crédits IA insuffisants. Contactez l'administrateur." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`AI Gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const executiveSummary = aiData.choices?.[0]?.message?.content || "Rapport non généré";

    console.log(`[Executive Run] AI response received, ${executiveSummary.length} chars`);

    // For now, return the run result without storing (RPC functions needed for hq schema writes)
    const runResult = {
      success: true,
      run_id: crypto.randomUUID(),
      run_type,
      platform_key,
      executive_summary: executiveSummary,
      steps: template.steps,
      model_used: model,
      completed_at: new Date().toISOString(),
    };

    console.log(`[Executive Run] Completed successfully`);

    return new Response(
      JSON.stringify(runResult),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[Executive Run] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erreur inconnue" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
