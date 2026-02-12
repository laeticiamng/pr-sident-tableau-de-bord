 import { Badge } from "@/components/ui/badge";
 import { Button } from "@/components/ui/button";
 import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
 import { 
   Rocket, 
   TrendingUp, 
   Brain, 
   Workflow, 
   Users, 
   Target,
   RefreshCcw,
   Download,
   Sparkles,
   Database,
   Cloud,
  AlertCircle,
  Bell
 } from "lucide-react";
import { useGrowthMetrics } from "@/hooks/useGrowthMetrics";
import { useGrowthAlerts } from "@/hooks/useGrowthAlerts";
import { toast } from "sonner";
import { logger } from "@/lib/logger";
 
 // Growth OS Components
 import { GrowthMetricsGrid } from "@/components/hq/growth/GrowthMetricsGrid";
 import { ConversionFunnelWidget } from "@/components/hq/growth/ConversionFunnelWidget";
 import { ChannelAttributionWidget } from "@/components/hq/growth/ChannelAttributionWidget";
 import { RetentionCohortWidget } from "@/components/hq/growth/RetentionCohortWidget";
 import { UserSegmentsWidget } from "@/components/hq/growth/UserSegmentsWidget";
 import { AutomationWorkflowsWidget } from "@/components/hq/growth/AutomationWorkflowsWidget";
 import { AIPredictionsWidget } from "@/components/hq/growth/AIPredictionsWidget";
 import { AIRecommendationsWidget } from "@/components/hq/growth/AIRecommendationsWidget";
 import { GrowthTrendChart } from "@/components/hq/growth/GrowthTrendChart";
