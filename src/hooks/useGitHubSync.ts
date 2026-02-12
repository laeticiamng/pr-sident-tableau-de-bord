import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { logger } from "@/lib/logger";

// The 7 managed repositories
const MANAGED_REPOS = [
  { key: "emotionscare", repo: "laeticiamng/emotionscare" },
  { key: "nearvity", repo: "laeticiamng/nearvity" },
  { key: "system-compass", repo: "laeticiamng/system-compass" },
  { key: "growth-copilot", repo: "laeticiamng/growth-copilot" },
  { key: "med-mng", repo: "laeticiamng/med-mng" },
  { key: "swift-care-hub", repo: "laeticiamng/swift-care-hub" },
  { key: "track-triumph-tavern", repo: "laeticiamng/track-triumph-tavern" },
];

export interface GitHubRepo {
  key: string;
  repo: string;
  commits: GitHubCommit[];
  issues: GitHubIssue[];
  pullRequests: GitHubPullRequest[];
  lastSynced: Date | null;
  error?: string;
}

export interface GitHubCommit {
  sha: string;
  message: string;
  author: string;
  date: string;
  url: string;
}

export interface GitHubIssue {
  number: number;
  title: string;
  state: "open" | "closed";
  labels: string[];
  createdAt: string;
  url: string;
}

export interface GitHubPullRequest {
  number: number;
  title: string;
  state: "open" | "closed" | "merged";
  author: string;
  createdAt: string;
  url: string;
}

export interface GitHubPlatformStats {
  key: string;
  commits: number;
  branches: number;
  contributors: number;
  stars: number;
  forks: number;
  open_issues: number;
  open_prs: number;
  last_commit: string | null;
  last_release: string | null;
}

export interface GitHubSyncSummary {
  synced_at: string;
  platforms_count: number;
  total_commits: number;
  total_branches: number;
  total_contributors: number;
  total_stars: number;
  total_open_issues: number;
  total_open_prs: number;
  platforms: GitHubPlatformStats[];
}

export interface GitHubSyncResult {
  success: boolean;
  summary: GitHubSyncSummary;
  data: Record<string, unknown>[];
  error?: string;
}

export interface GitHubDataResult {
  success: boolean;
  repos: GitHubRepo[];
  syncedAt: string;
  summary?: GitHubSyncSummary;
}

