import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Building2, 
  TrendingUp, 
  Users, 
  Briefcase,
  Target,
  Calendar,
  Award
} from "lucide-react";

const COMPANY_KPIS = {
  founded: "2025-05-15",
  platforms: 5,
  agents: 37,
  totalUsers: 1247,
  monthlyGrowth: 12.5,
  objectives: {
    completed: 8,
    total: 12,
    progress: 67,
  },
  milestones: [
    { name: "MVP EmotionsCare", status: "completed", date: "2025-06" },
    { name: "Lancement Growth Copilot", status: "completed", date: "2025-09" },
    { name: "1000 utilisateurs", status: "completed", date: "2025-12" },
    { name: "Break-even", status: "in_progress", date: "2026-Q2" },
    { name: "Série A", status: "planned", date: "2026-Q4" },
  ],
};

export function CompanyKPIs() {
  const ageInMonths = Math.floor(
    (new Date().getTime() - new Date(COMPANY_KPIS.founded).getTime()) / (1000 * 60 * 60 * 24 * 30)
  );

  return (
    <Card className="card-executive">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <Building2 className="h-5 w-5 text-primary" />
          Indicateurs Société
        </CardTitle>
        <CardDescription>
          Métriques clés de l'entreprise
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 rounded-lg bg-primary/5">
            <Calendar className="h-5 w-5 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">{ageInMonths}</p>
            <p className="text-xs text-muted-foreground">Mois d'activité</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-success/5">
            <Briefcase className="h-5 w-5 mx-auto mb-2 text-success" />
            <p className="text-2xl font-bold">{COMPANY_KPIS.platforms}</p>
            <p className="text-xs text-muted-foreground">Plateformes</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-accent/5">
            <Users className="h-5 w-5 mx-auto mb-2 text-accent" />
            <p className="text-2xl font-bold">{COMPANY_KPIS.agents}</p>
            <p className="text-xs text-muted-foreground">Agents IA</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-warning/5">
            <TrendingUp className="h-5 w-5 mx-auto mb-2 text-warning" />
            <p className="text-2xl font-bold">+{COMPANY_KPIS.monthlyGrowth}%</p>
            <p className="text-xs text-muted-foreground">Croissance/mois</p>
          </div>
        </div>

        {/* Objectives Progress */}
        <div className="mb-6 p-4 rounded-lg border">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              <span className="font-medium">Objectifs Annuels</span>
            </div>
            <Badge variant="gold">
              {COMPANY_KPIS.objectives.completed}/{COMPANY_KPIS.objectives.total}
            </Badge>
          </div>
          <Progress value={COMPANY_KPIS.objectives.progress} className="h-3" />
          <p className="text-xs text-muted-foreground mt-2">
            {COMPANY_KPIS.objectives.progress}% des objectifs atteints
          </p>
        </div>

        {/* Milestones */}
        <div>
          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
            <Award className="h-4 w-4 text-primary" />
            Jalons Clés
          </h4>
          <div className="space-y-2">
            {COMPANY_KPIS.milestones.map((milestone) => (
              <div 
                key={milestone.name}
                className="flex items-center justify-between p-3 rounded-lg border"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    milestone.status === "completed" ? "bg-success" :
                    milestone.status === "in_progress" ? "bg-primary animate-pulse" :
                    "bg-muted-foreground"
                  }`} />
                  <span className="text-sm">{milestone.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{milestone.date}</span>
                  <Badge 
                    variant={
                      milestone.status === "completed" ? "success" :
                      milestone.status === "in_progress" ? "default" :
                      "subtle"
                    }
                    className="text-xs"
                  >
                    {milestone.status === "completed" ? "✓" :
                     milestone.status === "in_progress" ? "En cours" :
                     "Planifié"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