import { GrowthAlertsWidget } from "@/components/hq/growth/GrowthAlertsWidget";
 import { GrowthAnalyticsSyncWidget } from "@/components/hq/growth/GrowthAnalyticsSyncWidget";
 
 export default function GrowthPage() {
   const { metrics, isLoading, error } = useGrowthMetrics();
  const { hasCritical, criticalAlerts } = useGrowthAlerts();
 
   const handleRefresh = () => {
     window.location.reload();
   };

   const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
   };

   const convertToCsv = (rows: Array<Record<string, string | number | boolean>>) => {
    if (rows.length === 0) {
      return "";
    }

    const headers = Object.keys(rows[0]);
    const escape = (value: string | number | boolean) => `"${String(value).replaceAll('"', '""')}"`;

    return [
      headers.join(","),
      ...rows.map((row) => headers.map((header) => escape(row[header] ?? "")).join(",")),
    ].join("\n");
   };
 
   const handleExport = () => {
     try {
      const now = new Date();
      const timestamp = now.toISOString().replaceAll(":", "-");

      const metricsRows = [
        { metric: "CAC", value: metrics.cac.value, trendPercent: metrics.cac.trend, benchmark: metrics.cac.benchmark ?? "N/A" },
        { metric: "LTV", value: metrics.ltv.value, trendPercent: metrics.ltv.trend, benchmark: metrics.ltv.benchmark ?? "N/A" },
        { metric: "LTV:CAC", value: metrics.ltvCacRatio.value, trendPercent: metrics.ltvCacRatio.trend, benchmark: metrics.ltvCacRatio.benchmark ?? "N/A" },
        { metric: "ARPU", value: metrics.arpu.value, trendPercent: metrics.arpu.trend, benchmark: metrics.arpu.benchmark ?? "N/A" },
        { metric: "PaybackPeriod", value: metrics.paybackPeriod.value, trendPercent: metrics.paybackPeriod.trend, benchmark: metrics.paybackPeriod.benchmark ?? "N/A" },
        { metric: "MAU", value: metrics.mau.value, trendPercent: metrics.mau.trend, benchmark: metrics.mau.benchmark ?? "N/A" },
        { metric: "DAU", value: metrics.dau.value, trendPercent: metrics.dau.trend, benchmark: metrics.dau.benchmark ?? "N/A" },
        { metric: "DAU:MAU", value: metrics.dauMauRatio.value, trendPercent: metrics.dauMauRatio.trend, benchmark: metrics.dauMauRatio.benchmark ?? "N/A" },
        { metric: "MRR", value: metrics.mrr.value, trendPercent: metrics.mrr.trend, benchmark: metrics.mrr.benchmark ?? "N/A" },
        { metric: "Churn", value: metrics.churn.value, trendPercent: metrics.churn.trend, benchmark: metrics.churn.benchmark ?? "N/A" },
      ];

      const alertRows = criticalAlerts.map((alert) => ({
        id: alert.id,
        severity: alert.severity,
        title: alert.title,
        metric: alert.metric,
        value: alert.value,
        threshold: alert.threshold,
        action: alert.action,
      }));

      const metadataRows = [
        {
          generatedAt: now.toISOString(),
          dataSource: metrics.isRealData ? "stripe_live" : "simulated",
          hasCriticalAlerts: hasCritical,
          criticalAlertsCount: criticalAlerts.length,
        },
      ];

      downloadFile(convertToCsv(metricsRows), `growth-metrics-${timestamp}.csv`, "text/csv;charset=utf-8");
      downloadFile(convertToCsv(alertRows), `growth-critical-alerts-${timestamp}.csv`, "text/csv;charset=utf-8");
      downloadFile(JSON.stringify(metadataRows[0], null, 2), `growth-export-metadata-${timestamp}.json`, "application/json;charset=utf-8");

      toast.success("Export Growth OS généré (CSV + JSON).");
     } catch (exportError) {
      logger.error("Growth export failed", exportError);
      toast.error("Échec de l'export Growth OS. Réessayez.");
     }
   };
 
   return (
     <div className="space-y-6 animate-fade-in">
       {/* Header */}
       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
         <div>
           <div className="flex items-center gap-3 mb-2">
             <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-platform-growth text-white">
               <Rocket className="h-5 w-5" />
             </div>
             <div>
               <h1 className="text-xl sm:text-2xl font-bold text-foreground">Growth OS</h1>
               <p className="text-xs sm:text-sm text-muted-foreground">
                 Intelligence stratégique et pilotage de croissance
               </p>
             </div>
           </div>
         </div>
         
         <div className="flex items-center gap-2">
           {/* Data source indicator */}
           {!isLoading && (
             <Badge 
               variant={metrics.isRealData ? "success" : "subtle"} 
               className="text-xs gap-1"
             >
               {metrics.isRealData ? (
                 <>
                   <Database className="h-3 w-3" />
                   Stripe Live
                 </>
               ) : (
                 <>
                   <Cloud className="h-3 w-3" />
                   Données Simulées
                 </>
               )}
             </Badge>
           )}
           <Badge variant="gold" className="text-xs">
             <Sparkles className="h-3 w-3 mr-1" />
             IA Active
           </Badge>
           <Button variant="outline" size="sm" className="text-xs" onClick={handleRefresh}>
             <RefreshCcw className="h-3 w-3 mr-1.5" />
             Actualiser
           </Button>
           <Button variant="outline" size="sm" className="text-xs" onClick={handleExport}>
             <Download className="h-3 w-3 mr-1.5" />
             Export
           </Button>
         </div>
       </div>
 
       {/* Error Alert */}
       {error && (
         <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
           <AlertCircle className="h-4 w-4 flex-shrink-0" />
           <span>Erreur de chargement des données : {error.message}</span>
         </div>
       )}
 
      {/* Critical Alerts Banner */}
      {hasCritical && criticalAlerts.length > 0 && (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/30 animate-pulse">
          <Bell className="h-5 w-5 text-destructive flex-shrink-0" />
          <div className="flex-1">
            <span className="text-sm font-semibold text-destructive">
              {criticalAlerts.length} alerte{criticalAlerts.length > 1 ? "s" : ""} critique{criticalAlerts.length > 1 ? "s" : ""}
            </span>
            <span className="text-xs text-muted-foreground ml-2">
              {criticalAlerts[0]?.title}
            </span>
          </div>
          <Badge variant="destructive" className="text-xs">
            Action requise
          </Badge>
        </div>
      )}

       {/* KPI Metrics Bar */}
       <GrowthMetricsGrid />
 
       {/* Main Tabs */}
       <Tabs defaultValue="overview" className="space-y-4">
         <TabsList className="grid w-full grid-cols-4 h-auto p-1">
           <TabsTrigger value="overview" className="text-xs sm:text-sm py-2">
             <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-1.5" />
             <span className="hidden sm:inline">Vue d'ensemble</span>
             <span className="sm:hidden">Vue</span>
           </TabsTrigger>
           <TabsTrigger value="acquisition" className="text-xs sm:text-sm py-2">
             <Target className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-1.5" />
             <span className="hidden sm:inline">Acquisition</span>
             <span className="sm:hidden">Acq.</span>
           </TabsTrigger>
           <TabsTrigger value="retention" className="text-xs sm:text-sm py-2">
             <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-1.5" />
             <span className="hidden sm:inline">Rétention</span>
             <span className="sm:hidden">Rét.</span>
           </TabsTrigger>
           <TabsTrigger value="intelligence" className="text-xs sm:text-sm py-2">
             <Brain className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-1.5" />
             <span className="hidden sm:inline">Intelligence IA</span>
             <span className="sm:hidden">IA</span>
           </TabsTrigger>
         </TabsList>
 
         {/* Overview Tab */}
         <TabsContent value="overview" className="space-y-4 mt-4">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
             <GrowthTrendChart />
             <AIPredictionsWidget />
           </div>
           
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
             <ConversionFunnelWidget />
             <AIRecommendationsWidget />
           </div>
         </TabsContent>
 
         {/* Acquisition Tab */}
         <TabsContent value="acquisition" className="space-y-4 mt-4">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
             <ConversionFunnelWidget />
             <ChannelAttributionWidget />
           </div>
           
           <div className="grid grid-cols-1 gap-4">
             <GrowthTrendChart />
           </div>
         </TabsContent>
 
         {/* Retention Tab */}
         <TabsContent value="retention" className="space-y-4 mt-4">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
             <RetentionCohortWidget />
             <UserSegmentsWidget />
           </div>
           
           <div className="grid grid-cols-1 gap-4">
             <AutomationWorkflowsWidget />
           </div>
         </TabsContent>
 
         {/* Intelligence Tab */}
         <TabsContent value="intelligence" className="space-y-4 mt-4">
           <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
             <GrowthAnalyticsSyncWidget />
             <GrowthAlertsWidget />
             <AIPredictionsWidget />
             <AIRecommendationsWidget />
           </div>
           
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
             <AutomationWorkflowsWidget />
             <UserSegmentsWidget />
           </div>
         </TabsContent>
       </Tabs>
     </div>
   );
 }
