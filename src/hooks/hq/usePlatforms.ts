import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

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

/** Fetch all HQ platforms via secure RPC. Refetches every 5 min. */
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

/** Fetch a single platform from the cached list. */
export function usePlatform(key: string) {
  const { data: platforms } = usePlatforms();

  return useQuery({
    queryKey: ["hq", "platforms", key],
    queryFn: async () => platforms?.find((p) => p.key === key) || null,
    enabled: !!key && !!platforms,
  });
}
