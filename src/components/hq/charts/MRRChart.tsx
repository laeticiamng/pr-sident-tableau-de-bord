import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { TrendingUp } from "lucide-react";

interface MRRDataPoint {
  month: string;
  mrr: number;
  target?: number;
}

interface MRRChartProps {
  data?: MRRDataPoint[];
  loading?: boolean;
}

const DEFAULT_DATA: MRRDataPoint[] = [
  { month: "Sep", mrr: 8500, target: 8000 },
  { month: "Oct", mrr: 9200, target: 8500 },
  { month: "Nov", mrr: 10800, target: 9000 },
  { month: "Déc", mrr: 11500, target: 10000 },
  { month: "Jan", mrr: 12400, target: 11000 },
  { month: "Fév", mrr: 13200, target: 12000 },
];

export function MRRChart({ data = DEFAULT_DATA, loading }: MRRChartProps) {
  const currentMRR = data[data.length - 1]?.mrr || 0;
  const previousMRR = data[data.length - 2]?.mrr || 0;
  const growth = previousMRR > 0 ? ((currentMRR - previousMRR) / previousMRR) * 100 : 0;

  if (loading) {
    return (
      <Card className="card-executive">
        <CardContent className="p-6">
          <div className="h-64 bg-muted/30 animate-pulse rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-executive">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Évolution MRR
          </CardTitle>
          <CardDescription>Revenu mensuel récurrent (6 derniers mois)</CardDescription>
        </div>
        <Badge variant={growth > 0 ? "success" : "destructive"}>
          {growth > 0 ? "+" : ""}{growth.toFixed(1)}%
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorMrr" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="month" 
                className="text-xs fill-muted-foreground"
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                className="text-xs fill-muted-foreground"
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `€${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
                formatter={(value: number) => [`€${value.toLocaleString("fr-FR")}`, "MRR"]}
              />
              <Area
                type="monotone"
                dataKey="mrr"
                stroke="hsl(var(--primary))"
                fillOpacity={1}
                fill="url(#colorMrr)"
                strokeWidth={2}
              />
              {data[0]?.target && (
                <Line
                  type="monotone"
                  dataKey="target"
                  stroke="hsl(var(--muted-foreground))"
                  strokeDasharray="5 5"
                  strokeWidth={1}
                  dot={false}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
