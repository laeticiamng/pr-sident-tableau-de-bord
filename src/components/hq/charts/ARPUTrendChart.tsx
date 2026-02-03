import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

interface ARPUTrendChartProps {
  data?: { month: string; arpu: number }[];
  currency?: string;
}

const DEFAULT_DATA = [
  { month: "Sep", arpu: 24.5 },
  { month: "Oct", arpu: 26.8 },
  { month: "Nov", arpu: 28.2 },
  { month: "Dec", arpu: 29.5 },
  { month: "Jan", arpu: 30.1 },
  { month: "Fév", arpu: 31.2 },
];

export function ARPUTrendChart({ data = DEFAULT_DATA, currency = "EUR" }: ARPUTrendChartProps) {
  const formatValue = (value: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const latestARPU = data[data.length - 1]?.arpu || 0;
  const firstARPU = data[0]?.arpu || 0;
  const growth = firstARPU > 0 ? ((latestARPU - firstARPU) / firstARPU * 100).toFixed(1) : "N/A";

  return (
    <Card className="card-executive">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Évolution ARPU
        </CardTitle>
        <CardDescription>
          Revenu moyen par utilisateur — Croissance: +{growth}% sur 6 mois
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="month" 
              tick={{ fontSize: 12 }}
              className="text-muted-foreground"
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => `${value}€`}
              className="text-muted-foreground"
            />
            <Tooltip 
              formatter={(value: number) => [formatValue(value), "ARPU"]}
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                borderColor: "hsl(var(--border))",
                borderRadius: "8px",
              }}
            />
            <Line 
              type="monotone" 
              dataKey="arpu" 
              stroke="hsl(var(--primary))" 
              strokeWidth={3}
              dot={{ fill: "hsl(var(--primary))", strokeWidth: 2 }}
              activeDot={{ r: 6, fill: "hsl(var(--accent))" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
