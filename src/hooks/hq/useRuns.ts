import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { RunType } from "@/lib/run-types-registry";

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
  // Circuit-breaker informational fields (optional)
  fallback_used?: boolean;
  breaker_state?: "CLOSED" | "OPEN" | "HALF_OPEN";
}

/** Fetch the most recent runs (default 10). */
export function useRecentRuns(limit = 10, enabled = true) {
  return useQuery({
    queryKey: ["hq", "runs", "recent", limit],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_hq_recent_runs", { limit_count: limit });
      if (error) throw new Error(error.message);
      return (data as Run[]) || [];
    },
    enabled,
  });
}

/** Execute an Executive Run via the edge function. */
export function useExecuteRun() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      run_type,
      platform_key,
      context_data,
    }: {
      run_type: RunType;
      platform_key?: string;
      context_data?: Record<string, unknown>;
    }): Promise<ExecutiveRunResult> => {
      const { data, error } = await supabase.functions.invoke("executive-run", {
        body: { run_type, platform_key, context_data },
      });

      if (error) throw new Error(error.message || "Erreur lors de l'exécution du run");
      if (data?.error) throw new Error(data.error);
      return data as ExecutiveRunResult;
    },
    onSuccess: (data) => {
      const fallbackNote = data.fallback_used ? " (mode dégradé)" : "";
      toast({
        title: "Run exécuté avec succès",
        description: `${data.run_type.replace(/_/g, " ")} terminé${fallbackNote}`,
      });
      queryClient.invalidateQueries({ queryKey: ["hq", "runs"] });
    },
    onError: (error: Error) => {
      const msg = error.message;
      let userMessage = msg;
      if (msg.includes("401") || msg.includes("Authorization")) {
        userMessage = "Session expirée. Veuillez vous reconnecter.";
      } else if (msg.includes("403") || msg.includes("Permissions")) {
        userMessage = "Permissions insuffisantes pour cette action.";
      } else if (msg.includes("429") || msg.includes("Limite")) {
        userMessage = "Limite de requêtes atteinte. Réessayez dans un instant.";
      } else if (msg.includes("503") || msg.includes("breaker_open") || msg.includes("unavailable")) {
        userMessage = "IA temporairement indisponible (circuit-breaker actif). Réessayez dans 1 min.";
      } else if (msg.includes("500")) {
        userMessage = "Erreur serveur. L'équipe a été notifiée.";
      }
      toast({
        title: "Erreur d'exécution",
        description: userMessage,
        variant: "destructive",
      });
    },
  });
}
