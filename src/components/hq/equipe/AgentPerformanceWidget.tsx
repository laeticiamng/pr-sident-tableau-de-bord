import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bot, Database, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface AgentPerformanceWidgetProps {
  className?: string;
}

export function AgentPerformanceWidget({ className }: AgentPerformanceWidgetProps) {
  const { data: agents, isLoading } = useQuery({
    queryKey: ["hq-agents-performance"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_hq_agents");
      if (error) throw error;
      return data;
    },
  });

  const { data: runs } = useQuery({
    queryKey: ["hq", "runs", "recent", 200],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_hq_recent_runs", { limit_count: 200 });
      if (error) throw error;
      return data || [];
    },
  });

  // Count runs per agent
  const runCountByAgent = (runs || []).reduce<Record<string, { total: number; success: number }>>((acc, run) => {
    const agentId = run.director_agent_id;
    if (!agentId) return acc;
    if (!acc[agentId]) acc[agentId] = { total: 0, success: 0 };
    acc[agentId].total++;
    if (run.status === "completed") acc[agentId].success++;
    return acc;
  }, {});

  if (isLoading) {
    return (
      <Card className={cn("card-executive", className)}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-1/3" />
            <div className="h-20 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!agents || agents.length === 0) {
    return (
      <Card className={cn("card-executive", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            Performance des Agents IA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-muted-foreground/20 rounded-lg">
            <Database className="h-10 w-10 text-muted-foreground/40 mb-3" />
            <p className="text-sm font-medium text-muted-foreground">Aucun agent configuré</p>
            <p className="text-xs text-muted-foreground mt-1">Les agents IA apparaîtront ici une fois configurés</p>
            <Badge variant="outline" className="mt-3">Base de données HQ</Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  const enabledAgents = agents.filter(a => a.is_enabled).length;

  // Sort agents by run count descending
  const sortedAgents = [...agents].sort((a, b) => {
    const aCount = runCountByAgent[a.id]?.total || 0;
    const bCount = runCountByAgent[b.id]?.total || 0;
    return bCount - aCount;
  });

  return (
    <Card className={cn("card-executive", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              Performance des Agents IA
            </CardTitle>
            <CardDescription>
              Agents classés par nombre de runs exécutés
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Badge variant="success">{enabledAgents} actifs</Badge>
            <Badge variant="subtle">{agents.length} total</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sortedAgents.map((agent) => {
            const stats = runCountByAgent[agent.id];
            const totalRuns = stats?.total || 0;
            const successRuns = stats?.success || 0;
            const successRate = totalRuns > 0 ? Math.round((successRuns / totalRuns) * 100) : 0;

            return (
              <div key={agent.id} className="p-3 rounded-lg border hover:bg-muted/30 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "h-2 w-2 rounded-full",
                      agent.is_enabled ? "bg-success animate-pulse" : "bg-muted-foreground"
                    )} />
                    <div>
                      <h4 className="font-medium text-sm">{agent.name}</h4>
                      <p className="text-xs text-muted-foreground">{agent.role_title_fr}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {totalRuns > 0 ? (
                      <>
                        <Badge variant="default" className="text-xs font-mono">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          {totalRuns} run{totalRuns > 1 ? "s" : ""}
                        </Badge>
                        <Badge variant={successRate >= 80 ? "success" : successRate >= 50 ? "gold" : "destructive"} className="text-xs">
                          {successRate}%
                        </Badge>
                      </>
                    ) : (
                      <Badge variant="subtle" className="text-xs">0 runs</Badge>
                    )}
                    <Badge variant={agent.is_enabled ? "success" : "subtle"} className="text-xs">
                      {agent.is_enabled ? "Actif" : "Off"}
                    </Badge>
                  </div>
                </div>
                {totalRuns > 0 && (
                  <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        "h-full rounded-full transition-all",
                        successRate >= 80 ? "bg-success" : successRate >= 50 ? "bg-gold" : "bg-destructive"
                      )}
                      style={{ width: `${successRate}%` }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
