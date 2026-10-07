 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
 import { Badge } from "@/components/ui/badge";
 import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
 import { Brain, TrendingUp, TrendingDown, Database, Link2 } from "lucide-react";
 import { cn } from "@/lib/utils";
import { useGrowthMetrics } from "@/hooks/useGrowthMetrics";
 
 const predictionConfig = [
   { key: "mrr", label: "MRR", format: "€", icon: "💰", good: "up" },
   { key: "churn", label: "Churn", format: "%", icon: "📉", good: "down" },
   { key: "newUsers", label: "Nouveaux", format: "", icon: "👥", good: "up" },
   { key: "ltv", label: "LTV", format: "€", icon: "💎", good: "up" },
 ];
 
 export function AIPredictionsWidget() {
   const { predictions, metrics, isLoading } = useGrowthMetrics();
 
   if (isLoading) {
     return (
       <Card className="card-executive">
         <CardHeader className="pb-2">
           <Skeleton className="h-6 w-40" />
           <Skeleton className="h-4 w-60 mt-1" />
         </CardHeader>
         <CardContent className="space-y-4">
           {[1, 2, 3, 4].map((i) => (
             <Skeleton key={i} className="h-20 w-full" />
           ))}
         </CardContent>
       </Card>
     );
   }
 
   // État vide - aucune donnée réelle
   if (!predictions) {
     return (
       <Card className="card-executive border-dashed border-2 border-muted-foreground/20">
         <CardHeader className="pb-2">
           <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
             <Brain className="h-4 w-4 sm:h-5 sm:w-5 text-accent" />
             Prédictions IA
           </CardTitle>
           <CardDescription className="text-xs sm:text-sm">
             Projections à 30 et 90 jours
           </CardDescription>
         </CardHeader>
         <CardContent className="py-8 text-center">
           <Database className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
           <h3 className="text-sm font-semibold mb-1">Données insuffisantes</h3>
           <p className="text-xs text-muted-foreground mb-3">
             Les prédictions IA nécessitent des données Stripe réelles.
           </p>
           <Badge variant="outline" className="text-[10px] gap-1">
             <Link2 className="h-2.5 w-2.5" />
             Source requise : Stripe
           </Badge>
         </CardContent>
       </Card>
     );
   }
 
   return (
     <Card className="card-executive relative overflow-hidden">
       {/* Subtle AI glow */}
       <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
       
       <CardHeader className="pb-2 relative">
         <div className="flex items-center justify-between">
           <div>
             <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
               <Brain className="h-4 w-4 sm:h-5 sm:w-5 text-accent" />
               Prédictions IA
             </CardTitle>
             <CardDescription className="text-xs sm:text-sm">
               Projections à 30 et 90 jours
             </CardDescription>
           </div>
           <div className="flex items-center gap-1">
             <Badge variant="success" className="text-[9px]">
               <Database className="h-2.5 w-2.5 mr-0.5" />
               Live
             </Badge>
           </div>
         </div>
       </CardHeader>
       <CardContent className="space-y-4 relative">
         {predictionConfig.map((config) => {
           const prediction = predictions[config.key as keyof typeof predictions];
           // Projection non disponible (ex. MRR sans variation mesurée) : on ne l'invente pas.
           if (!prediction) return null;
           const change30d = ((prediction.predicted30d - prediction.current) / prediction.current) * 100;
           const change90d = ((prediction.predicted90d - prediction.current) / prediction.current) * 100;
           const isGood30d = config.good === "up" ? change30d > 0 : change30d < 0;
           const isGood90d = config.good === "up" ? change90d > 0 : change90d < 0;
           
           return (
             <div key={config.key} className="space-y-2">
               <div className="flex items-center justify-between">
                 <div className="flex items-center gap-2">
                   <span className="text-base">{config.icon}</span>
                   <span className="text-xs sm:text-sm font-medium">{config.label}</span>
                 </div>
                 <div className="flex items-center gap-1">
                   <span className="text-[9px] text-muted-foreground">Confiance:</span>
                   <span className="text-[10px] font-mono font-medium">{prediction.confidence}%</span>
                 </div>
               </div>
               
               <div className="grid grid-cols-3 gap-2 text-center">
                 <div className="p-2 rounded-lg bg-muted/50">
                   <div className="text-[9px] text-muted-foreground mb-0.5">Actuel</div>
                   <div className="text-xs sm:text-sm font-bold">
                     {config.format === "€" && "€"}{prediction.current.toLocaleString("fr-FR")}{config.format === "%" && "%"}
                   </div>
                 </div>
                 <div className={cn(
                   "p-2 rounded-lg",
                   isGood30d ? "bg-success/10" : "bg-destructive/10"
                 )}>
                   <div className="text-[9px] text-muted-foreground mb-0.5">+30j</div>
                   <div className={cn(
                     "text-xs sm:text-sm font-bold flex items-center justify-center gap-0.5",
                     isGood30d ? "text-success" : "text-destructive"
                   )}>
                     {config.format === "€" && "€"}{prediction.predicted30d.toLocaleString("fr-FR")}{config.format === "%" && "%"}
                     {isGood30d ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
                   </div>
                 </div>
                 <div className={cn(
                   "p-2 rounded-lg",
                   isGood90d ? "bg-success/10" : "bg-destructive/10"
                 )}>
                   <div className="text-[9px] text-muted-foreground mb-0.5">+90j</div>
                   <div className={cn(
                     "text-xs sm:text-sm font-bold flex items-center justify-center gap-0.5",
                     isGood90d ? "text-success" : "text-destructive"
                   )}>
                     {config.format === "€" && "€"}{prediction.predicted90d.toLocaleString("fr-FR")}{config.format === "%" && "%"}
                     {isGood90d ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
                   </div>
                 </div>
               </div>
               
               <Progress value={prediction.confidence} className="h-1" />
             </div>
           );
         })}
       </CardContent>
     </Card>
   );
 }