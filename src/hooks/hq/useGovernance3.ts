/**
 * Horizon 3 — Hooks gouvernance avancée
 * - useSLOStatus       : 4 SLO (uptime, p95, success, freshness)
 * - useTopRunCosts     : Top-5 ventilation coûts IA / 30j
 * - useGovernanceDashboard : Score audit + roadmap + reliability + runbooks
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

export interface SLOEntry {
  key: string;
  name: string;
  target_pct: number;
  current_pct: number;
  is_compliant: boolean;
  budget_remaining_pct?: number;
  current_value_ms?: number;
  threshold_ms?: number;
  total_runs?: number;
  success_runs?: number;
  recent_runs_24h?: number;
}

export interface SLOStatus {
  window_days: number;
  computed_at: string;
  slos: SLOEntry[];
}

export interface TopRunCostEntry {
  run_type: string;
  run_count: number;
  unit_cost_eur: number;
  total_cost_eur: number;
}

export interface TopRunCosts {
  window_days: number;
  computed_at: string;
  top_5: TopRunCostEntry[];
  total_cost_eur: number;
  total_runs: number;
}

export interface RoadmapItem {
  horizon: string;
  name: string;
  status: "completed" | "in_progress" | "todo";
  progress: number;
  highlights: string[];
}

export interface Runbook {
  id: string;
  title: string;
  steps: string[];
}

export interface GovernanceDashboard {
  computed_at: string;
  audit_score: number;
  audit_grade: "A+" | "A" | "B" | "C" | "D";
  roadmap: RoadmapItem[];
  reliability: {
    total_runs_30d: number;
    failed_runs_30d: number;
    success_rate_pct: number;
    dlq_pending: number;
    dlq_abandoned: number;
  };
  governance: {
    recent_audit_actions_7d: number;
    rls_policies_count: number;
    edge_functions_count: number;
  };
  runbooks: Runbook[];
}

export function useSLOStatus(enabled = true) {
  return useQuery({
    queryKey: ["hq", "slo_status"],
    queryFn: async (): Promise<SLOStatus | null> => {
      const { data, error } = await supabase.rpc("get_hq_slo_status");
      if (error) {
        logger.warn("[useSLOStatus] RPC error:", error.message);
        return null;
      }
      return data as unknown as SLOStatus;
    },
    enabled,
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
}

export function useTopRunCosts(windowDays = 30, enabled = true) {
  return useQuery({
    queryKey: ["hq", "top_run_costs", windowDays],
    queryFn: async (): Promise<TopRunCosts | null> => {
      const { data, error } = await supabase.rpc("get_hq_top_run_costs", { p_window_days: windowDays });
      if (error) {
        logger.warn("[useTopRunCosts] RPC error:", error.message);
        return null;
      }
      return data as unknown as TopRunCosts;
    },
    enabled,
    staleTime: 5 * 60_000,
  });
}

export function useGovernanceDashboard(enabled = true) {
  return useQuery({
    queryKey: ["hq", "governance_dashboard"],
    queryFn: async (): Promise<GovernanceDashboard | null> => {
      const { data, error } = await supabase.rpc("get_hq_governance_dashboard");
      if (error) {
        logger.warn("[useGovernanceDashboard] RPC error:", error.message);
        return null;
      }
      return data as unknown as GovernanceDashboard;
    },
    enabled,
    refetchInterval: 2 * 60_000,
    staleTime: 60_000,
  });
}
