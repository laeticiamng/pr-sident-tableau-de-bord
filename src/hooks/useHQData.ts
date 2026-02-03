import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Types for HQ data
export interface Platform {
  id: string;
  key: string;
  name: string;
  description: string | null;
  github_url: string | null;
  status: "green" | "amber" | "red";
  status_reason: string | null;
  uptime_percent: number | null;
  last_release_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Agent {
  id: string;
  role_key: string;
  name: string;
  is_enabled: boolean;
  model_preference: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrgRole {
  id: string;
  key: string;
  title: string;
  title_fr: string;
  category: "c_suite" | "function_head" | "platform_gm";
  description: string | null;
  created_at: string;
}

export interface Run {
  id: string;
  run_type: string;
  owner_requested: boolean;
  platform_key: string | null;
  director_agent_id: string | null;
  status: "pending" | "running" | "completed" | "failed" | "cancelled";
  started_at: string | null;
  completed_at: string | null;
  executive_summary: string | null;
  detailed_appendix: Record<string, unknown> | null;
  created_at: string;
}

export interface Action {
  id: string;
  run_id: string | null;
  agent_id: string | null;
  action_type: string;
  title: string;
  description: string | null;
  payload: Record<string, unknown> | null;
  risk_level: "low" | "medium" | "high" | "critical";
  requires_approval: boolean;
  status: "pending" | "approved" | "rejected" | "executed" | "cancelled";
  created_at: string;
  executed_at: string | null;
}

export interface AuditLog {
  id: string;
  actor_type: "owner" | "agent" | "system";
  actor_id: string | null;
  action: string;
  resource_type: string | null;
  resource_id: string | null;
  details: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
}

export interface ExecutiveRunResult {
  success: boolean;
  run_id: string;
  run_type: string;
  platform_key?: string;
  executive_summary: string;
  steps: string[];
  model_used: string;
  completed_at: string;
  error?: string;
}

// Local storage keys for cached runs
const RUNS_CACHE_KEY = "hq_runs_cache";
const PLATFORMS_CACHE_KEY = "hq_platforms_cache";

// Get cached data from localStorage
function getCachedData<T>(key: string): T[] {
  try {
    const cached = localStorage.getItem(key);
    return cached ? JSON.parse(cached) : [];
  } catch {
    return [];
  }
}

// Save data to localStorage
function setCachedData<T>(key: string, data: T[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn("Failed to cache data:", e);
  }
}

// Mock platforms data (will be replaced when RPC functions are ready)
const MOCK_PLATFORMS: Platform[] = [
  {
    id: "1",
    key: "emotionscare",
    name: "EmotionsCare",
    description: "Plateforme principale de gestion émotionnelle",
    github_url: "https://github.com/laeticiamng/emotionscare",
    status: "green",
    status_reason: "Opérationnel",
    uptime_percent: 99.9,
    last_release_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "2",
    key: "pixel-perfect-replica",
    name: "Pixel Perfect Replica",
    description: "Réplication d'interfaces haute fidélité",
    github_url: "https://github.com/laeticiamng/pixel-perfect-replica",
    status: "green",
    status_reason: "Opérationnel",
    uptime_percent: 99.8,
    last_release_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "3",
    key: "system-compass",
    name: "System Compass",
    description: "Navigation et orientation systémique",
    github_url: "https://github.com/laeticiamng/system-compass",
    status: "green",
    status_reason: "Opérationnel",
    uptime_percent: 99.9,
    last_release_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "4",
    key: "growth-copilot",
    name: "Growth Copilot",
    description: "Intelligence marketing et croissance",
    github_url: "https://github.com/laeticiamng/growth-copilot",
    status: "amber",
    status_reason: "Mise à jour en cours",
    uptime_percent: 98.5,
    last_release_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "5",
    key: "med-mng",
    name: "Med MNG",
    description: "Gestion médicale et suivi santé",
    github_url: "https://github.com/laeticiamng/med-mng",
    status: "green",
    status_reason: "Opérationnel",
    uptime_percent: 99.7,
    last_release_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// Hook: Fetch platforms (using cached/mock data until RPC is ready)
export function usePlatforms() {
  return useQuery({
    queryKey: ["hq", "platforms"],
    queryFn: async () => {
      // For now, return mock data
      // TODO: Replace with RPC call when functions are created
      return MOCK_PLATFORMS;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Hook: Fetch single platform
export function usePlatform(key: string) {
  return useQuery({
    queryKey: ["hq", "platforms", key],
    queryFn: async () => {
      return MOCK_PLATFORMS.find(p => p.key === key) || null;
    },
    enabled: !!key,
  });
}

// Hook: Fetch pending approvals (empty for now)
export function usePendingApprovals() {
  return useQuery({
    queryKey: ["hq", "actions", "pending"],
    queryFn: async (): Promise<Action[]> => {
      // TODO: Replace with RPC call when functions are created
      return [];
    },
  });
}

// Hook: Fetch recent runs from local cache
export function useRecentRuns(limit = 10) {
  return useQuery({
    queryKey: ["hq", "runs", "recent", limit],
    queryFn: async (): Promise<Run[]> => {
      const cached = getCachedData<Run>(RUNS_CACHE_KEY);
      return cached.slice(0, limit);
    },
  });
}

// Hook: Fetch audit logs (empty for now)
export function useAuditLogs(limit = 50) {
  return useQuery({
    queryKey: ["hq", "audit_logs", limit],
    queryFn: async (): Promise<AuditLog[]> => {
      // TODO: Replace with RPC call when functions are created
      return [];
    },
  });
}

// Hook: Execute an Executive Run
export function useExecuteRun() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      run_type,
      platform_key,
      context_data,
    }: {
      run_type: string;
      platform_key?: string;
      context_data?: Record<string, unknown>;
    }): Promise<ExecutiveRunResult> => {
      const { data, error } = await supabase.functions.invoke("executive-run", {
        body: { run_type, platform_key, context_data },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);
      
      return data as ExecutiveRunResult;
    },
    onSuccess: (data) => {
      // Cache the run result locally
      const cached = getCachedData<Run>(RUNS_CACHE_KEY);
      const newRun: Run = {
        id: data.run_id,
        run_type: data.run_type,
        owner_requested: true,
        platform_key: data.platform_key || null,
        director_agent_id: null,
        status: "completed",
        started_at: data.completed_at,
        completed_at: data.completed_at,
        executive_summary: data.executive_summary,
        detailed_appendix: { model_used: data.model_used, steps: data.steps },
        created_at: data.completed_at,
      };
      setCachedData(RUNS_CACHE_KEY, [newRun, ...cached].slice(0, 50));

      toast({
        title: "Run exécuté avec succès",
        description: `${data.run_type.replace(/_/g, " ")} terminé`,
      });
      queryClient.invalidateQueries({ queryKey: ["hq", "runs"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur d'exécution",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// Hook: Approve/Reject action (placeholder)
export function useApproveAction() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      action_id,
      decision,
      reason,
    }: {
      action_id: string;
      decision: "approved" | "rejected";
      reason?: string;
    }) => {
      // TODO: Implement when RPC functions are ready
      console.log("Approval:", { action_id, decision, reason });
      return { action_id, decision };
    },
    onSuccess: (data) => {
      toast({
        title: data.decision === "approved" ? "Action approuvée" : "Action rejetée",
        description: `Décision enregistrée`,
      });
      queryClient.invalidateQueries({ queryKey: ["hq", "actions"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
