import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Brain, 
  Eye, 
  ChevronDown, 
  ChevronUp,
  BookOpen,
  Link2,
  Cpu,
  Lightbulb,
  Shield,
  GitBranch,
  Search,
  Database
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AITransparencyPanelProps {
  runResult?: {
    executive_summary: string;
    model_used?: string;
    data_sources?: string[];
    steps?: string[];
  };
  className?: string;
}

// Documentation du AI Gateway
const AI_GATEWAY_DOCS = {
  title: "Lovable AI Gateway",
  description: "Routeur intelligent multi-modèles pour exécutions stratégiques",
  models: [
    {
      id: "google/gemini-2.5-pro",
      name: "Gemini 2.5 Pro",
      useCase: "Raisonnement stratégique, analyses complexes",
      strengths: ["Multi-modal", "Long contexte", "Raisonnement avancé"],
    },
    {
      id: "google/gemini-2.5-flash",
      name: "Gemini 2.5 Flash",
      useCase: "Synthèses rapides, résumés",
      strengths: ["Vitesse", "Coût optimisé", "Bonne qualité"],
    },
    {
      id: "openai/gpt-5.2",
      name: "GPT-5.2",
      useCase: "Code, analyses techniques",
      strengths: ["Précision", "Nuances", "Raisonnement"],
    },
  ],
  dataSources: [
    {
      id: "github",
      name: "GitHub API",
      icon: GitBranch,
      description: "Commits, PRs, issues des 5 dépôts",
    },
    {
      id: "perplexity",
      name: "Perplexity Sonar Pro",
      icon: Search,
      description: "Veille stratégique et recherche temps réel",
    },
    {
      id: "supabase",
      name: "Base de données HQ",
      icon: Database,
      description: "Métriques, configurations, historique",
    },
  ],
  principles: [
    {
      title: "Rigueur HEC/Polytechnique",
      description: "Toutes les analyses sont structurées, factuelles et prêtes pour la décision",
    },
    {
      title: "Preuves obligatoires",
      description: "Aucune conjecture - chaque recommandation est basée sur des données vérifiables",
    },
    {
      title: "Transparence totale",
      description: "Sources, modèles utilisés et limitations sont toujours documentés",
    },
    {
      title: "Sécurité par défaut",
      description: "Validation RLS, sanitization des inputs, audit trail complet",
    },
  ],
};

export function AITransparencyPanel({ runResult, className }: AITransparencyPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

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
                  <CardTitle className="text-base">Transparence IA</CardTitle>
                  <CardDescription>
                    Comment l'IA génère ses recommandations
                  </CardDescription>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8" aria-label={isExpanded ? "Réduire le panneau" : "Développer le panneau"}>
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CollapsibleTrigger>
        </CardHeader>

        <CollapsibleContent>
          <CardContent>
            <Tabs defaultValue="current" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="current">Run actuel</TabsTrigger>
                <TabsTrigger value="gateway">AI Gateway</TabsTrigger>
                <TabsTrigger value="principles">Principes</TabsTrigger>
              </TabsList>

              {/* Current Run Analysis */}
              <TabsContent value="current" className="space-y-4 pt-4">
                {runResult ? (
                  <>
                    {/* Model Used */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium flex items-center gap-2">
                        <Cpu className="h-4 w-4 text-muted-foreground" />
                        Modèle utilisé
                      </h4>
                      <Badge variant="subtle" className="font-mono">
                        {runResult.model_used || "Non spécifié"}
                      </Badge>
                    </div>

                    {/* Data Sources */}
                    {runResult.data_sources && runResult.data_sources.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium flex items-center gap-2">
                          <Link2 className="h-4 w-4 text-muted-foreground" />
                          Sources de données
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {runResult.data_sources.map((source, i) => (
                            <Badge key={i} variant="subtle" className="text-xs">
                              {source}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Steps */}
                    {runResult.steps && runResult.steps.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-muted-foreground" />
                          Étapes d'exécution
                        </h4>
                        <ol className="space-y-1 text-sm text-muted-foreground">
                          {runResult.steps.map((step, i) => (
                            <li key={i} className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center">
                                {i + 1}
                              </span>
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
                    <p className="text-sm">Aucun run sélectionné</p>
                    <p className="text-xs">
                      Lancez un Brief Exécutif pour voir les détails
                    </p>
                  </div>
                )}
              </TabsContent>

              {/* AI Gateway Documentation */}
              <TabsContent value="gateway" className="space-y-4 pt-4">
                <div className="p-3 rounded-lg bg-accent/5 border border-accent/20">
                  <h4 className="font-medium text-sm mb-1">{AI_GATEWAY_DOCS.title}</h4>
                  <p className="text-xs text-muted-foreground">
                    {AI_GATEWAY_DOCS.description}
                  </p>
                </div>

                {/* Models */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <Cpu className="h-4 w-4 text-muted-foreground" />
                    Modèles disponibles
                  </h4>
                  <div className="space-y-2">
                    {AI_GATEWAY_DOCS.models.map((model) => (
                      <div 
                        key={model.id}
                        className="p-3 rounded-lg bg-muted/30"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-sm">{model.name}</span>
                          <Badge variant="subtle" className="text-xs font-mono">
                            {model.id.split("/")[0]}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">
                          {model.useCase}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {model.strengths.map((s, i) => (
                            <Badge key={i} variant="subtle" className="text-xs">
                              {s}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Data Sources */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <Database className="h-4 w-4 text-muted-foreground" />
                    Sources de données
                  </h4>
                  <div className="space-y-2">
                    {AI_GATEWAY_DOCS.dataSources.map((source) => {
                      const Icon = source.icon;
                      return (
                        <div 
                          key={source.id}
                          className="flex items-start gap-3 p-2 rounded-lg bg-muted/30"
                        >
                          <Icon className="h-4 w-4 mt-0.5 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">{source.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {source.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </TabsContent>

              {/* Principles */}
              <TabsContent value="principles" className="space-y-4 pt-4">
                <div className="space-y-3">
                  {AI_GATEWAY_DOCS.principles.map((principle, i) => (
                    <div 
                      key={i}
                      className="p-3 rounded-lg bg-muted/30 border-l-2 border-accent"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {i === 0 && <BookOpen className="h-4 w-4 text-accent" />}
                        {i === 1 && <Lightbulb className="h-4 w-4 text-accent" />}
                        {i === 2 && <Eye className="h-4 w-4 text-accent" />}
                        {i === 3 && <Shield className="h-4 w-4 text-accent" />}
                        <h4 className="font-medium text-sm">{principle.title}</h4>
                      </div>
                      <p className="text-xs text-muted-foreground pl-6">
                        {principle.description}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="p-3 rounded-lg bg-success/5 border border-success/20">
                  <p className="text-xs text-success">
                    💡 Toutes les recommandations de l'IA incluent leurs sources et peuvent être vérifiées. 
                    En cas de données manquantes, l'IA déclare explicitement "Données non disponibles".
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
