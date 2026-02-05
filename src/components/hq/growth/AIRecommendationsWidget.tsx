 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
 import { Badge } from "@/components/ui/badge";
 import { Button } from "@/components/ui/button";
 import { Lightbulb, ArrowRight, Target, Users, Filter, Rocket, CheckCircle2, Database, Link2 } from "lucide-react";
 import { cn } from "@/lib/utils";
 import { useGrowthMetrics } from "@/hooks/useGrowthMetrics";
 import { useState } from "react";
 
 const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
   acquisition: Target,
   retention: Users,
   conversion: Filter,
   expansion: Rocket,
 };
 
 const priorityColors: Record<string, string> = {
   high: "bg-destructive text-destructive-foreground",
   medium: "bg-warning text-warning-foreground",
   low: "bg-muted text-muted-foreground",
 };
 
 const effortLabels: Record<string, string> = {
   low: "Facile",
   medium: "Moyen",
   high: "Complexe",
 };
 
 export function AIRecommendationsWidget() {
   const [dismissedIds, setDismissedIds] = useState<string[]>([]);
   const { recommendations } = useGrowthMetrics();
   
   // État vide - aucune donnée réelle
   if (!recommendations || recommendations.length === 0) {
     return (
       <Card className="card-executive border-dashed border-2 border-muted-foreground/20">
         <CardHeader className="pb-2">
           <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
             <Lightbulb className="h-4 w-4 sm:h-5 sm:w-5 text-accent" />
             Recommandations IA
           </CardTitle>
           <CardDescription className="text-xs sm:text-sm">
             Actions stratégiques suggérées
           </CardDescription>
         </CardHeader>
         <CardContent className="py-8 text-center">
           <Database className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
           <h3 className="text-sm font-semibold mb-1">Analyse en attente</h3>
           <p className="text-xs text-muted-foreground mb-3">
             L'IA générera des recommandations après analyse des données.
           </p>
           <Badge variant="outline" className="text-[10px] gap-1">
             <Link2 className="h-2.5 w-2.5" />
             Source requise : Growth OS API
           </Badge>
         </CardContent>
       </Card>
     );
   }
   
   const activeRecommendations = recommendations.filter(r => !dismissedIds.includes(r.id));
   
   return (
     <Card className="card-executive">
       <CardHeader className="pb-2">
         <div className="flex items-center justify-between">
           <div>
             <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
               <Lightbulb className="h-4 w-4 sm:h-5 sm:w-5 text-accent" />
               Recommandations IA
             </CardTitle>
             <CardDescription className="text-xs sm:text-sm">
               Actions stratégiques suggérées
             </CardDescription>
           </div>
           <Badge variant="subtle" className="text-xs">
             {activeRecommendations.length} actives
           </Badge>
         </div>
       </CardHeader>
       <CardContent className="space-y-3">
         {activeRecommendations.map((rec) => {
           const Icon = categoryIcons[rec.category] || Lightbulb;
           
           return (
             <div 
               key={rec.id}
               className="p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
             >
               <div className="flex items-start justify-between gap-2 mb-2">
                 <div className="flex items-center gap-2">
                   <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                   <span className="text-xs sm:text-sm font-semibold line-clamp-1">
                     {rec.title}
                   </span>
                 </div>
                 <Badge className={cn("text-[8px] sm:text-[9px] px-1.5 flex-shrink-0", priorityColors[rec.priority])}>
                   {rec.priority === "high" ? "Priorité" : rec.priority === "medium" ? "Moyen" : "Bas"}
                 </Badge>
               </div>
               
               <p className="text-[10px] sm:text-xs text-muted-foreground mb-2 line-clamp-2">
                 {rec.description}
               </p>
               
               <div className="flex items-center justify-between">
                 <div className="flex items-center gap-2">
                   <Badge variant="success" className="text-[8px] sm:text-[9px] px-1.5">
                     {rec.impact}
                   </Badge>
                   <span className="text-[9px] text-muted-foreground">
                     Effort: {effortLabels[rec.effort]} • {rec.confidence}% confiance
                   </span>
                 </div>
                 
                 <div className="flex items-center gap-1">
                   <Button 
                     variant="ghost" 
                     size="sm" 
                     className="h-6 px-2 text-[10px]"
                     onClick={() => setDismissedIds([...dismissedIds, rec.id])}
                   >
                     <CheckCircle2 className="h-3 w-3" />
                   </Button>
                   <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px] text-accent">
                     Détails
                     <ArrowRight className="h-2.5 w-2.5 ml-0.5" />
                   </Button>
                 </div>
               </div>
             </div>
           );
         })}
         
         {activeRecommendations.length === 0 && (
           <div className="text-center py-6 text-muted-foreground">
             <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-success" />
             <p className="text-sm">Toutes les recommandations ont été traitées</p>
           </div>
         )}
       </CardContent>
     </Card>
   );
 }