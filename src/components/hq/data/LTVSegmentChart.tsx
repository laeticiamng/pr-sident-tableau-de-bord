import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Users, DollarSign } from "lucide-react";

const SEGMENT_DATA = [
  { segment: "Enterprise", ltv: 2400, count: 12, color: "hsl(var(--primary))" },
  { segment: "Pro", ltv: 890, count: 85, color: "hsl(var(--success))" },
  { segment: "Starter", ltv: 245, count: 340, color: "hsl(var(--accent))" },
  { segment: "Free Trial", ltv: 0, count: 580, color: "hsl(var(--muted))" },
];

export function LTVSegmentChart() {
  const totalRevenue = SEGMENT_DATA.reduce((sum, s) => sum + (s.ltv * s.count), 0);
  const totalCustomers = SEGMENT_DATA.reduce((sum, s) => sum + s.count, 0);
  const avgLTV = totalRevenue / (totalCustomers - SEGMENT_DATA[3].count); // Exclude free trial

  return (
    <Card className="card-executive">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <DollarSign className="h-5 w-5 text-primary" />
          LTV par Segment
        </CardTitle>
        <CardDescription>
          Valeur vie client par catégorie
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Pie Chart */}
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={SEGMENT_DATA.filter(s => s.ltv > 0)}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
                dataKey="count"
              >
                {SEGMENT_DATA.filter(s => s.ltv > 0).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number, name: string, props: any) => [
                  `${value} clients (LTV: ${props.payload.ltv}€)`,
                  props.payload.segment
                ]}
                contentStyle={{ 
                  backgroundColor: "hsl(var(--card))", 
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px"
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Segment Details */}
          <div className="space-y-3">
            {SEGMENT_DATA.map((segment) => (
              <div 
                key={segment.segment}
                className="flex items-center justify-between p-3 rounded-lg border"
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: segment.color }}
                  />
                  <div>
                    <p className="font-medium text-sm">{segment.segment}</p>
                    <p className="text-xs text-muted-foreground">{segment.count} clients</p>
                  </div>
                </div>
                <Badge variant={segment.ltv > 500 ? "gold" : segment.ltv > 0 ? "default" : "subtle"}>
                  {segment.ltv > 0 ? `${segment.ltv} €` : "—"}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t">
          <div className="text-center p-3 rounded-lg bg-primary/5">
            <p className="text-sm text-muted-foreground">LTV Moyen</p>
            <p className="text-xl font-bold text-primary">{avgLTV.toFixed(0)} €</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-success/5">
            <p className="text-sm text-muted-foreground">Revenus Potentiels</p>
            <p className="text-xl font-bold text-success">{(totalRevenue / 1000).toFixed(0)}k €</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
