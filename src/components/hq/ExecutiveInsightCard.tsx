import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { 
  Lightbulb, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle,
  ArrowRight,
  Info
} from "lucide-react";

export type InsightType = "opportunity" | "risk" | "achievement" | "recommendation" | "info";
export type InsightPriority = "critical" | "high" | "medium" | "low";

interface ExecutiveInsight {
  id: string;
  type: InsightType;
  priority: InsightPriority;
  title: string;
  description: string;
  metric?: {
    label: string;
    value: string | number;
    change?: number;
  };
  action?: {
    label: string;
    onClick?: () => void;
  };
  source?: string;
  timestamp?: Date | string;
}

const typeConfig: Record<InsightType, { icon: typeof Lightbulb; color: string; label: string }> = {
  opportunity: { icon: TrendingUp, color: "text-success", label: "Opportunité" },
  risk: { icon: AlertTriangle, color: "text-destructive", label: "Risque" },
  achievement: { icon: CheckCircle, color: "text-primary", label: "Réalisation" },
  recommendation: { icon: Lightbulb, color: "text-warning", label: "Recommandation" },
  info: { icon: Info, color: "text-muted-foreground", label: "Information" },
};

const priorityConfig: Record<InsightPriority, { variant: "destructive" | "warning" | "subtle" | "success"; label: string }> = {
  critical: { variant: "destructive", label: "Critique" },
  high: { variant: "warning", label: "Haute" },
  medium: { variant: "subtle", label: "Moyenne" },
  low: { variant: "success", label: "Basse" },
};

interface ExecutiveInsightCardProps {
  insight: ExecutiveInsight;
  className?: string;
}

/**
 * Carte d'insight exécutif — Standard HEC/Polytechnique
 * Format structuré : type, priorité, métrique clé, action recommandée
 */
export function ExecutiveInsightCard({ insight, className }: ExecutiveInsightCardProps) {
  const typeInfo = typeConfig[insight.type];
  const priorityInfo = priorityConfig[insight.priority];
  const Icon = typeInfo.icon;

  return (
    <Card className={cn("card-executive group hover:border-accent/30 transition-all duration-300", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2 rounded-lg bg-secondary",
              typeInfo.color
            )}>
              <Icon className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Badge variant={priorityInfo.variant} className="text-[10px]">
                  {priorityInfo.label}
                </Badge>
                <span className="text-xs text-muted-foreground">{typeInfo.label}</span>
              </div>
              <CardTitle className="text-base mt-1">{insight.title}</CardTitle>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <CardDescription className="text-sm leading-relaxed">
          {insight.description}
        </CardDescription>

        {insight.metric && (
          <div className="p-3 rounded-lg bg-secondary/50 border">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{insight.metric.label}</span>
              {insight.metric.change !== undefined && (
                <span className={cn(
                  "text-xs font-medium",
                  insight.metric.change > 0 ? "text-success" : 
                  insight.metric.change < 0 ? "text-destructive" : "text-muted-foreground"
                )}>
                  {insight.metric.change > 0 ? "+" : ""}{insight.metric.change}%
                </span>
              )}
            </div>
            <div className="text-xl font-bold mt-1">{insight.metric.value}</div>
          </div>
        )}

        {insight.action && (
          <button
            onClick={insight.action.onClick}
            className={cn(
              "w-full flex items-center justify-between p-3 rounded-lg border",
              "bg-secondary/30 hover:bg-secondary/50 transition-colors",
              "text-sm font-medium group-hover:border-accent/30"
            )}
          >
            <span>{insight.action.label}</span>
            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
          </button>
        )}

        {(insight.source || insight.timestamp) && (
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
            {insight.source && <span>Source : {insight.source}</span>}
            {insight.timestamp && (
              <span>{new Date(insight.timestamp).toLocaleDateString("fr-FR")}</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface ExecutiveInsightListProps {
  insights: ExecutiveInsight[];
  maxItems?: number;
  className?: string;
}

/**
 * Liste d'insights exécutifs triés par priorité
 */
export function ExecutiveInsightList({ insights, maxItems = 5, className }: ExecutiveInsightListProps) {
  // Trier par priorité (critical > high > medium > low)
  const priorityOrder: Record<InsightPriority, number> = {
    critical: 0,
    high: 1,
    medium: 2,
    low: 3,
  };

  const sortedInsights = [...insights]
    .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
    .slice(0, maxItems);

  return (
    <div className={cn("space-y-4", className)}>
      {sortedInsights.map((insight) => (
        <ExecutiveInsightCard key={insight.id} insight={insight} />
      ))}
    </div>
  );
}
