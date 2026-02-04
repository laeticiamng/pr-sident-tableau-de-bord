import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Bot, Zap, Clock, CheckCircle, AlertTriangle, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface AgentPerformance {
  id: string;
  name: string;
  role: string;
  runsCompleted: number;
  avgResponseTime: number; // secondes
  successRate: number;
  lastActive: string;
  status: "active" | "idle" | "error";
}

const AGENT_PERFORMANCES: AgentPerformance[] = [
  { id: "1", name: "DG Agent", role: "Directeur Général", runsCompleted: 156, avgResponseTime: 2.3, successRate: 98.5, lastActive: "Il y a 2 min", status: "active" },
  { id: "2", name: "CFO Agent", role: "Directeur Financier", runsCompleted: 89, avgResponseTime: 3.1, successRate: 97.2, lastActive: "Il y a 15 min", status: "active" },
  { id: "3", name: "CMO Agent", role: "Directeur Marketing", runsCompleted: 124, avgResponseTime: 2.8, successRate: 96.8, lastActive: "Il y a 1h", status: "idle" },
  { id: "4", name: "CTO Agent", role: "Directeur Technique", runsCompleted: 203, avgResponseTime: 4.2, successRate: 99.1, lastActive: "Il y a 5 min", status: "active" },
  { id: "5", name: "Security Agent", role: "Responsable Sécurité", runsCompleted: 78, avgResponseTime: 5.6, successRate: 100, lastActive: "Il y a 30 min", status: "idle" },
];

interface AgentPerformanceWidgetProps {
  className?: string;
}

export function AgentPerformanceWidget({ className }: AgentPerformanceWidgetProps) {
  const avgSuccessRate = (AGENT_PERFORMANCES.reduce((sum, a) => sum + a.successRate, 0) / AGENT_PERFORMANCES.length).toFixed(1);
  const totalRuns = AGENT_PERFORMANCES.reduce((sum, a) => sum + a.runsCompleted, 0);
  const activeAgents = AGENT_PERFORMANCES.filter(a => a.status === "active").length;

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
              Métriques d'exécution et fiabilité
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Badge variant="success">{activeAgents} actifs</Badge>
            <Badge variant="subtle">{avgSuccessRate}% succès</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <div className="text-2xl font-bold text-primary">{totalRuns}</div>
            <div className="text-xs text-muted-foreground">Runs Total</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <div className="text-2xl font-bold text-success">{avgSuccessRate}%</div>
            <div className="text-xs text-muted-foreground">Taux Succès</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <div className="text-2xl font-bold">
              {(AGENT_PERFORMANCES.reduce((sum, a) => sum + a.avgResponseTime, 0) / AGENT_PERFORMANCES.length).toFixed(1)}s
            </div>
            <div className="text-xs text-muted-foreground">Temps Moyen</div>
          </div>
        </div>

        {/* Agent List */}
        <div className="space-y-3">
          {AGENT_PERFORMANCES.map((agent) => (
            <div key={agent.id} className="p-3 rounded-lg border hover:bg-muted/30 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "h-2 w-2 rounded-full",
                    agent.status === "active" ? "bg-success animate-pulse" :
                    agent.status === "idle" ? "bg-muted-foreground" : "bg-destructive"
                  )} />
                  <div>
                    <h4 className="font-medium text-sm">{agent.name}</h4>
                    <p className="text-xs text-muted-foreground">{agent.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {agent.lastActive}
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-2 mt-2">
                <div className="flex items-center gap-1 text-xs">
                  <Zap className="h-3 w-3 text-primary" />
                  <span>{agent.runsCompleted} runs</span>
                </div>
                <div className="flex items-center gap-1 text-xs">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span>{agent.avgResponseTime}s moy</span>
                </div>
                <div className="flex items-center gap-1 text-xs">
                  {agent.successRate >= 98 ? (
                    <CheckCircle className="h-3 w-3 text-success" />
                  ) : (
                    <AlertTriangle className="h-3 w-3 text-warning" />
                  )}
                  <span>{agent.successRate}%</span>
                </div>
              </div>
              
              <Progress 
                value={agent.successRate} 
                className="h-1 mt-2" 
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
