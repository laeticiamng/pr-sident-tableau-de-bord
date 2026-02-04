import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { UserPlus, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const ONBOARDING_DATA = [
  { 
    agent: "CFO Agent", 
    role: "Directeur Financier", 
    progress: 100,
    status: "completed",
    startedAt: "2025-01-15"
  },
  { 
    agent: "CMO Agent", 
    role: "Directeur Marketing", 
    progress: 85,
    status: "in_progress",
    startedAt: "2025-01-28"
  },
  { 
    agent: "CTO Agent", 
    role: "Directeur Technique", 
    progress: 100,
    status: "completed",
    startedAt: "2025-01-10"
  },
  { 
    agent: "Support Lead", 
    role: "Responsable Support", 
    progress: 60,
    status: "in_progress",
    startedAt: "2025-02-01"
  },
  { 
    agent: "Sales Director", 
    role: "Directeur Commercial", 
    progress: 30,
    status: "pending",
    startedAt: "2025-02-03"
  },
];

const statusConfig = {
  completed: { icon: CheckCircle, color: "text-success", label: "Terminé", badge: "success" as const },
  in_progress: { icon: Clock, color: "text-primary", label: "En cours", badge: "default" as const },
  pending: { icon: AlertCircle, color: "text-warning", label: "En attente", badge: "warning" as const },
};

export function OnboardingTracker() {
  const completed = ONBOARDING_DATA.filter(a => a.status === "completed").length;
  const inProgress = ONBOARDING_DATA.filter(a => a.status === "in_progress").length;
  const total = ONBOARDING_DATA.length;

  return (
    <Card className="card-executive">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <UserPlus className="h-5 w-5 text-primary" />
          Suivi Onboarding Agents
        </CardTitle>
        <CardDescription>
          {completed}/{total} agents opérationnels • {inProgress} en formation
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="text-center p-3 rounded-lg bg-success/10">
            <p className="text-2xl font-bold text-success">{completed}</p>
            <p className="text-xs text-muted-foreground">Opérationnels</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-primary/10">
            <p className="text-2xl font-bold text-primary">{inProgress}</p>
            <p className="text-xs text-muted-foreground">En formation</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted">
            <p className="text-2xl font-bold">{total - completed - inProgress}</p>
            <p className="text-xs text-muted-foreground">En attente</p>
          </div>
        </div>

        {/* Agent List */}
        <div className="space-y-3">
          {ONBOARDING_DATA.map((agent) => {
            const config = statusConfig[agent.status as keyof typeof statusConfig];
            const StatusIcon = config.icon;
            
            return (
              <div 
                key={agent.agent}
                className="p-4 rounded-lg border hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <StatusIcon className={cn("h-4 w-4", config.color)} />
                    <div>
                      <p className="font-medium text-sm">{agent.agent}</p>
                      <p className="text-xs text-muted-foreground">{agent.role}</p>
                    </div>
                  </div>
                  <Badge variant={config.badge}>{config.label}</Badge>
                </div>
                <div className="flex items-center gap-3">
                  <Progress value={agent.progress} className="flex-1 h-2" />
                  <span className="text-xs font-mono text-muted-foreground w-10">
                    {agent.progress}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
