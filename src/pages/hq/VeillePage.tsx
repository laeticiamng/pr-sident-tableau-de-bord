import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Brain, ExternalLink, TrendingUp, TrendingDown, AlertTriangle,
  Loader2, Globe, Newspaper, Target, Eye, Sparkles
} from "lucide-react";
import { useExecuteRun } from "@/hooks/useHQData";
import { MANAGED_PLATFORMS } from "@/lib/constants";
import { ExecutiveHeader } from "@/components/hq/ExecutiveDataSource";
import { MethodologyDisclosure } from "@/components/hq/MethodologyDisclosure";
import { useTranslation } from "@/contexts/LanguageContext";
import { hqCommon } from "@/i18n/hq-common";

const competitorSources = [
  { name: "Product Hunt", url: "https://www.producthunt.com", categoryKey: "productLaunch" as const },
  { name: "TechCrunch Health", url: "https://techcrunch.com/category/health/", categoryKey: "healthTech" as const },
  { name: "Crunchbase", url: "https://www.crunchbase.com", categoryKey: "fundraising" as const },
  { name: "G2 Reviews", url: "https://www.g2.com", categoryKey: "userReviews" as const },
  { name: "Hacker News", url: "https://news.ycombinator.com", categoryKey: "techCommunity" as const },
  { name: "Station F", url: "https://stationf.co", categoryKey: "frEcosystem" as const },
];

const marketTrends = [
  { trend: "IA générative en santé", direction: "up" as const, impact: "high" as const, summary: "Adoption massive des LLMs dans les outils de santé. Opportunité directe pour EmotionsCare et Med MNG." },
  { trend: "Bien-être au travail", direction: "up" as const, impact: "high" as const, summary: "Marché QVT en croissance de 12% annuel. Les entreprises investissent dans le bien-être des soignants." },
  { trend: "EdTech médical", direction: "up" as const, impact: "medium" as const, summary: "Concurrence accrue sur l'apprentissage médical. Différenciation par la musique IA unique sur le marché." },
  { trend: "Mobilité internationale", direction: "stable" as const, impact: "medium" as const, summary: "Post-COVID, stabilisation des flux migratoires. System Compass reste pertinent pour les digital nomads." },
  { trend: "Social apps étudiants", direction: "down" as const, impact: "low" as const, summary: "Marché saturé (BeReal, Locket). NEARVITY se différencie par le radar proximité temps réel." },
];

const competitiveMap = [
  { platform: "EmotionsCare", competitors: ["Moka.care", "Alan Mind", "Teladoc Health"], advantage: "Seule plateforme dédiée aux soignants avec IA émotionnelle + musicothérapie", threat: "low" as const },
  { platform: "Med MNG", competitors: ["Anki Medical", "Osmosis", "Amboss"], advantage: "Unique : apprentissage médical par génération musicale IA", threat: "low" as const },
  { platform: "System Compass", competitors: ["Numbeo", "Expatistan", "InterNations"], advantage: "Intelligence décisionnelle personnalisée vs. simples comparateurs", threat: "medium" as const },
  { platform: "Growth Copilot", competitors: ["Jasper AI", "Copy.ai", "HubSpot AI"], advantage: "39 agents spécialisés avec validation présidentielle intégrée", threat: "medium" as const },
  { platform: "UrgenceOS", competitors: ["Lifen", "Doctolib Pro", "HopitalWeb"], advantage: "Temps réel natif, pancarte IDE 1 tap, audit trail médical", threat: "low" as const },
  { platform: "Track Triumph", competitors: ["SoundCloud", "BandLab", "Splice"], advantage: "Compétition communautaire avec votes multi-critères", threat: "medium" as const },
  { platform: "NEARVITY", competitors: ["BeReal", "Bumble BFF", "Meetup"], advantage: "Radar proximité temps réel unique, 3 états de signal", threat: "high" as const },
];

