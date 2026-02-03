import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Les 5 plateformes managées (registre immuable)
const MANAGED_REPOS = [
  { key: "emotionscare", repo: "laeticiamng/emotionscare" },
  { key: "pixel-perfect-replica", repo: "laeticiamng/pixel-perfect-replica" },
  { key: "system-compass", repo: "laeticiamng/system-compass" },
  { key: "growth-copilot", repo: "laeticiamng/growth-copilot" },
  { key: "med-mng", repo: "laeticiamng/med-mng" },
];

interface RepoData {
  key: string;
  repo: string;
  commits: {
    sha: string;
    message: string;
    author: string;
    date: string;
  }[];
  issues: {
    number: number;
    title: string;
    state: string;
    created_at: string;
    labels: string[];
  }[];
  pullRequests: {
    number: number;
    title: string;
    state: string;
    created_at: string;
    draft: boolean;
  }[];
  releases: {
    tag: string;
    name: string;
    published_at: string;
    prerelease: boolean;
  }[];
  stats: {
    openIssues: number;
    openPRs: number;
    lastCommit: string | null;
    lastRelease: string | null;
  };
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

async function fetchRepoData(repoInfo: typeof MANAGED_REPOS[0], token: string): Promise<RepoData> {
  const { key, repo } = repoInfo;
  
  // Fetch en parallèle pour la performance
  const [commitsData, issuesData, prsData, releasesData] = await Promise.all([
    fetchGitHubAPI(`/repos/${repo}/commits?per_page=10`, token),
    fetchGitHubAPI(`/repos/${repo}/issues?state=open&per_page=20`, token),
    fetchGitHubAPI(`/repos/${repo}/pulls?state=open&per_page=20`, token),
    fetchGitHubAPI(`/repos/${repo}/releases?per_page=5`, token),
  ]);

  const commits = (commitsData || []).map((c: any) => ({
    sha: c.sha?.slice(0, 7),
    message: c.commit?.message?.split("\n")[0] || "",
    author: c.commit?.author?.name || "Unknown",
    date: c.commit?.author?.date || "",
  }));

  const issues = (issuesData || [])
    .filter((i: any) => !i.pull_request)
    .map((i: any) => ({
      number: i.number,
      title: i.title,
      state: i.state,
      created_at: i.created_at,
      labels: i.labels?.map((l: any) => l.name) || [],
    }));

  const pullRequests = (prsData || []).map((pr: any) => ({
    number: pr.number,
    title: pr.title,
    state: pr.state,
    created_at: pr.created_at,
    draft: pr.draft || false,
  }));

  const releases = (releasesData || []).map((r: any) => ({
    tag: r.tag_name,
    name: r.name || r.tag_name,
    published_at: r.published_at,
    prerelease: r.prerelease || false,
  }));

  return {
    key,
    repo,
    commits,
    issues,
    pullRequests,
    releases,
    stats: {
      openIssues: issues.length,
      openPRs: pullRequests.length,
      lastCommit: commits[0]?.date || null,
      lastRelease: releases[0]?.published_at || null,
    },
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
    const GITHUB_TOKEN = Deno.env.get("GITHUB_TOKEN");

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !SUPABASE_ANON_KEY) {
      throw new Error("Configuration Supabase manquante");
    }

    // ============================================
    // AUTHENTICATION & AUTHORIZATION CHECK
    // ============================================
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.error("[GitHub Sync] Missing or invalid authorization header");
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
      console.error("[GitHub Sync] Invalid token:", claimsError?.message);
      return new Response(
        JSON.stringify({ error: "Token invalide ou expiré" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = claimsData.claims.sub;
    console.log(`[GitHub Sync] Authenticated user: ${userId}`);

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: hasOwnerRole, error: roleError } = await supabaseAdmin.rpc("has_role", {
      _user_id: userId,
      _role: "owner"
    });

    if (roleError || !hasOwnerRole) {
      console.error(`[GitHub Sync] User ${userId} lacks owner role`);
      return new Response(
        JSON.stringify({ error: "Permissions insuffisantes - rôle owner requis" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[GitHub Sync] User ${userId} authorized as owner`);
    // ============================================
    // END AUTHENTICATION CHECK
    // ============================================

    if (!GITHUB_TOKEN) {
      console.error("GITHUB_TOKEN non configuré");
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "GitHub token non configuré. Ajoutez GITHUB_TOKEN dans les secrets." 
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { platform_key } = await req.json().catch(() => ({}));

    let reposToFetch = MANAGED_REPOS;
    if (platform_key) {
      reposToFetch = MANAGED_REPOS.filter(r => r.key === platform_key);
      if (reposToFetch.length === 0) {
        return new Response(
          JSON.stringify({ success: false, error: `Plateforme inconnue: ${platform_key}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    console.log(`Syncing ${reposToFetch.length} repo(s)...`);

    // Fetch tous les repos en parallèle
    const results = await Promise.all(
      reposToFetch.map(repo => fetchRepoData(repo, GITHUB_TOKEN))
    );

    // Générer un résumé exécutif
    const totalOpenIssues = results.reduce((sum, r) => sum + r.stats.openIssues, 0);
    const totalOpenPRs = results.reduce((sum, r) => sum + r.stats.openPRs, 0);
    
    const summary = {
      synced_at: new Date().toISOString(),
      platforms_count: results.length,
      total_open_issues: totalOpenIssues,
      total_open_prs: totalOpenPRs,
      platforms: results.map(r => ({
        key: r.key,
        open_issues: r.stats.openIssues,
        open_prs: r.stats.openPRs,
        last_commit: r.stats.lastCommit,
        last_release: r.stats.lastRelease,
      })),
    };

    console.log("GitHub sync completed successfully");

    return new Response(
      JSON.stringify({
        success: true,
        summary,
        data: results,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("GitHub sync error:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : "Erreur inconnue" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
