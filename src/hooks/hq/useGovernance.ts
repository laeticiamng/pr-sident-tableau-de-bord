import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { logger } from "@/lib/logger";

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

export function useAuditLogs(limit = 50, enabled = true) {
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
    enabled,
  });
}

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
      toast({ title: "Erreur", description: errorMessage, variant: "destructive" });
    },
  });
}