export default function VeillePage() {
  const executeRun = useExecuteRun();
  const [lastAnalysis, setLastAnalysis] = useState<string | null>(null);
  const t = useTranslation(hqCommon);

  const handleCompetitiveAnalysis = async () => {
    const result = await executeRun.mutateAsync({ run_type: "COMPETITIVE_ANALYSIS" });
    if (result?.executive_summary) setLastAnalysis(result.executive_summary);
  };

  const totalPlatforms = MANAGED_PLATFORMS.length;
  const threatColors = { low: "text-success", medium: "text-warning", high: "text-destructive" };
  const threatLabels = { low: t.threatLow, medium: t.threatModerate, high: t.threatHigh };
  const impactLabels = { high: t.impactHigh, medium: t.impactMedium, low: t.impactLow };

  return (
    <div className="space-y-8 animate-fade-in">
      <ExecutiveHeader
        title={t.strategicIntelligence}
        subtitle={t.intelligenceSubtitle.replace("{n}", String(totalPlatforms))}
        context={t.intelligenceContext}
        source={{ source: "mock", lastUpdated: new Date(), confidence: "medium" }}
        actions={
          <Button onClick={handleCompetitiveAnalysis} disabled={executeRun.isPending}>
            {executeRun.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Brain className="h-4 w-4 mr-2" />}
            {t.aiCompetitiveAnalysis}
          </Button>
        }
      />

      <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
        <Card className="card-executive bg-gradient-to-br from-accent/5 to-transparent border-accent/20">
          <CardContent className="p-6 text-center">
            <Eye className="h-8 w-8 mx-auto mb-3 text-accent" />
            <div className="text-2xl font-bold">{competitiveMap.length}</div>
            <div className="text-sm text-muted-foreground">{t.marketsMonitored}</div>
          </CardContent>
        </Card>
        <Card className="card-executive bg-gradient-to-br from-success/5 to-transparent border-success/20">
          <CardContent className="p-6 text-center">
            <Target className="h-8 w-8 mx-auto mb-3 text-success" />
            <div className="text-2xl font-bold">{competitiveMap.reduce((sum, c) => sum + c.competitors.length, 0)}</div>
            <div className="text-sm text-muted-foreground">{t.competitorsIdentified}</div>
          </CardContent>
        </Card>
        <Card className="card-executive bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
          <CardContent className="p-6 text-center">
            <TrendingUp className="h-8 w-8 mx-auto mb-3 text-primary" />
            <div className="text-2xl font-bold">{marketTrends.filter(t => t.direction === "up").length}</div>
            <div className="text-sm text-muted-foreground">{t.bullishTrends}</div>
          </CardContent>
        </Card>
        <Card className="card-executive bg-gradient-to-br from-warning/5 to-transparent border-warning/20">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-8 w-8 mx-auto mb-3 text-warning" />
            <div className="text-2xl font-bold">{t.lowToModerate}</div>
            <div className="text-sm text-muted-foreground">{t.avgThreatLevel}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="card-executive">
        <CardHeader>
          <CardTitle className="flex items-center gap-3"><Sparkles className="h-5 w-5 text-accent" />{t.marketTrends}</CardTitle>
          <CardDescription>{t.marketTrendsDesc}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {marketTrends.map((trend) => (
              <div key={trend.trend} className="flex items-start gap-4 p-4 rounded-lg border hover:bg-muted/30 transition-colors">
                <div className="mt-1">
                  {trend.direction === "up" ? <TrendingUp className="h-5 w-5 text-success" /> : trend.direction === "down" ? <TrendingDown className="h-5 w-5 text-destructive" /> : <TrendingUp className="h-5 w-5 text-muted-foreground rotate-0" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-semibold">{trend.trend}</h3>
                    <Badge variant={trend.impact === "high" ? "destructive" : trend.impact === "medium" ? "default" : "subtle"}>
                      {impactLabels[trend.impact]}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{trend.summary}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="card-executive">
        <CardHeader>
          <CardTitle className="flex items-center gap-3"><Target className="h-5 w-5 text-accent" />{t.competitiveMap}</CardTitle>
          <CardDescription>{t.competitiveMapDesc}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {competitiveMap.map((entry) => (
              <div key={entry.platform} className="p-4 rounded-lg border hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">{entry.platform}</h3>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {entry.competitors.map((comp) => <Badge key={comp} variant="outline" className="text-xs">{comp}</Badge>)}
                    </div>
                  </div>
                  <Badge variant="outline" className={threatColors[entry.threat]}>
                    {t.threatLabel} : {threatLabels[entry.threat]}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">{t.advantageLabel} : </span>
                  {entry.advantage}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {lastAnalysis && (
        <Card className="card-executive border-accent/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-3"><Brain className="h-5 w-5 text-accent" />{t.aiAnalysisResult}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose dark:prose-invert max-w-none text-sm whitespace-pre-wrap">{lastAnalysis}</div>
          </CardContent>
        </Card>
      )}

      <Card className="card-executive">
        <CardHeader>
          <CardTitle className="flex items-center gap-3"><Globe className="h-5 w-5 text-accent" />{t.intelligenceSources}</CardTitle>
          <CardDescription>{t.intelligenceSourcesDesc}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {competitorSources.map((source) => (
              <a key={source.name} href={source.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/30 hover:border-accent/30 transition-all group">
                <Newspaper className="h-4 w-4 text-muted-foreground group-hover:text-accent" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{source.name}</p>
                  <p className="text-xs text-muted-foreground">{t.sourceCategories[source.categoryKey]}</p>
                </div>
                <ExternalLink className="h-3 w-3 text-muted-foreground group-hover:text-accent" />
              </a>
            ))}
          </div>
        </CardContent>
      </Card>

      <MethodologyDisclosure
        sources={[
          { name: "Agent CSO IA", type: "computed", reliability: "estimated", description: "Analyses concurrentielles" },
          { name: "Données curées", type: "manual", reliability: "estimated", description: "Tendances marché, concurrents" },
        ]}
        calculations={[
          { metric: "Niveau de menace", assumptions: ["Estimations qualitatives"], limitations: ["Analyse non automatisée en temps réel"] },
        ]}
      />
    </div>
  );
}
