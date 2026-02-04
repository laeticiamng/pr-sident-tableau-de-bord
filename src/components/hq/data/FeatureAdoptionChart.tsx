import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeatureUsage {
  feature: string;
  usage: number;
  trend: "up" | "down" | "stable";
}

const FEATURE_USAGE_DATA: FeatureUsage[] = [
  { feature: "Brief Exécutif", usage: 95, trend: "up" },
  { feature: "Approbations", usage: 88, trend: "stable" },
  { feature: "Cockpit", usage: 82, trend: "up" },
  { feature: "Audit Logs", usage: 75, trend: "stable" },
  { feature: "Runs IA", usage: 70, trend: "up" },
  { feature: "Scheduler", usage: 65, trend: "down" },
  { feature: "Diagnostics", usage: 58, trend: "stable" },
  { feature: "Export", usage: 45, trend: "up" },
];

interface FeatureAdoptionChartProps {
  className?: string;
}

export function FeatureAdoptionChart({ className }: FeatureAdoptionChartProps) {
  const avgAdoption = FEATURE_USAGE_DATA.reduce((sum, f) => sum + f.usage, 0) / FEATURE_USAGE_DATA.length;
  const highAdoption = FEATURE_USAGE_DATA.filter(f => f.usage >= 70).length;

  const getBarColor = (usage: number) => {
    if (usage >= 80) return "hsl(var(--success))";
    if (usage >= 60) return "hsl(var(--primary))";
    if (usage >= 40) return "hsl(var(--warning))";
    return "hsl(var(--muted-foreground))";
  };

  return (
    <Card className={cn("card-executive", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Adoption des Fonctionnalités
            </CardTitle>
            <CardDescription>
              Taux d'utilisation par feature
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Badge variant="subtle">{avgAdoption.toFixed(0)}% moyen</Badge>
            <Badge variant="success">{highAdoption} features &gt;70%</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={FEATURE_USAGE_DATA} layout="vertical" margin={{ left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={true} vertical={false} />
            <XAxis 
              type="number" 
              domain={[0, 100]}
              tick={{ fontSize: 11 }}
              tickFormatter={(value) => `${value}%`}
              className="text-muted-foreground"
            />
            <YAxis 
              type="category" 
              dataKey="feature" 
              tick={{ fontSize: 11 }}
              width={100}
              className="text-muted-foreground"
            />
            <Tooltip 
              formatter={(value: number) => [`${value}%`, "Adoption"]}
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                borderColor: "hsl(var(--border))",
                borderRadius: "8px",
              }}
            />
            <Bar dataKey="usage" radius={[0, 4, 4, 0]}>
              {FEATURE_USAGE_DATA.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.usage)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Legend */}
        <div className="flex justify-center gap-6 mt-4 pt-4 border-t text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-success" />
            <span>≥80%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-primary" />
            <span>60-79%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-warning" />
            <span>40-59%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-muted-foreground" />
            <span>&lt;40%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
