 import { useState, useCallback } from "react";
 import { supabase } from "@/integrations/supabase/client";
 import { useToast } from "@/hooks/use-toast";
 import { logger } from "@/lib/logger";
 
 export type GrowthAnalyticsAction = 
   | "sync-ga4"
   | "sync-kpis"
   | "sync-gsc"
   | "sync-meta-ads"
   | "sync-google-ads"
   | "monitoring-metrics"
   | "analytics-guardian"
   | "generate-report"
   | "ai-insights"
   | "perplexity-research"
   | "full-sync";
 
 export interface GA4Data {
   sessions: number;
   users: number;
   newUsers: number;
   pageviews: number;
   bounceRate: number;
   avgSessionDuration: number;
   byDate: Array<{
     date: string;
     sessions: number;
     users: number;
   }>;
   bySource: Array<{
     source: string;
     medium: string;
     sessions: number;
     conversions: number;
   }>;
 }
 
 export interface KPIData {
   mrr: number;
   arr: number;
   churn: number;
   ltv: number;
   cac: number;
   nps: number;
   activeUsers: number;
   conversionRate: number;
 }
 
 export interface MonitoringData {
   uptime: number;
   latency: number;
   errorRate: number;
   requestsPerMinute: number;
   alerts: Array<{
     type: string;
     severity: string;
     message: string;
     timestamp: string;
   }>;
 }
 
 export interface AnalyticsGuardianAlert {
   id: string;
   type: "anomaly" | "threshold" | "trend";
   severity: "low" | "medium" | "high" | "critical";
   metric: string;
   message: string;
   recommendation: string;
   detectedAt: string;
 }
 
 export interface GrowthAnalyticsResult {
   success: boolean;
   action: string;
   timestamp: string;
   data?: Record<string, unknown>;
   error?: string;
 }
 
 export function useGrowthAnalytics() {
   const [isLoading, setIsLoading] = useState(false);
   const [lastSync, setLastSync] = useState<string | null>(null);
   const { toast } = useToast();
 
   const executeAction = useCallback(async (
     action: GrowthAnalyticsAction,
     params: Record<string, unknown> = {}
   ): Promise<GrowthAnalyticsResult | null> => {
     setIsLoading(true);
     
     try {
       const { data, error } = await supabase.functions.invoke("growth-analytics", {
         body: { action, params },
       });
 
       if (error) {
         logger.error("Growth Analytics error:", error);
         toast({
           title: "Erreur Analytics",
           description: error.message || "Impossible de contacter l'API Growth OS",
           variant: "destructive",
         });
         return null;
       }
 
       setLastSync(new Date().toISOString());
       
       if (data?.success) {
         toast({
           title: "Sync réussie",
           description: `Action "${action}" exécutée avec succès`,
         });
       }
 
       return data as GrowthAnalyticsResult;
     } catch (err) {
       logger.error("Growth Analytics call failed:", err);
       toast({
         title: "Erreur",
         description: "Échec de la connexion à Growth OS",
         variant: "destructive",
       });
       return null;
     } finally {
       setIsLoading(false);
     }
   }, [toast]);
 
   // Convenience methods for common actions
   const syncGA4 = useCallback((dateRange?: string) => 
     executeAction("sync-ga4", { dateRange }), [executeAction]);
 
   const syncKPIs = useCallback((sources?: string[]) => 
     executeAction("sync-kpis", { sources }), [executeAction]);
 
   const syncGSC = useCallback((dateRange?: string) => 
     executeAction("sync-gsc", { dateRange }), [executeAction]);
 
   const getMonitoringMetrics = useCallback((timeRange?: string) => 
     executeAction("monitoring-metrics", { timeRange }), [executeAction]);
 
   const getAnalyticsAlerts = useCallback((severity?: string) => 
     executeAction("analytics-guardian", { severity }), [executeAction]);
 
   const generateReport = useCallback((reportType?: string, format?: string) => 
     executeAction("generate-report", { reportType, format }), [executeAction]);
 
   const getAIInsights = useCallback((question: string, dataContext?: Record<string, unknown>) =>
     executeAction("ai-insights", { question, dataContext }), [executeAction]);
 
   const fullSync = useCallback(() => 
     executeAction("full-sync"), [executeAction]);
 
   return {
     isLoading,
     lastSync,
     executeAction,
     // Convenience methods
     syncGA4,
     syncKPIs,
     syncGSC,
     getMonitoringMetrics,
     getAnalyticsAlerts,
     generateReport,
     getAIInsights,
     fullSync,
   };
 }