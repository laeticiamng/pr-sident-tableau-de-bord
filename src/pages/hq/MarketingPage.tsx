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
import { ExecutiveHeader } from "@/components/hq/ExecutiveDataSource";
import { MethodologyDisclosure } from "@/components/hq/MethodologyDisclosure";
import { ChannelROIChart } from "@/components/hq/marketing/ChannelROIChart";
import { CompetitiveRadar } from "@/components/hq/marketing/CompetitiveRadar";
import { CampaignPerformance } from "@/components/hq/marketing/CampaignPerformance";
import { PlatformTrafficWidget } from "@/components/hq/marketing/PlatformTrafficWidget";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { fr, enGB, de } from "date-fns/locale";
import ReactMarkdown from "react-markdown";
import { useTranslation, useLanguage } from "@/contexts/LanguageContext";
import { hqCommon } from "@/i18n/hq-common";

const dateFnsLocales = { fr, en: enGB, de } as const;

export default function MarketingPage() {
  const executeRun = useExecuteRun();
  const { data: runs, isLoading, refetch, isFetching } = useRecentRuns(20);
  const [generatingPlan, setGeneratingPlan] = useState(false);
  const t = useTranslation(hqCommon);
  const { language } = useLanguage();
  const locale = dateFnsLocales[language] || fr;

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
      <ExecutiveHeader
        title={t.marketingCommand}
        subtitle={t.centralizedMarketing}
        context={t.marketingContext}
        source={{ source: "mock", lastUpdated: new Date(), confidence: "medium" }}
        actions={
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? "animate-spin" : ""}`} />
            {t.refresh}
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
            {t.weekPlan}
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
            {t.competitiveAnalysis}
          </Button>
        </div>
        }
      />

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
                {formatDistanceToNow(new Date(run.created_at), { addSuffix: true, locale })}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="card-executive">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-primary" />
                {t.weeklyMarketingPlan}
              </CardTitle>
              {latestPlan && (
                <Badge variant="subtle" className="text-xs">CMO Agent</Badge>
              )}
            </div>
            <CardDescription>
              {latestPlan 
                ? `${t.generatedAgo} ${formatDistanceToNow(new Date(latestPlan.created_at), { addSuffix: true, locale })}`
                : t.noPlanGenerated
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
                <p className="text-sm mb-3">{t.noMarketingPlan}</p>
                <Button variant="outline" size="sm" onClick={handleGeneratePlan} disabled={generatingPlan}>
                  <Brain className="h-4 w-4 mr-2" />
                  {t.generateWithAI}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="card-executive">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-primary" />
                {t.competitiveAnalysis}
              </CardTitle>
              {latestCompetitive && (
                <Badge variant="subtle" className="text-xs">CSO Agent</Badge>
              )}
            </div>
            <CardDescription>
              {latestCompetitive
                ? `${t.generatedAgo} ${formatDistanceToNow(new Date(latestCompetitive.created_at), { addSuffix: true, locale })}`
                : t.noAnalysis
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
                <p className="text-sm mb-3">{t.analysisNotAvailable}</p>
                <Button variant="outline" size="sm" onClick={handleGenerateCompetitive} disabled={executeRun.isPending}>
                  {t.launchAnalysis}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChannelROIChart />
        <CompetitiveRadar />
      </div>

      <CampaignPerformance />
      <PlatformTrafficWidget />
      <ContentCalendar />

      <MethodologyDisclosure
        sources={[
          { name: "Agent CMO IA", type: "computed", reliability: "estimated", description: "Rapports marketing générés par IA" },
          { name: "Données mock", type: "mock", reliability: "simulated", description: "Canaux, campagnes, trafic" },
        ]}
        calculations={[
          { metric: "ROI par canal", assumptions: ["Données simulées"], limitations: ["Connexion Google Analytics requise pour données réelles"] },
        ]}
      />
    </div>
  );
}
