import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// The 5 managed repositories
const MANAGED_REPOS = [
  { key: "emotionscare", repo: "laeticiamng/emotionscare" },
  { key: "pixel-perfect-replica", repo: "laeticiamng/pixel-perfect-replica" },
  { key: "system-compass", repo: "laeticiamng/system-compass" },
  { key: "growth-copilot", repo: "laeticiamng/growth-copilot" },
  { key: "med-mng", repo: "laeticiamng/med-mng" },
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

export interface GitHubSyncResult {
  success: boolean;
  repos: GitHubRepo[];
  syncedAt: string;
}

// Hook: Fetch GitHub data for all platforms
export function useGitHubData() {
  return useQuery({
    queryKey: ["github", "all"],
    queryFn: async (): Promise<GitHubSyncResult> => {
      try {
        const { data, error } = await supabase.functions.invoke("github-sync", {
          body: { action: "sync_all" },
        });

        if (error) throw error;
        
        // Transform the response to match our expected interface
        const transformedData: GitHubSyncResult = {
          success: data.success,
          repos: (data.data || []).map((repoData: any) => ({
            key: repoData.key,
            repo: repoData.repo,
            commits: (repoData.commits || []).map((c: any) => ({
              sha: c.sha,
              message: c.message,
              author: c.author,
              date: c.date,
              url: `https://github.com/${repoData.repo}/commit/${c.sha}`,
            })),
            issues: (repoData.issues || []).map((i: any) => ({
              number: i.number,
              title: i.title,
              state: i.state as "open" | "closed",
              labels: i.labels || [],
              createdAt: i.created_at,
              url: `https://github.com/${repoData.repo}/issues/${i.number}`,
            })),
            pullRequests: (repoData.pullRequests || []).map((pr: any) => ({
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
        };
        
        return transformedData;
      } catch (e) {
        console.warn("GitHub sync failed:", e);
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
        console.warn(`GitHub sync failed for ${platformKey}:`, e);
        return null;
      }
    },
    enabled: !!platformKey,
    staleTime: 1000 * 60 * 5,
  });
}

// Hook: Force sync GitHub data
export function useGitHubSync() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (platformKey?: string) => {
      const { data, error } = await supabase.functions.invoke("github-sync", {
        body: { 
          action: platformKey ? "sync_platform" : "sync_all",
          platform_key: platformKey,
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Synchronisation GitHub réussie",
        description: "Les données ont été mises à jour",
      });
      queryClient.invalidateQueries({ queryKey: ["github"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur de synchronisation",
        description: error.message,
        variant: "destructive",
      });
    },
  });
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
    totalCommits: data?.repos.reduce((sum, r) => sum + r.commits.length, 0) || 0,
    totalOpenIssues: data?.repos.reduce((sum, r) => sum + r.issues.filter(i => i.state === "open").length, 0) || 0,
    totalOpenPRs: data?.repos.reduce((sum, r) => sum + r.pullRequests.filter(pr => pr.state === "open").length, 0) || 0,
    lastSynced: data?.syncedAt ? new Date(data.syncedAt) : null,
  };
}
