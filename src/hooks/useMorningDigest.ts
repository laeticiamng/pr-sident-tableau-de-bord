import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface MorningDigest {
  id: string;
  digest_date: string;
  executive_summary: string;
  sections: Record<string, unknown>;
  data_sources: string[];
  model_used: string | null;
  generation_duration_ms: number | null;
  triggered_by: string;
  created_at: string;
}

/**
 * Fetches the latest morning digest from the dedicated hq.morning_digests table.
 * Falls back to the latest DAILY_EXECUTIVE_BRIEF run if no dedicated digest exists.
 */
export function useMorningDigest() {
  return useQuery({
    queryKey: ["hq", "morning-digest"],
    queryFn: async (): Promise<MorningDigest | null> => {
      // Try the dedicated morning_digests table first
      const { data, error } = await supabase.rpc("get_hq_morning_digest" as any, {
        p_date: new Date().toISOString().split("T")[0],
      });

      if (!error && data && Array.isArray(data) && data.length > 0) {
        return data[0] as MorningDigest;
      }

      // Fallback: get from runs table
      const { data: runs, error: runsError } = await supabase.rpc("get_hq_recent_runs", {
        limit_count: 20,
      });

      if (runsError || !runs) return null;

      const digest = (runs as any[])?.find(
        (r) =>
          r.run_type === "DAILY_EXECUTIVE_BRIEF" &&
          r.status === "completed" &&
          r.executive_summary
      );

      if (!digest) return null;

      return {
        id: digest.id,
        digest_date: new Date(digest.created_at).toISOString().split("T")[0],
        executive_summary: digest.executive_summary,
        sections: digest.detailed_appendix || {},
        data_sources: digest.detailed_appendix?.data_sources || [],
        model_used: digest.detailed_appendix?.model_used || null,
        generation_duration_ms: null,
        triggered_by: digest.owner_requested ? "manual" : "scheduler",
        created_at: digest.created_at,
      };
    },
    staleTime: 1000 * 60 * 2,
    refetchInterval: 1000 * 60 * 5,
  });
}
