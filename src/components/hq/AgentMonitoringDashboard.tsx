import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Bot,
  Brain,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  RefreshCw,
  Zap,
  Euro,
  Play,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  BarChart3,
  Timer,
} from "lucide-react";
import { useRecentRuns } from "@/hooks/useHQData";
import { useExecuteRun } from "@/hooks/useHQData";
import { useRunQueue } from "@/hooks/useRunQueue";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import ReactMarkdown from "react-markdown";

// Coût estimé par run type (en €)
const RUN_COSTS: Record<string, number> = {
  DAILY_EXECUTIVE_BRIEF: 0.12,
  CEO_STANDUP_MEETING: 0.05,
  PLATFORM_STATUS_REVIEW: 0.08,
  SECURITY_AUDIT_RLS: 0.15,
  MARKETING_WEEK_PLAN: 0.10,
  RELEASE_GATE_CHECK: 0.12,
  COMPETITIVE_ANALYSIS: 0.18,
};

// Modèle utilisé par run type
const RUN_MODELS: Record<string, string> = {
  DAILY_EXECUTIVE_BRIEF: "gemini-2.5-pro",
  CEO_STANDUP_MEETING: "gemini-3-flash",
  PLATFORM_STATUS_REVIEW: "gemini-2.5-flash",
  SECURITY_AUDIT_RLS: "gemini-2.5-pro",
  MARKETING_WEEK_PLAN: "gemini-3-flash",
  RELEASE_GATE_CHECK: "gemini-2.5-pro",
  COMPETITIVE_ANALYSIS: "gemini-2.5-pro",
};

// Agent responsable par type de run
const RUN_AGENTS: Record<string, { name: string; role: string; emoji: string }> = {
  DAILY_EXECUTIVE_BRIEF: { name: "CEO Agent", role: "Directeur Général", emoji: "👔" },
  CEO_STANDUP_MEETING: { name: "CEO Agent", role: "Directeur Général", emoji: "👔" },
  PLATFORM_STATUS_REVIEW: { name: "CTO Agent", role: "Directeur Technique", emoji: "⚙️" },
  SECURITY_AUDIT_RLS: { name: "CISO Agent", role: "Directeur Sécurité", emoji: "🔒" },
  MARKETING_WEEK_PLAN: { name: "CMO Agent", role: "Directeur Marketing", emoji: "📣" },
  RELEASE_GATE_CHECK: { name: "CTO Agent", role: "Directeur Technique", emoji: "⚙️" },
  COMPETITIVE_ANALYSIS: { name: "CSO Agent", role: "Directeur Stratégie", emoji: "🎯" },
};

// Palette pour le statut
const STATUS_CONFIG = {
  completed: { label: "Terminé", icon: CheckCircle, color: "text-success", bg: "bg-success/10" },
  running: { label: "En cours", icon: Loader2, color: "text-primary", bg: "bg-primary/10" },
  failed: { label: "Échoué", icon: XCircle, color: "text-destructive", bg: "bg-destructive/10" },
  pending: { label: "En attente", icon: Timer, color: "text-muted-foreground", bg: "bg-muted/30" },
  cancelled: { label: "Annulé", icon: AlertCircle, color: "text-muted-foreground", bg: "bg-muted/20" },
} as const;

// Disponible dans la file d'attente
const AVAILABLE_RUNS = [
  { type: "DAILY_EXECUTIVE_BRIEF", label: "Brief Exécutif" },
  { type: "SECURITY_AUDIT_RLS", label: "Audit Sécurité" },
  { type: "MARKETING_WEEK_PLAN", label: "Plan Marketing" },
  { type: "COMPETITIVE_ANALYSIS", label: "Analyse Concurrentielle" },
  { type: "PLATFORM_STATUS_REVIEW", label: "Revue Plateformes" },
  { type: "RELEASE_GATE_CHECK", label: "Release Gate" },
];

interface AgentMonitoringDashboardProps {
  className?: string;
  compact?: boolean;
}

