import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Run } from "@/hooks/useHQData";

/**
 * Fetches the latest automated DAILY_EXECUTIVE_BRIEF run from today.
 * Used by BriefingRoom to auto-display the morning digest without user action.
 */
export function useMorningDigest() {
  return useQuery({
    queryKey: ["hq", "morning-digest"],
    queryFn: async (): Promise<Run | null> => {
      const { data, error } = await supabase.rpc("get_hq_recent_runs", { limit_count: 50 });

      if (error) throw new Error(error.message);

      const today = new Date().toDateString();

      // Find the latest completed automated DAILY_EXECUTIVE_BRIEF from today
      const digest = (data as Run[])?.find(
        (r) =>
          r.run_type === "DAILY_EXECUTIVE_BRIEF" &&
          r.status === "completed" &&
          r.executive_summary &&
          !r.owner_requested &&
          new Date(r.completed_at || r.created_at).toDateString() === today
      );

      // Fallback: if no automated brief today, show the latest one (any source)
      if (!digest) {
        return (
          (data as Run[])?.find(
            (r) =>
              r.run_type === "DAILY_EXECUTIVE_BRIEF" &&
              r.status === "completed" &&
              r.executive_summary
          ) || null
        );
      }

      return digest;
    },
    staleTime: 1000 * 60 * 2, // 2 min
    refetchInterval: 1000 * 60 * 5, // poll every 5 min for new digest
  });
}
