import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  TrendingUp, 
  Target, 
  Mail, 
  Users, 
  BarChart3, 
  Calendar,
  Loader2,
  RefreshCw,
  Megaphone
} from "lucide-react";
import { useExecuteRun, useRecentRuns } from "@/hooks/useHQData";
import { useState } from "react";

const marketingKPIs = [
  { label: "Visiteurs Mensuels", value: "—", change: "—", icon: Users },
  { label: "Taux de Conversion", value: "—", change: "—", icon: Target },
  { label: "Emails Envoyés", value: "—", change: "—", icon: Mail },
  { label: "Engagement Social", value: "—", change: "—", icon: TrendingUp },
];

export default function MarketingPage() {
  const executeRun = useExecuteRun();
  const { data: runs, isLoading } = useRecentRuns(10);
  const [generatingPlan, setGeneratingPlan] = useState(false);

  const marketingRuns = runs?.filter(r => r.run_type === "MARKETING_WEEK_PLAN");
  const latestPlan = marketingRuns?.[0];

  const handleGeneratePlan = async () => {
    setGeneratingPlan(true);
    try {
      await executeRun.mutateAsync({ run_type: "MARKETING_WEEK_PLAN" });
    } finally {
      setGeneratingPlan(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-headline-1 mb-2">Marketing Command</h1>
          <p className="text-muted-foreground text-lg">
            Pilotage marketing centralisé pour l'ensemble des plateformes.
          </p>
        </div>
        <Button 
          variant="executive"
          onClick={handleGeneratePlan}
          disabled={generatingPlan}
        >
          {generatingPlan ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Calendar className="h-4 w-4 mr-2" />
          )}
          Générer Plan Semaine
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-4">
        {marketingKPIs.map((kpi) => (
          <Card key={kpi.label} className="card-executive">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <kpi.icon className="h-5 w-5 text-primary" />
                <span className="text-sm text-muted-foreground">{kpi.label}</span>
              </div>
              <div className="text-2xl font-bold">{kpi.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{kpi.change}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Weekly Plan */}
        <Card className="card-executive">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-primary" />
              Plan Marketing Hebdomadaire
            </CardTitle>
            <CardDescription>
              {latestPlan 
                ? `Dernière mise à jour: ${new Date(latestPlan.created_at).toLocaleDateString("fr-FR")}`
                : "Aucun plan généré"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-48 w-full" />
            ) : latestPlan?.executive_summary ? (
              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-wrap text-sm">
                  {latestPlan.executive_summary}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Megaphone className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Aucun plan marketing généré.</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={handleGeneratePlan}
                  disabled={generatingPlan}
                >
                  Générer le Plan
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Campaigns */}
        <Card className="card-executive">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Target className="h-5 w-5 text-primary" />
              Campagnes Actives
            </CardTitle>
            <CardDescription>
              Campagnes marketing en cours
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucune campagne active</p>
              <p className="text-sm mt-1">Les campagnes seront affichées ici.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Calendar */}
      <Card className="card-executive">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <BarChart3 className="h-5 w-5 text-primary" />
            Calendrier de Contenu
          </CardTitle>
          <CardDescription>
            Planification du contenu pour les 5 plateformes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">Calendrier en cours de configuration</p>
            <p className="text-sm mt-1">
              Le calendrier de contenu unifié sera disponible prochainement.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
