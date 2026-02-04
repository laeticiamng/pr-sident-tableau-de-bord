import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Brain, 
  Globe, 
  GitBranch, 
  Loader2, 
  AlertCircle, 
  CheckCircle2,
  ExternalLink,
  FileText,
  BarChart3,
  Sparkles
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

interface PlatformAnalysisDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  platform: {
    key: string;
    name: string;
    liveUrl?: string;
    github?: string;
  } | null;
}

interface AnalysisResult {
  success: boolean;
  platform: {
    key: string;
    name: string;
    liveUrl: string;
    repo: string;
  };
  analyzed_at: string;
  website: {
    scraped: boolean;
    links_count: number;
    content_length: number;
    error?: string;
  };
  github: {
    stars: number;
    forks: number;
    languages: string[];
    issues_open: number;
    issues_closed: number;
    prs_open: number;
    prs_merged: number;
    last_push: string;
    recent_commits: Array<{
      sha: string;
      message: string;
      date: string;
      author: string;
    }>;
  };
  analysis: string;
  error?: string;
}

export function PlatformAnalysisDialog({ open, onOpenChange, platform }: PlatformAnalysisDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const runAnalysis = async () => {
    if (!platform) return;
    
    setIsLoading(true);
    setResult(null);
    
    try {
      const { data, error } = await supabase.functions.invoke("platform-analysis", {
        body: { platform_key: platform.key, analysis_type: "full" }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.success) {
        throw new Error(data.error || "Analyse échouée");
      }

      setResult(data);
      toast.success(`Analyse de ${platform.name} terminée`);
    } catch (error) {
      console.error("Analysis error:", error);
      toast.error(error instanceof Error ? error.message : "Erreur d'analyse");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setResult(null);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Analyse IA Complète
            {platform && (
              <Badge variant="outline" className="ml-2">{platform.name}</Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            Analyse automatisée combinant scraping du site web, données GitHub et intelligence artificielle.
          </DialogDescription>
        </DialogHeader>

        {!result && !isLoading && (
          <div className="flex flex-col items-center justify-center py-12 gap-6">
            <div className="flex items-center gap-4 text-muted-foreground">
              <div className="flex flex-col items-center gap-2">
                <Globe className="h-8 w-8" />
                <span className="text-sm">Site Web</span>
              </div>
              <span className="text-2xl">+</span>
              <div className="flex flex-col items-center gap-2">
                <GitBranch className="h-8 w-8" />
                <span className="text-sm">GitHub</span>
              </div>
              <span className="text-2xl">+</span>
              <div className="flex flex-col items-center gap-2">
                <Sparkles className="h-8 w-8" />
                <span className="text-sm">IA</span>
              </div>
            </div>
            
            <p className="text-center text-muted-foreground max-w-md">
              L'analyse va scraper le site <strong>{platform?.liveUrl}</strong>, 
              récupérer les données GitHub et générer un rapport complet via IA.
            </p>

            <Button onClick={runAnalysis} size="lg" className="mt-4">
              <Brain className="h-5 w-5 mr-2" />
              Lancer l'Analyse Complète
            </Button>
          </div>
        )}

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-lg font-medium">Analyse en cours...</p>
            <p className="text-sm text-muted-foreground">
              Scraping du site, récupération GitHub, génération du rapport IA
            </p>
          </div>
        )}

        {result && (
          <Tabs defaultValue="analysis" className="flex-1 min-h-0">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="analysis" className="gap-2">
                <FileText className="h-4 w-4" />
                Rapport IA
              </TabsTrigger>
              <TabsTrigger value="github" className="gap-2">
                <GitBranch className="h-4 w-4" />
                GitHub
              </TabsTrigger>
              <TabsTrigger value="website" className="gap-2">
                <Globe className="h-4 w-4" />
                Site Web
              </TabsTrigger>
            </TabsList>

            <ScrollArea className="flex-1 mt-4 pr-4" style={{ maxHeight: "calc(90vh - 280px)" }}>
              <TabsContent value="analysis" className="mt-0">
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown>{result.analysis}</ReactMarkdown>
                </div>
              </TabsContent>

              <TabsContent value="github" className="mt-0 space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 rounded-lg bg-muted/50 text-center">
                    <div className="text-2xl font-bold">{result.github.stars}</div>
                    <div className="text-xs text-muted-foreground">Stars</div>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50 text-center">
                    <div className="text-2xl font-bold">{result.github.forks}</div>
                    <div className="text-xs text-muted-foreground">Forks</div>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50 text-center">
                    <div className="text-2xl font-bold text-warning">{result.github.issues_open}</div>
                    <div className="text-xs text-muted-foreground">Issues Ouvertes</div>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50 text-center">
                    <div className="text-2xl font-bold text-success">{result.github.prs_merged}</div>
                    <div className="text-xs text-muted-foreground">PRs Mergées</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Langages
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {result.github.languages.map(lang => (
                      <Badge key={lang} variant="secondary">{lang}</Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Commits Récents</h4>
                  <div className="space-y-2">
                    {result.github.recent_commits?.map((commit) => (
                      <div key={commit.sha} className="flex items-start gap-3 p-2 rounded bg-muted/30">
                        <code className="text-xs text-primary">{commit.sha}</code>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm truncate">{commit.message}</p>
                          <p className="text-xs text-muted-foreground">{commit.author}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="website" className="mt-0 space-y-4">
                <div className="flex items-center gap-2">
                  {result.website.scraped ? (
                    <CheckCircle2 className="h-5 w-5 text-success" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-destructive" />
                  )}
                  <span className="font-medium">
                    {result.website.scraped ? "Scraping réussi" : "Scraping échoué"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-muted/50">
                    <div className="text-2xl font-bold">{result.website.links_count}</div>
                    <div className="text-xs text-muted-foreground">Liens trouvés</div>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <div className="text-2xl font-bold">
                      {Math.round(result.website.content_length / 1000)}K
                    </div>
                    <div className="text-xs text-muted-foreground">Caractères extraits</div>
                  </div>
                </div>

                {result.website.error && (
                  <div className="p-4 rounded-lg bg-destructive/10 text-destructive">
                    <p className="text-sm">{result.website.error}</p>
                  </div>
                )}

                <Button variant="outline" asChild className="w-full">
                  <a href={result.platform.liveUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Ouvrir le site
                  </a>
                </Button>
              </TabsContent>
            </ScrollArea>
          </Tabs>
        )}

        {result && (
          <div className="flex justify-between items-center pt-4 border-t mt-4">
            <p className="text-xs text-muted-foreground">
              Analysé le {new Date(result.analyzed_at).toLocaleString("fr-FR")}
            </p>
            <Button variant="outline" onClick={runAnalysis}>
              Relancer l'analyse
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
