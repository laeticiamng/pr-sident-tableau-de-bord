import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Users, 
  DollarSign,
  Target,
  Activity,
  PieChart,
  LineChart,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { useStripeKPIs, formatCurrency, formatPercentage } from "@/hooks/useStripeKPIs";
import { CohortRetentionTable } from "@/components/hq/data/CohortRetentionTable";
import { CohortAnalysis } from "@/components/hq/data/CohortAnalysis";
import { ARPUTrendChart } from "@/components/hq/charts/ARPUTrendChart";
import { LTVSegmentChart } from "@/components/hq/data/LTVSegmentChart";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string;
  change?: number;
  icon: React.ReactNode;
  loading?: boolean;
}

function MetricCard({ title, value, change, icon, loading }: MetricCardProps) {
  if (loading) {
    return (
      <Card className="card-executive">
        <CardContent className="p-4">
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    );
  }

  const isPositive = change && change > 0;
  const isNegative = change && change < 0;

  return (
    <Card className="card-executive hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {change !== undefined && (
              <div className="flex items-center gap-1 text-xs">
                {isPositive ? (
                  <ArrowUpRight className="h-3 w-3 text-success" />
                ) : isNegative ? (
                  <ArrowDownRight className="h-3 w-3 text-destructive" />
                ) : null}
                <span className={cn(
                  isPositive ? "text-success" : 
                  isNegative ? "text-destructive" : 
                  "text-muted-foreground"
                )}>
                  {formatPercentage(change)} vs mois dernier
                </span>
              </div>
            )}
          </div>
          <div className="p-2 rounded-lg bg-accent/10">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Données de cohortes simulées
const COHORT_DATA = [
  { month: "Sep 2024", users: 120, retention: [100, 85, 72, 65, 58] },
  { month: "Oct 2024", users: 145, retention: [100, 88, 75, 68] },
  { month: "Nov 2024", users: 168, retention: [100, 82, 70] },
  { month: "Déc 2024", users: 195, retention: [100, 86] },
  { month: "Jan 2025", users: 220, retention: [100] },
];

// Données de funnel
const FUNNEL_DATA = [
  { stage: "Visiteurs", count: 10000, percentage: 100 },
  { stage: "Inscriptions", count: 2500, percentage: 25 },
  { stage: "Activation", count: 1200, percentage: 12 },
  { stage: "Premier achat", count: 450, percentage: 4.5 },
  { stage: "Récurrence", count: 180, percentage: 1.8 },
];

export default function DataAnalyticsPage() {
  const { data: stripeData, isLoading } = useStripeKPIs();
  const kpis = stripeData?.kpis;
  const isMock = stripeData?.mock;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-headline-1 mb-2">Data & Analytics</h1>
          <p className="text-muted-foreground text-lg">
            Analyse des cohortes, LTV, ROI et métriques business.
          </p>
        </div>
        {isMock && (
          <Badge variant="subtle">Données simulées</Badge>
        )}
      </div>

      {/* KPIs principaux depuis Stripe */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="MRR"
          value={kpis ? formatCurrency(kpis.mrr) : "—"}
          change={kpis?.mrrChange}
          icon={<DollarSign className="h-5 w-5 text-accent" />}
          loading={isLoading}
        />
        <MetricCard
          title="Abonnés Actifs"
          value={kpis?.activeSubscriptions.toString() || "—"}
          change={kpis ? (kpis.activeSubscriptionsChange / (kpis.activeSubscriptions || 1)) * 100 : undefined}
          icon={<Users className="h-5 w-5 text-accent" />}
          loading={isLoading}
        />
        <MetricCard
          title="Taux de Churn"
          value={kpis ? `${kpis.churnRate}%` : "—"}
          change={kpis?.churnRateChange}
          icon={<TrendingDown className="h-5 w-5 text-accent" />}
          loading={isLoading}
        />
        <MetricCard
          title="Nouveaux ce mois"
          value={kpis?.newCustomersThisMonth.toString() || "—"}
          icon={<TrendingUp className="h-5 w-5 text-accent" />}
          loading={isLoading}
        />
      </div>

      {/* Funnel de conversion */}
      <Card className="card-executive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Funnel de Conversion
          </CardTitle>
          <CardDescription>
            Parcours utilisateur de la visite à la récurrence
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {FUNNEL_DATA.map((stage, index) => (
              <div key={stage.stage} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">
                      {index + 1}
                    </span>
                    <span className="font-medium">{stage.stage}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground">
                      {stage.count.toLocaleString("fr-FR")}
                    </span>
                    <Badge variant="subtle" className="font-mono">
                      {stage.percentage}%
                    </Badge>
                  </div>
                </div>
                <Progress value={stage.percentage} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Analyse de cohortes - Composants dédiés */}
      <div className="grid gap-6 lg:grid-cols-2">
        <CohortRetentionTable />
        <ARPUTrendChart />
      </div>

      {/* LTV par Segment */}
      <LTVSegmentChart />

      {/* LTV et ROI */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="card-executive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChart className="h-5 w-5 text-primary" />
              Customer Lifetime Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center p-6 rounded-lg bg-gradient-to-br from-primary/10 to-transparent">
                <p className="text-4xl font-bold text-primary">€487</p>
                <p className="text-sm text-muted-foreground">LTV moyen</p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="p-3 rounded-lg bg-muted/30">
                  <p className="text-muted-foreground">CAC</p>
                  <p className="font-bold">€52</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/30">
                  <p className="text-muted-foreground">LTV:CAC</p>
                  <p className="font-bold text-success">9.4x</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-executive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              ROI Marketing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center p-6 rounded-lg bg-gradient-to-br from-success/10 to-transparent">
                <p className="text-4xl font-bold text-success">342%</p>
                <p className="text-sm text-muted-foreground">ROI global</p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="p-3 rounded-lg bg-muted/30">
                  <p className="text-muted-foreground">Investissement</p>
                  <p className="font-bold">€12,400</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/30">
                  <p className="text-muted-foreground">Revenus générés</p>
                  <p className="font-bold">€54,800</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
