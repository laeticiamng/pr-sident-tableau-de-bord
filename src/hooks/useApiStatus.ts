import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

interface ApiStatus {
  github: boolean;
  stripe: boolean;
  perplexity: boolean;
  lovable_ai: boolean;
  firecrawl: boolean;
}

interface ApiStatusResponse {
  status: ApiStatus;
  checked_at: string;
}

export function useApiStatus() {
  return useQuery({
    queryKey: ["api-status"],
    queryFn: async (): Promise<ApiStatusResponse> => {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      if (!token) {
        throw new Error("Non authentifié");
      }

      const { data, error } = await supabase.functions.invoke("check-api-status", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (error) {
        logger.error("[useApiStatus] Error:", error);
        throw new Error(error.message || "Erreur lors de la vérification");
      }

      return data as ApiStatusResponse;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
}
