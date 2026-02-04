import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Target, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

// Mock strategic goals
const STRATEGIC_GOALS = [
  {
    id: "1",
    name: "Atteindre 50k€ MRR",
    category: "Revenue",
    progress: 72,
    status: "on_track",
    dueDate: "Q2 2026",
    keyResults: [
      { name: "Augmenter ARPU de 20%", progress: 85 },
      { name: "Réduire churn à <5%", progress: 60 },
      { name: "Lancer 2 nouveaux produits", progress: 50 },
    ]
  },
  {
    id: "2",
    name: "Expansion internationale",
    category: "Growth",
    progress: 45,
    status: "at_risk",
    dueDate: "Q4 2026",
    keyResults: [
      { name: "Ouvrir marché UK", progress: 30 },
      { name: "Traductions 3 langues", progress: 66 },
      { name: "Conformité GDPR UK", progress: 40 },
    ]
  },
  {
    id: "3",
    name: "Excellence opérationnelle",
    category: "Ops",
    progress: 88,
    status: "completed",
    dueDate: "Q1 2026",
    keyResults: [
      { name: "Uptime 99.9%", progress: 100 },
      { name: "Temps de réponse <2h", progress: 95 },
      { name: "Automatiser 80% tâches", progress: 70 },
    ]
  },
];

const statusConfig = {
  on_track: { label: "En bonne voie", color: "text-success", bgColor: "bg-success/10", icon: CheckCircle2 },
  at_risk: { label: "À risque", color: "text-warning", bgColor: "bg-warning/10", icon: AlertTriangle },
  completed: { label: "Atteint", color: "text-accent", bgColor: "bg-accent/10", icon: CheckCircle2 },
  delayed: { label: "Retardé", color: "text-destructive", bgColor: "bg-destructive/10", icon: Clock },
};

interface StrategicGoalsProps {
  className?: string;
}

export function StrategicGoals({ className }: StrategicGoalsProps) {
  const overallProgress = Math.round(
    STRATEGIC_GOALS.reduce((sum, g) => sum + g.progress, 0) / STRATEGIC_GOALS.length
  );

  return (
    <Card className={cn("card-executive", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Target className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Objectifs Stratégiques 2026</CardTitle>
              <CardDescription>Progression des OKRs annuels</CardDescription>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">{overallProgress}%</p>
            <p className="text-xs text-muted-foreground">Progression globale</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {STRATEGIC_GOALS.map((goal) => {
          const status = statusConfig[goal.status as keyof typeof statusConfig];
          const StatusIcon = status.icon;
          
          return (
            <div key={goal.id} className="space-y-3 p-4 rounded-lg border">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="subtle">{goal.category}</Badge>
                    <span className="text-xs text-muted-foreground">{goal.dueDate}</span>
                  </div>
                  <h4 className="font-medium">{goal.name}</h4>
                </div>
                <div className={cn("flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium", status.bgColor, status.color)}>
                  <StatusIcon className="h-3 w-3" />
                  {status.label}
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progression</span>
                  <span className="font-medium">{goal.progress}%</span>
                </div>
                <Progress value={goal.progress} className="h-2" />
              </div>
              
              <div className="space-y-2 pt-2 border-t">
                <p className="text-xs font-medium text-muted-foreground">Résultats clés:</p>
                {goal.keyResults.map((kr, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{kr.name}</span>
                    <div className="flex items-center gap-2">
                      <Progress value={kr.progress} className="h-1 w-16" />
                      <span className="w-8 text-right">{kr.progress}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
