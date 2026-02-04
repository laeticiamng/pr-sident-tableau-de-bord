import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Clock, AlertTriangle, CheckCircle, Target, Timer } from "lucide-react";
import { cn } from "@/lib/utils";

interface SLAMetric {
  priority: "critical" | "high" | "medium" | "low";
  targetTime: string;
  targetMinutes: number;
  avgTime: number;
  compliance: number;
  breaches: number;
  total: number;
}

const SLA_METRICS: SLAMetric[] = [
  { priority: "critical", targetTime: "15 min", targetMinutes: 15, avgTime: 12, compliance: 95, breaches: 1, total: 20 },
  { priority: "high", targetTime: "1 heure", targetMinutes: 60, avgTime: 45, compliance: 92, breaches: 3, total: 38 },
  { priority: "medium", targetTime: "4 heures", targetMinutes: 240, avgTime: 180, compliance: 98, breaches: 1, total: 56 },
  { priority: "low", targetTime: "24 heures", targetMinutes: 1440, avgTime: 720, compliance: 100, breaches: 0, total: 42 },
];

const priorityLabels: Record<string, string> = {
  critical: "Critique",
  high: "Haute",
  medium: "Moyenne",
  low: "Basse",
};

const priorityColors: Record<string, string> = {
  critical: "text-destructive bg-destructive/10",
  high: "text-orange-600 bg-orange-500/10",
  medium: "text-amber-600 bg-amber-500/10",
  low: "text-muted-foreground bg-muted",
};

export function SLAMonitor() {
  const overallCompliance = Math.round(
    SLA_METRICS.reduce((sum, m) => sum + m.compliance * m.total, 0) / 
    SLA_METRICS.reduce((sum, m) => sum + m.total, 0)
  );

  const totalBreaches = SLA_METRICS.reduce((sum, m) => sum + m.breaches, 0);
  const totalTickets = SLA_METRICS.reduce((sum, m) => sum + m.total, 0);

  return (
    <Card className="card-executive">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-3">
              <Timer className="h-5 w-5 text-primary" />
              Monitoring SLA
            </CardTitle>
            <CardDescription>
              Suivi des engagements de temps de réponse
            </CardDescription>
          </div>
          <Badge 
            variant={overallCompliance >= 95 ? "success" : overallCompliance >= 85 ? "warning" : "destructive"}
            className="text-lg px-3 py-1"
          >
            {overallCompliance}% conforme
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {/* Overall Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 rounded-lg bg-muted/30">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Target className="h-4 w-4 text-primary" />
              <span className="text-2xl font-bold">{totalTickets}</span>
            </div>
            <p className="text-xs text-muted-foreground">Tickets Totaux</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-success/10">
            <div className="flex items-center justify-center gap-2 mb-1">
              <CheckCircle className="h-4 w-4 text-success" />
              <span className="text-2xl font-bold">{totalTickets - totalBreaches}</span>
            </div>
            <p className="text-xs text-muted-foreground">Dans les délais</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-destructive/10">
            <div className="flex items-center justify-center gap-2 mb-1">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <span className="text-2xl font-bold">{totalBreaches}</span>
            </div>
            <p className="text-xs text-muted-foreground">Dépassements</p>
          </div>
        </div>

        {/* Per Priority Breakdown */}
        <div className="space-y-4">
          {SLA_METRICS.map((metric) => (
            <div key={metric.priority} className="p-4 rounded-lg border">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className={cn("font-medium", priorityColors[metric.priority])}>
                    {priorityLabels[metric.priority]}
                  </Badge>
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Cible: {metric.targetTime}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {metric.breaches > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {metric.breaches} dépassement{metric.breaches > 1 ? "s" : ""}
                    </Badge>
                  )}
                  <Badge 
                    variant={metric.compliance >= 95 ? "success" : metric.compliance >= 85 ? "warning" : "destructive"}
                  >
                    {metric.compliance}%
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-2">
                <Progress 
                  value={metric.compliance} 
                  className={cn(
                    "h-2",
                    metric.compliance >= 95 && "[&>div]:bg-success",
                    metric.compliance < 85 && "[&>div]:bg-destructive"
                  )} 
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Temps moyen: {metric.avgTime < 60 ? `${metric.avgTime} min` : `${Math.round(metric.avgTime / 60)}h`}</span>
                  <span>{metric.total} tickets</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* SLA Summary */}
        <div className="mt-4 p-3 rounded-lg bg-muted/50 text-center">
          <p className="text-sm">
            {overallCompliance >= 95 ? (
              <span className="text-success flex items-center justify-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Excellente performance SLA ce mois
              </span>
            ) : overallCompliance >= 85 ? (
              <span className="text-warning flex items-center justify-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Performance SLA acceptable, amélioration possible
              </span>
            ) : (
              <span className="text-destructive flex items-center justify-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Attention: objectifs SLA non atteints
              </span>
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
