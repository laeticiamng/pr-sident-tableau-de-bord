import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { logger } from "@/lib/logger";

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


// ─── Hooks ──────────────────────────────────────────────────────────────

// Hook: Fetch platforms from RPC
export function usePlatforms() {
  return useQuery({
    queryKey: ["hq", "platforms"],
    queryFn: async (): Promise<Platform[]> => {
      const { data, error } = await supabase.rpc("get_all_hq_platforms");

      if (error) {
        logger.error("[usePlatforms] RPC error:", error.message);
        throw new Error(error.message);
      }

      return (data as Platform[]) || [];
    },
    staleTime: 1000 * 60 * 5,
    refetchInterval: 1000 * 60 * 5,
    refetchIntervalInBackground: false,
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
        logger.warn("RPC error:", error.message);
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
        logger.warn("RPC error:", error.message);
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
        logger.error("[usePendingApprovals] RPC error:", error.message);
        throw new Error(error.message);
      }

      return (data as Action[]) || [];
    },
  });
}

// Hook: Fetch recent runs
export function useRecentRuns(limit = 10) {
  return useQuery({
    queryKey: ["hq", "runs", "recent", limit],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_hq_recent_runs", { limit_count: limit });

      if (error) {
        logger.error("[useRecentRuns] RPC error:", error.message);
        throw new Error(error.message);
      }

      return (data as Run[]) || [];
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
        logger.error("[useAuditLogs] RPC error:", error.message);
        throw new Error(error.message);
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
        logger.warn("RPC error:", error.message);
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

      if (error) {
        throw new Error(error.message || "Erreur lors de l'exécution du run");
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      return data as ExecutiveRunResult;
    },
    onSuccess: (data) => {
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
      decision: "approved" | "rejected" | "deferred";
      reason?: string;
    }) => {
      const { error } = await supabase.rpc("approve_hq_action", {
        p_action_id: action_id,
        p_decision: decision,
        p_reason: reason || null,
      });

      if (error) throw error;

      return { action_id, decision };
    },
    onSuccess: (data) => {
      const labels: Record<string, string> = {
        approved: "Action approuvée",
        rejected: "Action rejetée",
        deferred: "Action reportée",
      };
      toast({
        title: labels[data.decision] || "Décision enregistrée",
        description: "Décision enregistrée",
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
