import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { DollarSign } from "lucide-react";
import { formatCurrency } from "@/hooks/useStripeKPIs";

interface RevenueSource {
  name: string;
  value: number;
  color: string;
  growth: number;
}

const mockRevenueSources: RevenueSource[] = [
  { name: "EmotionsCare", value: 12500, color: "hsl(var(--primary))", growth: 15 },
  { name: "Growth Copilot", value: 8200, color: "hsl(var(--success))", growth: 22 },
  { name: "System Compass", value: 5800, color: "hsl(var(--accent))", growth: 8 },
  { name: "Med MNG", value: 3200, color: "hsl(var(--warning))", growth: 35 },
];

export function RevenueBreakdown() {
  const total = mockRevenueSources.reduce((sum, s) => sum + s.value, 0);

  return (
    <Card className="card-executive">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <DollarSign className="h-5 w-5 text-primary" />
          Répartition des Revenus
        </CardTitle>
        <CardDescription>
          Par plateforme — {formatCurrency(total, "EUR")} total
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={mockRevenueSources}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={50}
                  paddingAngle={2}
                >
                  {mockRevenueSources.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value, "EUR")}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="space-y-3">
            {mockRevenueSources.map((source) => (
              <div 
                key={source.name}
                className="flex items-center justify-between p-3 rounded-lg border"
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: source.color }}
                  />
                  <div>
                    <p className="font-medium text-sm">{source.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {Math.round((source.value / total) * 100)}% du total
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatCurrency(source.value, "EUR")}</p>
                  <Badge variant={source.growth > 0 ? "success" : "destructive"} className="text-xs">
                    +{source.growth}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
