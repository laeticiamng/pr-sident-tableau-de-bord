 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
 import { Badge } from "@/components/ui/badge";
 import { Button } from "@/components/ui/button";
 import { Skeleton } from "@/components/ui/skeleton";
 import { Link } from "react-router-dom";
 import { Rocket, TrendingUp, TrendingDown, ArrowRight, Database, AlertTriangle, DollarSign, Target, Link2 } from "lucide-react";
 import { cn } from "@/lib/utils";
 import { useGrowthMetrics } from "@/hooks/useGrowthMetrics";
 import { DONNEES_INDISPONIBLES } from "@/lib/stripe-kpis-adapter";
 import { formatCurrency } from "@/hooks/useStripeKPIs";
 
 /**
  * Widget compact Growth OS pour le Briefing Room
  * Affiche les KPIs essentiels avec lien vers la page complète
  */
 export function GrowthSummaryWidget() {
   const { metrics, isLoading } = useGrowthMetrics();
 
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
 
   // État vide - aucune donnée réelle
   if (!metrics.isRealData) {
     return (
       <Card className="card-executive border-dashed border-2 border-muted-foreground/20">
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
             <Badge variant="destructive" className="text-[9px]">
               <AlertTriangle className="h-2.5 w-2.5 mr-0.5" />
               Non connecté
             </Badge>
           </div>
         </CardHeader>
         <CardContent className="py-6 text-center">
           <Database className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
           <p className="text-xs text-muted-foreground mb-3">
             Connectez Stripe pour les métriques
           </p>
           <Link to="/hq/growth">
             <Button variant="outline" size="sm" className="text-xs gap-1">
               <Link2 className="h-3 w-3" />
               Configurer
             </Button>
           </Link>
         </CardContent>
       </Card>
     );
   }
 
   const kpis = [
     {
       label: "MRR",
       value: metrics.mrr.value != null && metrics.currency ? formatCurrency(metrics.mrr.value, metrics.currency) : DONNEES_INDISPONIBLES,
       trend: metrics.mrr.trend,
       icon: DollarSign,
       good: "up"
     },
     {
       label: "ARPU",
       value: metrics.arpu.value != null && metrics.currency ? formatCurrency(metrics.arpu.value, metrics.currency) : DONNEES_INDISPONIBLES,
       trend: metrics.arpu.trend,
       icon: Target,
       good: "up"
     },
     {
       label: "Churn",
       value: metrics.churn.value != null ? `${metrics.churn.value}%` : DONNEES_INDISPONIBLES,
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
             <Badge variant="success" className="text-[9px]">
               <Database className="h-2.5 w-2.5 mr-0.5" />
               Live
             </Badge>
           </div>
         </div>
       </CardHeader>
       <CardContent className="space-y-3">
         <div className="grid grid-cols-3 gap-2">
           {kpis.map((kpi) => {
             const trendMesure = typeof kpi.trend === "number";
             const isPositive = trendMesure && (kpi.good === "up" ? kpi.trend > 0 : kpi.trend < 0);
             return (
               <div key={kpi.label} className="text-center p-2 rounded-lg bg-muted/30">
                 <kpi.icon className="h-3.5 w-3.5 mx-auto mb-1 text-muted-foreground" />
                 <div className={cn("font-bold", kpi.value === DONNEES_INDISPONIBLES ? "text-[10px] text-muted-foreground" : "text-sm sm:text-base text-foreground")}>
                   {kpi.value}
                 </div>
                 <div className="text-[9px] text-muted-foreground uppercase">
                   {kpi.label}
                 </div>
                 {trendMesure ? (
                   <div className={cn(
                     "text-[9px] font-medium flex items-center justify-center gap-0.5",
                     isPositive ? "text-success" : "text-destructive"
                   )}>
                     {isPositive ? <TrendingUp className="h-2 w-2" /> : <TrendingDown className="h-2 w-2" />}
                     {Math.abs(kpi.trend).toFixed(1)}%
                   </div>
                 ) : (
                   <div className="text-[9px] font-medium text-muted-foreground" title="Variation non mesurée">—</div>
                 )}
               </div>
             );
           })}
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