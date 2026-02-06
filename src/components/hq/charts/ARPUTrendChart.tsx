import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Link2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ARPUTrendChartProps {
  data?: { month: string; arpu: number }[];
  currency?: string;
}

export function ARPUTrendChart({ data, currency = "EUR" }: ARPUTrendChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card className="card-executive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Évolution ARPU
          </CardTitle>
          <CardDescription>Revenu moyen par utilisateur</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-muted-foreground/20 rounded-lg">
            <Link2 className="h-10 w-10 text-muted-foreground/40 mb-3" />
            <p className="text-sm font-medium text-muted-foreground">Connexion Stripe requise</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Connectez Stripe pour calculer l'ARPU automatiquement</p>
            <Badge variant="outline" className="mt-3">Stripe</Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

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
          Revenu moyen par utilisateur — Croissance: +{growth}% sur {data.length} mois
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} className="text-muted-foreground" />
            <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => `${value}€`} className="text-muted-foreground" />
            <Tooltip
              formatter={(value: number) => [formatValue(value), "ARPU"]}
              contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px" }}
            />
            <Line type="monotone" dataKey="arpu" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ fill: "hsl(var(--primary))", strokeWidth: 2 }} activeDot={{ r: 6, fill: "hsl(var(--accent))" }} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
