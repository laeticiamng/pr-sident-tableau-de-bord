import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Calendar, 
  Clock, 
  Play, 
  CheckCircle, 
  XCircle, 
  Timer,
  Loader2,
  RefreshCw,
  CalendarClock
} from "lucide-react";
import { useSchedulerJobs, useExecuteScheduledJob, formatCronExpression } from "@/hooks/useScheduler";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface SchedulerPanelProps {
  className?: string;
}

export function SchedulerPanel({ className }: SchedulerPanelProps) {
  const { data, isLoading, refetch, isRefetching } = useSchedulerJobs();
  const executeJob = useExecuteScheduledJob();

  if (isLoading) {
    return (
      <Card className={cn("card-executive", className)}>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const jobs = data?.jobs || [];

  return (
    <Card className={cn("card-executive", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <CalendarClock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Planificateur Automatique</CardTitle>
              <CardDescription>
                Jobs CRON pour exécution automatique des runs IA
              </CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => refetch()}
            disabled={isRefetching}
          >
            <RefreshCw className={cn("h-4 w-4", isRefetching && "animate-spin")} />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {jobs.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Aucun job planifié configuré
          </p>
        ) : (
          <div className="space-y-3">
            {jobs.map(job => (
              <div
                key={job.key}
                className={cn(
                  "p-4 rounded-lg border transition-colors",
                  job.enabled 
                    ? "bg-card hover:bg-muted/30" 
                    : "bg-muted/20 opacity-60"
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm truncate">{job.name}</h4>
                      <Badge 
                        variant={job.enabled ? "subtle" : "secondary"}
                        className="text-xs"
                      >
                        {job.enabled ? "Actif" : "Désactivé"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-1">
                      {job.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{formatCronExpression(job.cronExpression)}</span>
                      </div>
                      {job.lastRun && (
                        <div className="flex items-center gap-1">
                          {job.lastRun.status === "completed" ? (
                            <CheckCircle className="h-3 w-3 text-success" />
                          ) : (
                            <XCircle className="h-3 w-3 text-destructive" />
                          )}
                          <span>
                            {formatDistanceToNow(new Date(job.lastRun.completedAt), {
                              addSuffix: true,
                              locale: fr,
                            })}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => executeJob.mutate(job.key)}
                    disabled={!job.enabled || executeJob.isPending}
                    className="shrink-0"
                  >
                    {executeJob.isPending && executeJob.variables === job.key ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-1" />
                        Exécuter
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <Separator />

        <div className="text-xs text-muted-foreground space-y-1">
          <p className="flex items-center gap-1">
            <Timer className="h-3 w-3" />
            Fuseau horaire: Europe/Paris
          </p>
          <p>
            Les jobs s'exécutent automatiquement selon leur planification. 
            Utilisez "Exécuter" pour un lancement manuel.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
