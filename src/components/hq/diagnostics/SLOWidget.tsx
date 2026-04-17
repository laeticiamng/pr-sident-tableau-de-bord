import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Target, CheckCircle2, AlertCircle } from "lucide-react";
import { useSLOStatus, type SLOTarget } from "@/hooks/hq/useReliability";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

function getStatusColor(slo: SLOTarget): "success" | "warning" | "destructive" {
  if (slo.is_compliant) return "success";
  const gap = slo.target_pct - slo.current_pct;
  if (gap > 5) return "destructive";
  return "warning";
}

function formatSloValue(slo: SLOTarget): string {
  if (slo.current_value_ms !== undefined && slo.threshold_ms !== undefined) {
    return `${slo.current_value_ms}ms / cible ≤ ${slo.threshold_ms}ms`;
  }
  if (slo.total_runs !== undefined && slo.success_runs !== undefined) {
    return `${slo.success_runs}/${slo.total_runs} runs réussis`;
  }
  if (slo.recent_runs_24h !== undefined) {
    return `${slo.recent_runs_24h} runs sur les 24 dernières heures`;
  }
  return `${slo.current_pct.toFixed(2)}% mesuré`;
}

export function SLOWidget() {
  const { data, isLoading } = useSLOStatus();

  if (isLoading) {
    return (
      <Card className="card-executive">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Target className="h-5 w-5 text-primary" />
            Service Level Objectives (SLO)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-20 w-full" />)}
        </CardContent>
      </Card>
    );
  }

  if (!data || !data.slos?.length) {
    return (
      <Card className="card-executive">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Target className="h-5 w-5 text-primary" />
            Service Level Objectives (SLO)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Aucune donnée SLO disponible.</p>
        </CardContent>
      </Card>
    );
  }

  const compliantCount = data.slos.filter(s => s.is_compliant).length;
  const totalCount = data.slos.length;

  return (
    <Card className="card-executive">
      <CardHeader>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <CardTitle className="flex items-center gap-3">
              <Target className="h-5 w-5 text-primary" />
              Service Level Objectives (SLO)
            </CardTitle>
            <CardDescription>
              Fenêtre {data.window_days}j · Calculé {formatDistanceToNow(new Date(data.computed_at), { addSuffix: true, locale: fr })}
            </CardDescription>
          </div>
          <Badge variant={compliantCount === totalCount ? "success" : compliantCount >= totalCount / 2 ? "warning" : "destructive"}>
            {compliantCount}/{totalCount} conformes
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {data.slos.map((slo) => {
          const statusColor = getStatusColor(slo);
          const budgetRemaining = slo.budget_remaining_pct ?? Math.max(0, slo.current_pct - slo.target_pct);
          const progressValue = Math.min(100, Math.max(0, slo.current_pct));

          return (
            <div key={slo.key} className="space-y-2 p-4 rounded-lg border bg-card/40">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex items-start gap-3">
                  {slo.is_compliant ? (
                    <CheckCircle2 className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                  ) : (
                    <AlertCircle className={`h-5 w-5 mt-0.5 flex-shrink-0 ${statusColor === "destructive" ? "text-destructive" : "text-warning"}`} />
                  )}
                  <div>
                    <h4 className="font-medium text-sm">{slo.name}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">{formatSloValue(slo)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-sm font-semibold">
                    {slo.current_pct.toFixed(2)}%
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    cible ≥ {slo.target_pct}%
                  </div>
                </div>
              </div>
              <Progress value={progressValue} className="h-1.5" />
              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                <span>Error budget restant</span>
                <span className={`font-mono font-medium ${budgetRemaining > 0 ? "text-success" : "text-destructive"}`}>
                  {budgetRemaining > 0 ? "+" : ""}{budgetRemaining.toFixed(2)} pts
                </span>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
