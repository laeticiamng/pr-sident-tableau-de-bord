import { createClient } from "npm:@supabase/supabase-js@2";

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

// Les 7 plateformes (registre immuable)
const MANAGED_REPOS = [
  { key: "emotionscare", repo: "laeticiamng/emotionscare" },
  { key: "nearvity", repo: "laeticiamng/nearvity" },
  { key: "system-compass", repo: "laeticiamng/system-compass" },
  { key: "growth-copilot", repo: "laeticiamng/growth-copilot" },
  { key: "med-mng", repo: "laeticiamng/med-mng" },
  { key: "swift-care-hub", repo: "laeticiamng/swift-care-hub" },
  { key: "track-triumph-tavern", repo: "laeticiamng/track-triumph-tavern" },
];

// Run type configurations with system prompts
const RUN_TEMPLATES: Record<string, { 
  systemPrompt: string; 
  model: keyof typeof MODEL_CONFIG;
  steps: string[];
  useGitHub?: boolean;
  usePerplexity?: boolean;
  useFirecrawl?: boolean;
}> = {
  DAILY_EXECUTIVE_BRIEF: {
    systemPrompt: `Tu es le Directeur Général (CEO Agent) d'EMOTIONSCARE SASU, éditeur de logiciels applicatifs français de premier plan.
Tu génères le briefing exécutif quotidien pour la Présidente avec les données RÉELLES des systèmes.

Structure ton rapport ainsi:
1. 🎯 RÉSUMÉ EXÉCUTIF (3 phrases max, impact business)
2. 📊 STATUT RAG DES PLATEFORMES (basé sur GitHub + monitoring réels)
   - Commits récents, issues ouvertes, PRs en attente
   - Uptime et performance
3. ⚡ TOP 3 PRIORITÉS DU JOUR
4. ⏳ DÉCISIONS EN ATTENTE D'APPROBATION
5. 🚨 ALERTES CRITIQUES (si applicable)
6. 📈 VEILLE STRATÉGIQUE (insights du marché)

Ton : professionnel, direct, factuel. Standard HEC/Polytechnique.
Ne jamais inventer de données - indique "Données non disponibles" si nécessaire.`,
    model: "reasoning",
    steps: ["Sync GitHub", "Collecte métriques", "Veille marché", "Synthèse exécutive", "Recommandations"],
    useGitHub: true,
    usePerplexity: true,
  },
  CEO_STANDUP_MEETING: {
    systemPrompt: `Tu es le Directeur Général (CEO Agent) conduisant le standup quotidien.
Génère un compte-rendu de réunion structuré avec données réelles:
1. ✅ Points clés par plateforme (basé sur GitHub)
2. 🔄 PRs et issues à traiter
3. 📋 Décisions prises
4. 🎯 Actions à suivre avec responsables
5. 📅 Prochaine réunion

Sois concis et orienté action.`,
    model: "default",
    steps: ["Sync GitHub", "Tour de table", "Synthèse", "Plan d'action"],
    useGitHub: true,
  },
  PLATFORM_STATUS_REVIEW: {
    systemPrompt: `Tu es le Directeur de Plateforme analysant l'état d'une plateforme avec données RÉELLES.
Génère un rapport de statut basé sur les données GitHub et monitoring:
1. 🚦 STATUT GLOBAL (RAG) avec justification factuelle
2. 📊 MÉTRIQUES (commits, issues, PRs, uptime)
3. 🐛 INCIDENTS en cours ou récents
4. 🚀 RELEASES planifiées/récentes
5. ⚠️ RISQUES identifiés
6. 💡 RECOMMANDATIONS

Base-toi UNIQUEMENT sur les données fournies.`,
    model: "summary",
    steps: ["Fetch GitHub data", "Analyse métriques", "Évaluation risques", "Rapport"],
    useGitHub: true,
  },
  SECURITY_AUDIT_RLS: {
    systemPrompt: `Tu es le CISO (Directeur Sécurité) effectuant un audit RLS complet.
Génère un rapport d'audit structuré:
1. 📋 TABLES ANALYSÉES
2. 🔒 POLITIQUES RLS en place
3. 🔴 VULNÉRABILITÉS potentielles détectées
4. ✅ CONFORMITÉ (OK/NOK par table)
5. 🛠️ RECOMMANDATIONS de remédiation prioritaires
6. 🎯 SCORE DE SÉCURITÉ GLOBAL (/100)

Adopte une approche rigoureuse et exhaustive de type audit Big4.`,
    model: "reasoning",
    steps: ["Scan tables", "Analyse politiques", "Détection vulnérabilités", "Benchmarking", "Rapport"],
    usePerplexity: true,
  },
  MARKETING_WEEK_PLAN: {
    systemPrompt: `Tu es le CMO (Directeur Marketing) planifiant la semaine marketing.
Génère un plan hebdomadaire basé sur la veille concurrentielle:
1. 🎯 OBJECTIFS de la semaine (SMART)
2. 📢 CAMPAGNES actives et résultats
3. ✍️ CONTENU à produire
4. 📱 CANAUX prioritaires
5. 💰 BUDGET alloué
6. 📊 KPIs à suivre
7. 🔍 INSIGHTS CONCURRENTIELS

Sois créatif mais data-driven avec les insights marché.`,
    model: "default",
    steps: ["Veille concurrentielle", "Revue objectifs", "Planning campagnes", "Allocation ressources"],
    usePerplexity: true,
    useFirecrawl: true,
  },
  RELEASE_GATE_CHECK: {
    systemPrompt: `Tu es le CTO effectuant une vérification de gate de release basée sur données GitHub RÉELLES.
Évalue la readiness d'une release:
1. ✅ CHECKLIST TECHNIQUE
   - Tests passés
   - Code review (basé sur PRs)
   - Documentation
2. 🔒 CHECKLIST SÉCURITÉ
   - Audit réalisé
   - Vulnérabilités connues
3. 📦 CHECKLIST PRODUIT
   - Specs validées
   - QA passée
4. ⚠️ RISQUES identifiés
5. 🚦 DÉCISION: GO / NO-GO / CONDITIONAL
6. 📋 CONDITIONS si applicable

Sois rigoureux et prudent - basé sur les données réelles.`,
    model: "reasoning",
    steps: ["Fetch GitHub PRs", "Revue technique", "Revue sécurité", "Décision"],
    useGitHub: true,
  },
  COMPETITIVE_ANALYSIS: {
    systemPrompt: `Tu es le Directeur Stratégie effectuant une analyse concurrentielle approfondie.
Utilise les données de veille pour générer:
1. 🏢 PROFIL DES CONCURRENTS identifiés
2. 💪 FORCES & FAIBLESSES de chacun
3. 📊 POSITIONNEMENT sur le marché
4. 🔧 TECHNOLOGIES utilisées
5. 📈 OPPORTUNITÉS pour EMOTIONSCARE
6. ⚔️ MENACES à surveiller
7. 🎯 RECOMMANDATIONS STRATÉGIQUES

Analyse rigoureuse basée sur les données collectées.`,
    model: "reasoning",
    steps: ["Scraping concurrents", "Recherche Perplexity", "Analyse SWOT", "Recommandations"],
    usePerplexity: true,
    useFirecrawl: true,
  },
};

