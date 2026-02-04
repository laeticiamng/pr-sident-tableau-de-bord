import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Les 5 plateformes managées avec leurs URLs
const PLATFORMS = [
  { 
    key: "emotionscare", 
    repo: "laeticiamng/emotionscare",
    liveUrl: "https://emotionscare.com",
    name: "EmotionsCare"
  },
  { 
    key: "pixel-perfect-replica", 
    repo: "laeticiamng/pixel-perfect-replica",
    liveUrl: "https://pixel-perfect-clone-6574.lovable.app",
    name: "Pixel Perfect Replica"
  },
  { 
    key: "system-compass", 
    repo: "laeticiamng/system-compass",
    liveUrl: "https://world-alignment.lovable.app",
    name: "System Compass"
  },
  { 
    key: "growth-copilot", 
    repo: "laeticiamng/growth-copilot",
    liveUrl: "https://agent-growth-automator.com",
    name: "Growth Copilot"
  },
  { 
    key: "med-mng", 
    repo: "laeticiamng/med-mng",
    liveUrl: "https://medmng.com",
    name: "Med MNG"
  },
];

interface AnalysisRequest {
  platform_key: string;
  analysis_type?: "full" | "quick";
}

async function fetchGitHubAPI(endpoint: string, token: string): Promise<any> {
  const response = await fetch(`https://api.github.com${endpoint}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "EMOTIONSCARE-HQ",
    },
  });

  if (!response.ok) {
    console.error(`GitHub API error for ${endpoint}:`, response.status);
    return null;
  }

  return response.json();
}

async function scrapeWebsite(url: string, firecrawlKey: string): Promise<any> {
  try {
    console.log(`[Analysis] Scraping website: ${url}`);
    
    const response = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${firecrawlKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url,
        formats: ["markdown", "links"],
        onlyMainContent: true,
      }),
    });

    if (!response.ok) {
      console.error(`Firecrawl error: ${response.status}`);
      return { success: false, error: `Firecrawl error: ${response.status}` };
    }

    const data = await response.json();
    return { success: true, ...data };
  } catch (error) {
    console.error("Scrape error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Scrape failed" };
  }
}

async function fetchGitHubRepoInfo(repo: string, token: string): Promise<any> {
  const [repoData, commits, issues, prs, languages, readme] = await Promise.all([
    fetchGitHubAPI(`/repos/${repo}`, token),
    fetchGitHubAPI(`/repos/${repo}/commits?per_page=10`, token),
    fetchGitHubAPI(`/repos/${repo}/issues?state=all&per_page=30`, token),
    fetchGitHubAPI(`/repos/${repo}/pulls?state=all&per_page=30`, token),
    fetchGitHubAPI(`/repos/${repo}/languages`, token),
    fetchGitHubAPI(`/repos/${repo}/readme`, token),
  ]);

  // Decode README if available
  let readmeContent = "";
  if (readme?.content) {
    try {
      readmeContent = atob(readme.content);
    } catch (e) {
      console.error("Failed to decode README");
    }
  }

  const openIssues = (issues || []).filter((i: any) => i.state === "open" && !i.pull_request).length;
  const closedIssues = (issues || []).filter((i: any) => i.state === "closed" && !i.pull_request).length;
  const openPRs = (prs || []).filter((pr: any) => pr.state === "open").length;
  const mergedPRs = (prs || []).filter((pr: any) => pr.merged_at).length;

  return {
    name: repoData?.name,
    description: repoData?.description,
    stars: repoData?.stargazers_count || 0,
    forks: repoData?.forks_count || 0,
    watchers: repoData?.watchers_count || 0,
    size: repoData?.size || 0,
    default_branch: repoData?.default_branch || "main",
    created_at: repoData?.created_at,
    updated_at: repoData?.updated_at,
    pushed_at: repoData?.pushed_at,
    languages: languages || {},
    commits_count: commits?.length || 0,
    recent_commits: (commits || []).slice(0, 5).map((c: any) => ({
      sha: c.sha?.slice(0, 7),
      message: c.commit?.message?.split("\n")[0],
      date: c.commit?.author?.date,
      author: c.commit?.author?.name,
    })),
    issues: { open: openIssues, closed: closedIssues },
    pull_requests: { open: openPRs, merged: mergedPRs },
    readme_preview: readmeContent.slice(0, 2000),
    has_readme: !!readme,
  };
}

async function generateAIAnalysis(
  platformName: string,
  websiteData: any,
  githubData: any,
  lovableApiKey: string
): Promise<string> {
  const prompt = `Tu es un analyste technique senior. Analyse la plateforme "${platformName}" de manière exhaustive.

## Données du site web (Firecrawl)
${websiteData.success ? `
- Contenu extrait: ${websiteData.data?.markdown?.slice(0, 3000) || "Non disponible"}
- Liens trouvés: ${websiteData.data?.links?.length || 0}
` : `Scraping échoué: ${websiteData.error}`}

## Données GitHub
- Repository: ${githubData.name}
- Description: ${githubData.description || "Non définie"}
- Stars: ${githubData.stars}, Forks: ${githubData.forks}
- Langages: ${Object.keys(githubData.languages || {}).join(", ")}
- Issues: ${githubData.issues?.open} ouvertes, ${githubData.issues?.closed} fermées
- PRs: ${githubData.pull_requests?.open} ouvertes, ${githubData.pull_requests?.merged} mergées
- Dernière activité: ${githubData.pushed_at}
- Commits récents:
${githubData.recent_commits?.map((c: any) => `  - ${c.sha}: ${c.message} (${c.author})`).join("\n")}

## README (aperçu)
${githubData.readme_preview?.slice(0, 1500) || "README non disponible"}

---

Génère un rapport d'analyse structuré avec:

1. **Résumé Exécutif** (2-3 phrases)
2. **État Technique**
   - Stack détectée
   - Qualité du code (estimation)
   - Architecture perçue
3. **Métriques Clés**
   - Activité du dépôt
   - Santé du projet (issues/PRs)
4. **Forces** (3-5 points)
5. **Points d'Amélioration** (3-5 points)
6. **Recommandations Prioritaires** (3 actions)
7. **Score Global** (/100)

Réponds en français, format Markdown structuré.`;

  try {
    console.log("[Analysis] Calling Lovable AI for analysis...");
    
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "Tu es un analyste technique expert en développement web et mobile. Tu fournis des analyses détaillées, structurées et actionnables." },
          { role: "user", content: prompt }
        ],
        max_tokens: 4000,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Analysis] AI error:", response.status, errorText);
      return `## Erreur d'analyse\n\nL'analyse IA a échoué (${response.status}). Données brutes disponibles ci-dessus.`;
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "Analyse non générée";
  } catch (error) {
    console.error("[Analysis] AI call failed:", error);
    return `## Erreur d'analyse\n\n${error instanceof Error ? error.message : "Erreur inconnue"}`;
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
    const GITHUB_TOKEN = Deno.env.get("GITHUB_TOKEN");
    const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !SUPABASE_ANON_KEY) {
      throw new Error("Configuration Supabase manquante");
    }

    // ============================================
    // AUTHENTICATION & AUTHORIZATION CHECK
    // ============================================
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.error("[Platform Analysis] Missing authorization header");
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
      console.error("[Platform Analysis] Invalid token:", claimsError?.message);
      return new Response(
        JSON.stringify({ error: "Token invalide ou expiré" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = claimsData.claims.sub;
    console.log(`[Platform Analysis] Authenticated user: ${userId}`);

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: hasOwnerRole, error: roleError } = await supabaseAdmin.rpc("has_role", {
      _user_id: userId,
      _role: "owner"
    });

    if (roleError || !hasOwnerRole) {
      console.error(`[Platform Analysis] User ${userId} lacks owner role`);
      return new Response(
        JSON.stringify({ error: "Permissions insuffisantes - rôle owner requis" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[Platform Analysis] User ${userId} authorized as owner`);
    // ============================================

    const { platform_key, analysis_type = "full" }: AnalysisRequest = await req.json();

    if (!platform_key) {
      return new Response(
        JSON.stringify({ success: false, error: "platform_key requis" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const platform = PLATFORMS.find(p => p.key === platform_key);
    if (!platform) {
      return new Response(
        JSON.stringify({ success: false, error: `Plateforme inconnue: ${platform_key}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[Platform Analysis] Starting ${analysis_type} analysis for ${platform.name}`);

    // Check required API keys
    if (!GITHUB_TOKEN) {
      return new Response(
        JSON.stringify({ success: false, error: "GITHUB_TOKEN non configuré" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ success: false, error: "LOVABLE_API_KEY non configuré" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch data in parallel
    const [websiteData, githubData] = await Promise.all([
      FIRECRAWL_API_KEY 
        ? scrapeWebsite(platform.liveUrl, FIRECRAWL_API_KEY)
        : { success: false, error: "FIRECRAWL_API_KEY non configuré" },
      fetchGitHubRepoInfo(platform.repo, GITHUB_TOKEN),
    ]);

    console.log(`[Platform Analysis] Data fetched - Website: ${websiteData.success}, GitHub: ${!!githubData}`);

    // Generate AI analysis
    const aiAnalysis = await generateAIAnalysis(
      platform.name,
      websiteData,
      githubData,
      LOVABLE_API_KEY
    );

    const result = {
      success: true,
      platform: {
        key: platform.key,
        name: platform.name,
        liveUrl: platform.liveUrl,
        repo: platform.repo,
      },
      analyzed_at: new Date().toISOString(),
      website: {
        scraped: websiteData.success,
        links_count: websiteData.data?.links?.length || 0,
        content_length: websiteData.data?.markdown?.length || 0,
        error: websiteData.error,
      },
      github: {
        stars: githubData.stars,
        forks: githubData.forks,
        languages: Object.keys(githubData.languages || {}),
        issues_open: githubData.issues?.open || 0,
        issues_closed: githubData.issues?.closed || 0,
        prs_open: githubData.pull_requests?.open || 0,
        prs_merged: githubData.pull_requests?.merged || 0,
        last_push: githubData.pushed_at,
        recent_commits: githubData.recent_commits,
      },
      analysis: aiAnalysis,
    };

    console.log(`[Platform Analysis] Complete for ${platform.name}`);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[Platform Analysis] Error:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : "Erreur inconnue" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
