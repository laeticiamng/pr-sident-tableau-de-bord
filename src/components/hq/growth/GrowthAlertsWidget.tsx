 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
 import { Badge } from "@/components/ui/badge";
 import { Button } from "@/components/ui/button";
 import { Skeleton } from "@/components/ui/skeleton";
 import { ScrollArea } from "@/components/ui/scroll-area";
 import { 
   AlertTriangle, 
   TrendingUp, 
   TrendingDown, 
   Bell, 
   ChevronRight,
   Sparkles,
   ShieldAlert,
   Rocket,
   Target
 } from "lucide-react";
 import { cn } from "@/lib/utils";
 import { useGrowthAlerts, GrowthAlert } from "@/hooks/useGrowthAlerts";
 
 const severityColors = {
   critical: "bg-destructive text-destructive-foreground",
   high: "bg-warning text-warning-foreground",
   medium: "bg-accent text-accent-foreground",
   low: "bg-success text-success-foreground",
 };
 
 const severityBorder = {
   critical: "border-l-destructive",
   high: "border-l-warning",
   medium: "border-l-accent",
   low: "border-l-success",
 };
 
 const typeIcons = {
   churn_risk: ShieldAlert,
   growth_opportunity: Rocket,
   benchmark_warning: Target,
   milestone: Sparkles,
 };
 
 interface AlertItemProps {
   alert: GrowthAlert;
   compact?: boolean;
 }
 
 function AlertItem({ alert, compact = false }: AlertItemProps) {
   const Icon = typeIcons[alert.type];
   
   return (
     <div 
       className={cn(
         "p-3 rounded-lg border-l-4 bg-muted/30 transition-all hover:bg-muted/50",
         severityBorder[alert.severity]
       )}
     >
       <div className="flex items-start gap-3">
         <div className={cn(
           "flex-shrink-0 p-1.5 rounded-md",
           severityColors[alert.severity]
         )}>
           <Icon className="h-3.5 w-3.5" />
         </div>
         <div className="flex-1 min-w-0">
           <div className="flex items-center gap-2 mb-1">
             <span className="text-xs sm:text-sm font-semibold text-foreground truncate">
               {alert.title}
             </span>
             <Badge variant="outline" className="text-[9px] flex-shrink-0">
               {alert.severity}
             </Badge>
           </div>
           {!compact && (
             <>
               <p className="text-[11px] sm:text-xs text-muted-foreground mb-2 line-clamp-2">
                 {alert.message}
               </p>
               {alert.action && (
                 <div className="flex items-center gap-1 text-[10px] text-primary">
                   <ChevronRight className="h-3 w-3" />
                   <span className="font-medium">{alert.action}</span>
                 </div>
               )}
             </>
           )}
         </div>
       </div>
     </div>
   );
 }
 
 interface GrowthAlertsWidgetProps {
   compact?: boolean;
   maxAlerts?: number;
   className?: string;
 }
 
 export function GrowthAlertsWidget({ 
   compact = false, 
   maxAlerts = 5,
   className 
 }: GrowthAlertsWidgetProps) {
   const { alerts, churnAlerts, opportunityAlerts, hasCritical, isLoading } = useGrowthAlerts();
 
   if (isLoading) {
     return (
       <Card className={cn("card-executive", className)}>
         <CardHeader className="pb-2">
           <Skeleton className="h-5 w-40" />
           <Skeleton className="h-4 w-56 mt-1" />
         </CardHeader>
         <CardContent>
           <div className="space-y-2">
             {[1, 2, 3].map((i) => (
               <Skeleton key={i} className="h-16 w-full" />
             ))}
           </div>
         </CardContent>
       </Card>
     );
   }
 
   const displayAlerts = alerts.slice(0, maxAlerts);
   const remainingCount = alerts.length - maxAlerts;
 
   return (
     <Card className={cn("card-executive", className)}>
       <CardHeader className="pb-2">
         <div className="flex items-center justify-between">
           <div>
             <CardTitle className="flex items-center gap-2 text-base">
               <Bell className={cn(
                 "h-4 w-4",
                 hasCritical ? "text-destructive animate-pulse" : "text-warning"
               )} />
               Alertes Intelligence
             </CardTitle>
             <CardDescription className="text-xs">
               Détection automatique des risques et opportunités
             </CardDescription>
           </div>
           <div className="flex items-center gap-1.5">
             {churnAlerts.length > 0 && (
               <Badge variant="destructive" className="text-[9px]">
                 <TrendingDown className="h-2.5 w-2.5 mr-0.5" />
                 {churnAlerts.length} risque{churnAlerts.length > 1 ? "s" : ""}
               </Badge>
             )}
             {opportunityAlerts.length > 0 && (
               <Badge variant="success" className="text-[9px]">
                 <TrendingUp className="h-2.5 w-2.5 mr-0.5" />
                 {opportunityAlerts.length} opp.
               </Badge>
             )}
           </div>
         </div>
       </CardHeader>
       <CardContent>
         {alerts.length === 0 ? (
           <div className="text-center py-6 text-muted-foreground">
             <Sparkles className="h-8 w-8 mx-auto mb-2 text-success" />
             <p className="text-sm font-medium">Aucune alerte active</p>
             <p className="text-xs">Tous les indicateurs sont dans les normes</p>
           </div>
         ) : (
           <ScrollArea className={compact ? "h-[200px]" : "h-auto max-h-[320px]"}>
             <div className="space-y-2 pr-2">
               {displayAlerts.map((alert) => (
                 <AlertItem key={alert.id} alert={alert} compact={compact} />
               ))}
               {remainingCount > 0 && (
                 <div className="text-center py-2">
                   <span className="text-xs text-muted-foreground">
                     +{remainingCount} autres alertes
                   </span>
                 </div>
               )}
             </div>
           </ScrollArea>
         )}
       </CardContent>
     </Card>
   );
 }