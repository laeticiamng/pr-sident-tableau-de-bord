import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CalendarClock,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Scissors,
  PlayCircle,
} from "lucide-react";
import { type COSProject, COS_RULES } from "@/lib/cos-types";
import { cn } from "@/lib/utils";

interface COSDeadlineEscalatorProps {
  projects: COSProject[];
  onUpdateDeadline: (
    projectId: string,
    step: "d3" | "d7" | "d14" | "d30",
    status: COSProject["deadlines"]["d3"]["status"],
    scopeCut?: string
  ) => void;
}

const STATUS_ICON: Record<string, typeof CheckCircle2> = {
  pending: Clock,
  in_progress: PlayCircle,
  done: CheckCircle2,
  overdue: AlertTriangle,
  scope_cut: Scissors,
};

const STATUS_COLOR: Record<string, string> = {
  pending: "text-muted-foreground",
  in_progress: "text-blue-500",
  done: "text-emerald-500",
  overdue: "text-destructive",
  scope_cut: "text-amber-500",
};

const STATUS_BG: Record<string, string> = {
  pending: "bg-muted/50",
  in_progress: "bg-blue-500/10 border-blue-500/30",
  done: "bg-emerald-500/10 border-emerald-500/30",
  overdue: "bg-destructive/10 border-destructive/30",
  scope_cut: "bg-amber-500/10 border-amber-500/30",
};

function isOverdue(targetDate: string, status: string): boolean {
  if (status === "done" || status === "scope_cut") return false;
  return new Date(targetDate) < new Date(new Date().toISOString().split("T")[0]);
}

function formatDateFR(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
  });
}

function daysUntil(dateStr: string): number {
  const target = new Date(dateStr);
  const today = new Date(new Date().toISOString().split("T")[0]);
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function COSDeadlineEscalator({ projects, onUpdateDeadline }: COSDeadlineEscalatorProps) {
  const activeProjects = projects.filter((p) => p.status === "actif" || p.status === "en_lancement");
  const steps = COS_RULES.DEADLINE_STEPS;

  return (
    <Card className="card-executive">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarClock className="h-5 w-5 text-primary" />
          Escalier de Deadlines
        </CardTitle>
        <CardDescription>
          Regle : si une etape depasse la date, on coupe le scope, jamais la date.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {activeProjects.map((project) => (
          <div key={project.id} className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm">{project.name}</span>
              {project.isCashFirst && (
                <Badge variant="outline" className="text-xs border-emerald-500 text-emerald-500">
                  Cash-first
                </Badge>
              )}
              <span className="text-xs text-muted-foreground ml-auto">
                Debut : {formatDateFR(project.startDate)}
              </span>
            </div>

            {/* Timeline */}
            <div className="relative">
              {/* Connecting line */}
              <div className="absolute left-[19px] top-6 bottom-6 w-0.5 bg-border" />

              <div className="space-y-3">
                {steps.map((stepKey) => {
                  const step = project.deadlines[stepKey];
                  const overdue = isOverdue(step.targetDate, step.status);
                  const effectiveStatus = overdue && step.status !== "done" && step.status !== "scope_cut" ? "overdue" : step.status;
                  const Icon = STATUS_ICON[effectiveStatus] || Clock;
                  const days = daysUntil(step.targetDate);

                  return (
                    <div
                      key={stepKey}
                      className={cn(
                        "relative flex items-start gap-3 p-3 rounded-lg border transition-colors",
                        STATUS_BG[effectiveStatus]
                      )}
                    >
                      <div className={cn("mt-0.5 shrink-0 z-10", STATUS_COLOR[effectiveStatus])}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-medium">{step.label}</span>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className={cn(
                              "text-xs font-mono",
                              overdue ? "text-destructive font-bold" : "text-muted-foreground"
                            )}>
                              {formatDateFR(step.targetDate)}
                              {days > 0 && ` (J-${days})`}
                              {days === 0 && " (AUJOURD'HUI)"}
                              {days < 0 && ` (+${Math.abs(days)}j retard)`}
                            </span>
                            <Select
                              value={effectiveStatus}
                              onValueChange={(v) =>
                                onUpdateDeadline(
                                  project.id,
                                  stepKey,
                                  v as COSProject["deadlines"]["d3"]["status"]
                                )
                              }
                            >
                              <SelectTrigger className="w-[120px] h-7 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">En attente</SelectItem>
                                <SelectItem value="in_progress">En cours</SelectItem>
                                <SelectItem value="done">Fait</SelectItem>
                                <SelectItem value="scope_cut">Scope coupe</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{step.description}</p>
                        {step.scopeCut && (
                          <p className="text-xs text-amber-500 mt-1 flex items-center gap-1">
                            <Scissors className="h-3 w-3" />
                            Scope coupe : {step.scopeCut}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}

        {activeProjects.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <CalendarClock className="h-8 w-8 mx-auto mb-2" />
            <p className="text-sm">Activez un projet pour voir ses deadlines.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
