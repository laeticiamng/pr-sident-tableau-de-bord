import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Target, TrendingUp, Users, DollarSign, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface Objective {
  id: string;
  title: string;
  category: "growth" | "product" | "ops" | "finance";
  target: string;
  current: number;
  targetValue: number;
  unit: string;
  status: "on_track" | "at_risk" | "behind";
}

const Q1_OBJECTIVES: Objective[] = [
  { id: "1", title: "Croissance MRR", category: "finance", target: "60K€", current: 45200, targetValue: 60000, unit: "€", status: "on_track" },
  { id: "2", title: "Nouveaux Utilisateurs", category: "growth", target: "500", current: 312, targetValue: 500, unit: "", status: "on_track" },
  { id: "3", title: "Satisfaction Client", category: "product", target: "4.5/5", current: 4.3, targetValue: 4.5, unit: "/5", status: "at_risk" },
  { id: "4", title: "Temps de Réponse Support", category: "ops", target: "<2h", current: 2.4, targetValue: 2, unit: "h", status: "behind" },
  { id: "5", title: "Taux de Conversion", category: "growth", target: "8%", current: 7.2, targetValue: 8, unit: "%", status: "on_track" },
];

const categoryIcons = {
  growth: TrendingUp,
  product: Zap,
  ops: Users,
  finance: DollarSign,
};

const categoryLabels = {
  growth: "Croissance",
  product: "Produit",
  ops: "Opérations",
  finance: "Finance",
};

const statusColors = {
  on_track: "text-success border-success/30 bg-success/5",
  at_risk: "text-warning border-warning/30 bg-warning/5",
  behind: "text-destructive border-destructive/30 bg-destructive/5",
};

const statusLabels = {
  on_track: "En bonne voie",
  at_risk: "À risque",
  behind: "En retard",
};

interface QuarterlyObjectivesProps {
  className?: string;
}

export function QuarterlyObjectives({ className }: QuarterlyObjectivesProps) {
  const onTrackCount = Q1_OBJECTIVES.filter(o => o.status === "on_track").length;
  const totalCount = Q1_OBJECTIVES.length;
  const progressPercent = (onTrackCount / totalCount) * 100;

  return (
    <Card className={cn("card-executive", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Objectifs Q1 2026
            </CardTitle>
            <CardDescription>
              Suivi des objectifs trimestriels
            </CardDescription>
          </div>
          <Badge variant={onTrackCount >= totalCount * 0.7 ? "success" : "warning"}>
            {onTrackCount}/{totalCount} en voie
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {/* Global Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Progression globale Q1</span>
            <span className="font-medium">{progressPercent.toFixed(0)}%</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>

        {/* Objectives List */}
        <div className="space-y-3">
          {Q1_OBJECTIVES.map((objective) => {
            const Icon = categoryIcons[objective.category];
            const progress = objective.category === "ops" 
              ? Math.max(0, (objective.targetValue / objective.current) * 100)
              : (objective.current / objective.targetValue) * 100;
            
            return (
              <div 
                key={objective.id}
                className={cn(
                  "p-3 rounded-lg border transition-colors",
                  statusColors[objective.status]
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    <span className="font-medium text-sm">{objective.title}</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {statusLabels[objective.status]}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-muted-foreground">
                    {categoryLabels[objective.category]}
                  </span>
                  <span>
                    {objective.current}{objective.unit} / {objective.target}
                  </span>
                </div>
                
                <Progress 
                  value={Math.min(100, progress)} 
                  className="h-1.5"
                />
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
