import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  TrendingUp, 
  Target, 
  Mail, 
  Users, 
  Calendar,
  Loader2,
  Megaphone,
  Database,
  Link2,
  AlertTriangle
} from "lucide-react";
import { useExecuteRun, useRecentRuns } from "@/hooks/useHQData";
import { useState } from "react";
import { ContentCalendar } from "@/components/hq/marketing/ContentCalendar";
import { ChannelROIChart } from "@/components/hq/marketing/ChannelROIChart";
import { CompetitiveRadar } from "@/components/hq/marketing/CompetitiveRadar";
import { CampaignPerformance } from "@/components/hq/marketing/CampaignPerformance";
import { PlatformTrafficWidget } from "@/components/hq/marketing/PlatformTrafficWidget";

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

      {/* KPIs - État vide, nécessite connexion GA4/Meta */}
      <Card className="card-executive border-dashed border-2 border-muted-foreground/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Métriques Marketing
            </CardTitle>
            <Badge variant="destructive" className="text-[9px]">
              <AlertTriangle className="h-2.5 w-2.5 mr-0.5" />
              Non connecté
            </Badge>
          </div>
          <CardDescription>
            Visiteurs, conversions, emails, engagement
          </CardDescription>
        </CardHeader>
        <CardContent className="py-6 text-center">
          <Database className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
          <h3 className="text-sm font-semibold mb-1">Connexion requise</h3>
          <p className="text-xs text-muted-foreground mb-3">
            Connectez Google Analytics, Meta Ads ou Growth OS pour les KPIs marketing.
          </p>
          <Badge variant="outline" className="text-[10px] gap-1">
            <Link2 className="h-2.5 w-2.5" />
            Sources : GA4, Meta Ads, Growth OS
          </Badge>
        </CardContent>
      </Card>

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
              <div className="h-48 bg-muted/50 rounded-lg animate-pulse" />
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

        {/* Campaigns - État vide */}
        <Card className="card-executive border-dashed border-2 border-muted-foreground/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Target className="h-5 w-5 text-primary" />
              Campagnes Actives
            </CardTitle>
            <CardDescription className="flex items-center gap-2">
              Aucune campagne connectée
            </CardDescription>
          </CardHeader>
          <CardContent className="py-8 text-center">
            <Database className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
            <p className="text-xs text-muted-foreground mb-3">
              Connectez un outil de campagne pour suivre vos performances.
            </p>
            <Badge variant="outline" className="text-[10px] gap-1">
              <Link2 className="h-2.5 w-2.5" />
              Sources : Meta Ads, Google Ads
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* ROI by Channel Chart & Competitive Radar */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ChannelROIChart />
        <CompetitiveRadar />
      </div>

      {/* Campaign Performance - Detailed Analysis */}
      <CampaignPerformance />

      {/* Platform Traffic Widget */}
      <PlatformTrafficWidget />

      {/* Content Calendar - Interactive Component */}
      <ContentCalendar />
    </div>
  );
}
