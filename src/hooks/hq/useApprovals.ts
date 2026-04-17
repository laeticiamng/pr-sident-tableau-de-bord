import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { logger } from "@/lib/logger";

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

/** Fetch actions waiting for owner approval. */
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

/** Approve, reject or defer an action. */
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
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    },
  });
}
