 import { useState } from "react";
 import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
 import { Button } from "@/components/ui/button";
 import { Badge } from "@/components/ui/badge";
 import { 
   RefreshCw, 
   Database, 
   TrendingUp, 
   Search, 
   BarChart3, 
   Zap,
   CheckCircle2,
   AlertCircle,
   Clock
 } from "lucide-react";
 import { useGrowthAnalytics } from "@/hooks/useGrowthAnalytics";
 import { cn } from "@/lib/utils";
 
 interface SyncSource {
   id: string;
   name: string;
   icon: React.ElementType;
   action: "sync-ga4" | "sync-kpis" | "sync-gsc" | "sync-meta-ads";
   description: string;
   status: "idle" | "syncing" | "success" | "error";
   lastSync?: string;
 }
 
 export function GrowthAnalyticsSyncWidget() {
   const { executeAction, isLoading, fullSync } = useGrowthAnalytics();
   const [sources, setSources] = useState<SyncSource[]>([
     {
       id: "ga4",
       name: "Google Analytics 4",
       icon: BarChart3,
       action: "sync-ga4",
       description: "Sessions, utilisateurs, funnel",
       status: "idle",
     },
     {
       id: "gsc",
       name: "Search Console",
       icon: Search,
       action: "sync-gsc",
       description: "SEO, requêtes, positions",
       status: "idle",
     },
     {
       id: "kpis",
       name: "KPIs Agrégés",
       icon: TrendingUp,
       action: "sync-kpis",
       description: "MRR, LTV, CAC, Churn",
       status: "idle",
     },
     {
       id: "meta",
       name: "Meta Ads",
       icon: Zap,
       action: "sync-meta-ads",
       description: "Facebook & Instagram Ads",
       status: "idle",
     },
   ]);
 
   const syncSource = async (sourceId: string) => {
     const source = sources.find(s => s.id === sourceId);
     if (!source) return;
 
     setSources(prev => prev.map(s => 
       s.id === sourceId ? { ...s, status: "syncing" as const } : s
     ));
 
     const result = await executeAction(source.action);
 
     setSources(prev => prev.map(s => 
       s.id === sourceId ? { 
         ...s, 
         status: result?.success ? "success" as const : "error" as const,
         lastSync: result?.success ? new Date().toISOString() : s.lastSync
       } : s
     ));
 
     // Reset status after 3 seconds
     setTimeout(() => {
       setSources(prev => prev.map(s => 
         s.id === sourceId ? { ...s, status: "idle" as const } : s
       ));
     }, 3000);
   };
 
   const handleFullSync = async () => {
     setSources(prev => prev.map(s => ({ ...s, status: "syncing" as const })));
     
     const result = await fullSync();
     
     setSources(prev => prev.map(s => ({ 
       ...s, 
       status: result?.success ? "success" as const : "error" as const,
       lastSync: result?.success ? new Date().toISOString() : s.lastSync
     })));
 
     setTimeout(() => {
       setSources(prev => prev.map(s => ({ ...s, status: "idle" as const })));
     }, 3000);
   };
 
   const getStatusIcon = (status: SyncSource["status"]) => {
     switch (status) {
       case "syncing":
         return <RefreshCw className="h-4 w-4 animate-spin text-primary" />;
       case "success":
                 return <CheckCircle2 className="h-4 w-4 text-success" />;
       case "error":
         return <AlertCircle className="h-4 w-4 text-destructive" />;
       default:
         return <Clock className="h-4 w-4 text-muted-foreground" />;
     }
   };
 
   return (
     <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
       <CardHeader className="pb-3">
         <div className="flex items-center justify-between">
           <div className="flex items-center gap-2">
             <Database className="h-5 w-5 text-primary" />
             <CardTitle className="text-base">Growth OS Sync</CardTitle>
           </div>
           <Badge variant="outline" className="text-xs">
             API v2.0
           </Badge>
         </div>
       </CardHeader>
       <CardContent className="space-y-4">
         {/* Sources list */}
         <div className="space-y-2">
           {sources.map((source) => (
             <div
               key={source.id}
               className={cn(
                 "flex items-center justify-between p-3 rounded-lg",
                 "bg-muted/30 hover:bg-muted/50 transition-colors"
               )}
             >
               <div className="flex items-center gap-3">
                 <div className="p-2 rounded-md bg-primary/10">
                   <source.icon className="h-4 w-4 text-primary" />
                 </div>
                 <div>
                   <p className="text-sm font-medium">{source.name}</p>
                   <p className="text-xs text-muted-foreground">{source.description}</p>
                 </div>
               </div>
               <div className="flex items-center gap-2">
                 {getStatusIcon(source.status)}
                 <Button
                   variant="ghost"
                   size="sm"
                   onClick={() => syncSource(source.id)}
                   disabled={isLoading || source.status === "syncing"}
                 >
                   <RefreshCw className={cn(
                     "h-4 w-4",
                     source.status === "syncing" && "animate-spin"
                   )} />
                 </Button>
               </div>
             </div>
           ))}
         </div>
 
         {/* Full sync button */}
         <Button
           onClick={handleFullSync}
           disabled={isLoading}
           className="w-full"
           variant="default"
         >
           {isLoading ? (
             <>
               <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
               Synchronisation en cours...
             </>
           ) : (
             <>
               <Zap className="mr-2 h-4 w-4" />
               Sync Complète
             </>
           )}
         </Button>
 
         <p className="text-xs text-center text-muted-foreground">
           Connecté à l'API Growth OS • 38 endpoints disponibles
         </p>
       </CardContent>
     </Card>
   );
 }