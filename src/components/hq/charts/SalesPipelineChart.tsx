import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Target } from "lucide-react";
import { SALES_PIPELINE } from "@/lib/mock-data";

interface SalesPipelineChartProps {
  data?: typeof SALES_PIPELINE;
  loading?: boolean;
}

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--accent))",
  "hsl(var(--success))",
  "hsl(var(--warning))",
  "hsl(38 92% 50%)",
];

export function SalesPipelineChart({ data = SALES_PIPELINE, loading }: SalesPipelineChartProps) {
  const totalValue = data.reduce((sum, stage) => sum + stage.value, 0);
  const totalCount = data.reduce((sum, stage) => sum + stage.count, 0);

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
            <Target className="h-5 w-5 text-primary" />
            Pipeline Commercial
          </CardTitle>
          <CardDescription>Répartition par étape du funnel</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="subtle">{totalCount} deals</Badge>
          <Badge variant="gold">€{(totalValue / 1000).toFixed(0)}k</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={false} />
              <XAxis 
                type="number"
                className="text-xs fill-muted-foreground"
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `€${(value / 1000).toFixed(0)}k`}
              />
              <YAxis 
                type="category"
                dataKey="name"
                className="text-xs fill-muted-foreground"
                tickLine={false}
                axisLine={false}
                width={100}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                formatter={(value: number, name: string, props: any) => [
                  `€${value.toLocaleString("fr-FR")} (${props.payload.count} deals)`,
                  "Valeur"
                ]}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
