import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Activity, Clock, Target, Zap, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface PerformanceMetric {
  name: string;
  value: number;
  target: number;
  unit: string;
  trend: "up" | "down" | "stable";
}

const TEAM_METRICS: PerformanceMetric[] = [
  { name: "Tâches Complétées", value: 1247, target: 1000, unit: "tâches", trend: "up" },
  { name: "Temps de Réponse", value: 2.3, target: 3, unit: "secondes", trend: "up" },
  { name: "Disponibilité", value: 99.9, target: 99.5, unit: "%", trend: "stable" },
  { name: "Erreurs Critiques", value: 0, target: 0, unit: "incidents", trend: "stable" },
];

export function TeamPerformanceMetrics() {
  return (
    <Card className="card-executive">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Performance Équipe IA
        </CardTitle>
        <CardDescription>
          Métriques de performance des agents IA ce mois
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {TEAM_METRICS.map((metric) => {
            const progress = metric.name === "Erreurs Critiques" 
              ? (metric.value === 0 ? 100 : 0) 
              : Math.min(100, (metric.value / metric.target) * 100);
            const isGood = progress >= 100;

            return (
              <div key={metric.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{metric.name}</span>
                    {metric.trend === "up" && (
                      <TrendingUp className="h-3 w-3 text-success" />
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono">
                      {metric.value} {metric.unit}
                    </span>
                    <Badge variant={isGood ? "success" : "warning"} className="text-xs">
                      {isGood ? "Objectif atteint" : "En cours"}
                    </Badge>
                  </div>
                </div>
                <Progress 
                  value={progress} 
                  className={cn(
                    "h-2",
                    isGood && "bg-success/20 [&>div]:bg-success"
                  )} 
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0</span>
                  <span>Objectif: {metric.target} {metric.unit}</span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
