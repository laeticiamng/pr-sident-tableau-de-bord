import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  PieChart,
  BarChart3,
  Wallet,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Users
} from "lucide-react";
import { useStripeKPIs, formatCurrency, formatPercentage } from "@/hooks/useStripeKPIs";
import { Skeleton } from "@/components/ui/skeleton";
import { MANAGED_PLATFORMS } from "@/lib/constants";
import { MRRChart } from "@/components/hq/charts/MRRChart";
import { UnitEconomicsDisplay } from "@/components/hq/finance/UnitEconomicsDisplay";
import { RevenueComparisonChart } from "@/components/hq/charts/RevenueComparisonChart";
import { RevenueBreakdown } from "@/components/hq/finance/RevenueBreakdown";

export default function FinancePage() {
  const { data, isLoading, error, refetch, isFetching } = useStripeKPIs();

  const kpis = data?.kpis;
  const isMock = data?.mock;

  // Financial KPIs from Stripe
  const financialKPIs = [
    { 
      label: "MRR", 
      value: kpis ? formatCurrency(kpis.mrr, kpis.currency) : "—", 
      change: kpis ? formatPercentage(kpis.mrrChange) : "—",
      trend: kpis && kpis.mrrChange > 0 ? "up" : kpis && kpis.mrrChange < 0 ? "down" : "neutral",
      icon: DollarSign,
      description: "Monthly Recurring Revenue"
    },
    { 
      label: "Revenus du Mois", 
      value: kpis ? formatCurrency(kpis.revenueThisMonth, kpis.currency) : "—", 
      change: kpis && kpis.revenueLastMonth > 0 
        ? formatPercentage(((kpis.revenueThisMonth - kpis.revenueLastMonth) / kpis.revenueLastMonth) * 100) 
        : "—",
      trend: kpis && kpis.revenueThisMonth > kpis.revenueLastMonth ? "up" : "down",
      icon: CreditCard,
      description: "vs mois précédent"
    },
    { 
      label: "Abonnements Actifs", 
      value: kpis ? kpis.activeSubscriptions.toString() : "—", 
      change: kpis ? `+${kpis.activeSubscriptionsChange} ce mois` : "—",
      trend: kpis && kpis.activeSubscriptionsChange > 0 ? "up" : "neutral",
      icon: TrendingUp,
      description: "Subscriptions actives"
    },
    { 
      label: "Taux de Churn", 
      value: kpis ? `${kpis.churnRate}%` : "—", 
      change: kpis ? formatPercentage(kpis.churnRateChange) : "—",
      trend: kpis && kpis.churnRateChange < 0 ? "up" : kpis && kpis.churnRateChange > 0 ? "down" : "neutral",
      icon: kpis && kpis.churnRate < 3 ? TrendingDown : Wallet,
      description: "Attrition mensuelle"
    },
  ];

  // Platform costs (simplified - would come from cloud billing API)
  const platformCosts = MANAGED_PLATFORMS.map(p => ({
    name: p.name,
    hosting: "Lovable Cloud",
    status: p.status,
    isActive: p.status === "production" || p.status === "prototype",
  }));

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-headline-1 mb-2">Finance & ROI</h1>
          <p className="text-muted-foreground text-lg">
            Vue financière consolidée depuis Stripe.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isMock && (
            <Badge variant="outline" className="border-warning text-warning">
              <AlertCircle className="h-3 w-3 mr-1" />
              Données mock
            </Badge>
          )}
          {!isMock && kpis && (
            <Badge variant="outline" className="border-success text-success">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Stripe connecté
            </Badge>
          )}
          <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? "animate-spin" : ""}`} />
            Actualiser
          </Button>
        </div>
      </div>

      {error && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <span className="text-destructive">Erreur de chargement : {error.message}</span>
          </CardContent>
        </Card>
      )}

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-4">
        {financialKPIs.map((kpi) => (
          <Card key={kpi.label} className="card-executive">
            <CardContent className="p-6">
              {isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-5 w-5" />
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-3">
                    <kpi.icon className="h-5 w-5 text-primary" />
                    {kpi.trend === "up" && <ArrowUpRight className="h-4 w-4 text-success" />}
                    {kpi.trend === "down" && <ArrowDownRight className="h-4 w-4 text-destructive" />}
                  </div>
                  <div className="text-2xl font-bold">{kpi.value}</div>
                  <div className="text-sm text-muted-foreground mt-1">{kpi.label}</div>
                  <div className="text-xs text-muted-foreground mt-2">{kpi.change}</div>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Clients Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="card-executive">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Users className="h-5 w-5 text-primary" />
              Base Clients
            </CardTitle>
            <CardDescription>
              Statistiques clients Stripe
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="grid grid-cols-2 gap-4">
                {[1, 2].map(i => (
                  <div key={i} className="p-4 rounded-lg border text-center">
                    <Skeleton className="h-8 w-16 mx-auto mb-2" />
                    <Skeleton className="h-4 w-24 mx-auto" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg border text-center">
                  <div className="text-3xl font-bold text-primary">{kpis?.totalCustomers || 0}</div>
                  <div className="text-sm text-muted-foreground">Clients totaux</div>
                </div>
                <div className="p-4 rounded-lg border text-center">
                  <div className="text-3xl font-bold text-success">+{kpis?.newCustomersThisMonth || 0}</div>
                  <div className="text-sm text-muted-foreground">Nouveaux ce mois</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Revenue Comparison */}
        <Card className="card-executive">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <BarChart3 className="h-5 w-5 text-primary" />
              Comparaison Revenus
            </CardTitle>
            <CardDescription>
              Ce mois vs mois précédent
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-3/4" />
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">Ce mois</span>
                    <span className="font-semibold">{formatCurrency(kpis?.revenueThisMonth || 0, kpis?.currency)}</span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full transition-all" 
                      style={{ 
                        width: `${Math.min(100, kpis?.revenueLastMonth && kpis.revenueLastMonth > 0 
                          ? (kpis.revenueThisMonth / kpis.revenueLastMonth) * 100 
                          : 100)}%` 
                      }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">Mois précédent</span>
                    <span className="font-semibold">{formatCurrency(kpis?.revenueLastMonth || 0, kpis?.currency)}</span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-muted-foreground/30 rounded-full" 
                      style={{ width: "100%" }}
                    />
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* MRR Chart & Revenue Comparison */}
      <div className="grid gap-6 lg:grid-cols-2">
        <MRRChart />
        <RevenueComparisonChart 
          currentMonth={kpis?.revenueThisMonth || 0} 
          previousMonth={kpis?.revenueLastMonth || 0}
          currency={kpis?.currency || "EUR"}
        />
      </div>

      {/* Revenue Breakdown */}
      <RevenueBreakdown />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Platform Costs */}
        <Card className="card-executive">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <PieChart className="h-5 w-5 text-primary" />
              Plateformes & Infrastructure
            </CardTitle>
            <CardDescription>
              Statut des 5 plateformes gérées
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {platformCosts.map((platform) => (
                <div 
                  key={platform.name} 
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <span className="font-medium text-sm">{platform.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">{platform.hosting}</span>
                    <Badge variant={platform.isActive ? "default" : "outline"}>
                      {platform.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Unit Economics - Enhanced Component */}
        <UnitEconomicsDisplay />
      </div>

      {/* Last Updated */}
      {kpis?.lastUpdated && (
        <div className="text-center text-xs text-muted-foreground">
          Dernière mise à jour : {new Date(kpis.lastUpdated).toLocaleString("fr-FR")}
        </div>
      )}
    </div>
  );
}
