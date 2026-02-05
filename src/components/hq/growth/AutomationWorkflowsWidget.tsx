 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
 import { Badge } from "@/components/ui/badge";
 import { Switch } from "@/components/ui/switch";
 import { Workflow, Play, Pause, CheckCircle2, Clock } from "lucide-react";
 import { cn } from "@/lib/utils";
 import { AUTOMATION_WORKFLOWS } from "@/lib/growth-data";
 import { formatDistanceToNow } from "date-fns";
 import { fr } from "date-fns/locale";
 
 export function AutomationWorkflowsWidget() {
   const activeCount = AUTOMATION_WORKFLOWS.filter(w => w.status === "active").length;
   const totalTriggers = AUTOMATION_WORKFLOWS.reduce((sum, w) => sum + w.triggers, 0);
   
   return (
     <Card className="card-executive">
       <CardHeader className="pb-2">
         <div className="flex items-center justify-between">
           <div>
             <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
               <Workflow className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
               Workflows Automatisés
             </CardTitle>
             <CardDescription className="text-xs sm:text-sm">
               Séquences et orchestration
             </CardDescription>
           </div>
           <div className="flex items-center gap-2">
             <Badge variant="success" className="text-xs">
               {activeCount} actifs
             </Badge>
             <Badge variant="subtle" className="text-xs">
               {totalTriggers.toLocaleString("fr-FR")} triggers
             </Badge>
           </div>
         </div>
       </CardHeader>
       <CardContent className="space-y-3">
         {AUTOMATION_WORKFLOWS.map((workflow) => (
           <div 
             key={workflow.id}
             className={cn(
               "p-3 rounded-lg border transition-all",
               workflow.status === "active" 
                 ? "bg-success/5 border-success/20" 
                 : "bg-muted/30 border-border/50"
             )}
           >
             <div className="flex items-start justify-between gap-2">
               <div className="flex-1 min-w-0">
                 <div className="flex items-center gap-2 mb-1">
                   {workflow.status === "active" ? (
                     <Play className="h-3 w-3 text-success" />
                   ) : (
                     <Pause className="h-3 w-3 text-muted-foreground" />
                   )}
                   <span className="text-xs sm:text-sm font-medium truncate">
                     {workflow.name}
                   </span>
                 </div>
                 
                 <div className="flex items-center gap-3 text-[10px] sm:text-xs text-muted-foreground">
                   <span className="flex items-center gap-1">
                     <CheckCircle2 className="h-2.5 w-2.5" />
                     {workflow.conversions}/{workflow.triggers} ({workflow.conversionRate}%)
                   </span>
                   <span className="flex items-center gap-1">
                     <Clock className="h-2.5 w-2.5" />
                     {formatDistanceToNow(new Date(workflow.lastRun), { addSuffix: true, locale: fr })}
                   </span>
                 </div>
               </div>
               
               <Switch 
                 checked={workflow.status === "active"} 
                 className="scale-75"
               />
             </div>
           </div>
         ))}
       </CardContent>
     </Card>
   );
 }