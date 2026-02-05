 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
 import { Badge } from "@/components/ui/badge";
 import { Button } from "@/components/ui/button";
 import { Skeleton } from "@/components/ui/skeleton";
 import { Link } from "react-router-dom";
 import { Rocket, TrendingUp, TrendingDown, ArrowRight, Database, Cloud, Users, DollarSign, Target } from "lucide-react";
 import { cn } from "@/lib/utils";
import { useGrowthMetrics } from "@/hooks/useGrowthMetrics";
 
 /**
  * Widget compact Growth OS pour le Briefing Room
  * Affiche les KPIs essentiels avec lien vers la page complète
  */
 export function GrowthSummaryWidget() {
   const { metrics, predictions, isLoading } = useGrowthMetrics();
 
   if (isLoading) {
     return (
       <Card className="card-executive">
         <CardHeader className="pb-2">
           <Skeleton className="h-5 w-32" />
           <Skeleton className="h-4 w-48 mt-1" />
         </CardHeader>
         <CardContent>
           <div className="grid grid-cols-4 gap-3">
             {[1, 2, 3, 4].map((i) => (
               <Skeleton key={i} className="h-16" />
             ))}
           </div>
         </CardContent>
       </Card>
     );
   }
 
   const kpis = [
     { 
       label: "MRR", 
       value: `€${metrics.mrr.value.toLocaleString("fr-FR")}`, 
       trend: metrics.mrr.trend,
       icon: DollarSign,
       good: "up"
     },
     { 
       label: "LTV:CAC", 
       value: `${metrics.ltvCacRatio.value}x`, 
       trend: metrics.ltvCacRatio.trend,
       icon: Target,
       good: "up"
     },
     { 
       label: "MAU", 
       value: metrics.mau.value.toLocaleString("fr-FR"), 
       trend: metrics.mau.trend,
       icon: Users,
       good: "up"
     },
     { 
       label: "Churn", 
       value: `${metrics.churn.value}%`, 
       trend: metrics.churn.trend,
       icon: TrendingDown,
       good: "down"
     },
   ];
 
   return (
     <Card className="card-executive">
       <CardHeader className="pb-2">
         <div className="flex items-center justify-between">
           <div>
             <CardTitle className="flex items-center gap-2 text-base">
               <Rocket className="h-4 w-4 text-platform-growth" />
               Growth OS
             </CardTitle>
             <CardDescription className="text-xs">
               Métriques de croissance clés
             </CardDescription>
           </div>
           <div className="flex items-center gap-1.5">
             <Badge variant={metrics.isRealData ? "success" : "subtle"} className="text-[9px]">
               {metrics.isRealData ? (
                 <>
                   <Database className="h-2.5 w-2.5 mr-0.5" />
                   Live
                 </>
               ) : (
                 <>
                   <Cloud className="h-2.5 w-2.5 mr-0.5" />
                   Simulé
                 </>
               )}
             </Badge>
           </div>
         </div>
       </CardHeader>
       <CardContent className="space-y-3">
         <div className="grid grid-cols-4 gap-2">
           {kpis.map((kpi) => {
             const isPositive = kpi.good === "up" ? kpi.trend > 0 : kpi.trend < 0;
             return (
               <div key={kpi.label} className="text-center p-2 rounded-lg bg-muted/30">
                 <kpi.icon className="h-3.5 w-3.5 mx-auto mb-1 text-muted-foreground" />
                 <div className="text-sm sm:text-base font-bold text-foreground">
                   {kpi.value}
                 </div>
                 <div className="text-[9px] text-muted-foreground uppercase">
                   {kpi.label}
                 </div>
                 <div className={cn(
                   "text-[9px] font-medium flex items-center justify-center gap-0.5",
                   isPositive ? "text-success" : "text-destructive"
                 )}>
                   {isPositive ? <TrendingUp className="h-2 w-2" /> : <TrendingDown className="h-2 w-2" />}
                   {Math.abs(kpi.trend).toFixed(1)}%
                 </div>
               </div>
             );
           })}
         </div>
 
         {/* Prediction highlight */}
         <div className="flex items-center justify-between p-2 rounded-lg bg-accent/5 border border-accent/20">
           <div className="text-xs">
             <span className="text-muted-foreground">Prédiction MRR +90j:</span>
             <span className="font-semibold text-foreground ml-1">
               €{predictions.mrr.predicted90d.toLocaleString("fr-FR")}
             </span>
           </div>
           <Badge variant="gold" className="text-[9px]">
             {predictions.mrr.confidence}% confiance
           </Badge>
         </div>
 
         <Link to="/hq/growth">
           <Button variant="ghost" size="sm" className="w-full text-xs text-platform-growth hover:text-platform-growth/80">
             Voir le dashboard complet
             <ArrowRight className="h-3 w-3 ml-1" />
           </Button>
         </Link>
       </CardContent>
     </Card>
   );
 }