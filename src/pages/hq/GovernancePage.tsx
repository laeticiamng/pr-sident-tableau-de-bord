import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Shield, Target, TrendingUp, BookOpen, CheckCircle2, AlertTriangle, Activity } from "lucide-react";
import { useGovernanceDashboard, useSLOStatus, useTopRunCosts } from "@/hooks/hq/useGovernance3";
import { usePageMeta } from "@/hooks/usePageMeta";
import { cn } from "@/lib/utils";

const GRADE_COLORS: Record<string, string> = {
  "A+": "text-success bg-success/10 border-success/30",
  "A": "text-success bg-success/10 border-success/30",
  "B": "text-warning bg-warning/10 border-warning/30",
  "C": "text-warning bg-warning/10 border-warning/30",
  "D": "text-destructive bg-destructive/10 border-destructive/30",
};

const STATUS_COLORS = {
  completed: "text-success",
  in_progress: "text-primary",
  todo: "text-muted-foreground",
};

export default function GovernancePage() {
  usePageMeta({ title: "Gouvernance — HQ", noindex: true });

  const { data: dashboard, isLoading: loadingDash } = useGovernanceDashboard();
  const { data: slo, isLoading: loadingSlo } = useSLOStatus();
  const { data: costs, isLoading: loadingCosts } = useTopRunCosts(30);

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <Shield className="h-7 w-7 text-accent" /> Gouvernance
        </h1>
        <p className="text-sm text-muted-foreground">
          Score d'audit, SLO, budget IA, roadmap d'industrialisation et runbooks d'incidents.
        </p>
      </header>

      {/* Score audit + SLO */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="card-executive lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="h-4 w-4 text-accent" /> Score d'audit
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingDash ? (
              <Skeleton className="h-32" />
            ) : dashboard ? (
              <div className="text-center space-y-3">
                <div className={cn("inline-flex flex-col items-center justify-center rounded-2xl border-2 px-8 py-4", GRADE_COLORS[dashboard.audit_grade])}>
                  <span className="text-5xl font-black">{dashboard.audit_grade}</span>
                  <span className="font-mono text-2xl font-bold mt-1">{dashboard.audit_score}/100</span>
                </div>
                <div className="text-xs text-muted-foreground space-y-1 pt-2">
                  <p>Politiques RLS actives : <span className="font-mono font-semibold">{dashboard.governance.rls_policies_count}</span></p>
                  <p>Edge functions : <span className="font-mono font-semibold">{dashboard.governance.edge_functions_count}</span></p>
                  <p>Actions audit (7j) : <span className="font-mono font-semibold">{dashboard.governance.recent_audit_actions_7d}</span></p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Connexion requise</p>
            )}
          </CardContent>
        </Card>

        <Card className="card-executive lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4 text-accent" /> SLO & Error Budget (7j)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loadingSlo ? (
              <Skeleton className="h-32" />
            ) : slo?.slos ? (
              slo.slos.map((s) => (
                <div key={s.key} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      {s.is_compliant ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                      ) : (
                        <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
                      )}
                      {s.name}
                    </span>
                    <span className="font-mono text-xs">
                      <span className={s.is_compliant ? "text-success" : "text-destructive"}>
                        {s.current_pct.toFixed(1)}%
                      </span>
                      <span className="text-muted-foreground"> / cible {s.target_pct}%</span>
                      {s.current_value_ms !== undefined && s.threshold_ms && (
                        <span className="text-muted-foreground ml-2">
                          (p95={s.current_value_ms}ms)
                        </span>
                      )}
                    </span>
                  </div>
                  <Progress value={s.current_pct} className="h-1.5" />
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Aucune donnée</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Roadmap */}
      <Card className="card-executive">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-accent" /> Roadmap industrialisation
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingDash ? (
            <Skeleton className="h-32" />
          ) : dashboard?.roadmap ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {dashboard.roadmap.map((item) => (
                <div key={item.horizon} className="rounded-lg border border-border/40 p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="font-mono">{item.horizon}</Badge>
                    <span className={cn("text-xs font-medium", STATUS_COLORS[item.status])}>
                      {item.status === "completed" ? "✓ Terminé" : item.status === "in_progress" ? "⏳ En cours" : "À faire"}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold">{item.name}</h3>
                  <Progress value={item.progress} className="h-1" />
                  <ul className="text-xs text-muted-foreground space-y-0.5 pt-1">
                    {item.highlights.map((h, i) => (
                      <li key={i} className="truncate">• {h}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Aucune donnée</p>
          )}
        </CardContent>
      </Card>

      {/* Top costs + Runbooks */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="card-executive">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Top-5 runs gourmands (30j)</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingCosts ? (
              <Skeleton className="h-40" />
            ) : costs?.top_5 && costs.top_5.length > 0 ? (
              <div className="space-y-2">
                {costs.top_5.map((c) => (
                  <div key={c.run_type} className="flex items-center justify-between text-sm border-b border-border/40 pb-1.5">
                    <div className="min-w-0">
                      <p className="font-mono text-xs truncate">{c.run_type}</p>
                      <p className="text-xs text-muted-foreground">{c.run_count}× × {c.unit_cost_eur.toFixed(2)}€</p>
                    </div>
                    <span className="font-mono font-bold">{c.total_cost_eur.toFixed(2)}€</span>
                  </div>
                ))}
                <div className="flex items-center justify-between text-sm pt-2 font-semibold">
                  <span>Total 30j</span>
                  <span className="font-mono">{costs.total_cost_eur.toFixed(2)}€ ({costs.total_runs} runs)</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-4">Aucun run sur la période</p>
            )}
          </CardContent>
        </Card>

        <Card className="card-executive">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-accent" /> Runbooks d'incidents
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dashboard?.runbooks ? (
              <div className="space-y-3">
                {dashboard.runbooks.map((rb) => (
                  <details key={rb.id} className="rounded-md border border-border/40 p-2">
                    <summary className="text-sm font-medium cursor-pointer">{rb.title}</summary>
                    <ol className="mt-2 ml-4 text-xs text-muted-foreground list-decimal space-y-0.5">
                      {rb.steps.map((step, i) => <li key={i}>{step}</li>)}
                    </ol>
                  </details>
                ))}
                <p className="text-xs text-muted-foreground pt-2">
                  📖 Procédures complètes : <code>docs/RUNBOOKS.md</code>
                </p>
              </div>
            ) : (
              <Skeleton className="h-32" />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
