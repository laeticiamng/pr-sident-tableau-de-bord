import { supabase } from "@/integrations/supabase/client";

// ========== GitHub Sync API ==========
export interface GitHubSyncResult {
  success: boolean;
  error?: string;
  summary?: {
    synced_at: string;
    platforms_count: number;
    total_open_issues: number;
    total_open_prs: number;
    platforms: {
      key: string;
      open_issues: number;
      open_prs: number;
      last_commit: string | null;
      last_release: string | null;
    }[];
  };
  data?: any[];
}

export async function syncGitHub(platformKey?: string): Promise<GitHubSyncResult> {
  const { data, error } = await supabase.functions.invoke("github-sync", {
    body: { platform_key: platformKey },
  });

  if (error) {
    return { success: false, error: error.message };
  }
  return data;
}

// ========== Intelligence Search API (Perplexity) ==========
export interface IntelligenceSearchResult {
  success: boolean;
  error?: string;
  query?: string;
  type?: string;
  response?: string;
  citations?: string[];
  searched_at?: string;
}

export type SearchType = "competitive" | "market" | "technical" | "general";
export type SearchRecency = "day" | "week" | "month" | "year";

export async function intelligenceSearch(
  query: string,
  type: SearchType = "general",
  searchRecency: SearchRecency = "week"
): Promise<IntelligenceSearchResult> {
  const { data, error } = await supabase.functions.invoke("intelligence-search", {
    body: { query, type, search_recency: searchRecency },
  });

  if (error) {
    return { success: false, error: error.message };
  }
  return data;
}

// ========== Web Scraper API (Firecrawl) ==========
export interface WebScraperResult {
  success: boolean;
  error?: string;
  action?: string;
  markdown?: string;
  links?: string[];
  data?: any[];
  scraped_at?: string;
}

export type ScrapeAction = "scrape" | "search" | "map";

export async function webScraper(
  url: string,
  action: ScrapeAction = "scrape",
  options?: {
    formats?: string[];
    query?: string;
    limit?: number;
    onlyMainContent?: boolean;
  }
): Promise<WebScraperResult> {
  const { data, error } = await supabase.functions.invoke("web-scraper", {
    body: { url, action, options },
  });

  if (error) {
    return { success: false, error: error.message };
  }
  return data;
}

// ========== Platform Monitor API ==========
export interface PlatformMonitorResult {
  success: boolean;
  error?: string;
  summary?: {
    checked_at: string;
    overall_status: "green" | "amber" | "red";
    platforms_total: number;
    platforms_green: number;
    platforms_amber: number;
    platforms_red: number;
    avg_response_time_ms: number;
    platforms: {
      key: string;
      status: "green" | "amber" | "red";
      response_time_ms: number | null;
      error: string | null;
    }[];
  };
  details?: any[];
}

export async function monitorPlatforms(platformKey?: string): Promise<PlatformMonitorResult> {
  const { data, error } = await supabase.functions.invoke("platform-monitor", {
    body: { platform_key: platformKey },
  });

  if (error) {
    return { success: false, error: error.message };
  }
  return data;
}

// ========== Platform Analysis API (NEW) ==========
export interface PlatformAnalysisResult {
  success: boolean;
  error?: string;
  platform?: {
    key: string;
    name: string;
    liveUrl: string;
    repo: string;
  };
  analyzed_at?: string;
  website?: {
    scraped: boolean;
    links_count: number;
    content_length: number;
    error?: string;
  };
  github?: {
    stars: number;
    forks: number;
    languages: string[];
    issues_open: number;
    issues_closed: number;
    prs_open: number;
    prs_merged: number;
    last_push: string;
    recent_commits: Array<{
      sha: string;
      message: string;
      date: string;
      author: string;
    }>;
  };
  analysis?: string;
}

export async function analyzePlatform(
  platformKey: string,
  analysisType: "full" | "quick" = "full"
): Promise<PlatformAnalysisResult> {
  const { data, error } = await supabase.functions.invoke("platform-analysis", {
    body: { platform_key: platformKey, analysis_type: analysisType },
  });

  if (error) {
    return { success: false, error: error.message };
  }
  return data;
}

// ========== Convenience functions for HQ ==========

/**
 * Lance une veille concurrentielle complète
 */
export async function runCompetitiveAnalysis(competitor: string): Promise<IntelligenceSearchResult> {
  return intelligenceSearch(
    `Analyse concurrentielle de ${competitor} dans le secteur des logiciels applicatifs français. 
     Forces, faiblesses, stratégie, positionnement, technologies utilisées.`,
    "competitive",
    "month"
  );
}

/**
 * Recherche les tendances du marché
 */
export async function searchMarketTrends(sector: string): Promise<IntelligenceSearchResult> {
  return intelligenceSearch(
    `Tendances actuelles du marché ${sector} en France et en Europe. 
     Évolutions technologiques, opportunités, nouvelles réglementations.`,
    "market",
    "week"
  );
}

/**
 * Effectue un audit technique d'un site/service
 */
export async function technicalAudit(url: string): Promise<WebScraperResult> {
  return webScraper(url, "scrape", {
    formats: ["markdown", "links"],
    onlyMainContent: true,
  });
}

/**
 * Cartographie un site concurrent
 */
export async function mapCompetitorSite(url: string): Promise<WebScraperResult> {
  return webScraper(url, "map", { limit: 200 });
}

/**
 * Lance une analyse IA complète d'une plateforme
 */
export async function runPlatformAudit(platformKey: string): Promise<PlatformAnalysisResult> {
  return analyzePlatform(platformKey, "full");
}
