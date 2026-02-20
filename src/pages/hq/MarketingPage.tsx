import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  TrendingUp, 
  Calendar,
  Loader2,
  Megaphone,
  RefreshCw,
  Brain,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useExecuteRun, useRecentRuns } from "@/hooks/useHQData";
import { useState } from "react";
import { ContentCalendar } from "@/components/hq/marketing/ContentCalendar";
import { ChannelROIChart } from "@/components/hq/marketing/ChannelROIChart";
import { CompetitiveRadar } from "@/components/hq/marketing/CompetitiveRadar";
import { CampaignPerformance } from "@/components/hq/marketing/CampaignPerformance";
import { PlatformTrafficWidget } from "@/components/hq/marketing/PlatformTrafficWidget";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import ReactMarkdown from "react-markdown";

export default function MarketingPage() {
  const executeRun = useExecuteRun();
  const { data: runs, isLoading, refetch, isFetching } = useRecentRuns(20);
  const [generatingPlan, setGeneratingPlan] = useState(false);

  const marketingRuns = runs?.filter(r => 
    r.run_type === "MARKETING_WEEK_PLAN" || r.run_type === "COMPETITIVE_ANALYSIS"
  );
  const latestPlan = runs?.find(r => r.run_type === "MARKETING_WEEK_PLAN");
  const latestCompetitive = runs?.find(r => r.run_type === "COMPETITIVE_ANALYSIS");

  const handleGeneratePlan = async () => {
    setGeneratingPlan(true);
    try {
      await executeRun.mutateAsync({ run_type: "MARKETING_WEEK_PLAN" });
    } finally {
      setGeneratingPlan(false);
    }
  };

  const handleGenerateCompetitive = async () => {
    try {
      await executeRun.mutateAsync({ run_type: "COMPETITIVE_ANALYSIS" });
    } catch {}
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-headline-1 mb-2">Marketing Command</h1>
          <p className="text-muted-foreground text-lg">
            Pilotage marketing centralisé — données générées par l'agent CMO IA.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? "animate-spin" : ""}`} />
            Actualiser
          </Button>
          <Button
            variant="executive"
            onClick={handleGeneratePlan}
            disabled={generatingPlan || executeRun.isPending}
          >
            {generatingPlan ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Calendar className="h-4 w-4 mr-2" />
            )}
            Plan Semaine
          </Button>
          <Button
            variant="outline"
            onClick={handleGenerateCompetitive}
            disabled={executeRun.isPending}
          >
            {executeRun.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Brain className="h-4 w-4 mr-2" />
            )}
            Analyse Concurrentielle
          </Button>
        </div>
      </div>

      {/* Historique des runs marketing */}
      {marketingRuns && marketingRuns.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {marketingRuns.slice(0, 4).map(run => (
            <div key={run.id} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/40 border text-xs">
              {run.status === "completed" ? (
                <CheckCircle className="h-3 w-3 text-success" />
              ) : (
                <XCircle className="h-3 w-3 text-destructive" />
              )}
              <span className="font-medium">{run.run_type.replace(/_/g, " ")}</span>
              <span className="text-muted-foreground flex items-center gap-1">
                <Clock className="h-2.5 w-2.5" />
                {formatDistanceToNow(new Date(run.created_at), { addSuffix: true, locale: fr })}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Plan Marketing (données réelles du run IA) */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="card-executive">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-primary" />
                Plan Marketing Hebdomadaire
              </CardTitle>
              {latestPlan && (
                <Badge variant="subtle" className="text-xs">
                  CMO Agent
                </Badge>
              )}
            </div>
            <CardDescription>
              {latestPlan 
                ? `Généré ${formatDistanceToNow(new Date(latestPlan.created_at), { addSuffix: true, locale: fr })}`
                : "Aucun plan généré — cliquez sur 'Plan Semaine'"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[1,2,3,4].map(i => <Skeleton key={i} className="h-4 w-full" />)}
              </div>
            ) : latestPlan?.executive_summary ? (
              <div className="prose prose-sm max-w-none dark:prose-invert text-xs max-h-80 overflow-y-auto">
                <ReactMarkdown>{latestPlan.executive_summary}</ReactMarkdown>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Megaphone className="h-10 w-10 mx-auto mb-4 opacity-40" />
                <p className="text-sm mb-3">Aucun plan marketing généré.</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGeneratePlan}
                  disabled={generatingPlan}
                >
                  <Brain className="h-4 w-4 mr-2" />
                  Générer avec l'IA
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Analyse Concurrentielle */}
        <Card className="card-executive">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-primary" />
                Analyse Concurrentielle
              </CardTitle>
              {latestCompetitive && (
                <Badge variant="subtle" className="text-xs">CSO Agent</Badge>
              )}
            </div>
            <CardDescription>
              {latestCompetitive
                ? `Générée ${formatDistanceToNow(new Date(latestCompetitive.created_at), { addSuffix: true, locale: fr })}`
                : "Aucune analyse — lancez 'Analyse Concurrentielle'"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[1,2,3,4].map(i => <Skeleton key={i} className="h-4 w-full" />)}
              </div>
            ) : latestCompetitive?.executive_summary ? (
              <div className="prose prose-sm max-w-none dark:prose-invert text-xs max-h-80 overflow-y-auto">
                <ReactMarkdown>{latestCompetitive.executive_summary}</ReactMarkdown>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Brain className="h-10 w-10 mx-auto mb-4 opacity-40" />
                <p className="text-sm mb-3">Analyse non disponible.</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateCompetitive}
                  disabled={executeRun.isPending}
                >
                  Lancer l'analyse
                </Button>
              </div>
            )}
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
