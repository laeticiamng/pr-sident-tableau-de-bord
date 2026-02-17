import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./use-toast";
import { logger } from "@/lib/logger";

export interface PlatformHealthResult {
  key: string;
  url: string;
  status: "green" | "amber" | "red";
  statusCode: number | null;
  responseTime: number | null;
  error: string | null;
  checkedAt: string;
}

export interface PlatformMonitorSummary {
  checked_at: string;
  overall_status: "green" | "amber" | "red";
  platforms_total: number;
  platforms_green: number;
  platforms_amber: number;
  platforms_red: number;
  avg_response_time_ms: number;
  platforms: Array<{
    key: string;
    status: "green" | "amber" | "red";
    response_time_ms: number | null;
    error: string | null;
  }>;
}

export interface PlatformMonitorResponse {
  success: boolean;
  summary: PlatformMonitorSummary;
  details: PlatformHealthResult[];
  error?: string;
}

// Hook pour récupérer le statut temps réel des plateformes
export function usePlatformMonitor(platformKey?: string) {
  return useQuery({
    queryKey: ["platform-monitor", platformKey || "all"],
    queryFn: async (): Promise<PlatformMonitorResponse> => {
      const { data, error } = await supabase.functions.invoke("platform-monitor", {
        body: platformKey ? { platform_key: platformKey } : {},
      });

      if (error) {
        logger.error("[usePlatformMonitor] Edge function error:", error.message);
        throw new Error(error.message || "Erreur de monitoring");
      }

      if (!data || !data.success) {
        throw new Error(data?.error || "Réponse invalide du monitoring");
      }

      return data as PlatformMonitorResponse;
    },
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 60,
    retry: 2,
  });
}

// Hook pour rafraîchir manuellement le monitoring
export function useRefreshPlatformMonitor() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (platformKey?: string) => {
      const { data, error } = await supabase.functions.invoke("platform-monitor", {
        body: platformKey ? { platform_key: platformKey } : {},
      });

      if (error) {
        throw new Error(error.message || "Erreur de monitoring");
      }

      if (!data) {
        throw new Error("Réponse vide du monitoring");
      }

      return data as PlatformMonitorResponse;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["platform-monitor", "all"], data);
      toast({
        title: "Monitoring actualisé",
        description: `${data.summary.platforms_green} plateformes vertes sur ${data.summary.platforms_total}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur de monitoring",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// Hook pour les métriques consolidées des plateformes
export function useConsolidatedMetrics() {
  const { data: monitorData, isLoading: monitorLoading } = usePlatformMonitor();

  // Transform platforms to consistent format
  const platforms = monitorData?.details.map(d => ({
    key: d.key,
    status: d.status,
    responseTime: d.responseTime,
    error: d.error,
  })) || [];

  // Calcul des métriques consolidées
  const metrics = {
    totalPlatforms: monitorData?.summary.platforms_total || 7,
    greenPlatforms: monitorData?.summary.platforms_green || 0,
    amberPlatforms: monitorData?.summary.platforms_amber || 0,
    redPlatforms: monitorData?.summary.platforms_red || 0,
    avgResponseTime: monitorData?.summary.avg_response_time_ms || 0,
    overallStatus: monitorData?.summary.overall_status || "amber" as const,
    lastChecked: monitorData?.summary.checked_at || null,
    uptimePercent: monitorData ?
      ((monitorData.summary.platforms_green / monitorData.summary.platforms_total) * 100) : 0,
    platforms,
  };

  return {
    metrics,
    isLoading: monitorLoading,
    isHealthy: metrics.overallStatus === "green",
    needsAttention: metrics.overallStatus === "amber",
    isCritical: metrics.overallStatus === "red",
  };
}
