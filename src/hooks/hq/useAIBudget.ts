import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

export interface AIBudgetStatus {
  monthly_cost_eur: number;
  daily_cost_eur: number;
  monthly_target_eur: number;
  alert_threshold_pct: number;
  pct_used: number;
  projection_eur: number;
  is_alert_threshold_reached: boolean;
  last_alert_sent_at: string | null;
  computed_at: string;
}

/**
 * Hook : statut budget IA temps réel.
 * Calcule le coût mensuel cumulé, la projection fin de mois et si le seuil d'alerte est franchi.
 */
export function useAIBudget() {
  return useQuery({
    queryKey: ["hq", "ai_budget_status"],
    queryFn: async (): Promise<AIBudgetStatus | null> => {
      const { data, error } = await supabase.rpc(
        "get_hq_ai_budget_status" as never
      );
      if (error) {
        logger.error("[useAIBudget] RPC error:", (error as Error).message);
        return null;
      }
      return (data as unknown) as AIBudgetStatus | null;
    },
    staleTime: 1000 * 60 * 5,
    refetchInterval: 1000 * 60 * 5,
  });
}
