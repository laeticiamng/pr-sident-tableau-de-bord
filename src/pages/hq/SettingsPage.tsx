import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Settings,
  GitBranch,
  CreditCard,
  Search,
  Sparkles,
  Globe,
  CheckCircle,
  XCircle,
  RefreshCw,
  ExternalLink,
  Info,
  Loader2,
} from "lucide-react";
import { useApiStatus } from "@/hooks/useApiStatus";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const API_CONFIG = [
  {
    key: "github",
    name: "GitHub API",
    icon: GitBranch,
    description: "Synchronisation des commits, PRs, issues",
    envVar: "GITHUB_TOKEN",
    docsUrl: "https://github.com/settings/tokens",
  },
  {
    key: "stripe",
    name: "Stripe API",
    icon: CreditCard,
    description: "KPIs financiers et métriques de paiement",
    envVar: "STRIPE_SECRET_KEY",
    docsUrl: "https://dashboard.stripe.com/apikeys",
  },
  {
    key: "perplexity",
    name: "Perplexity AI",
    icon: Search,
    description: "Veille stratégique et recherche temps réel",
    envVar: "PERPLEXITY_API_KEY",
    docsUrl: "https://www.perplexity.ai/settings/api",
  },
  {
    key: "lovable_ai",
    name: "Lovable AI Gateway",
    icon: Sparkles,
    description: "Routeur IA multi-modèles pour les runs exécutifs",
    envVar: "LOVABLE_API_KEY",
    docsUrl: null, // Managed automatically
  },
  {
    key: "firecrawl",
    name: "Firecrawl API",
    icon: Globe,
    description: "Web scraping pour analyse concurrentielle",
    envVar: "FIRECRAWL_API_KEY",
    docsUrl: "https://firecrawl.dev/app/api-keys",
  },
];

export default function SettingsPage() {
  const { data: apiStatus, isLoading, isError, refetch, isFetching } = useApiStatus();

  const connectedCount = apiStatus
    ? Object.values(apiStatus.status).filter(Boolean).length
    : 0;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-primary/10">
            <Settings className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Paramètres</h1>
            <p className="text-muted-foreground">
              Configuration des intégrations et API
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          {isFetching ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Actualiser
        </Button>
      </div>

      {/* Status Summary */}
      <Card className="card-executive">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-accent" />
            Statut des Connexions
          </CardTitle>
          <CardDescription>
            {isLoading
              ? "Vérification en cours..."
              : isError
              ? "Erreur de vérification"
              : `${connectedCount}/${API_CONFIG.length} intégrations configurées`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {apiStatus && (
            <p className="text-xs text-muted-foreground">
              Dernière vérification : {new Date(apiStatus.checked_at).toLocaleString("fr-FR")}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Instructions Alert */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Comment configurer les clés API ?</AlertTitle>
        <AlertDescription className="mt-2">
          Les clés API sont stockées de manière sécurisée dans les secrets de Lovable Cloud.
          Pour ajouter ou modifier une clé :
          <ol className="list-decimal ml-4 mt-2 space-y-1 text-sm">
            <li>Ouvrez les paramètres du projet Lovable</li>
            <li>Accédez à <strong>Cloud &gt; Secrets</strong></li>
            <li>Ajoutez ou modifiez le secret correspondant</li>
          </ol>
        </AlertDescription>
      </Alert>

      {/* API Connections Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {API_CONFIG.map((api) => {
          const isConnected = apiStatus?.status?.[api.key as keyof typeof apiStatus.status];
          const Icon = api.icon;

          return (
            <Card key={api.key} className="card-executive">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`p-2.5 rounded-lg ${isConnected ? "bg-success/10" : "bg-muted"}`}>
                      <Icon className={`h-5 w-5 ${isConnected ? "text-success" : "text-muted-foreground"}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold">{api.name}</h3>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {api.description}
                      </p>
                      <p className="text-xs text-muted-foreground/60 font-mono mt-2">
                        {api.envVar}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {isLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    ) : isConnected ? (
                      <Badge variant="subtle" className="bg-success/10 text-success border-success/20">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Connecté
                      </Badge>
                    ) : (
                      <Badge variant="subtle" className="bg-destructive/10 text-destructive border-destructive/20">
                        <XCircle className="h-3 w-3 mr-1" />
                        Non configuré
                      </Badge>
                    )}
                    {api.docsUrl && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs h-7 px-2"
                        asChild
                      >
                        <a href={api.docsUrl} target="_blank" rel="noopener noreferrer">
                          Obtenir clé
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Separator />

      {/* Security Note */}
      <Card className="border-accent/30 bg-accent/5">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-lg bg-accent/10">
              <Info className="h-5 w-5 text-accent" />
            </div>
            <div>
              <h3 className="font-semibold text-accent">Sécurité des clés API</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Les clés API ne sont jamais exposées côté client. Seul le statut de connexion
                (connecté/non connecté) est vérifié via une edge function sécurisée.
                Les clés sont stockées de manière chiffrée dans Lovable Cloud et ne sont accessibles
                que par les edge functions côté serveur.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
