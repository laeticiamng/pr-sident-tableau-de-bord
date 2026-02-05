 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
 import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
 import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TrendingUp, Activity, Database, Cloud } from "lucide-react";
import { useGrowthMetrics } from "@/hooks/useGrowthMetrics";
 
 export function GrowthTrendChart() {
   const { history, metrics, isLoading } = useGrowthMetrics();
 
   if (isLoading) {
     return (
       <Card className="card-executive">
         <CardHeader className="pb-2">
           <Skeleton className="h-6 w-48" />
           <Skeleton className="h-4 w-64 mt-1" />
         </CardHeader>
         <CardContent>
           <Skeleton className="h-[280px] w-full" />
         </CardContent>
       </Card>
     );
   }
 
   const latestMRR = history[history.length - 1].mrr;
   const previousMRR = history[history.length - 2].mrr;
   const mrrGrowth = (((latestMRR - previousMRR) / previousMRR) * 100).toFixed(1);
   
   return (
     <Card className="card-executive">
       <CardHeader className="pb-2">
         <div className="flex items-center justify-between">
           <div>
             <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
               <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
               Tendances de Croissance
             </CardTitle>
             <CardDescription className="text-xs sm:text-sm">
               MRR, utilisateurs et churn sur 6 mois
             </CardDescription>
           </div>
           <div className="flex items-center gap-1.5">
             <Badge variant="success" className="text-xs">
               <TrendingUp className="h-3 w-3 mr-1" />
               +{mrrGrowth}% MoM
             </Badge>
             {metrics.isRealData && (
               <Badge variant="subtle" className="text-[9px]">
                 <Database className="h-2.5 w-2.5 mr-0.5" />
                 Live
               </Badge>
             )}
           </div>
         </div>
       </CardHeader>
       <CardContent>
         <div className="h-[200px] sm:h-[280px]">
           <ResponsiveContainer width="100%" height="100%">
             <LineChart data={history} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
               <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
               <XAxis 
                 dataKey="month" 
                 tick={{ fontSize: 10 }}
                 className="text-muted-foreground"
               />
               <YAxis 
                 yAxisId="left"
                 tick={{ fontSize: 10 }}
                 tickFormatter={(v) => `€${(v/1000).toFixed(0)}K`}
                 className="text-muted-foreground"
               />
               <YAxis 
                 yAxisId="right"
                 orientation="right"
                 tick={{ fontSize: 10 }}
                 tickFormatter={(v) => `${v}%`}
                 domain={[0, 10]}
                 className="text-muted-foreground"
               />
               <Tooltip 
                 formatter={(value: number, name: string) => {
                   if (name === "mrr") return [`€${value.toLocaleString("fr-FR")}`, "MRR"];
                   if (name === "users") return [value.toLocaleString("fr-FR"), "Utilisateurs"];
                   if (name === "churn") return [`${value}%`, "Churn"];
                   return [value, name];
                 }}
                 contentStyle={{
                   backgroundColor: "hsl(var(--card))",
                   borderColor: "hsl(var(--border))",
                   borderRadius: "8px",
                   fontSize: "11px"
                 }}
               />
               <Legend 
                 wrapperStyle={{ fontSize: "10px" }}
                 formatter={(value) => {
                   if (value === "mrr") return "MRR";
                   if (value === "users") return "Utilisateurs";
                   if (value === "churn") return "Churn";
                   return value;
                 }}
               />
               <Line 
                 yAxisId="left"
                 type="monotone" 
                 dataKey="mrr" 
                 stroke="hsl(var(--success))" 
                 strokeWidth={2}
                 dot={{ r: 3 }}
                 activeDot={{ r: 5 }}
               />
               <Line 
                 yAxisId="left"
                 type="monotone" 
                 dataKey="users" 
                 stroke="hsl(var(--platform-compass))" 
                 strokeWidth={2}
                 dot={{ r: 3 }}
                 activeDot={{ r: 5 }}
               />
               <Line 
                 yAxisId="right"
                 type="monotone" 
                 dataKey="churn" 
                 stroke="hsl(var(--destructive))" 
                 strokeWidth={2}
                 strokeDasharray="5 5"
                 dot={{ r: 3 }}
                 activeDot={{ r: 5 }}
               />
             </LineChart>
           </ResponsiveContainer>
         </div>
       </CardContent>
     </Card>
   );
 }