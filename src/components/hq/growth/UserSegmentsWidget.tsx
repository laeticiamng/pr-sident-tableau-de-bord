 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
 import { Badge } from "@/components/ui/badge";
 import { Progress } from "@/components/ui/progress";
 import { Users, AlertTriangle, Star, Heart, Zap, Moon } from "lucide-react";
 import { cn } from "@/lib/utils";
 import { USER_SEGMENTS } from "@/lib/growth-data";
 
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
   const totalUsers = USER_SEGMENTS.reduce((sum, s) => sum + s.users, 0);
   const totalLTV = USER_SEGMENTS.reduce((sum, s) => sum + (s.users * s.ltv), 0);
   
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
         {USER_SEGMENTS.map((segment) => {
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