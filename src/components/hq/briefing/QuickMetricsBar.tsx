import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, ArrowDownRight, TrendingUp, Users, DollarSign, Activity, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricItem {
  label: string;
  value: string;
  change?: number;
  trend?: "up" | "down" | "neutral";
  icon: React.ElementType;
}

interface QuickMetricsBarProps {
  className?: string;
}

const METRICS: MetricItem[] = [
  { label: "MRR", value: "€45.2K", change: 12.5, trend: "up", icon: DollarSign },
  { label: "Utilisateurs", value: "2,847", change: 8.3, trend: "up", icon: Users },
  { label: "Uptime", value: "99.9%", trend: "neutral", icon: Activity },
  { label: "Sécurité", value: "A+", trend: "neutral", icon: Shield },
];

export function QuickMetricsBar({ className }: QuickMetricsBarProps) {
  return (
    <div className={cn("grid grid-cols-2 md:grid-cols-4 gap-3", className)}>
      {METRICS.map((metric) => {
        const Icon = metric.icon;
        return (
          <Card key={metric.label} className="card-executive">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Icon className="h-4 w-4 text-primary" />
                {metric.trend === "up" && (
                  <Badge variant="success" className="text-xs flex items-center gap-0.5">
                    <ArrowUpRight className="h-3 w-3" />
                    {metric.change}%
                  </Badge>
                )}
                {metric.trend === "down" && (
                  <Badge variant="destructive" className="text-xs flex items-center gap-0.5">
                    <ArrowDownRight className="h-3 w-3" />
                    {metric.change}%
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
