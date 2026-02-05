 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
 import { Badge } from "@/components/ui/badge";
 import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
 import { Target, TrendingUp } from "lucide-react";
 import { CHANNEL_ATTRIBUTION } from "@/lib/growth-data";
 
 const COLORS = [
   "hsl(var(--success))",
   "hsl(var(--platform-compass))",
   "hsl(var(--platform-social))",
   "hsl(var(--platform-growth))",
   "hsl(var(--warning))",
 ];
 
 export function ChannelAttributionWidget() {
   const totalRevenue = CHANNEL_ATTRIBUTION.reduce((sum, c) => sum + c.revenue, 0);
   const avgROI = (CHANNEL_ATTRIBUTION.reduce((sum, c) => sum + c.roi, 0) / CHANNEL_ATTRIBUTION.length).toFixed(1);
   
   return (
     <Card className="card-executive">
       <CardHeader className="pb-2">
         <div className="flex items-center justify-between">
           <div>
             <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
               <Target className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
               Attribution par Canal
             </CardTitle>
             <CardDescription className="text-xs sm:text-sm">
               ROI et performance par source
             </CardDescription>
           </div>
           <Badge variant="gold" className="text-xs">
             ROI moy: {avgROI}x
           </Badge>
         </div>
       </CardHeader>
       <CardContent>
         <div className="h-[180px] sm:h-[220px]">
           <ResponsiveContainer width="100%" height="100%">
             <BarChart data={CHANNEL_ATTRIBUTION} layout="vertical" margin={{ left: 0, right: 10 }}>
               <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={(v) => `€${(v/1000).toFixed(0)}K`} />
               <YAxis type="category" dataKey="channel" tick={{ fontSize: 10 }} width={70} />
               <Tooltip 
                 formatter={(value: number, name: string) => [
                   name === "revenue" ? `€${value.toLocaleString("fr-FR")}` : value,
                   name === "revenue" ? "Revenu" : name
                 ]}
                 contentStyle={{
                   backgroundColor: "hsl(var(--card))",
                   borderColor: "hsl(var(--border))",
                   borderRadius: "8px",
                   fontSize: "12px"
                 }}
               />
               <Bar dataKey="revenue" radius={[0, 4, 4, 0]}>
                 {CHANNEL_ATTRIBUTION.map((entry, index) => (
                   <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                 ))}
               </Bar>
             </BarChart>
           </ResponsiveContainer>
         </div>
         
         {/* ROI par canal */}
         <div className="mt-3 grid grid-cols-5 gap-1 text-center">
           {CHANNEL_ATTRIBUTION.map((channel, index) => (
             <div key={channel.channel} className="space-y-0.5">
               <div 
                 className="text-xs sm:text-sm font-bold" 
                 style={{ color: COLORS[index % COLORS.length] }}
               >
                 {channel.roi}x
               </div>
               <div className="text-[8px] sm:text-[9px] text-muted-foreground truncate">
                 {channel.channel.split(" ")[0]}
               </div>
             </div>
           ))}
         </div>
       </CardContent>
     </Card>
   );
 }