 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
 import { Badge } from "@/components/ui/badge";
 import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
 import { Users, Database, Link2 } from "lucide-react";
 import { cn } from "@/lib/utils";
 import { useGrowthMetrics } from "@/hooks/useGrowthMetrics";
 
 function getCellColor(value: number): string {
   if (value >= 70) return "bg-success/20 text-success";
   if (value >= 50) return "bg-success/10 text-success/80";
   if (value >= 35) return "bg-warning/15 text-warning";
   return "bg-destructive/10 text-destructive/80";
 }
 
 export function RetentionCohortWidget() {
   const { cohorts } = useGrowthMetrics();
   
   // État vide - aucune donnée réelle
   if (!cohorts || cohorts.length === 0) {
     return (
       <Card className="card-executive border-dashed border-2 border-muted-foreground/20">
         <CardHeader className="pb-2">
           <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
             <Users className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
             Rétention par Cohorte
           </CardTitle>
           <CardDescription className="text-xs sm:text-sm">
             Évolution de la rétention mensuelle
           </CardDescription>
         </CardHeader>
         <CardContent className="py-8 text-center">
           <Database className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
           <h3 className="text-sm font-semibold mb-1">Données non disponibles</h3>
           <p className="text-xs text-muted-foreground mb-3">
             Connectez Growth OS pour analyser la rétention par cohorte.
           </p>
           <Badge variant="outline" className="text-[10px] gap-1">
             <Link2 className="h-2.5 w-2.5" />
             Source requise : Growth OS API
           </Badge>
         </CardContent>
       </Card>
     );
   }
   
   const avgM5Retention = (cohorts.reduce((sum, c) => sum + c.m5, 0) / cohorts.length).toFixed(0);
   
   return (
     <Card className="card-executive">
       <CardHeader className="pb-2">
         <div className="flex items-center justify-between">
           <div>
             <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
               <Users className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
               Rétention par Cohorte
             </CardTitle>
             <CardDescription className="text-xs sm:text-sm">
               Évolution de la rétention mensuelle
             </CardDescription>
           </div>
           <Badge variant="subtle" className="text-xs">
             M5 moy: {avgM5Retention}%
           </Badge>
         </div>
       </CardHeader>
       <CardContent className="overflow-x-auto">
         <Table>
           <TableHeader>
             <TableRow>
               <TableHead className="text-[10px] sm:text-xs w-[80px]">Cohorte</TableHead>
               <TableHead className="text-[10px] sm:text-xs text-center">M0</TableHead>
               <TableHead className="text-[10px] sm:text-xs text-center">M1</TableHead>
               <TableHead className="text-[10px] sm:text-xs text-center">M2</TableHead>
               <TableHead className="text-[10px] sm:text-xs text-center">M3</TableHead>
               <TableHead className="text-[10px] sm:text-xs text-center">M4</TableHead>
               <TableHead className="text-[10px] sm:text-xs text-center">M5</TableHead>
             </TableRow>
           </TableHeader>
           <TableBody>
             {cohorts.map((cohort) => (
               <TableRow key={cohort.cohort}>
                 <TableCell className="text-[10px] sm:text-xs font-medium whitespace-nowrap">
                   {cohort.cohort}
                 </TableCell>
                 {[cohort.m0, cohort.m1, cohort.m2, cohort.m3, cohort.m4, cohort.m5].map((value, idx) => (
                   <TableCell key={idx} className="p-1 text-center">
                     <span className={cn(
                       "inline-block px-1.5 sm:px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-medium",
                       getCellColor(value)
                     )}>
                       {value}%
                     </span>
                   </TableCell>
                 ))}
               </TableRow>
             ))}
           </TableBody>
         </Table>
       </CardContent>
     </Card>
   );
 }