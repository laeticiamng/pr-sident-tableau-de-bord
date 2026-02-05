 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
 import { Badge } from "@/components/ui/badge";
 import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
 import { Target, Database, Link2 } from "lucide-react";
 import { useGrowthMetrics } from "@/hooks/useGrowthMetrics";
 
 const COLORS = [
   "hsl(var(--success))",
   "hsl(var(--platform-compass))",
   "hsl(var(--platform-social))",
   "hsl(var(--platform-growth))",
   "hsl(var(--warning))",
 ];
 
 export function ChannelAttributionWidget() {
   const { channels } = useGrowthMetrics();
   
   // État vide - aucune donnée réelle
   if (!channels || channels.length === 0) {
     return (
       <Card className="card-executive border-dashed border-2 border-muted-foreground/20">
         <CardHeader className="pb-2">
           <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
             <Target className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
             Attribution par Canal
           </CardTitle>
           <CardDescription className="text-xs sm:text-sm">
             ROI et performance par source
           </CardDescription>
         </CardHeader>
         <CardContent className="py-8 text-center">
           <Database className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
           <h3 className="text-sm font-semibold mb-1">Données non disponibles</h3>
           <p className="text-xs text-muted-foreground mb-3">
             Connectez vos sources marketing via Growth OS.
           </p>
           <Badge variant="outline" className="text-[10px] gap-1">
             <Link2 className="h-2.5 w-2.5" />
             Sources : GA4, Meta Ads, Google Ads
           </Badge>
         </CardContent>
       </Card>
     );
   }
   
   const avgROI = (channels.reduce((sum, c) => sum + c.roi, 0) / channels.length).toFixed(1);
   
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
             <BarChart data={channels} layout="vertical" margin={{ left: 0, right: 10 }}>
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
                 {channels.map((entry, index) => (
                   <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                 ))}
               </Bar>
             </BarChart>
           </ResponsiveContainer>
         </div>
         
         {/* ROI par canal */}
         <div className="mt-3 grid grid-cols-5 gap-1 text-center">
           {channels.map((channel, index) => (
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