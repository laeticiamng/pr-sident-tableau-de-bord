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
  role_title_fr?: string;
  role_category?: string;
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

// Hook: Fetch platforms from RPC with auto-refresh
export function usePlatforms() {
  return useQuery({
    queryKey: ["hq", "platforms"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_all_hq_platforms");
      
      if (error) {
        console.error("[usePlatforms] RPC error:", error.message);
        throw new Error(`Impossible de charger les plateformes: ${error.message}`);
      }
      
      return (data as Platform[]) || [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes - data considered fresh
    refetchInterval: 1000 * 60 * 60, // 1 hour - auto-refresh uptime data
    refetchIntervalInBackground: false, // Only refresh when tab is active
    meta: { errorMessage: "Impossible de charger les plateformes depuis la base de données" },
  });
}

// Hook: Fetch single platform
export function usePlatform(key: string) {
  const { data: platforms } = usePlatforms();
  
  return useQuery({
    queryKey: ["hq", "platforms", key],
    queryFn: async () => {
      return platforms?.find(p => p.key === key) || null;
    },
    enabled: !!key && !!platforms,
  });
}

// Hook: Fetch org roles
export function useOrgRoles() {
  return useQuery({
    queryKey: ["hq", "org_roles"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_hq_org_roles");
      
      if (error) {
        console.warn("RPC error:", error.message);
        return [];
      }
      
      return (data as OrgRole[]) || [];
    },
  });
}

// Hook: Fetch agents with their roles
export function useAgents() {
  return useQuery({
    queryKey: ["hq", "agents"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_hq_agents");
      
      if (error) {
        console.warn("RPC error:", error.message);
        return [];
      }
      
      return (data as Agent[]) || [];
    },
  });
}

// Hook: Fetch pending approvals
export function usePendingApprovals() {
  return useQuery({
    queryKey: ["hq", "actions", "pending"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_hq_pending_actions");
      
      if (error) {
        console.warn("RPC error:", error.message);
        return [];
      }
      
      return (data as Action[]) || [];
    },
  });
}

// Hook: Fetch recent runs (from DB + local cache)
export function useRecentRuns(limit = 10) {
  return useQuery({
    queryKey: ["hq", "runs", "recent", limit],
    queryFn: async () => {
      // Try to get from database
      const { data, error } = await supabase.rpc("get_hq_recent_runs", { limit_count: limit });
      
      if (!error && data && Array.isArray(data) && data.length > 0) {
        return data as Run[];
      }
      
      // Fallback to local cache
      const cached = getCachedData<Run>(RUNS_CACHE_KEY);
      return cached.slice(0, limit);
    },
  });
}

// Hook: Fetch audit logs
export function useAuditLogs(limit = 50) {
  return useQuery({
    queryKey: ["hq", "audit_logs", limit],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_hq_audit_logs", { limit_count: limit });
      
      if (error) {
        console.warn("RPC error:", error.message);
        return [];
      }
      
      return (data as AuditLog[]) || [];
    },
  });
}

// Hook: Fetch system config
export function useSystemConfig(key: string) {
  return useQuery({
    queryKey: ["hq", "system_config", key],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_hq_system_config", { config_key: key });
      
      if (error) {
        console.warn("RPC error:", error.message);
        return null;
      }
      
      return data as Record<string, unknown> | null;
    },
    enabled: !!key,
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
    onSuccess: async (data) => {
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

      // Persist to database
      try {
        const { error: dbError } = await supabase.rpc("insert_hq_run", {
          p_run_type: data.run_type,
          p_platform_key: data.platform_key || null,
          p_owner_requested: true,
          p_status: "completed",
          p_executive_summary: data.executive_summary,
          p_detailed_appendix: { model_used: data.model_used, steps: data.steps },
        });
        if (dbError) {
          console.warn("Run logged locally only:", dbError.message);
        }
      } catch (dbErr) {
        console.warn("Run logged locally only:", dbErr);
      }

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

// Hook: Approve/Reject action
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
      const { data, error } = await supabase.rpc("approve_hq_action", {
        p_action_id: action_id,
        p_decision: decision,
        p_reason: reason || null,
      });

      if (error) throw error;
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

// Hook: Update system config
export function useUpdateConfig() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      key,
      value,
    }: {
      key: string;
      value: Record<string, unknown>;
    }) => {
      const { error } = await supabase.rpc("update_hq_system_config", {
        p_key: key,
        p_value: value as unknown as Parameters<typeof supabase.rpc<"update_hq_system_config">>[1]["p_value"],
      });

      if (error) throw error;
      return { key, value };
    },
    onSuccess: (data) => {
      toast({
        title: "Configuration mise à jour",
        description: `${data.key} sauvegardé`,
      });
      queryClient.invalidateQueries({ queryKey: ["hq", "system_config"] });
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });
}

// Fallback: use static MANAGED_PLATFORMS data when DB is unavailable
function getMockPlatforms(): Platform[] {
  // Dynamic import to avoid circular dependency
  const MANAGED_PLATFORMS = [
    {
      key: "emotionscare",
      name: "EmotionsCare",
      description: "Plateforme de gestion du bien-être émotionnel pour les professionnels de santé et étudiants en médecine.",
      github: "https://github.com/laeticiamng/emotionscare",
      status: "production",
      lastCommit: "2026-02-03",
    },
    {
      key: "pixel-perfect-replica",
      name: "Pixel Perfect Replica",
      description: "PWA mobile-first de connexion sociale. Radar temps réel pour visualiser les personnes disponibles.",
      github: "https://github.com/laeticiamng/pixel-perfect-replica",
      status: "prototype",
      lastCommit: "2026-01-28",
    },
    {
      key: "system-compass",
      name: "System Compass",
      description: "Plateforme d'aide à la décision pour relocalisation internationale.",
      github: "https://github.com/laeticiamng/system-compass",
      status: "production",
      lastCommit: "2026-02-03",
    },
    {
      key: "growth-copilot",
      name: "Growth Copilot",
      description: "Growth OS : 39 employés IA premium répartis dans 11 départements.",
      github: "https://github.com/laeticiamng/growth-copilot",
      status: "production",
      lastCommit: "2026-02-02",
    },
    {
      key: "med-mng",
      name: "Med MNG",
      description: "Plateforme anti-panique cognitive pour étudiants en médecine.",
      github: "https://github.com/laeticiamng/med-mng",
      status: "production",
      lastCommit: "2026-02-03",
    },
  ];
  
  return MANAGED_PLATFORMS.map((p) => ({
    id: p.key,
    key: p.key,
    name: p.name,
    description: p.description,
    github_url: p.github,
    status: p.status === "production" ? "green" as const : p.status === "prototype" ? "amber" as const : "red" as const,
    status_reason: null,
    uptime_percent: 99.9,
    last_release_at: p.lastCommit,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));
}
