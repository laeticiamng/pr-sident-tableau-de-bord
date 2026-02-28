import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Brain,
  Clock,
  Play,
  CheckCircle,
  XCircle,
  Loader2,
  RefreshCw,
  CalendarClock,
  Zap,
  AlertCircle,
  Bot,
  FileText,
} from "lucide-react";
import { useAISchedulerStatus, useAISchedulerExecute, useAIAutopilot } from "@/hooks/useAIScheduler";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface SchedulerPanelProps {
  className?: string;
}

export function SchedulerPanel({ className }: SchedulerPanelProps) {
  const { data, isLoading, refetch, isRefetching } = useAISchedulerStatus();
  const executeJob = useAISchedulerExecute();
  const [autopilot, setAutopilot] = useState(false);
  const { lastDecision, isDeciding, nextCheckIn } = useAIAutopilot(autopilot);

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
  const dueJobs = jobs.filter(j => j.isDueNow);

  return (
    <Card className={cn("card-executive", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Brain className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                Scheduler IA Autonome
                {isDeciding && (
                  <Badge variant="outline" className="text-xs animate-pulse border-primary/50 text-primary">
                    <Bot className="h-3 w-3 mr-1" />
                    Décision IA...
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Piloté par Lovable AI — remplace pg_cron
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

        {/* Autopilot Toggle */}
        <div className={cn(
          "flex items-center justify-between p-3 rounded-lg border mt-2 transition-colors",
          autopilot ? "bg-primary/5 border-primary/30" : "bg-muted/20 border-border"
        )}>
          <div className="flex items-center gap-2">
            <Zap className={cn("h-4 w-4", autopilot ? "text-primary" : "text-muted-foreground")} />
            <Label htmlFor="autopilot-switch" className="cursor-pointer font-medium text-sm">
              Autopilot IA
            </Label>
            {autopilot && (
              <span className="text-xs text-muted-foreground">
                • Prochain check dans {nextCheckIn} min
              </span>
            )}
          </div>
          <Switch
            id="autopilot-switch"
            checked={autopilot}
            onCheckedChange={setAutopilot}
          />
        </div>

        {/* Alerte jobs en attente */}
        {dueJobs.length > 0 && !autopilot && (
          <div className="flex items-center gap-2 p-2 rounded-lg bg-destructive/10 border border-destructive/20 text-xs text-destructive mt-1">
            <AlertCircle className="h-3 w-3 shrink-0" />
            <span>{dueJobs.length} job(s) devraient tourner maintenant — activez l'Autopilot IA</span>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Dernière décision IA */}
        {lastDecision && (
          <div className="p-3 rounded-lg bg-muted/30 border border-border space-y-1">
            <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <Bot className="h-3 w-3" /> Dernière décision IA
            </p>
            <p className="text-xs">{lastDecision.ai_decision.reasoning}</p>
            {lastDecision.executed.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {lastDecision.executed.map(e => (
                  <Badge key={e.job} variant={e.success ? "subtle" : "destructive"} className="text-xs">
                    {e.success ? <CheckCircle className="h-2.5 w-2.5 mr-1" /> : <XCircle className="h-2.5 w-2.5 mr-1" />}
                    {e.job}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Liste des jobs */}
        {jobs.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Aucun job configuré
          </p>
        ) : (
          <div className="space-y-3">
            {jobs.map(job => (
              <div
                key={job.key}
                className={cn(
                  "p-3 rounded-lg border transition-colors",
                  job.isDueNow
                    ? "bg-primary/5 border-primary/30"
                    : job.enabled
                    ? "bg-card hover:bg-muted/30"
                    : "bg-muted/20 opacity-60"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm truncate">{job.name}</h4>
                      <Badge
                        variant={job.priority === "high" ? "destructive" : job.priority === "medium" ? "subtle" : "secondary"}
                        className="text-xs"
                      >
                        {job.priority}
                      </Badge>
                      {job.isDueNow && (
                        <Badge variant="outline" className="text-xs border-primary/50 text-primary animate-pulse">
                          Due maintenant
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mb-1.5 line-clamp-1">{job.description}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{job.cronExpression}</span>
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
                        Run
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <Separator />

        {/* Journal des décisions IA */}
        <AutopilotDecisionLog />

        <div className="text-xs text-muted-foreground space-y-1">
          <p className="flex items-center gap-1">
            <Brain className="h-3 w-3" />
            L'IA analyse l'heure, le contexte et l'historique pour décider automatiquement.
          </p>
          <p className="flex items-center gap-1">
            <CalendarClock className="h-3 w-3" />
            Fuseau horaire: Europe/Paris · Polling toutes les 5 min en Autopilot
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

/** Journal des 5 dernières décisions Autopilot depuis les logs structurés */
function AutopilotDecisionLog() {
  const { data: logs, isLoading } = useQuery({
    queryKey: ["hq", "autopilot_decisions"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_hq_logs", {
        limit_count: 5,
        source_filter: "autopilot",
      });
      if (error) return [];
      return (data as Array<{ id: string; level: string; message: string; metadata: any; created_at: string }>) || [];
    },
    refetchInterval: 60000,
  });

  if (isLoading || !logs?.length) return null;

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
        <FileText className="h-3 w-3" />
        Journal des décisions IA
      </p>
      <ScrollArea className="max-h-[160px]">
        <div className="space-y-1.5">
          {logs.map(log => (
            <div key={log.id} className="p-2 rounded bg-muted/20 border border-border/50 text-xs">
              <div className="flex items-center justify-between mb-0.5">
                <Badge variant="outline" className="text-[9px]">{log.message}</Badge>
                <span className="text-[10px] text-muted-foreground">
                  {formatDistanceToNow(new Date(log.created_at), { addSuffix: true, locale: fr })}
                </span>
              </div>
              {log.metadata?.reasoning && (
                <p className="text-muted-foreground line-clamp-2">{log.metadata.reasoning}</p>
              )}
              {log.metadata?.jobs_to_run?.length > 0 && (
                <div className="flex gap-1 mt-1">
                  {log.metadata.jobs_to_run.map((j: string) => (
                    <Badge key={j} variant="subtle" className="text-[9px]">{j}</Badge>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
      <Separator />
    </div>
  );
}
