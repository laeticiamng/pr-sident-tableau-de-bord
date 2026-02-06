import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wallet, TrendingUp, Link2 } from "lucide-react";
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

export function CashFlowForecast({ data, currency = "EUR", className }: CashFlowForecastProps) {
  if (!data || data.length === 0) {
    return (
      <Card className={cn("card-executive", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-primary" />
            Prévision Cash Flow
          </CardTitle>
          <CardDescription>Projection des flux de trésorerie</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-muted-foreground/20 rounded-lg">
            <Link2 className="h-10 w-10 text-muted-foreground/40 mb-3" />
            <p className="text-sm font-medium text-muted-foreground">Connexion Finance requise</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Connectez Stripe et votre comptabilité pour les prévisions</p>
            <Badge variant="outline" className="mt-3">Stripe / Comptabilité</Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatValue = (value: number) => {
    return new Intl.NumberFormat("fr-FR", { style: "currency", currency, notation: "compact", maximumFractionDigits: 0 }).format(value);
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
            <CardDescription>{data.length} prochains mois</CardDescription>
          </div>
          <Badge variant="success" className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            +{formatValue(avgNet)}/mois
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} barGap={2}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} className="text-muted-foreground" />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={(value) => `${value / 1000}K`} className="text-muted-foreground" />
            <Tooltip
              formatter={(value: number, name: string) => [formatValue(value), name === "inflow" ? "Entrées" : name === "outflow" ? "Sorties" : "Net"]}
              contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px" }}
            />
            <Legend formatter={(value) => (value === "inflow" ? "Entrées" : value === "outflow" ? "Sorties" : "Net")} />
            <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" />
            <Bar dataKey="inflow" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
            <Bar dataKey="outflow" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
          <div className="text-center">
            <div className="text-lg font-bold text-success">{formatValue(data.reduce((sum, d) => sum + d.inflow, 0))}</div>
            <div className="text-xs text-muted-foreground">Entrées totales</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-destructive">{formatValue(data.reduce((sum, d) => sum + d.outflow, 0))}</div>
            <div className="text-xs text-muted-foreground">Sorties totales</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-primary">{formatValue(totalNet)}</div>
            <div className="text-xs text-muted-foreground">Net prévu</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
