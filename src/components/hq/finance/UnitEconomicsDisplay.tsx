import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, DollarSign, Users, Target, AlertCircle, CheckCircle, Link2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface UnitEconomicsData {
  cac: number;
  ltv: number;
  arpu: number;
  paybackPeriod: number;
  grossMargin: number;
}

interface UnitEconomicsDisplayProps {
  data?: UnitEconomicsData;
  currency?: string;
  className?: string;
}

export function UnitEconomicsDisplay({ data, currency = "EUR", className }: UnitEconomicsDisplayProps) {
  if (!data) {
    return (
      <Card className={cn("card-executive", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Unit Economics
          </CardTitle>
          <CardDescription>Métriques unitaires de rentabilité</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-muted-foreground/20 rounded-lg">
            <Link2 className="h-10 w-10 text-muted-foreground/40 mb-3" />
            <p className="text-sm font-medium text-muted-foreground">Connexion Finance requise</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Connectez Stripe et votre analytics pour calculer les unit economics</p>
            <Badge variant="outline" className="mt-3">Stripe / Analytics</Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  const ltvCacRatio = data.ltv / data.cac;
  const isHealthy = ltvCacRatio >= 3;
  const paybackIsGood = data.paybackPeriod <= 12;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("fr-FR", { style: "currency", currency, minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
  };

  return (
    <Card className={cn("card-executive", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Unit Economics
        </CardTitle>
        <CardDescription className="flex items-center gap-2">
          {isHealthy ? <CheckCircle className="h-4 w-4 text-success" /> : <AlertCircle className="h-4 w-4 text-warning" />}
          {isHealthy ? "Métriques saines" : "À surveiller"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-transparent border border-primary/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Ratio LTV/CAC</span>
            <Badge variant={ltvCacRatio >= 3 ? "success" : ltvCacRatio >= 2 ? "warning" : "destructive"}>
              {ltvCacRatio >= 3 ? "Excellent" : ltvCacRatio >= 2 ? "Bon" : "Faible"}
            </Badge>
          </div>
          <div className="text-4xl font-bold text-primary">{ltvCacRatio.toFixed(1)}x</div>
          <Progress value={Math.min(100, (ltvCacRatio / 5) * 100)} className="h-2 mt-3" />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>Cible: ≥3x</span>
            <span>Optimal: 5x+</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-lg border text-center">
            <DollarSign className="h-4 w-4 mx-auto mb-2 text-destructive" />
            <div className="text-sm text-muted-foreground mb-1">CAC</div>
            <div className="text-xl font-bold">{formatCurrency(data.cac)}</div>
            <div className="text-xs text-muted-foreground">Coût d'Acquisition</div>
          </div>
          <div className="p-4 rounded-lg border text-center">
            <Users className="h-4 w-4 mx-auto mb-2 text-success" />
            <div className="text-sm text-muted-foreground mb-1">LTV</div>
            <div className="text-xl font-bold">{formatCurrency(data.ltv)}</div>
            <div className="text-xs text-muted-foreground">Valeur Client</div>
          </div>
          <div className="p-4 rounded-lg border text-center">
            <Target className="h-4 w-4 mx-auto mb-2 text-primary" />
            <div className="text-sm text-muted-foreground mb-1">ARPU</div>
            <div className="text-xl font-bold">{formatCurrency(data.arpu)}</div>
            <div className="text-xs text-muted-foreground">Revenu/Utilisateur</div>
          </div>
          <div className="p-4 rounded-lg border text-center">
            <TrendingUp className="h-4 w-4 mx-auto mb-2 text-accent" />
            <div className="text-sm text-muted-foreground mb-1">Payback</div>
            <div className="text-xl font-bold">{data.paybackPeriod} mois</div>
            <div className="text-xs text-muted-foreground">{paybackIsGood ? "✓ Bon" : "⚠ Lent"}</div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Marge Brute</span>
            <span className="font-medium">{data.grossMargin}%</span>
          </div>
          <Progress value={data.grossMargin} className={cn("h-2", data.grossMargin >= 70 && "[&>div]:bg-success")} />
        </div>
      </CardContent>
    </Card>
  );
}
