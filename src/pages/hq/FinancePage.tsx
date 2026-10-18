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
  CheckCircle2,
  Users,
} from "lucide-react";
import { useStripeKPIs, formatCurrency, formatPercentage } from "@/hooks/useStripeKPIs";
import { Skeleton } from "@/components/ui/skeleton";
import { MANAGED_PLATFORMS } from "@/lib/constants";
import { MRRChart } from "@/components/hq/charts/MRRChart";
import { UnitEconomicsDisplay } from "@/components/hq/finance/UnitEconomicsDisplay";
import { RevenueComparisonChart } from "@/components/hq/charts/RevenueComparisonChart";
import { RevenueBreakdown } from "@/components/hq/finance/RevenueBreakdown";
import { CashFlowForecast } from "@/components/hq/finance/CashFlowForecast";
import { ExecutiveHeader } from "@/components/hq/ExecutiveDataSource";
import { MethodologyDisclosure } from "@/components/hq/MethodologyDisclosure";
import { DonneesIndisponibles } from "@/components/hq/DonneesIndisponibles";
import { DONNEES_INDISPONIBLES, messageIndisponibilite } from "@/lib/stripe-kpis-adapter";

export default function FinancePage() {
  const { data, isLoading, refetch, isFetching } = useStripeKPIs();

  // kpis n'est renseigné que pour des données Stripe réelles ; sinon « Données indisponibles ».
  const kpis = data?.kpis ?? null;
  const raison = messageIndisponibilite(data?.reason);

  const direction = (v: number | null | undefined, inverse = false) =>
    v == null || v === 0 ? "neutral" : (v > 0) !== inverse ? "up" : "down";

  // Financial KPIs from Stripe
  const financialKPIs = [
    {
      label: "MRR",
      available: !!kpis,
      value: kpis ? formatCurrency(kpis.mrr, kpis.currency) : DONNEES_INDISPONIBLES,
      // Variation du MRR non mesurée par Stripe (null) : « — ».
      change: kpis && kpis.mrrChange != null ? formatPercentage(kpis.mrrChange) : "—",
      trend: direction(kpis?.mrrChange),
      icon: DollarSign,
      description: "Monthly Recurring Revenue"
    },
    {
      label: "Encaissé ce mois (à date)",
      available: !!kpis,
      value: kpis ? formatCurrency(kpis.revenueThisMonth, kpis.currency) : DONNEES_INDISPONIBLES,
      // Comparaison sur périodes équivalentes : même durée écoulée du mois précédent.
      change: kpis && kpis.revenueChangeToDate != null ? formatPercentage(kpis.revenueChangeToDate) : "—",
      trend: direction(kpis?.revenueChangeToDate),
      icon: CreditCard,
      description: "vs même période du mois précédent"
    },
    {
      label: "Abonnements Actifs",
      available: !!kpis,
      value: kpis ? kpis.activeSubscriptions.toString() : DONNEES_INDISPONIBLES,
      change: kpis && kpis.activeSubscriptionsChange != null
        ? `${kpis.activeSubscriptionsChange > 0 ? "+" : ""}${kpis.activeSubscriptionsChange} ce mois (net)`
        : "—",
      trend: direction(kpis?.activeSubscriptionsChange),
      icon: TrendingUp,
      description: "Subscriptions actives"
    },
    {
      label: "Taux de Churn",
      available: kpis?.churnRate != null,
      value: kpis?.churnRate != null ? `${kpis.churnRate}%` : DONNEES_INDISPONIBLES,
      change: kpis && kpis.churnRateChange != null ? formatPercentage(kpis.churnRateChange) : "—",
      trend: direction(kpis?.churnRateChange, true),
      icon: kpis?.churnRate != null && kpis.churnRate < 3 ? TrendingDown : Wallet,
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
      {/* En-tête exécutif — Standard HEC/Polytechnique */}
      <ExecutiveHeader
        title="Finance & ROI"
        subtitle={`Vue financière consolidée des ${MANAGED_PLATFORMS.length} plateformes`}
        context="Indicateurs financiers issus de l'API Stripe : MRR, encaissements, churn. Aucun chiffre n'est affiché sans source vérifiée."
        source={kpis ? {
          source: "stripe",
          lastUpdated: kpis.lastUpdated || undefined,
          confidence: "high",
          methodology: "Agrégation des données de paiement Stripe",
        } : undefined}
        actions={
          <div className="flex items-center gap-3">
            {kpis && (
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
        }
      />

      {!isLoading && !kpis && <DonneesIndisponibles reason={raison} />}

      {/* KPIs */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
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
                  {kpi.available ? (
                    <div className="text-2xl font-bold">{kpi.value}</div>
                  ) : (
                    <div className="text-sm font-medium text-muted-foreground py-1">{kpi.value}</div>
                  )}
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
            ) : kpis ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg border text-center">
                  <div className="text-3xl font-bold text-primary">{kpis.totalCustomers}</div>
                  <div className="text-sm text-muted-foreground">Clients totaux</div>
                </div>
                <div className="p-4 rounded-lg border text-center">
                  <div className="text-3xl font-bold text-success">+{kpis.newCustomersThisMonth}</div>
                  <div className="text-sm text-muted-foreground">Nouveaux ce mois</div>
                </div>
              </div>
            ) : (
              <DonneesIndisponibles reason={raison} />
            )}
          </CardContent>
        </Card>

        {/* Revenue Comparison */}
        <Card className="card-executive">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <BarChart3 className="h-5 w-5 text-primary" />
              Comparaison des encaissements
            </CardTitle>
            <CardDescription>
              Mois en cours à date vs même période du mois précédent
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-3/4" />
              </div>
            ) : !kpis ? (
              <DonneesIndisponibles reason={raison} />
            ) : (
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">Ce mois (à date)</span>
                    <span className="font-semibold">{formatCurrency(kpis.revenueThisMonth, kpis.currency)}</span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full transition-all" 
                      style={{ 
                        width: `${Math.min(100, kpis.revenueLastMonthToDate > 0
                          ? (kpis.revenueThisMonth / kpis.revenueLastMonthToDate) * 100
                          : 100)}%` 
                      }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">Même période du mois précédent</span>
                    <span className="font-semibold">{formatCurrency(kpis.revenueLastMonthToDate, kpis.currency)}</span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-muted-foreground/30 rounded-full" 
                      style={{ width: "100%" }}
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Mois précédent complet : {formatCurrency(kpis.revenueLastMonth, kpis.currency)}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* MRR Chart & Revenue Comparison */}
      <div className="grid gap-6 lg:grid-cols-2">
        <MRRChart />
        {kpis ? (
          <RevenueComparisonChart
            currentMonth={kpis.revenueThisMonth}
            previousMonth={kpis.revenueLastMonthToDate}
            currency={kpis.currency}
          />
        ) : (
          <DonneesIndisponibles
            title="Évolution des encaissements"
            description="Mois en cours à date vs même période du mois précédent"
            reason={raison}
          />
        )}
      </div>

      {/* Revenue Breakdown */}
      <RevenueBreakdown />

      {/* Cash Flow Forecast */}
      <CashFlowForecast />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Platform Costs */}
        <Card className="card-executive">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <PieChart className="h-5 w-5 text-primary" />
              Plateformes & Infrastructure
            </CardTitle>
            <CardDescription>
              Statut des {MANAGED_PLATFORMS.length} plateformes gérées
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {platformCosts.map((platform) => (
                <div 
                  key={platform.name} 
                  className="flex items-center justify-between flex-wrap gap-2 p-3 rounded-lg border"
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

      {/* Méthodologie & Sources — Standard HEC/Polytechnique */}
      <MethodologyDisclosure
        sources={[
          kpis
            ? {
                name: "Stripe API",
                type: "api",
                refreshRate: "À chaque chargement",
                reliability: "verified",
                description: "Abonnements, clients et paiements (lecture seule)",
              }
            : {
                name: "Stripe API",
                type: "api",
                reliability: "estimated",
                description: "Non connectée : aucune donnée affichée",
              },
        ]}
        calculations={[
          {
            metric: "MRR (Monthly Recurring Revenue)",
            formula: "Σ (prix unitaire × quantité), ramené au mois selon l'intervalle de facturation",
            assumptions: ["Abonnements au statut « actif » uniquement", "Annuel ÷ 12, trimestriel ÷ 3, etc."],
            limitations: ["Exclut les revenus ponctuels, les prix à l'usage et à paliers", "Remises non déduites"],
          },
          {
            metric: "Taux de Churn",
            formula: "Abonnements annulés ce mois (créés avant le 1er) ÷ abonnements actifs au 1er du mois × 100",
            limitations: ["Hors essais et impayés", "Indisponible si aucun abonnement au 1er du mois"],
          },
        ]}
        lastUpdated={kpis?.lastUpdated || undefined}
        dataQuality={kpis ? "high" : "low"}
      />

      {/* Last Updated */}
      {kpis?.lastUpdated && (
        <div className="text-center text-xs text-muted-foreground">
          Dernière mise à jour : {new Date(kpis.lastUpdated).toLocaleString("fr-FR")}
        </div>
      )}
    </div>
  );
}
