import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  DollarSign, 
  Users, 
  TrendingUp, 
  Activity,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { useStripeKPIs, formatCurrency, formatPercentage } from "@/hooks/useStripeKPIs";
import { usePlatforms } from "@/hooks/useHQData";
import { Skeleton } from "@/components/ui/skeleton";

export function KeyMetricsGrid() {
  const { data: stripeData, isLoading: stripeLoading } = useStripeKPIs();
  const { data: platformsResult, isLoading: platformsLoading } = usePlatforms();
  const platforms = platformsResult?.platforms;
  
  const kpis = stripeData?.kpis;
  const isLoading = stripeLoading || platformsLoading;

  const healthyPlatforms = platforms?.filter(p => p.status === "green").length || 0;
  const totalPlatforms = platforms?.length || 7;

  const metrics = [
    {
      title: "MRR",
      value: kpis ? formatCurrency(kpis.mrr, kpis.currency) : "—",
      change: kpis ? formatPercentage(kpis.mrrChange) : "—",
      trend: kpis && kpis.mrrChange > 0 ? "up" : "down",
      icon: DollarSign,
      color: "text-success"
    },
    {
      title: "Clients Actifs",
      value: kpis?.activeSubscriptions?.toString() || "—",
      change: kpis ? `+${kpis.activeSubscriptionsChange}` : "—",
      trend: "up",
      icon: Users,
      color: "text-primary"
    },
    {
      title: "Plateformes OK",
      value: `${healthyPlatforms}/${totalPlatforms}`,
      change: healthyPlatforms === totalPlatforms ? "100%" : `${Math.round((healthyPlatforms/totalPlatforms)*100)}%`,
      trend: healthyPlatforms === totalPlatforms ? "up" : "down",
      icon: Activity,
      color: healthyPlatforms === totalPlatforms ? "text-success" : "text-warning"
    },
    {
      title: "Croissance",
      value: kpis ? `${kpis.mrrChange > 0 ? '+' : ''}${kpis.mrrChange}%` : "—",
      change: "vs mois dernier",
      trend: kpis && kpis.mrrChange > 0 ? "up" : "down",
      icon: TrendingUp,
      color: kpis && kpis.mrrChange > 0 ? "text-success" : "text-destructive"
    },
  ];

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="card-executive">
            <CardContent className="p-6">
              <Skeleton className="h-5 w-5 mb-3" />
              <Skeleton className="h-8 w-24 mb-2" />
              <Skeleton className="h-4 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-4">
      {metrics.map((metric) => (
        <Card key={metric.title} className="card-executive">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <metric.icon className={`h-5 w-5 ${metric.color}`} />
              {metric.trend === "up" ? (
                <ArrowUpRight className="h-4 w-4 text-success" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-destructive" />
              )}
            </div>
            <div className="text-2xl font-bold">{metric.value}</div>
            <div className="text-sm text-muted-foreground">{metric.title}</div>
            <div className="text-xs text-muted-foreground mt-1">{metric.change}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