// Hook: Fetch GitHub data for all platforms
export function useGitHubData() {
  return useQuery({
    queryKey: ["github", "all"],
    queryFn: async (): Promise<GitHubDataResult> => {
      try {
        const { data, error } = await supabase.functions.invoke("github-sync", {
          body: { action: "sync_all" },
        });

        if (error) throw error;
        
        // Transform the response to match our expected interface
        interface RawCommit { sha: string; message: string; author: string; date: string }
        interface RawIssue { number: number; title: string; state: string; labels?: string[]; created_at: string }
        interface RawPR { number: number; title: string; state: string; author?: string; created_at: string }
        interface RawRepo { key: string; repo: string; commits?: RawCommit[]; issues?: RawIssue[]; pullRequests?: RawPR[] }

        const transformedData: GitHubDataResult = {
          success: data.success,
          repos: ((data.data || []) as RawRepo[]).map((repoData) => ({
            key: repoData.key,
            repo: repoData.repo,
            commits: (repoData.commits || []).map((c) => ({
              sha: c.sha,
              message: c.message,
              author: c.author,
              date: c.date,
              url: `https://github.com/${repoData.repo}/commit/${c.sha}`,
            })),
            issues: (repoData.issues || []).map((i) => ({
              number: i.number,
              title: i.title,
              state: i.state as "open" | "closed",
              labels: i.labels || [],
              createdAt: i.created_at,
              url: `https://github.com/${repoData.repo}/issues/${i.number}`,
            })),
            pullRequests: (repoData.pullRequests || []).map((pr) => ({
              number: pr.number,
              title: pr.title,
              state: pr.state as "open" | "closed" | "merged",
              author: pr.author || "Unknown",
              createdAt: pr.created_at,
              url: `https://github.com/${repoData.repo}/pull/${pr.number}`,
            })),
            lastSynced: new Date(),
          })),
          syncedAt: data.summary?.synced_at || new Date().toISOString(),
          summary: data.summary,
        };
        
        return transformedData;
      } catch (e) {
        logger.warn("GitHub sync failed:", e);
        // Return empty data structure on error
        return {
          success: false,
          repos: MANAGED_REPOS.map(r => ({
            key: r.key,
            repo: r.repo,
            commits: [],
            issues: [],
            pullRequests: [],
            lastSynced: null,
            error: "Sync failed",
          })),
          syncedAt: new Date().toISOString(),
        };
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });
}

// Hook: Fetch GitHub data for a single platform
export function useGitHubPlatform(platformKey: string) {
  return useQuery({
    queryKey: ["github", "platform", platformKey],
    queryFn: async (): Promise<GitHubRepo | null> => {
      try {
        const { data, error } = await supabase.functions.invoke("github-sync", {
          body: { action: "sync_platform", platform_key: platformKey },
        });

        if (error) throw error;
        
        return data as GitHubRepo;
      } catch (e) {
        logger.warn(`GitHub sync failed for ${platformKey}:`, e);
        return null;
      }
    },
    enabled: !!platformKey,
    staleTime: 1000 * 60 * 5,
  });
}

// Hook: Force sync GitHub data with full stats
export function useGitHubSync() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [lastSyncResult, setLastSyncResult] = useState<GitHubSyncResult | null>(null);

  const mutation = useMutation({
    mutationFn: async (platformKey?: string): Promise<GitHubSyncResult> => {
      const { data, error } = await supabase.functions.invoke("github-sync", {
        body: platformKey ? { platform_key: platformKey } : {},
      });

      if (error) throw error;
      
      if (!data.success) {
        throw new Error(data.error || "Synchronisation échouée");
      }
      
      return data as GitHubSyncResult;
    },
    onSuccess: (data) => {
      setLastSyncResult(data);
      toast({
        title: "Synchronisation GitHub réussie",
        description: `${data.summary.total_commits.toLocaleString()} commits synchronisés sur ${data.summary.platforms_count} plateformes`,
      });
      queryClient.invalidateQueries({ queryKey: ["github"] });
      queryClient.invalidateQueries({ queryKey: ["hq", "platforms"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur de synchronisation",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    sync: mutation.mutate,
    syncAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    lastSyncResult,
    error: mutation.error,
  };
}

// Helper to get repo name for a platform key
export function getRepoForPlatform(platformKey: string): string | null {
  const found = MANAGED_REPOS.find(r => r.key === platformKey);
  return found?.repo || null;
}

// Get total stats across all repos
export function useGitHubStats() {
  const { data, isLoading } = useGitHubData();

  return {
    isLoading,
    // Use summary stats if available (more accurate), fallback to counting
    totalCommits: data?.summary?.total_commits ?? data?.repos.reduce((sum, r) => sum + r.commits.length, 0) ?? 0,
    totalBranches: data?.summary?.total_branches ?? 0,
    totalContributors: data?.summary?.total_contributors ?? 0,
    totalStars: data?.summary?.total_stars ?? 0,
    totalOpenIssues: data?.summary?.total_open_issues ?? data?.repos.reduce((sum, r) => sum + r.issues.filter(i => i.state === "open").length, 0) ?? 0,
    totalOpenPRs: data?.summary?.total_open_prs ?? data?.repos.reduce((sum, r) => sum + r.pullRequests.filter(pr => pr.state === "open").length, 0) ?? 0,
    lastSynced: data?.syncedAt ? new Date(data.syncedAt) : null,
    platformStats: data?.summary?.platforms ?? [],
  };
}

// Get stats for a specific platform
export function useGitHubPlatformStats(platformKey: string) {
  const { platformStats } = useGitHubStats();
  return platformStats.find(p => p.key === platformKey) ?? null;
}
