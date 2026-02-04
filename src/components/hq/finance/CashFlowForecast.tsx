import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wallet, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface CashFlowData {
  month: string;
  inflow: number;
  outflow: number;
  net: number;
}

interface CashFlowForecastProps {
  data?: CashFlowData[];
  currency?: string;
  className?: string;
}

const DEFAULT_DATA: CashFlowData[] = [
  { month: "Fév", inflow: 52000, outflow: 38000, net: 14000 },
  { month: "Mar", inflow: 58000, outflow: 40000, net: 18000 },
  { month: "Avr", inflow: 61000, outflow: 42000, net: 19000 },
  { month: "Mai", inflow: 65000, outflow: 43000, net: 22000 },
  { month: "Juin", inflow: 70000, outflow: 45000, net: 25000 },
];

export function CashFlowForecast({ data = DEFAULT_DATA, currency = "EUR", className }: CashFlowForecastProps) {
  const formatValue = (value: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency,
      notation: "compact",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const totalNet = data.reduce((sum, d) => sum + d.net, 0);
  const avgNet = totalNet / data.length;

  return (
    <Card className={cn("card-executive", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-primary" />
              Prévision Cash Flow
            </CardTitle>
            <CardDescription>
              5 prochains mois
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Badge variant="success" className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              +{formatValue(avgNet)}/mois
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} barGap={2}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="month" 
              tick={{ fontSize: 11 }}
              className="text-muted-foreground"
            />
            <YAxis 
              tick={{ fontSize: 11 }}
              tickFormatter={(value) => `${value / 1000}K`}
              className="text-muted-foreground"
            />
            <Tooltip 
              formatter={(value: number, name: string) => [
                formatValue(value), 
                name === "inflow" ? "Entrées" : name === "outflow" ? "Sorties" : "Net"
              ]}
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                borderColor: "hsl(var(--border))",
                borderRadius: "8px",
              }}
            />
            <Legend 
              formatter={(value) => (
                value === "inflow" ? "Entrées" : value === "outflow" ? "Sorties" : "Net"
              )}
            />
            <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" />
            <Bar dataKey="inflow" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
            <Bar dataKey="outflow" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
          <div className="text-center">
            <div className="text-lg font-bold text-success">
              {formatValue(data.reduce((sum, d) => sum + d.inflow, 0))}
            </div>
            <div className="text-xs text-muted-foreground">Entrées totales</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-destructive">
              {formatValue(data.reduce((sum, d) => sum + d.outflow, 0))}
            </div>
            <div className="text-xs text-muted-foreground">Sorties totales</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-primary">
              {formatValue(totalNet)}
            </div>
            <div className="text-xs text-muted-foreground">Net prévu</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