export function AgentMonitoringDashboard({ className, compact = false }: AgentMonitoringDashboardProps) {
  const { data: runs, isLoading, refetch, isFetching } = useRecentRuns(20);
  const executeRun = useExecuteRun();
  const { enqueue, queue } = useRunQueue();
  const [expandedRun, setExpandedRun] = useState<string | null>(null);
  const [liveIndicator, setLiveIndicator] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Clignotement du point "live"
  useEffect(() => {
    intervalRef.current = setInterval(() => setLiveIndicator(v => !v), 1200);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  // Auto-refresh toutes les 30 secondes
  useEffect(() => {
    const t = setInterval(() => refetch(), 30000);
    return () => clearInterval(t);
  }, [refetch]);

  // Stats globales
  const totalRuns = runs?.length || 0;
  const completedRuns = runs?.filter(r => r.status === "completed").length || 0;
  const failedRuns = runs?.filter(r => r.status === "failed").length || 0;
  const successRate = totalRuns > 0 ? Math.round((completedRuns / totalRuns) * 100) : 0;
  const totalCostEst = runs?.reduce((acc, r) => acc + (RUN_COSTS[r.run_type] || 0.05), 0) || 0;

  // Agents actifs (runs dans les 24h)
  const last24h = runs?.filter(r => {
    const d = new Date(r.created_at);
    return Date.now() - d.getTime() < 24 * 3600 * 1000;
  }) || [];
  const activeAgentKeys = [...new Set(last24h.map(r => r.run_type))];

  return (
    <div className={cn("space-y-6", className)}>
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Brain className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              Monitoring Agents IA
              <span className={cn(
                "inline-block w-2 h-2 rounded-full transition-opacity duration-300",
                liveIndicator ? "bg-success opacity-100" : "bg-success opacity-30"
              )} />
              <Badge variant="subtle" className="text-xs">Live</Badge>
            </h2>
            <p className="text-sm text-muted-foreground">
              Surveillance temps réel des agents autonomes
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className={cn("h-4 w-4 mr-2", isFetching && "animate-spin")} />
          Actualiser
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="card-executive">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Activity className="h-5 w-5 text-primary" />
            </div>
            <div>
              {isLoading ? <Skeleton className="h-7 w-10 mb-1" /> : (
                <p className="text-2xl font-bold">{totalRuns}</p>
              )}
              <p className="text-xs text-muted-foreground">Runs totaux</p>
            </div>
          </CardContent>
        </Card>

        <Card className="card-executive">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-success/10">
              <CheckCircle className="h-5 w-5 text-success" />
            </div>
            <div>
              {isLoading ? <Skeleton className="h-7 w-10 mb-1" /> : (
                <p className="text-2xl font-bold text-success">{successRate}%</p>
              )}
              <p className="text-xs text-muted-foreground">Taux succès</p>
            </div>
          </CardContent>
        </Card>

        <Card className="card-executive">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent/10">
              <Bot className="h-5 w-5 text-accent" />
            </div>
            <div>
              {isLoading ? <Skeleton className="h-7 w-10 mb-1" /> : (
                <p className="text-2xl font-bold">{activeAgentKeys.length}</p>
              )}
              <p className="text-xs text-muted-foreground">Agents actifs 24h</p>
            </div>
          </CardContent>
        </Card>

        <Card className="card-executive">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-warning/10">
              <Euro className="h-5 w-5 text-warning" />
            </div>
            <div>
              {isLoading ? <Skeleton className="h-7 w-16 mb-1" /> : (
                <p className="text-2xl font-bold">€{totalCostEst.toFixed(2)}</p>
              )}
              <p className="text-xs text-muted-foreground">Coût IA estimé</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Agents actifs dans les 24h */}
      {!compact && (
        <Card className="card-executive">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              Agents actifs — 24 dernières heures
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex gap-2 flex-wrap">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-8 w-32" />)}
              </div>
            ) : activeAgentKeys.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucun agent actif dans les 24 dernières heures</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {activeAgentKeys.map(rt => {
                  const agent = RUN_AGENTS[rt];
                  const count = last24h.filter(r => r.run_type === rt).length;
                  return (
                    <div key={rt} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/30 border">
                      <span className="text-base">{agent?.emoji || "🤖"}</span>
                      <div>
                        <p className="text-xs font-semibold">{agent?.name || rt}</p>
                        <p className="text-[10px] text-muted-foreground">{count} run(s)</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* File d'attente + Lancer un run */}
      {!compact && (
        <Card className="card-executive">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Play className="h-4 w-4 text-primary" />
              Lancer un Agent IA
            </CardTitle>
            <CardDescription>Déclenchez un run immédiat</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_RUNS.map(run => {
                const agent = RUN_AGENTS[run.type];
                const isRunning = executeRun.isPending && (executeRun.variables as any)?.run_type === run.type;
                return (
                  <Button
                    key={run.type}
                    variant="outline"
                    size="sm"
                    className="gap-2 text-xs"
                    disabled={executeRun.isPending}
                    onClick={() => executeRun.mutate({ run_type: run.type })}
                  >
                    {isRunning ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <span>{agent?.emoji || "🤖"}</span>
                    )}
                    {run.label}
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Historique des runs */}
      <Card className="card-executive">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              Historique des Runs
            </CardTitle>
            <Badge variant="outline" className="text-xs">{totalRuns} runs</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          ) : runs?.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Bot className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">Aucun run exécuté pour le moment</p>
            </div>
          ) : (
            <ScrollArea className="h-[400px]">
              <div className="divide-y divide-border">
                {runs?.map(run => {
                  const status = STATUS_CONFIG[run.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending;
                  const StatusIcon = status.icon;
                  const agent = RUN_AGENTS[run.run_type];
                  const cost = RUN_COSTS[run.run_type] || 0.05;
                  const model = RUN_MODELS[run.run_type] || "gemini-flash";
                  const isExpanded = expandedRun === run.id;

                  return (
                    <div key={run.id} className="hover:bg-muted/20 transition-colors">
                      <button
                        className="w-full p-4 text-left"
                        onClick={() => setExpandedRun(isExpanded ? null : run.id)}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 min-w-0">
                            {/* Agent emoji */}
                            <div className={cn("p-1.5 rounded-lg shrink-0 mt-0.5", status.bg)}>
                              {run.status === "running" ? (
                                <Loader2 className={cn("h-4 w-4 animate-spin", status.color)} />
                              ) : (
                                <StatusIcon className={cn("h-4 w-4", status.color)} />
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                                <span className="text-sm font-semibold truncate">
                                  {agent?.emoji} {agent?.name || "Agent IA"}
                                </span>
                                <Badge variant="outline" className="text-[10px] shrink-0">
                                  {run.run_type.replace(/_/g, " ")}
                                </Badge>
                                {run.platform_key && (
                                  <Badge variant="subtle" className="text-[10px] shrink-0">
                                    {run.platform_key}
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {formatDistanceToNow(new Date(run.created_at), { addSuffix: true, locale: fr })}
                                </span>
                                <span className="font-mono text-[10px] opacity-60">{model}</span>
                                <span className="flex items-center gap-0.5 text-warning">
                                  <Euro className="h-2.5 w-2.5" />
                                  {cost.toFixed(2)}
                                </span>
                              </div>
                              {run.executive_summary && !isExpanded && (
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                                  {run.executive_summary.replace(/[#*`]/g, "").slice(0, 100)}...
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <Badge
                              variant={run.status === "completed" ? "subtle" : run.status === "failed" ? "destructive" : "secondary"}
                              className="text-xs"
                            >
                              {status.label}
                            </Badge>
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                        </div>
                      </button>

                      {/* Output expandé */}
                      {isExpanded && run.executive_summary && (
                        <div className="px-4 pb-4 ml-10">
                          <Separator className="mb-3" />
                          <div className="prose prose-sm max-w-none dark:prose-invert text-xs">
                            <ReactMarkdown>{run.executive_summary}</ReactMarkdown>
                          </div>
                          {run.detailed_appendix && (
                            <div className="mt-3 p-2 rounded bg-muted/30 text-xs font-mono">
                              <p className="text-muted-foreground mb-1">Données techniques :</p>
                              {Object.entries(run.detailed_appendix).map(([k, v]) => (
                                <div key={k} className="flex gap-2">
                                  <span className="text-muted-foreground">{k}:</span>
                                  <span>{String(v)}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
