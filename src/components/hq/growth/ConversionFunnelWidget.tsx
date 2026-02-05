 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
 import { Badge } from "@/components/ui/badge";
 import { Filter, TrendingUp, Database, Link2 } from "lucide-react";
 import { cn } from "@/lib/utils";
 import { useGrowthMetrics } from "@/hooks/useGrowthMetrics";
 
 export function ConversionFunnelWidget() {
   const { funnel } = useGrowthMetrics();
   
   // État vide - aucune donnée réelle
   if (!funnel || funnel.length === 0) {
     return (
       <Card className="card-executive border-dashed border-2 border-muted-foreground/20">
         <CardHeader className="pb-2">
           <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
             <Filter className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
             Tunnel de Conversion
           </CardTitle>
           <CardDescription className="text-xs sm:text-sm">
             Parcours visiteur → client
           </CardDescription>
         </CardHeader>
         <CardContent className="py-8 text-center">
           <Database className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
           <h3 className="text-sm font-semibold mb-1">Données non disponibles</h3>
           <p className="text-xs text-muted-foreground mb-3">
             Connectez Google Analytics 4 via Growth OS pour visualiser votre tunnel.
           </p>
           <Badge variant="outline" className="text-[10px] gap-1">
             <Link2 className="h-2.5 w-2.5" />
             Source requise : GA4
           </Badge>
         </CardContent>
       </Card>
     );
   }
   
   const totalConversion = ((funnel[funnel.length - 1].count / funnel[0].count) * 100).toFixed(2);
   
   return (
     <Card className="card-executive">
       <CardHeader className="pb-2">
         <div className="flex items-center justify-between">
           <div>
             <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
               <Filter className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
               Tunnel de Conversion
             </CardTitle>
             <CardDescription className="text-xs sm:text-sm">
               Parcours visiteur → client
             </CardDescription>
           </div>
           <Badge variant="success" className="text-xs">
             <TrendingUp className="h-3 w-3 mr-1" />
             {totalConversion}% global
           </Badge>
         </div>
       </CardHeader>
       <CardContent className="space-y-2">
       {funnel.map((stage, index) => {
         const widthPercent = (stage.count / funnel[0].count) * 100;
         const prevStage = index > 0 ? funnel[index - 1] : null;
           const dropRate = prevStage ? ((1 - stage.count / prevStage.count) * 100).toFixed(0) : null;
           
           return (
             <div key={stage.stage} className="space-y-1">
               <div className="flex items-center justify-between text-xs sm:text-sm">
                 <div className="flex items-center gap-2">
                   <span className="font-medium">{stage.stage}</span>
                   {dropRate && (
                     <span className="text-[10px] text-destructive/70">
                       -{dropRate}%
                     </span>
                   )}
                 </div>
                 <div className="flex items-center gap-2">
                   <span className="font-mono font-semibold">
                     {stage.count.toLocaleString("fr-FR")}
                   </span>
                   {index > 0 && (
                     <span className="text-[10px] text-muted-foreground">
                       ({stage.rate}%)
                     </span>
                   )}
                 </div>
               </div>
               <div className="h-6 sm:h-8 bg-muted rounded-lg overflow-hidden relative">
                 <div 
                   className="h-full rounded-lg transition-all duration-500 flex items-center justify-center"
                   style={{ 
                     width: `${widthPercent}%`,
                     backgroundColor: stage.color,
                     minWidth: "40px"
                   }}
                 >
                   <span className="text-[9px] sm:text-[10px] font-semibold text-white drop-shadow-sm">
                     {widthPercent.toFixed(0)}%
                   </span>
                 </div>
               </div>
             </div>
           );
         })}
       </CardContent>
     </Card>
   );
 }