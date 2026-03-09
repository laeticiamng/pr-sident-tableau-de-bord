import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Brain, Eye, ChevronDown, ChevronUp, BookOpen, Link2, Cpu,
  Lightbulb, Shield, GitBranch, Search, Database
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/contexts/LanguageContext";
import { hqCommon } from "@/i18n/hq-common";

interface AITransparencyPanelProps {
  runResult?: {
    executive_summary: string;
    model_used?: string;
    data_sources?: string[];
    steps?: string[];
  };
  className?: string;
}

const AI_GATEWAY_MODELS = [
  { id: "google/gemini-2.5-pro", name: "Gemini 2.5 Pro", useCaseFr: "Raisonnement stratégique, analyses complexes", strengths: ["Multi-modal", "Long contexte", "Raisonnement avancé"] },
  { id: "google/gemini-2.5-flash", name: "Gemini 2.5 Flash", useCaseFr: "Synthèses rapides, résumés", strengths: ["Vitesse", "Coût optimisé", "Bonne qualité"] },
  { id: "openai/gpt-5.2", name: "GPT-5.2", useCaseFr: "Code, analyses techniques", strengths: ["Précision", "Nuances", "Raisonnement"] },
];

const AI_DATA_SOURCES = [
  { id: "github", name: "GitHub API", icon: GitBranch, descFr: "Commits, PRs, issues des 5 dépôts" },
  { id: "perplexity", name: "Perplexity Sonar Pro", icon: Search, descFr: "Veille stratégique et recherche temps réel" },
  { id: "supabase", name: "Base de données HQ", icon: Database, descFr: "Métriques, configurations, historique" },
];

export function AITransparencyPanel({ runResult, className }: AITransparencyPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const t = useTranslation(hqCommon);

  const principles = [
    { title: t.aiRigor, description: t.aiRigorDesc, icon: BookOpen },
    { title: t.aiEvidence, description: t.aiEvidenceDesc, icon: Lightbulb },
    { title: t.aiFullTransparency, description: t.aiFullTransparencyDesc, icon: Eye },
    { title: t.aiSecurityDefault, description: t.aiSecurityDefaultDesc, icon: Shield },
  ];

  return (
    <Card className={cn("card-executive", className)}>
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CardHeader className="pb-2">
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between cursor-pointer hover:opacity-80 transition-opacity">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-accent/10">
                  <Eye className="h-4 w-4 text-accent" />
                </div>
                <div>
                  <CardTitle className="text-base">{t.aiTransparency}</CardTitle>
                  <CardDescription>{t.aiTransparencyDesc}</CardDescription>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8" aria-label={isExpanded ? t.collapsePanel : t.expandPanel}>
                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>
          </CollapsibleTrigger>
        </CardHeader>

        <CollapsibleContent>
          <CardContent>
            <Tabs defaultValue="current" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="current" className="text-xs sm:text-sm">{t.aiCurrentRun}</TabsTrigger>
                <TabsTrigger value="gateway" className="text-xs sm:text-sm">{t.aiGateway}</TabsTrigger>
                <TabsTrigger value="principles" className="text-xs sm:text-sm">{t.aiPrinciples}</TabsTrigger>
              </TabsList>

              <TabsContent value="current" className="space-y-4 pt-4">
                {runResult ? (
                  <>
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium flex items-center gap-2">
                        <Cpu className="h-4 w-4 text-muted-foreground" />
                        {t.aiModelUsed}
                      </h4>
                      <Badge variant="subtle" className="font-mono">
                        {runResult.model_used || t.aiNotSpecified}
                      </Badge>
                    </div>

                    {runResult.data_sources && runResult.data_sources.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium flex items-center gap-2">
                          <Link2 className="h-4 w-4 text-muted-foreground" />
                          {t.aiDataSources}
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {runResult.data_sources.map((source, i) => (
                            <Badge key={i} variant="subtle" className="text-xs">{source}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {runResult.steps && runResult.steps.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-muted-foreground" />
                          {t.aiExecutionSteps}
                        </h4>
                        <ol className="space-y-1 text-sm text-muted-foreground">
                          {runResult.steps.map((step, i) => (
                            <li key={i} className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center">{i + 1}</span>
                              {step}
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <Brain className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">{t.aiNoRunSelected}</p>
                    <p className="text-xs">{t.aiLaunchBrief}</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="gateway" className="space-y-4 pt-4">
                <div className="p-3 rounded-lg bg-accent/5 border border-accent/20">
                  <h4 className="font-medium text-sm mb-1">{t.aiGatewayTitle}</h4>
                  <p className="text-xs text-muted-foreground">{t.aiGatewayDesc}</p>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <Cpu className="h-4 w-4 text-muted-foreground" />
                    {t.aiAvailableModels}
                  </h4>
                  <div className="space-y-2">
                    {AI_GATEWAY_MODELS.map((model) => (
                      <div key={model.id} className="p-3 rounded-lg bg-muted/30">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-sm">{model.name}</span>
                          <Badge variant="subtle" className="text-xs font-mono">{model.id.split("/")[0]}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">{model.useCaseFr}</p>
                        <div className="flex flex-wrap gap-1">
                          {model.strengths.map((s, i) => (
                            <Badge key={i} variant="subtle" className="text-xs">{s}</Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <Database className="h-4 w-4 text-muted-foreground" />
                    {t.aiDataSources}
                  </h4>
                  <div className="space-y-2">
                    {AI_DATA_SOURCES.map((source) => {
                      const Icon = source.icon;
                      return (
                        <div key={source.id} className="flex items-start gap-3 p-2 rounded-lg bg-muted/30">
                          <Icon className="h-4 w-4 mt-0.5 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">{source.name}</p>
                            <p className="text-xs text-muted-foreground">{source.descFr}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="principles" className="space-y-4 pt-4">
                <div className="space-y-3">
                  {principles.map((principle, i) => {
                    const Icon = principle.icon;
                    return (
                      <div key={i} className="p-3 rounded-lg bg-muted/30 border-l-2 border-accent">
                        <div className="flex items-center gap-2 mb-1">
                          <Icon className="h-4 w-4 text-accent" />
                          <h4 className="font-medium text-sm">{principle.title}</h4>
                        </div>
                        <p className="text-xs text-muted-foreground pl-6">{principle.description}</p>
                      </div>
                    );
                  })}
                </div>

                <div className="p-3 rounded-lg bg-success/5 border border-success/20">
                  <p className="text-xs text-success">{t.aiTransparencyNote}</p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
