 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
 import { Badge } from "@/components/ui/badge";
 import { Filter, TrendingUp } from "lucide-react";
 import { cn } from "@/lib/utils";
 import { CONVERSION_FUNNEL } from "@/lib/growth-data";
 
 export function ConversionFunnelWidget() {
   const totalConversion = ((CONVERSION_FUNNEL[CONVERSION_FUNNEL.length - 1].count / CONVERSION_FUNNEL[0].count) * 100).toFixed(2);
   
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
         {CONVERSION_FUNNEL.map((stage, index) => {
           const widthPercent = (stage.count / CONVERSION_FUNNEL[0].count) * 100;
           const prevStage = index > 0 ? CONVERSION_FUNNEL[index - 1] : null;
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