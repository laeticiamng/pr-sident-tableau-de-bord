import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

export interface DLQEntry {
  id: string;
  original_run_id: string;
  run_type: string;
  platform_key: string | null;
  attempts: number;
  max_attempts: number;
  status: "pending" | "in_progress" | "recovered" | "abandoned";
  failure_reason: string | null;
  last_error: string | null;
  next_retry_at: string;
  created_at: string;
  resolved_at: string | null;
}

/** Hook : entrées DLQ (Dead Letter Queue) — runs failed en cours de retry. */
export function useDLQEntries(limit = 50) {
  return useQuery({
    queryKey: ["hq", "dlq_entries", limit],
    queryFn: async (): Promise<DLQEntry[]> => {
      const { data, error } = await supabase.rpc("get_hq_dlq_entries" as never, {
        limit_count: limit,
      });
      if (error) {
        logger.error("[useDLQEntries] RPC error:", (error as Error).message);
        return [];
      }
      return (data as unknown as DLQEntry[]) || [];
    },
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 60,
  });
}

export interface RunDurationMetrics {
  window_days: number;
  total_runs: number;
  avg_ms: number;
  p50_ms: number;
  p95_ms: number;
  p99_ms: number;
  max_ms: number;
  by_run_type: Array<{
    run_type: string;
    count: number;
    avg_ms: number;
    p95_ms: number;
  }>;
  computed_at: string;
}

/** Hook : métriques durée runs (p50/p95/p99 sur 7j). */
export function useRunDurationMetrics() {
  return useQuery({
    queryKey: ["hq", "run_duration_metrics"],
    queryFn: async (): Promise<RunDurationMetrics | null> => {
      const { data, error } = await supabase.rpc(
        "get_hq_run_duration_metrics" as never
      );
      if (error) {
        logger.error("[useRunDurationMetrics] RPC error:", (error as Error).message);
        return null;
      }
      return (data as unknown as RunDurationMetrics) || null;
    },
    staleTime: 1000 * 60 * 5,
    refetchInterval: 1000 * 60 * 5,
  });
}
