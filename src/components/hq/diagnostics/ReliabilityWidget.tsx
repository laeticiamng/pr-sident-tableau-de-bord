import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Clock, AlertCircle, CheckCircle2, RotateCw } from "lucide-react";
import { useDLQEntries, useRunDurationMetrics } from "@/hooks/hq/useReliability";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";

function fmtMs(ms: number): string {
  if (!ms || ms === 0) return "—";
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

const STATUS_VARIANTS: Record<string, { icon: typeof RotateCw; cls: string; label: string }> = {
  pending: { icon: RotateCw, cls: "text-warning", label: "En attente" },
  in_progress: { icon: Activity, cls: "text-primary animate-pulse", label: "En cours" },
  recovered: { icon: CheckCircle2, cls: "text-success", label: "Récupéré" },
  abandoned: { icon: AlertCircle, cls: "text-destructive", label: "Abandonné" },
};

export function ReliabilityWidget({ className }: { className?: string }) {
  const { data: dlq } = useDLQEntries(20);
  const { data: metrics } = useRunDurationMetrics();

  const pending = dlq?.filter((d) => d.status === "pending" || d.status === "in_progress").length || 0;
  const abandoned = dlq?.filter((d) => d.status === "abandoned").length || 0;

  return (
    <div className={cn("grid gap-4 md:grid-cols-2", className)}>
      {/* Métriques durée */}
      <Card className="card-executive">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4 text-accent" />
            Durée des runs (7j)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-4 gap-3 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="font-mono text-lg font-bold">{metrics?.total_runs ?? 0}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">p50</p>
              <p className="font-mono text-lg font-bold">{fmtMs(metrics?.p50_ms ?? 0)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">p95</p>
              <p className="font-mono text-lg font-bold text-warning">{fmtMs(metrics?.p95_ms ?? 0)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">p99</p>
              <p className="font-mono text-lg font-bold text-destructive">{fmtMs(metrics?.p99_ms ?? 0)}</p>
            </div>
          </div>

          {metrics?.by_run_type && metrics.by_run_type.length > 0 && (
            <div className="pt-2 border-t border-border/50 space-y-1.5">
              <p className="text-xs text-muted-foreground mb-1">Top run types (p95)</p>
              {metrics.by_run_type.slice(0, 4).map((t) => (
                <div key={t.run_type} className="flex items-center justify-between text-xs">
                  <span className="font-mono truncate">{t.run_type}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-muted-foreground">{t.count}×</span>
                    <span className="font-mono font-medium">{fmtMs(t.p95_ms)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* DLQ */}
      <Card className="card-executive">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center justify-between">
            <span className="flex items-center gap-2">
              <RotateCw className="h-4 w-4 text-accent" />
              File de retry (DLQ)
            </span>
            <div className="flex items-center gap-1.5">
              {pending > 0 && (
                <Badge variant="subtle" className="font-mono">
                  {pending} en cours
                </Badge>
              )}
              {abandoned > 0 && (
                <Badge variant="destructive" className="font-mono">
                  {abandoned} abandonnés
                </Badge>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!dlq || dlq.length === 0 ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
              <CheckCircle2 className="h-4 w-4 text-success" />
              Aucun run en échec — tous les runs passent du premier coup.
            </div>
          ) : (
            <div className="space-y-2 max-h-[260px] overflow-y-auto">
              {dlq.slice(0, 8).map((entry) => {
                const variant = STATUS_VARIANTS[entry.status];
                const Icon = variant.icon;
                return (
                  <div
                    key={entry.id}
                    className="flex items-start justify-between gap-3 p-2 rounded-md border border-border/40 hover:bg-muted/30 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-mono text-xs font-medium truncate">{entry.run_type}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {entry.attempts}/{entry.max_attempts} tentatives ·{" "}
                        {formatDistanceToNow(new Date(entry.created_at), {
                          addSuffix: true,
                          locale: fr,
                        })}
                      </p>
                      {entry.last_error && entry.status !== "recovered" && (
                        <p className="text-xs text-destructive/80 mt-1 line-clamp-1" title={entry.last_error}>
                          {entry.last_error}
                        </p>
                      )}
                    </div>
                    <Badge variant="outline" className={cn("gap-1 shrink-0", variant.cls)}>
                      <Icon className="h-3 w-3" />
                      {variant.label}
                    </Badge>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
