 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
 import { Badge } from "@/components/ui/badge";
 import { Progress } from "@/components/ui/progress";
 import { Users, AlertTriangle, Star, Heart, Zap, Moon, Database, Link2 } from "lucide-react";
 import { cn } from "@/lib/utils";
 import { useGrowthMetrics } from "@/hooks/useGrowthMetrics";
 
 const segmentIcons: Record<string, React.ComponentType<{ className?: string }>> = {
   "Champions": Star,
   "Loyaux": Heart,
   "Potentiels": Zap,
   "À risque": AlertTriangle,
   "Dormants": Moon,
 };
 
 const riskColors: Record<string, string> = {
   low: "bg-success text-success-foreground",
   medium: "bg-warning text-warning-foreground",
   high: "bg-destructive/80 text-destructive-foreground",
   critical: "bg-destructive text-destructive-foreground",
 };
 
 export function UserSegmentsWidget() {
   const { segments } = useGrowthMetrics();
   
   // État vide - aucune donnée réelle
   if (!segments || segments.length === 0) {
     return (
       <Card className="card-executive border-dashed border-2 border-muted-foreground/20">
         <CardHeader className="pb-2">
           <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
             <Users className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
             Segments Utilisateurs
           </CardTitle>
           <CardDescription className="text-xs sm:text-sm">
             Analyse LTV et risque churn
           </CardDescription>
         </CardHeader>
         <CardContent className="py-8 text-center">
           <Database className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
           <h3 className="text-sm font-semibold mb-1">Données non disponibles</h3>
           <p className="text-xs text-muted-foreground mb-3">
             Connectez Growth OS pour la segmentation utilisateurs.
           </p>
           <Badge variant="outline" className="text-[10px] gap-1">
             <Link2 className="h-2.5 w-2.5" />
             Source requise : Growth OS API
           </Badge>
         </CardContent>
       </Card>
     );
   }
   
   const totalUsers = segments.reduce((sum, s) => sum + s.users, 0);
   const totalLTV = segments.reduce((sum, s) => sum + (s.users * s.ltv), 0);
   
   return (
     <Card className="card-executive">
       <CardHeader className="pb-2">
         <div className="flex items-center justify-between">
           <div>
             <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
               <Users className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
               Segments Utilisateurs
             </CardTitle>
             <CardDescription className="text-xs sm:text-sm">
               Analyse LTV et risque churn
             </CardDescription>
           </div>
           <div className="text-right">
             <div className="text-xs text-muted-foreground">LTV Total</div>
             <div className="text-sm font-bold text-foreground">
               €{(totalLTV / 1000).toFixed(0)}K
             </div>
           </div>
         </div>
       </CardHeader>
       <CardContent className="space-y-3">
         {segments.map((segment) => {
           const Icon = segmentIcons[segment.segment] || Users;
           const pctUsers = ((segment.users / totalUsers) * 100).toFixed(0);
           
           return (
             <div key={segment.segment} className="space-y-1.5">
               <div className="flex items-center justify-between">
                 <div className="flex items-center gap-2">
                   <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                   <span className="text-xs sm:text-sm font-medium">{segment.segment}</span>
                   <Badge className={cn("text-[8px] sm:text-[9px] px-1.5 py-0", riskColors[segment.churnRisk])}>
                     {segment.churnRisk === "low" ? "Stable" : 
                      segment.churnRisk === "medium" ? "Moyen" : 
                      segment.churnRisk === "high" ? "Risque" : "Critique"}
                   </Badge>
                 </div>
                 <div className="flex items-center gap-3 text-xs">
                   <span className="text-muted-foreground">{segment.users} ({pctUsers}%)</span>
                   <span className="font-mono font-semibold text-foreground">€{segment.ltv}</span>
                 </div>
               </div>
               <div className="flex items-center gap-2">
                 <Progress value={segment.engagement} className="h-1.5 flex-1" />
                 <span className="text-[9px] text-muted-foreground w-8">{segment.engagement}%</span>
               </div>
             </div>
           );
         })}
       </CardContent>
     </Card>
   );
 }