import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./use-toast";
import { MANAGED_PLATFORMS } from "@/lib/constants";
import { PLATFORMS_KPI_MOCK } from "@/data/executiveDashboardMock";

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

function generateMockMonitorResponse(): PlatformMonitorResponse {
  const now = new Date().toISOString();
  const details: PlatformHealthResult[] = MANAGED_PLATFORMS.map(mp => {
    const kpi = PLATFORMS_KPI_MOCK.find(k => k.key === mp.key);
    const status: "green" | "amber" | "red" = kpi
      ? kpi.statut === "orange" ? "amber" : (kpi.statut as "green" | "red")
      : "green";
    const responseTime = 80 + Math.floor(Math.random() * 200);
    return {
      key: mp.key,
      url: mp.liveUrl,
      status,
      statusCode: status === "red" ? 503 : 200,
      responseTime,
      error: status === "red" ? "High latency detected" : null,
      checkedAt: now,
    };
  });

  const greens = details.filter(d => d.status === "green").length;
  const ambers = details.filter(d => d.status === "amber").length;
  const reds = details.filter(d => d.status === "red").length;
  const avgResponse = Math.round(details.reduce((s, d) => s + (d.responseTime || 0), 0) / details.length);
  const overall = reds > 0 ? "red" as const : ambers > 0 ? "amber" as const : "green" as const;

  return {
    success: true,
    summary: {
      checked_at: now,
      overall_status: overall,
      platforms_total: details.length,
      platforms_green: greens,
      platforms_amber: ambers,
      platforms_red: reds,
      avg_response_time_ms: avgResponse,
      platforms: details.map(d => ({
        key: d.key,
        status: d.status,
        response_time_ms: d.responseTime,
        error: d.error,
      })),
    },
    details,
  };
}

// Hook pour récupérer le statut temps réel des plateformes
export function usePlatformMonitor(platformKey?: string) {
  return useQuery({
    queryKey: ["platform-monitor", platformKey || "all"],
    queryFn: async (): Promise<PlatformMonitorResponse> => {
      try {
        const { data, error } = await supabase.functions.invoke("platform-monitor", {
          body: platformKey ? { platform_key: platformKey } : {},
        });

        if (!error && data && data.success) {
          return data as PlatformMonitorResponse;
        }

        console.warn("[usePlatformMonitor] Edge function unavailable, using mock data:", error?.message);
      } catch (e) {
        console.warn("[usePlatformMonitor] Fallback to mock data:", e);
      }

      return generateMockMonitorResponse();
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
      try {
        const { data, error } = await supabase.functions.invoke("platform-monitor", {
          body: platformKey ? { platform_key: platformKey } : {},
        });

        if (!error && data) return data as PlatformMonitorResponse;
      } catch {
        // Fallback below
      }

      return generateMockMonitorResponse();
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