// Helper function to fetch GitHub data
async function fetchGitHubData(token: string | undefined, platformKey?: string): Promise<string> {
  if (!token) {
    return "GitHub non connecté - token manquant";
  }

  const repos = platformKey 
    ? MANAGED_REPOS.filter(r => r.key === platformKey)
    : MANAGED_REPOS;

  let contextData = "\n\n📊 DONNÉES GITHUB RÉELLES:\n";

  for (const { key, repo } of repos) {
    try {
      // Fetch commits
      const commitsRes = await fetch(`https://api.github.com/repos/${repo}/commits?per_page=5`, {
        headers: { Authorization: `Bearer ${token}`, "User-Agent": "EMOTIONSCARE-HQ" },
      });
      const commits = commitsRes.ok ? await commitsRes.json() : [];

      // Fetch open issues
      const issuesRes = await fetch(`https://api.github.com/repos/${repo}/issues?state=open&per_page=10`, {
        headers: { Authorization: `Bearer ${token}`, "User-Agent": "EMOTIONSCARE-HQ" },
      });
      const issues = issuesRes.ok ? (await issuesRes.json()).filter((i: any) => !i.pull_request) : [];

      // Fetch open PRs
      const prsRes = await fetch(`https://api.github.com/repos/${repo}/pulls?state=open&per_page=10`, {
        headers: { Authorization: `Bearer ${token}`, "User-Agent": "EMOTIONSCARE-HQ" },
      });
      const prs = prsRes.ok ? await prsRes.json() : [];

      contextData += `\n📁 ${key.toUpperCase()}\n`;
      contextData += `   Issues ouvertes: ${issues.length}\n`;
      contextData += `   PRs en attente: ${prs.length}\n`;
      
      if (commits.length > 0) {
        contextData += `   Dernier commit: ${commits[0]?.commit?.message?.split('\n')[0] || 'N/A'} (${commits[0]?.commit?.author?.date?.split('T')[0] || 'N/A'})\n`;
      }
      
      if (issues.length > 0) {
        contextData += `   Issues récentes: ${issues.slice(0, 3).map((i: any) => `#${i.number}: ${i.title}`).join(', ')}\n`;
      }
    } catch (e) {
      contextData += `\n📁 ${key.toUpperCase()}: Erreur de récupération\n`;
    }
  }

  return contextData;
}

