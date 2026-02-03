import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Key, CheckCircle, AlertTriangle, ExternalLink } from "lucide-react";

interface Secret {
  name: string;
  status: "configured" | "missing" | "connector";
  source?: string;
  lastRotated?: string;
}

const SECRETS_REGISTRY: Secret[] = [
  { name: "LOVABLE_API_KEY", status: "configured" },
  { name: "SUPABASE_URL", status: "configured" },
  { name: "SUPABASE_PUBLISHABLE_KEY", status: "configured" },
  { name: "SUPABASE_SERVICE_ROLE_KEY", status: "configured" },
  { name: "STRIPE_SECRET_KEY", status: "configured" },
  { name: "GITHUB_TOKEN", status: "configured" },
  { name: "PERPLEXITY_API_KEY", status: "connector", source: "Perplexity Connector" },
  { name: "FIRECRAWL_API_KEY", status: "connector", source: "Firecrawl Connector" },
];

export function SecretsRegistry() {
  const configuredCount = SECRETS_REGISTRY.filter(s => s.status !== "missing").length;
  const missingCount = SECRETS_REGISTRY.filter(s => s.status === "missing").length;

  return (
    <Card className="card-executive">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-3">
              <Key className="h-5 w-5 text-primary" />
              Registre des Secrets
            </CardTitle>
            <CardDescription>
              Les valeurs des secrets ne sont jamais affichées. Seuls les noms sont visibles.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="success">{configuredCount} configurés</Badge>
            {missingCount > 0 && (
              <Badge variant="destructive">{missingCount} manquants</Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 md:grid-cols-2">
          {SECRETS_REGISTRY.map((secret) => (
            <div 
              key={secret.name} 
              className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                secret.status === "missing" 
                  ? "border-destructive/30 bg-destructive/5" 
                  : "hover:bg-muted/30"
              }`}
            >
              {secret.status === "missing" ? (
                <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0" />
              ) : (
                <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <span className="font-mono text-sm truncate block">{secret.name}</span>
                {secret.source && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <ExternalLink className="h-3 w-3" />
                    {secret.source}
                  </span>
                )}
              </div>
              <Badge 
                variant={
                  secret.status === "configured" ? "success" : 
                  secret.status === "connector" ? "gold" : 
                  "destructive"
                }
                className="text-xs"
              >
                {secret.status === "configured" ? "Configuré" : 
                 secret.status === "connector" ? "Connector" : 
                 "Manquant"}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
