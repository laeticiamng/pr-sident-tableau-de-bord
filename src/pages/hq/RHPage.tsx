import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  Bot,
  Briefcase,
  Target,
  TrendingUp,
  CheckCircle,
  Brain,
  RefreshCw,
  Loader2,
  Clock,
  Activity,
} from "lucide-react";
import { useAgents, useRecentRuns, useExecuteRun } from "@/hooks/useHQData";
import { cn } from "@/lib/utils";
import { TeamPerformanceMetrics } from "@/components/hq/rh/TeamPerformanceMetrics";
import { OnboardingTracker } from "@/components/hq/rh/OnboardingTracker";
import { TrainingCompletionWidget } from "@/components/hq/rh/TrainingCompletionWidget";
import { PerformanceReview } from "@/components/hq/rh/PerformanceReview";
import { AgentMonitoringDashboard } from "@/components/hq/AgentMonitoringDashboard";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

export default function RHPage() {
  const { data: agents, isLoading, refetch, isFetching } = useAgents();
  const { data: runs, isLoading: runsLoading } = useRecentRuns(50);
  const executeRun = useExecuteRun();

  // Stats agents DB réelles
  const totalAgents = agents?.length || 0;
  const activeAgents = agents?.filter(a => a.is_enabled).length || 0;
  const agentsByCategory = agents?.reduce((acc, agent) => {
    const cat = agent.role_category || "other";
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  // KPIs runs réels
  const completedRuns = runs?.filter(r => r.status === "completed").length || 0;
  const totalRuns = runs?.length || 0;
  const successRate = totalRuns > 0 ? Math.round((completedRuns / totalRuns) * 100) : 0;
  
  // Agents les plus actifs (par type de run)
  const runsByType = runs?.reduce((acc, r) => {
    acc[r.run_type] = (acc[r.run_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const agentActivityMap: Record<string, number> = {
    "CEO Agent": (runsByType["DAILY_EXECUTIVE_BRIEF"] || 0) + (runsByType["CEO_STANDUP_MEETING"] || 0),
    "CISO Agent": runsByType["SECURITY_AUDIT_RLS"] || 0,
    "CMO Agent": runsByType["MARKETING_WEEK_PLAN"] || 0,
    "CTO Agent": (runsByType["PLATFORM_STATUS_REVIEW"] || 0) + (runsByType["RELEASE_GATE_CHECK"] || 0),
    "CSO Agent": runsByType["COMPETITIVE_ANALYSIS"] || 0,
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-headline-1 mb-2">Ressources & Agents IA</h1>
          <p className="text-muted-foreground text-lg">
            {totalAgents} agents configurés — performance en temps réel depuis les runs exécutés.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? "animate-spin" : ""}`} />
          Actualiser
        </Button>
      </div>

      {/* KPIs réels */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="card-executive">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Bot className="h-5 w-5 text-primary" />
              </div>
              <div>
                {isLoading ? <Skeleton className="h-7 w-10 mb-1" /> : (
                  <p className="text-2xl font-bold">{totalAgents}</p>
                )}
                <p className="text-xs text-muted-foreground">Agents IA</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-executive">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <CheckCircle className="h-5 w-5 text-success" />
              </div>
              <div>
                {isLoading ? <Skeleton className="h-7 w-10 mb-1" /> : (
                  <p className="text-2xl font-bold">{activeAgents}</p>
                )}
                <p className="text-xs text-muted-foreground">Actifs</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-executive">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/10">
                <Activity className="h-5 w-5 text-accent" />
              </div>
              <div>
                {runsLoading ? <Skeleton className="h-7 w-10 mb-1" /> : (
                  <p className="text-2xl font-bold">{totalRuns}</p>
                )}
                <p className="text-xs text-muted-foreground">Runs exécutés</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-executive">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/10">
                <TrendingUp className="h-5 w-5 text-warning" />
              </div>
              <div>
                {runsLoading ? <Skeleton className="h-7 w-10 mb-1" /> : (
                  <p className="text-2xl font-bold">{successRate}%</p>
                )}
                <p className="text-xs text-muted-foreground">Taux succès</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activité des agents principaux (données réelles runs) */}
      <Card className="card-executive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Performance des Agents — Runs réels
          </CardTitle>
          <CardDescription>
            Nombre de runs exécutés par agent depuis le début de l'historique
          </CardDescription>
        </CardHeader>
        <CardContent>
          {runsLoading ? (
            <div className="space-y-3">
              {[1,2,3,4].map(i => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(agentActivityMap)
                .sort(([, a], [, b]) => b - a)
                .map(([agent, count]) => {
                  const maxCount = Math.max(...Object.values(agentActivityMap), 1);
                  const pct = Math.round((count / maxCount) * 100);
                  return (
                    <div key={agent} className="space-y-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{agent}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant={count > 0 ? "subtle" : "secondary"} className="text-xs">
                            {count} run{count > 1 ? "s" : ""}
                          </Badge>
                          <span className="text-muted-foreground font-mono text-xs">{pct}%</span>
                        </div>
                      </div>
                      <Progress value={pct} className="h-2" />
                    </div>
                  );
                })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Répartition par département */}
      <Card className="card-executive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" />
            Agents par Département
          </CardTitle>
          <CardDescription>
            Distribution des {totalAgents} agents IA configurés dans la base de données
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(agentsByCategory).map(([category, count]) => {
                const countNum = typeof count === "number" ? count : 0;
                const percentage = totalAgents > 0 ? (countNum / totalAgents) * 100 : 0;
                return (
                  <div key={category} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="capitalize font-medium">{category}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="subtle">{countNum} agents</Badge>
                        <span className="text-muted-foreground font-mono text-xs">
                          {percentage.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Liste des agents DB */}
      <Card className="card-executive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Agents HQ Configurés
          </CardTitle>
          <CardDescription>
            {totalAgents} agents enregistrés dans la base de données
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-14 w-full" />)}
            </div>
          ) : agents?.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Aucun agent configuré</p>
          ) : (
            <div className="space-y-2">
              {agents?.map(agent => {
                const runsCount = Object.entries(runsByType).reduce((acc, [type, count]) => {
                  // rough match
                  return acc + (type.toLowerCase().includes(agent.role_key?.split("_")[0]?.toLowerCase() || "") ? count : 0);
                }, 0);
                return (
                  <div
                    key={agent.id}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg border transition-colors",
                      agent.is_enabled ? "bg-card hover:bg-muted/30" : "bg-muted/20 opacity-60"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-2 h-2 rounded-full shrink-0",
                        agent.is_enabled ? "bg-success" : "bg-muted-foreground"
                      )} />
                      <div>
                        <p className="font-medium text-sm">{agent.name}</p>
                        <p className="text-xs text-muted-foreground">{agent.role_title_fr}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="subtle" className="text-xs capitalize">
                        {agent.role_category}
                      </Badge>
                      <Badge
                        variant={agent.is_enabled ? "gold" : "secondary"}
                        className="text-xs"
                      >
                        {agent.is_enabled ? "Actif" : "Inactif"}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Monitoring complet */}
      <AgentMonitoringDashboard compact />

      {/* Onboarding Tracker */}
      <OnboardingTracker />

      {/* Formations */}
      <TrainingCompletionWidget />

      {/* Performance Review */}
      <PerformanceReview />

      {/* Performance globale */}
      <TeamPerformanceMetrics />
    </div>
  );
}
