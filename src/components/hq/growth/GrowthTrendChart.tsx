 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
 import { Badge } from "@/components/ui/badge";
 import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
 import { TrendingUp, Activity } from "lucide-react";
 import { GROWTH_HISTORY } from "@/lib/growth-data";
 
 export function GrowthTrendChart() {
   const latestMRR = GROWTH_HISTORY[GROWTH_HISTORY.length - 1].mrr;
   const previousMRR = GROWTH_HISTORY[GROWTH_HISTORY.length - 2].mrr;
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
           <Badge variant="success" className="text-xs">
             <TrendingUp className="h-3 w-3 mr-1" />
             +{mrrGrowth}% MoM
           </Badge>
         </div>
       </CardHeader>
       <CardContent>
         <div className="h-[200px] sm:h-[280px]">
           <ResponsiveContainer width="100%" height="100%">
             <LineChart data={GROWTH_HISTORY} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
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