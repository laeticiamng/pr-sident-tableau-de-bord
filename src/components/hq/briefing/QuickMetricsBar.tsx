import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowUpRight, ArrowDownRight, Users, DollarSign, Activity, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStripeKPIs, formatCurrency, formatPercentage } from "@/hooks/useStripeKPIs";
import { useConsolidatedMetrics } from "@/hooks/usePlatformMonitor";

interface QuickMetricsBarProps {
  className?: string;
}

export function QuickMetricsBar({ className }: QuickMetricsBarProps) {
  const { data: stripeData, isLoading: stripeLoading } = useStripeKPIs();
  const { metrics, isLoading: monitorLoading } = useConsolidatedMetrics();
  const stripeKPIs = stripeData?.kpis;

  type MetricItem = {
    label: string;
    value: string;
    change?: number;
    trend: "up" | "down" | "neutral";
    icon: React.ElementType;
    loading: boolean;
  };

  const metricsItems: MetricItem[] = [
    { 
      label: "MRR", 
      value: stripeKPIs ? formatCurrency(stripeKPIs.mrr, stripeKPIs.currency) : "—",
      change: stripeKPIs?.mrrChange,
      trend: stripeKPIs ? (stripeKPIs.mrrChange > 0 ? "up" : stripeKPIs.mrrChange < 0 ? "down" : "neutral") : "neutral",
      icon: DollarSign,
      loading: stripeLoading,
    },
    { 
      label: "Clients", 
      value: stripeKPIs ? stripeKPIs.totalCustomers.toLocaleString("fr-FR") : "—",
      change: stripeKPIs?.newCustomersThisMonth,
      trend: stripeKPIs && stripeKPIs.newCustomersThisMonth > 0 ? "up" : "neutral",
      icon: Users,
      loading: stripeLoading,
    },
    { 
      label: "Uptime", 
      value: monitorLoading ? "—" : `${metrics.uptimePercent.toFixed(1)}%`,
      trend: "neutral",
      icon: Activity,
      loading: monitorLoading,
    },
    { 
      label: "Plateformes", 
      value: monitorLoading ? "—" : `${metrics.greenPlatforms}/${metrics.totalPlatforms}`,
      trend: "neutral",
      icon: Shield,
      loading: monitorLoading,
    },
  ];

  return (
    <div className={cn("grid grid-cols-2 md:grid-cols-4 gap-3", className)}>
      {metricsItems.map((metric) => {
        const Icon = metric.icon;

        if (metric.loading) {
          return (
            <Card key={metric.label} className="card-executive">
              <CardContent className="p-4">
                <Skeleton className="h-12 w-full" />
              </CardContent>
            </Card>
          );
        }

        return (
          <Card key={metric.label} className="card-executive">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Icon className="h-4 w-4 text-primary" />
                {metric.trend === "up" && metric.change !== undefined && (
                  <Badge variant="success" className="text-xs flex items-center gap-0.5">
                    <ArrowUpRight className="h-3 w-3" />
                    {typeof metric.change === 'number' ? formatPercentage(metric.change) : metric.change}
                  </Badge>
                )}
                {metric.trend === "down" && metric.change !== undefined && (
                  <Badge variant="destructive" className="text-xs flex items-center gap-0.5">
                    <ArrowDownRight className="h-3 w-3" />
                    {typeof metric.change === 'number' ? formatPercentage(metric.change) : metric.change}
                  </Badge>
                )}
                {metric.trend === "neutral" && (
                  <Badge variant="subtle" className="text-xs">
                    Stable
                  </Badge>
                )}
              </div>
              <div className="text-xl font-bold">{metric.value}</div>
              <div className="text-xs text-muted-foreground">{metric.label}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
