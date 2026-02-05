import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Target, Database, AlertTriangle } from "lucide-react";

interface PipelineStage {
  name: string;
  count: number;
  value: number;
}

interface SalesPipelineChartProps {
  data?: PipelineStage[];
  loading?: boolean;
}

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--accent))",
  "hsl(var(--success))",
  "hsl(var(--warning))",
  "hsl(38 92% 50%)",
];

export function SalesPipelineChart({ data = [], loading }: SalesPipelineChartProps) {
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

  if (data.length === 0) {
    return (
      <Card className="card-executive border-dashed border-2 border-muted-foreground/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Pipeline Commercial
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <div className="p-3 rounded-full bg-muted/50 mb-3">
            <Database className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-sm font-semibold text-foreground mb-1">Aucune donnée pipeline</h3>
          <p className="text-xs text-muted-foreground max-w-[250px]">
            Connectez un CRM (HubSpot, Salesforce, Pipedrive) pour visualiser votre pipeline commercial.
          </p>
          <Badge variant="outline" className="text-[10px] mt-3 gap-1">
            <AlertTriangle className="h-2.5 w-2.5" />
            Source requise : CRM
          </Badge>
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