// Helper function to fetch Perplexity intelligence
async function fetchPerplexityData(apiKey: string | undefined, query: string): Promise<string> {
  if (!apiKey) {
    return "\n\n🔍 VEILLE STRATÉGIQUE: Perplexity non configuré";
  }

  try {
    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "sonar-pro",
        messages: [
          { role: "system", content: "Tu es un analyste de veille stratégique. Réponds en français, de manière concise et factuelle." },
          { role: "user", content: query },
        ],
        search_recency_filter: "week",
      }),
    });

    if (!response.ok) {
      return "\n\n🔍 VEILLE STRATÉGIQUE: Erreur API Perplexity";
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    const citations = data.citations || [];

    return `\n\n🔍 VEILLE STRATÉGIQUE (Perplexity):\n${content}\n\n📎 Sources: ${citations.slice(0, 3).join(", ") || "N/A"}`;
  } catch (e) {
    return "\n\n🔍 VEILLE STRATÉGIQUE: Erreur de connexion";
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
    const GITHUB_TOKEN = Deno.env.get("GITHUB_TOKEN");
    const PERPLEXITY_API_KEY = Deno.env.get("PERPLEXITY_API_KEY");

    if (!LOVABLE_API_KEY) {
      console.error("[Executive Run] LOVABLE_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Service temporarily unavailable" }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !SUPABASE_ANON_KEY) {
      console.error("[Executive Run] Supabase configuration missing");
      return new Response(
        JSON.stringify({ error: "Service temporarily unavailable" }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ============================================
    // AUTHENTICATION & AUTHORIZATION CHECK
    // ============================================
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.error("[Executive Run] Missing or invalid authorization header");
      return new Response(
        JSON.stringify({ error: "Authorization requise" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create a client with the user's token to verify authentication
    const supabaseAuth = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } }
    });

    // Verify the JWT and get claims
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseAuth.auth.getClaims(token);

    if (claimsError || !claimsData?.claims) {
      console.error("[Executive Run] Invalid token:", claimsError?.message);
      return new Response(
        JSON.stringify({ error: "Token invalide ou expiré" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = claimsData.claims.sub;
    console.log(`[Executive Run] Authenticated user: ${userId}`);

    // Create admin client for privileged operations
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Verify user has owner role using the has_role RPC function
    const { data: hasOwnerRole, error: roleError } = await supabaseAdmin.rpc("has_role", {
      _user_id: userId,
      _role: "owner"
    });

    if (roleError) {
      console.error("[Executive Run] Role check error:", roleError.message);
      return new Response(
        JSON.stringify({ error: "Erreur de vérification des permissions" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!hasOwnerRole) {
      console.error(`[Executive Run] User ${userId} lacks owner role`);
      return new Response(
        JSON.stringify({ error: "Permissions insuffisantes - rôle owner requis" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[Executive Run] User ${userId} authorized as owner`);
    // ============================================
    // END AUTHENTICATION CHECK
    // ============================================

    const { run_type, platform_key, context_data } = await req.json();

    console.log(`[Executive Run] Starting ${run_type}${platform_key ? ` for ${platform_key}` : ""}`);

    const template = RUN_TEMPLATES[run_type];
    if (!template) {
      return new Response(
        JSON.stringify({ error: `Unknown run type: ${run_type}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build rich context from multiple sources
    let additionalContext = "";

    // Fetch GitHub data if needed
    if (template.useGitHub) {
      console.log("[Executive Run] Fetching GitHub data...");
      additionalContext += await fetchGitHubData(GITHUB_TOKEN, platform_key);
    }

    // Fetch platform data from DB
    if (platform_key) {
      const { data: platform } = await supabaseAdmin.rpc("get_hq_platform", { 
        platform_key_param: platform_key 
      });
      if (platform) {
        additionalContext += `\n\n📋 DONNÉES PLATEFORME:\nNom: ${platform.name || platform_key}\nStatut: ${platform.status?.toUpperCase() || "INCONNU"}\nUptime: ${platform.uptime_percent || "N/A"}%`;
      }
    }

    // Fetch all platforms for executive brief
    if (run_type === "DAILY_EXECUTIVE_BRIEF") {
      const { data: platforms } = await supabaseAdmin.rpc("get_all_hq_platforms");
      if (platforms && Array.isArray(platforms)) {
        additionalContext += `\n\n📋 STATUT BASE DE DONNÉES:\n`;
        platforms.forEach((p: any) => {
          additionalContext += `- ${p.name}: ${p.status?.toUpperCase() || "INCONNU"} (${p.status_reason || "-"}) - Uptime: ${p.uptime_percent || "N/A"}%\n`;
        });
      }
    }

    // Fetch Perplexity intelligence if needed
    if (template.usePerplexity) {
      console.log("[Executive Run] Fetching Perplexity intelligence...");
      const searchQuery = run_type === "DAILY_EXECUTIVE_BRIEF"
        ? "Actualités et tendances du marché des logiciels applicatifs en France cette semaine. SaaS, no-code, IA."
        : run_type === "MARKETING_WEEK_PLAN"
        ? "Stratégies marketing digital efficaces pour éditeurs de logiciels B2B en 2025. Tendances, canaux, exemples."
        : run_type === "COMPETITIVE_ANALYSIS"
        ? "Principaux éditeurs de logiciels applicatifs français. Analyse concurrentielle, positionnement, forces."
        : "Actualités tech et software en France";
      
      additionalContext += await fetchPerplexityData(PERPLEXITY_API_KEY, searchQuery);
    }

    // Add custom context
    if (context_data) {
      additionalContext += `\n\nContexte supplémentaire:\n${JSON.stringify(context_data, null, 2)}`;
    }

    const model = MODEL_CONFIG[template.model];

    const userPrompt = `📅 Date: ${new Date().toLocaleDateString("fr-FR", { 
      weekday: "long", 
      year: "numeric", 
      month: "long", 
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })}

🏢 Entreprise: EMOTIONSCARE SASU — Éditeur de logiciels applicatifs
📍 Siège: Amiens, France
💼 7 Plateformes managées: EmotionsCare, NEARVITY, System Compass, Growth Copilot, Med MNG, UrgenceOS, Track Triumph

Type de run: ${run_type}
${additionalContext}

Génère le rapport demandé en français avec les données RÉELLES fournies ci-dessus.`;

    console.log(`[Executive Run] Calling AI model: ${model}`);

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
        max_tokens: 3000,
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

    console.log(`[Executive Run] AI response: ${executiveSummary.length} chars`);

    const runResult = {
      success: true,
      run_id: crypto.randomUUID(),
      run_type,
      platform_key,
      executive_summary: executiveSummary,
      steps: template.steps,
      model_used: model,
      data_sources: [
        template.useGitHub ? "GitHub API" : null,
        template.usePerplexity ? "Perplexity AI" : null,
        template.useFirecrawl ? "Firecrawl" : null,
        "Lovable AI Gateway",
      ].filter(Boolean),
      completed_at: new Date().toISOString(),
    };

    console.log(`[Executive Run] Completed with sources: ${runResult.data_sources.join(", ")}`);

    return new Response(
      JSON.stringify(runResult),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[Executive Run] Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred. Please try again later." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
