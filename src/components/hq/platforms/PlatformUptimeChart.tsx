import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Link2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface UptimeData {
  date: string;
  uptime: number;
}

interface PlatformUptimeChartProps {
  platformName?: string;
  data?: UptimeData[];
  className?: string;
}

export function PlatformUptimeChart({ 
  platformName = "Toutes plateformes", 
  data, 
  className 
}: PlatformUptimeChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card className={cn("card-executive", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Uptime - {platformName}
          </CardTitle>
          <CardDescription>7 derniers jours</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-muted-foreground/20 rounded-lg">
            <Link2 className="h-10 w-10 text-muted-foreground/40 mb-3" />
            <p className="text-sm font-medium text-muted-foreground">Données d'uptime non disponibles</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Connectez un service de monitoring pour suivre l'uptime</p>
            <Badge variant="outline" className="mt-3">Monitoring</Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  const avgUptime = (data.reduce((sum, d) => sum + d.uptime, 0) / data.length).toFixed(2);
  const minUptime = Math.min(...data.map(d => d.uptime)).toFixed(2);

  return (
    <Card className={cn("card-executive", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Uptime - {platformName}
            </CardTitle>
            <CardDescription>7 derniers jours</CardDescription>
          </div>
          <div className="flex gap-2">
            <Badge variant="success">{avgUptime}% moy.</Badge>
            <Badge variant="subtle">Min: {minUptime}%</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="uptimeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} className="text-muted-foreground" />
            <YAxis domain={[99, 100.1]} tick={{ fontSize: 11 }} tickFormatter={(value) => `${value}%`} className="text-muted-foreground" />
            <Tooltip formatter={(value: number) => [`${value}%`, "Uptime"]} contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px" }} />
            <Area type="monotone" dataKey="uptime" stroke="hsl(var(--success))" strokeWidth={2} fill="url(#uptimeGradient)" />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
