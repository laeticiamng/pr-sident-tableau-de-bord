 import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
 import { Badge } from "@/components/ui/badge";
 import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
 import { TrendingUp, TrendingDown, Target, Users, DollarSign, Clock, Activity, Zap, Database, AlertTriangle, Link2 } from "lucide-react";
 import { cn } from "@/lib/utils";
import { useGrowthMetrics } from "@/hooks/useGrowthMetrics";
 
 const metricsConfig = [
   { key: "cac", label: "CAC", icon: DollarSign, format: "€", inverse: true, description: "Coût d'Acquisition Client" },
   { key: "ltv", label: "LTV", icon: Users, format: "€", inverse: false, description: "Valeur Vie Client" },
   { key: "ltvCacRatio", label: "LTV:CAC", icon: Target, format: "x", inverse: false, description: "Ratio rentabilité" },
   { key: "arpu", label: "ARPU", icon: DollarSign, format: "€", inverse: false, description: "Revenu Moyen par Utilisateur" },
   { key: "paybackPeriod", label: "Payback", icon: Clock, format: " mois", inverse: true, description: "Période de remboursement" },
   { key: "mau", label: "MAU", icon: Users, format: "", inverse: false, description: "Utilisateurs Actifs Mensuels" },
   { key: "dau", label: "DAU", icon: Activity, format: "", inverse: false, description: "Utilisateurs Actifs Quotidiens" },
   { key: "dauMauRatio", label: "DAU/MAU", icon: Zap, format: "%", inverse: false, description: "Ratio d'engagement" },
 ];
 
 export function GrowthMetricsGrid() {
   const { metrics, isLoading } = useGrowthMetrics();
 
   if (isLoading) {
     return (
       <div className="space-y-2">
         <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 sm:gap-3">
           {metricsConfig.map((config) => (
             <Skeleton key={config.key} className="h-20 rounded-xl" />
           ))}
         </div>
       </div>
     );
   }
 
   // État vide - aucune donnée réelle
   if (!metrics.isRealData) {
     return (
       <div className="space-y-2">
         <div className="flex items-center justify-end gap-2">
           <Badge variant="destructive" className="text-[9px] gap-1">
             <AlertTriangle className="h-2.5 w-2.5" />
             Aucune donnée réelle
           </Badge>
         </div>
         <Card className="border-dashed border-2 border-muted-foreground/20">
           <CardContent className="py-8 text-center">
             <Database className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
             <h3 className="text-sm font-semibold mb-1">Connexion Stripe requise</h3>
             <p className="text-xs text-muted-foreground mb-3 max-w-md mx-auto">
               Les métriques de croissance nécessitent une connexion Stripe active avec des données réelles.
             </p>
             <Badge variant="outline" className="text-[10px] gap-1">
               <Link2 className="h-2.5 w-2.5" />
               Configurez STRIPE_SECRET_KEY dans les secrets
             </Badge>
           </CardContent>
         </Card>
       </div>
     );
   }
 
   return (
     <div className="space-y-2">
       {/* Data source indicator */}
       <div className="flex items-center justify-end gap-2">
         <Badge variant="success" className="text-[9px] gap-1">
           <Database className="h-2.5 w-2.5" />
           Stripe Live
         </Badge>
       </div>
       
       <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 sm:gap-3">
       {metricsConfig.map((config) => {
         const metric = metrics[config.key as keyof typeof metrics];
         if (!metric || typeof metric !== 'object' || !('value' in metric)) return null;
         
         const isPositive = config.inverse ? metric.trend < 0 : metric.trend > 0;
         const absBenchmark = metric.benchmark as number | null;
         const beatsBenchmark = absBenchmark ? (config.inverse ? metric.value < absBenchmark : metric.value > absBenchmark) : null;
         
         return (
           <Tooltip key={config.key}>
             <TooltipTrigger asChild>
               <Card className={cn(
                 "card-executive cursor-help transition-all hover:scale-[1.02]",
                 beatsBenchmark === true && "ring-1 ring-success/30",
                 beatsBenchmark === false && "ring-1 ring-warning/30"
               )}>
                 <CardContent className="p-3">
                   <div className="flex items-center justify-between mb-1">
                     <config.icon className="h-3.5 w-3.5 text-muted-foreground" />
                     <div className={cn(
                       "flex items-center gap-0.5 text-[10px] font-medium",
                       isPositive ? "text-success" : "text-destructive"
                     )}>
                       {isPositive ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
                       {Math.abs(metric.trend).toFixed(1)}%
                     </div>
                   </div>
                   <div className="text-lg sm:text-xl font-bold text-foreground">
                     {config.format === "€" && "€"}
                     {typeof metric.value === "number" ? metric.value.toLocaleString("fr-FR") : metric.value}
                     {config.format !== "€" && config.format}
                   </div>
                   <div className="text-[9px] sm:text-[10px] text-muted-foreground font-medium uppercase tracking-wide">
                     {config.label}
                   </div>
                 </CardContent>
               </Card>
             </TooltipTrigger>
             <TooltipContent side="bottom" className="max-w-[200px]">
               <div className="space-y-1">
                 <p className="font-semibold">{config.description}</p>
                 {absBenchmark && (
                   <p className="text-xs text-muted-foreground">
                     Benchmark: {config.format === "€" && "€"}{absBenchmark}{config.format !== "€" && config.format}
                     {beatsBenchmark ? " ✓" : " ⚠"}
                   </p>
                 )}
               {metrics.isRealData && (
                 <p className="text-[10px] text-success">✓ Source: Stripe API</p>
               )}
               </div>
             </TooltipContent>
           </Tooltip>
         );
       })}
       </div>
     </div>
   );
 }