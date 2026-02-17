import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Target,
  Zap,
  AlertTriangle,
  HelpCircle,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { type COSDailyEntry, type COSProject } from "@/lib/cos-types";
import { cn } from "@/lib/utils";

interface COSFocusDuJourProps {
  morningEntry?: COSDailyEntry;
  activeProjects: COSProject[];
  drapeauRouge: boolean;
}

export function COSFocusDuJour({ morningEntry, activeProjects, drapeauRouge }: COSFocusDuJourProps) {
  if (!morningEntry?.focusDuJour) {
    return (
      <Card className="card-executive border-dashed border-2 border-amber-500/30 bg-amber-500/5">
        <CardContent className="p-6 text-center">
          <Target className="h-8 w-8 mx-auto mb-3 text-amber-500" />
          <p className="font-semibold text-sm">Aucun focus defini pour aujourd'hui</p>
          <p className="text-xs text-muted-foreground mt-1">
            Remplissez le briefing matin pour activer le mode focus.
          </p>
        </CardContent>
      </Card>
    );
  }

  const nextDeadlines = activeProjects
    .flatMap((p) =>
      (["d3", "d7", "d14", "d30"] as const).map((step) => ({
        project: p.name,
        ...p.deadlines[step],
      }))
    )
    .filter((d) => d.status !== "done" && d.status !== "scope_cut")
    .sort((a, b) => new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime())
    .slice(0, 2);

  return (
    <Card className={cn(
      "card-executive",
      drapeauRouge
        ? "ring-2 ring-destructive/40 bg-destructive/5"
        : "ring-2 ring-primary/20 bg-gradient-to-br from-primary/5 to-transparent"
    )}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          Focus du jour
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Focus */}
        <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
          <p className="font-bold text-base">{morningEntry.focusDuJour}</p>
        </div>

        {/* 3 Actions */}
        {morningEntry.actions && morningEntry.actions.length > 0 && (
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Actions
            </span>
            {morningEntry.actions.map((action, i) =>
              action ? (
                <div
                  key={i}
                  className="flex items-center gap-2 p-2.5 rounded-lg border bg-background"
                >
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                    {i + 1}
                  </div>
                  <span className="text-sm">{action}</span>
                </div>
              ) : null
            )}
          </div>
        )}

        {/* Risk & Decision */}
        <div className="grid grid-cols-2 gap-3">
          {morningEntry.risquePrincipal && (
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <div className="flex items-center gap-1.5 mb-1">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                <span className="text-xs font-semibold text-amber-500">Risque</span>
              </div>
              <p className="text-xs">{morningEntry.risquePrincipal}</p>
            </div>
          )}
          {morningEntry.decisionBloquante && (
            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <div className="flex items-center gap-1.5 mb-1">
                <HelpCircle className="h-3.5 w-3.5 text-blue-500" />
                <span className="text-xs font-semibold text-blue-500">Decision</span>
              </div>
              <p className="text-xs">{morningEntry.decisionBloquante}</p>
            </div>
          )}
        </div>

        {/* Upcoming deadlines */}
        {nextDeadlines.length > 0 && (
          <div className="pt-2 border-t">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Prochaines deadlines
            </span>
            <div className="mt-2 space-y-1.5">
              {nextDeadlines.map((d, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  <span className="font-mono text-muted-foreground">
                    {new Date(d.targetDate).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                  </span>
                  <span className="truncate">
                    {d.project} — {d.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
