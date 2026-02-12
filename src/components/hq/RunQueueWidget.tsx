import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Play, 
  Pause, 
  X, 
  RefreshCw, 
  Trash2, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  ListOrdered,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { useRunQueue, QueuedRun } from "@/hooks/useRunQueue";
import { formatRunType } from "@/lib/run-engine";
import { cn } from "@/lib/utils";

interface RunQueueWidgetProps {
  className?: string;
  compact?: boolean;
}

function getStatusIcon(status: QueuedRun["status"]) {
  switch (status) {
    case "queued":
      return <Clock className="h-4 w-4 text-muted-foreground" />;
    case "running":
      return <Loader2 className="h-4 w-4 text-primary animate-spin" />;
    case "completed":
      return <CheckCircle2 className="h-4 w-4 text-success" />;
    case "failed":
      return <XCircle className="h-4 w-4 text-destructive" />;
    case "cancelled":
      return <X className="h-4 w-4 text-muted-foreground" />;
  }
}

function getStatusBadge(status: QueuedRun["status"]) {
  const variants: Record<QueuedRun["status"], "subtle" | "gold" | "destructive" | "default"> = {
    queued: "subtle",
    running: "gold",
    completed: "default",
    failed: "destructive",
    cancelled: "subtle",
  };
  
  const labels: Record<QueuedRun["status"], string> = {
    queued: "En attente",
    running: "En cours",
    completed: "Terminé",
    failed: "Échec",
    cancelled: "Annulé",
  };
  
  return <Badge variant={variants[status]}>{labels[status]}</Badge>;
}

export function RunQueueWidget({ className, compact = false }: RunQueueWidgetProps) {
  const [expanded, setExpanded] = useState(!compact);
  
  const {
    queue,
    stats,
    isProcessing,
    isPaused,
    currentRuns,
    cancelRun,
    retryRun,
    clearCompleted,
    pause,
    resume,
  } = useRunQueue();

  if (queue.length === 0 && compact) {
    return null;
  }

  return (
    <Card className={cn("card-executive", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <ListOrdered className="h-4 w-4 text-primary" />
            File d'Exécution
            {stats.running > 0 && (
              <Badge variant="gold" className="ml-2">
                {stats.running} en cours
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-1">
            {queue.length > 0 && (
              <>
                {isPaused ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={resume}>
                        <Play className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Reprendre</TooltipContent>
                  </Tooltip>
                ) : (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={pause}>
                        <Pause className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Pause</TooltipContent>
                  </Tooltip>
                )}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={clearCompleted}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Effacer terminés</TooltipContent>
                </Tooltip>
              </>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setExpanded(!expanded)}
              aria-label={expanded ? "Réduire la file" : "Développer la file"}
            >
              {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </Button>
          </div>
        </div>
        
        {/* Stats summary */}
        <div className="flex gap-4 text-xs text-muted-foreground mt-2">
          <span>{stats.queued} en attente</span>
          <span>{stats.completed} terminés</span>
          {stats.failed > 0 && <span className="text-destructive">{stats.failed} échecs</span>}
        </div>
      </CardHeader>
      
      {expanded && queue.length > 0 && (
        <CardContent className="pt-0">
          <ScrollArea className="h-[200px]">
            <div className="space-y-2">
              {queue.map((run) => (
                <div 
                  key={run.id}
                  className="p-3 rounded-lg border bg-card/50 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(run.status)}
                      <span className="font-medium text-sm">
                        {formatRunType(run.runType)}
                      </span>
                      {run.platformKey && (
                        <Badge variant="subtle" className="text-xs">
                          {run.platformKey}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {getStatusBadge(run.status)}
                      {run.status === "queued" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => cancelRun(run.id)}
                          aria-label="Annuler"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                      {run.status === "failed" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => retryRun(run.id)}
                          aria-label="Réessayer"
                        >
                          <RefreshCw className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {run.status === "running" && (
                    <div className="space-y-1">
                      <Progress value={run.progress} className="h-1.5" />
                      <p className="text-xs text-muted-foreground">
                        {run.currentStep || "Traitement..."} ({run.progress}%)
                      </p>
                    </div>
                  )}
                  
                  {run.status === "failed" && run.result?.error && (
                    <p className="text-xs text-destructive truncate">
                      {run.result.error}
                    </p>
                  )}
                  
                  {run.status === "completed" && run.result?.executiveSummary && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {run.result.executiveSummary.substring(0, 150)}...
                    </p>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      )}
      
      {expanded && queue.length === 0 && (
        <CardContent className="pt-0">
          <div className="text-center py-6 text-muted-foreground">
            <ListOrdered className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Aucun run en file d'attente</p>
            <p className="text-xs">Les runs apparaîtront ici</p>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
