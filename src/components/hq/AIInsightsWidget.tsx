import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRecentRuns, useExecuteRun } from "@/hooks/useHQData";
import { 
  Sparkles, 
  RefreshCw, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Loader2,
  ChevronDown,
  ChevronUp,
  Brain,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AIInsightsWidgetProps {
  className?: string;
}

export function AIInsightsWidget({ className }: AIInsightsWidgetProps) {
  const { data: recentRuns, isLoading, refetch } = useRecentRuns(5);
  const executeRun = useExecuteRun();
  const [expanded, setExpanded] = useState(false);
  const [generating, setGenerating] = useState(false);

  const latestBrief = recentRuns?.find(r => r.run_type === "DAILY_EXECUTIVE_BRIEF");

  const handleGenerateBrief = async () => {
    setGenerating(true);
    try {
      await executeRun.mutateAsync({ run_type: "DAILY_EXECUTIVE_BRIEF" });
      refetch();
    } finally {
      setGenerating(false);
    }
  };

  const formatRunType = (type: string) => {
    return type.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <Card className={cn("card-executive overflow-hidden", className)}>
      <CardHeader className="pb-3 bg-gradient-to-r from-accent/5 to-transparent">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="p-1.5 rounded-lg bg-accent/10">
              <Brain className="h-4 w-4 text-accent" />
            </div>
            Intelligence IA
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => refetch()}
              disabled={isLoading}
            >
              <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
            </Button>
            <Button
              variant="executive"
              size="sm"
              onClick={handleGenerateBrief}
              disabled={generating}
              className="gap-2"
            >
              {generating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              Nouveau Brief
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        {/* Latest Brief Preview */}
        {latestBrief?.executive_summary && (
          <div className="p-4 border-b bg-muted/20">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-accent" />
              <span className="text-sm font-medium">Dernier Brief</span>
              <Badge variant="subtle" className="text-xs">
                {new Date(latestBrief.completed_at || latestBrief.created_at).toLocaleTimeString("fr-FR", {
                  hour: "2-digit",
                  minute: "2-digit"
                })}
              </Badge>
            </div>
            <ScrollArea className={cn("transition-all duration-300", expanded ? "h-64" : "h-24")}>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {latestBrief.executive_summary}
              </p>
            </ScrollArea>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
              className="w-full mt-2 gap-2 text-muted-foreground"
            >
              {expanded ? (
                <>
                  <ChevronUp className="h-4 w-4" />
                  Réduire
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4" />
                  Voir plus
                </>
              )}
            </Button>
          </div>
        )}

        {/* Recent Runs List */}
        <div className="p-4">
          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            Activité Récente
          </h4>
          
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-muted/50 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : recentRuns && recentRuns.length > 0 ? (
            <div className="space-y-2">
              {recentRuns.slice(0, 4).map((run) => (
                <div
                  key={run.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {run.status === "completed" ? (
                      <CheckCircle className="h-4 w-4 text-success" />
                    ) : run.status === "failed" ? (
                      <AlertTriangle className="h-4 w-4 text-destructive" />
                    ) : (
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    )}
                    <div>
                      <p className="text-sm font-medium">{formatRunType(run.run_type)}</p>
                      <p className="text-xs text-muted-foreground">
                        {run.platform_key || "Global"}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground font-mono">
                    {new Date(run.created_at).toLocaleTimeString("fr-FR", {
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <Brain className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Aucune activité récente</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
