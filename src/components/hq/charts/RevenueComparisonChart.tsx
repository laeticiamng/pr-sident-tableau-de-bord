import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

interface RevenueComparisonChartProps {
  currentMonth: number;
  previousMonth: number;
  currency?: string;
}

export function RevenueComparisonChart({ 
  currentMonth, 
  previousMonth, 
  currency = "EUR" 
}: RevenueComparisonChartProps) {
  const data = [
    { name: "Mois précédent", revenue: previousMonth },
    { name: "Ce mois", revenue: currentMonth },
  ];

  const formatValue = (value: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const growth = previousMonth > 0 
    ? ((currentMonth - previousMonth) / previousMonth * 100).toFixed(1)
    : "N/A";

  return (
    <Card className="card-executive">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          Évolution des Revenus
        </CardTitle>
        <CardDescription>
          Croissance : {growth}% vs mois précédent
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12 }}
              className="text-muted-foreground"
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
              className="text-muted-foreground"
            />
            <Tooltip 
              formatter={(value: number) => [formatValue(value), "Revenus"]}
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                borderColor: "hsl(var(--border))",
                borderRadius: "8px",
              }}
            />
            <Bar 
              dataKey="revenue" 
              fill="hsl(var(--primary))" 
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
