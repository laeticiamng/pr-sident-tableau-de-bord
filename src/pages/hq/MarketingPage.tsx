import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  Target, 
  Mail, 
  Users, 
  Calendar,
  Loader2,
  Megaphone,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { useExecuteRun, useRecentRuns } from "@/hooks/useHQData";
import { useState } from "react";
import { MARKETING_KPIS, MARKETING_CAMPAIGNS } from "@/lib/mock-data";
import { ContentCalendar } from "@/components/hq/marketing/ContentCalendar";
import { ChannelROIChart } from "@/components/hq/marketing/ChannelROIChart";
import { CompetitiveRadar } from "@/components/hq/marketing/CompetitiveRadar";
import { cn } from "@/lib/utils";

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

  const kpis = [
    { 
      label: "Visiteurs Mensuels", 
      value: MARKETING_KPIS.monthlyVisitors.toLocaleString("fr-FR"), 
      change: MARKETING_KPIS.monthlyVisitorsChange, 
      icon: Users 
    },
    { 
      label: "Taux de Conversion", 
      value: `${MARKETING_KPIS.conversionRate}%`, 
      change: MARKETING_KPIS.conversionRateChange, 
      icon: Target 
    },
    { 
      label: "Emails Envoyés", 
      value: MARKETING_KPIS.emailsSent.toLocaleString("fr-FR"), 
      change: MARKETING_KPIS.emailsSentChange, 
      icon: Mail 
    },
    { 
      label: "Engagement Social", 
      value: MARKETING_KPIS.socialEngagement.toLocaleString("fr-FR"), 
      change: MARKETING_KPIS.socialEngagementChange, 
      icon: TrendingUp 
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active": return <Badge variant="success">Active</Badge>;
      case "scheduled": return <Badge variant="subtle">Planifiée</Badge>;
      case "completed": return <Badge variant="gold">Terminée</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
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
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="card-executive">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <kpi.icon className="h-5 w-5 text-primary" />
                {kpi.change > 0 ? (
                  <ArrowUpRight className="h-4 w-4 text-success" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-destructive" />
                )}
              </div>
              <div className="text-2xl font-bold">{kpi.value}</div>
              <div className="text-sm text-muted-foreground mt-1">{kpi.label}</div>
              <div className={cn(
                "text-xs mt-1",
                kpi.change > 0 ? "text-success" : "text-destructive"
              )}>
                {kpi.change > 0 ? "+" : ""}{kpi.change}% vs mois dernier
              </div>
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

        {/* Campaigns */}
        <Card className="card-executive">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Target className="h-5 w-5 text-primary" />
              Campagnes Actives
            </CardTitle>
            <CardDescription>
              {MARKETING_CAMPAIGNS.filter(c => c.status === "active").length} campagnes en cours
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {MARKETING_CAMPAIGNS.map((campaign) => (
                <div 
                  key={campaign.id}
                  className="p-4 rounded-lg border hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm">{campaign.name}</h4>
                    {getStatusBadge(campaign.status)}
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Budget: {campaign.spent}€ / {campaign.budget}€</span>
                      <span>{campaign.leads} leads</span>
                    </div>
                    <Progress 
                      value={(campaign.spent / campaign.budget) * 100} 
                      className="h-2" 
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ROI by Channel Chart & Competitive Radar */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ChannelROIChart />
        <CompetitiveRadar />
      </div>

      {/* Content Calendar - Interactive Component */}
      <ContentCalendar />
    </div>
  );
}
