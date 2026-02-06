import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  BarChart3,
  PieChart,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  RefreshCw
} from "lucide-react";
import { usePendingApprovals, useRecentRuns } from "@/hooks/useHQData";
import { useConsolidatedMetrics, useRefreshPlatformMonitor } from "@/hooks/usePlatformMonitor";
import { useStripeKPIs, formatCurrency, formatPercentage } from "@/hooks/useStripeKPIs";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  loading?: boolean;
}

function MetricCard({ title, value, change, changeLabel, icon, trend, loading }: MetricCardProps) {
  if (loading) {
    return (
      <Card className="card-executive">
        <CardContent className="p-4">
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-executive hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {change !== undefined && (
              <div className="flex items-center gap-1 text-xs">
                {trend === "up" ? (
                  <ArrowUpRight className="h-3 w-3 text-success" />
                ) : trend === "down" ? (
                  <ArrowDownRight className="h-3 w-3 text-destructive" />
                ) : (
                  <Minus className="h-3 w-3 text-muted-foreground" />
                )}
                <span className={cn(
                  trend === "up" ? "text-success" : 
                  trend === "down" ? "text-destructive" : 
                  "text-muted-foreground"
                )}>
                  {change > 0 ? "+" : ""}{change}% {changeLabel || "vs hier"}
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

interface ExecutiveCockpitProps {
  className?: string;
}

export function ExecutiveCockpit({ className }: ExecutiveCockpitProps) {
  const { metrics, isLoading: metricsLoading, isHealthy, isCritical } = useConsolidatedMetrics();
  const refreshMonitor = useRefreshPlatformMonitor();
  const { data: approvals, isLoading: approvalsLoading } = usePendingApprovals();
  const { data: runs, isLoading: runsLoading } = useRecentRuns(10);

  // Calculate platform metrics from live monitoring
  const greenCount = metrics.greenPlatforms;
  const amberCount = metrics.amberPlatforms;
  const redCount = metrics.redPlatforms;
  const totalPlatforms = metrics.totalPlatforms;
  const avgUptime = metrics.uptimePercent;

  // Calculate run metrics
  const completedRuns = runs?.filter(r => r.status === "completed").length || 0;
  const failedRuns = runs?.filter(r => r.status === "failed").length || 0;
  const runSuccessRate = runs?.length ? (completedRuns / runs.length) * 100 : 0;

  // Real Stripe KPIs
  const { data: stripeData, isLoading: stripeLoading } = useStripeKPIs();
  const stripeKPIs = stripeData?.kpis;

  const realKPIs = {
    mrr: { 
      value: stripeKPIs ? formatCurrency(stripeKPIs.mrr, stripeKPIs.currency) : "—", 
      change: stripeKPIs?.mrrChange ?? undefined, 
      trend: stripeKPIs ? (stripeKPIs.mrrChange > 0 ? "up" as const : stripeKPIs.mrrChange < 0 ? "down" as const : "neutral" as const) : "neutral" as const 
    },
    activeUsers: { 
      value: stripeKPIs ? stripeKPIs.totalCustomers.toLocaleString("fr-FR") : "—", 
      change: stripeKPIs?.newCustomersThisMonth ?? undefined, 
      trend: stripeKPIs && stripeKPIs.newCustomersThisMonth > 0 ? "up" as const : "neutral" as const 
    },
    churnRate: { 
      value: stripeKPIs ? formatPercentage(stripeKPIs.churnRate, false) : "—", 
      change: stripeKPIs?.churnRateChange ?? undefined, 
      trend: stripeKPIs ? (stripeKPIs.churnRateChange < 0 ? "up" as const : stripeKPIs.churnRateChange > 0 ? "down" as const : "neutral" as const) : "neutral" as const 
    },
    avgResponseTime: { value: `${metrics.avgResponseTime}ms`, change: undefined, trend: "neutral" as const },
  };

  const isLoading = metricsLoading || approvalsLoading || runsLoading || stripeLoading;

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Cockpit Dirigeant</h2>
          <p className="text-sm text-muted-foreground">
            Vue consolidée des KPIs des 5 plateformes
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => refreshMonitor.mutate(undefined)}
            disabled={refreshMonitor.isPending}
            title="Rafraîchir le monitoring"
          >
            <RefreshCw className={cn("h-4 w-4", refreshMonitor.isPending && "animate-spin")} />
          </Button>
          <Badge 
            variant={isCritical ? "destructive" : isHealthy ? "gold" : "subtle"} 
            className="gap-1"
          >
            <Activity className="h-3 w-3" />
            {isCritical ? "Critique" : isHealthy ? "Opérationnel" : "Attention"}
          </Badge>
        </div>
      </div>

      {/* Platform Health Overview */}
      <Card className="card-executive bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            Santé des Plateformes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center p-3 rounded-lg bg-success/10 border border-success/20">
              <div className="text-2xl font-bold text-success">{greenCount}</div>
              <div className="text-xs text-muted-foreground">Opérationnelles</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-warning/10 border border-warning/20">
              <div className="text-2xl font-bold text-warning">{amberCount}</div>
              <div className="text-xs text-muted-foreground">Attention</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              <div className="text-2xl font-bold text-destructive">{redCount}</div>
              <div className="text-xs text-muted-foreground">Critiques</div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Uptime moyen</span>
              <span className="font-mono font-medium">{avgUptime.toFixed(1)}%</span>
            </div>
            <Progress value={avgUptime} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricCard
          title="MRR"
          value={realKPIs.mrr.value}
          change={realKPIs.mrr.change}
          changeLabel="vs mois dernier"
          trend={realKPIs.mrr.trend}
          icon={<DollarSign className="h-5 w-5 text-accent" />}
          loading={isLoading}
        />
        <MetricCard
          title="Clients Stripe"
          value={realKPIs.activeUsers.value}
          change={realKPIs.activeUsers.change}
          changeLabel="nouveaux ce mois"
          trend={realKPIs.activeUsers.trend}
          icon={<Users className="h-5 w-5 text-accent" />}
          loading={isLoading}
        />
        <MetricCard
          title="Taux de Churn"
          value={realKPIs.churnRate.value}
          change={realKPIs.churnRate.change}
          trend={realKPIs.churnRate.trend}
          icon={<TrendingDown className="h-5 w-5 text-accent" />}
          loading={isLoading}
        />
        <MetricCard
          title="Temps Réponse"
          value={realKPIs.avgResponseTime.value}
          change={realKPIs.avgResponseTime.change}
          trend={realKPIs.avgResponseTime.trend}
          icon={<Clock className="h-5 w-5 text-accent" />}
          loading={isLoading}
        />
      </div>

      {/* Operations Summary */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Approvals Status */}
        <Card className="card-executive">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-success" />
              Gouvernance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Approbations en attente</span>
                <Badge variant={approvals?.length ? "gold" : "subtle"}>
                  {approvals?.length || 0}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Runs IA réussis</span>
                <Badge variant="subtle">
                  {completedRuns} / {runs?.length || 0}
                </Badge>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Taux de succès</span>
                  <span className="font-mono">{runSuccessRate.toFixed(0)}%</span>
                </div>
                <Progress value={runSuccessRate} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Activity */}
        <Card className="card-executive">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="h-4 w-4 text-accent" />
              Activité IA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Runs aujourd'hui</span>
                <Badge variant="subtle">{runs?.length || 0}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Dernier run</span>
                <span className="text-sm font-mono">
                  {runs?.[0]?.created_at 
                    ? new Date(runs[0].created_at).toLocaleTimeString("fr-FR", {
                        hour: "2-digit",
                        minute: "2-digit"
                      })
                    : "—"
                  }
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Échecs récents</span>
                <Badge variant={failedRuns > 0 ? "destructive" : "subtle"}>
                  {failedRuns}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Platform-specific KPIs */}
      <Card className="card-executive">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <PieChart className="h-4 w-4 text-primary" />
            KPIs par Plateforme
          </CardTitle>
          <CardDescription>
            Métriques consolidées des 5 plateformes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {metrics.platforms.map((platform) => (
              <div 
                key={platform.key}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    platform.status === "green" ? "bg-success" :
                    platform.status === "amber" ? "bg-warning" :
                    "bg-destructive"
                  )} />
                  <div>
                    <p className="font-medium text-sm capitalize">{platform.key.replace(/-/g, " ")}</p>
                    <p className="text-xs text-muted-foreground">
                      {platform.error || (platform.status === "green" ? "Opérationnel" : "Attention requise")}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm">{platform.responseTime ? `${platform.responseTime}ms` : "—"}</p>
                  <p className="text-xs text-muted-foreground">Latence</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
