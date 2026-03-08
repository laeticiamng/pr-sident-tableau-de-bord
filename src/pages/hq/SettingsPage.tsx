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
import { ExecutiveHeader } from "@/components/hq/ExecutiveDataSource";
import { PushNotificationSettings } from "@/components/hq/PushNotificationSettings";
import { useTranslation } from "@/contexts/LanguageContext";
import { settingsTranslations } from "@/i18n/settings";

const API_KEYS: Array<{
  key: string;
  icon: typeof GitBranch;
  envVar: string;
  docsUrl: string | null;
  i18nKey: "github" | "stripe" | "perplexity" | "lovable_ai" | "firecrawl";
}> = [
  { key: "github", icon: GitBranch, envVar: "GITHUB_TOKEN", docsUrl: "https://github.com/settings/tokens", i18nKey: "github" },
  { key: "stripe", icon: CreditCard, envVar: "STRIPE_SECRET_KEY", docsUrl: "https://dashboard.stripe.com/apikeys", i18nKey: "stripe" },
  { key: "perplexity", icon: Search, envVar: "PERPLEXITY_API_KEY", docsUrl: "https://www.perplexity.ai/settings/api", i18nKey: "perplexity" },
  { key: "lovable_ai", icon: Sparkles, envVar: "LOVABLE_API_KEY", docsUrl: null, i18nKey: "lovable_ai" },
  { key: "firecrawl", icon: Globe, envVar: "FIRECRAWL_API_KEY", docsUrl: "https://firecrawl.dev/app/api-keys", i18nKey: "firecrawl" },
];

export default function SettingsPage() {
  const { data: apiStatus, isLoading, isError, refetch, isFetching } = useApiStatus();
  const t = useTranslation(settingsTranslations);

  const connectedCount = apiStatus
    ? Object.values(apiStatus.status).filter(Boolean).length
    : 0;

  return (
    <div className="space-y-8 animate-fade-in">
      <ExecutiveHeader
        title={t.title}
        subtitle={t.subtitle}
        source={{ source: "supabase", lastUpdated: new Date(), confidence: "high" }}
        actions={
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
            {isFetching ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            {t.refresh}
          </Button>
        }
      />

      {/* Status Summary */}
      <Card className="card-executive">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-accent" />
            {t.connectionStatus}
          </CardTitle>
          <CardDescription>
            {isLoading ? t.checking : isError ? t.checkError : t.integrationsConfigured(connectedCount, API_KEYS.length)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {apiStatus && (
            <p className="text-xs text-muted-foreground">
              {t.lastCheck} : {new Date(apiStatus.checked_at).toLocaleString()}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Instructions Alert */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>{t.howTo.title}</AlertTitle>
        <AlertDescription className="mt-2">
          {t.howTo.description}
          <ol className="list-decimal ml-4 mt-2 space-y-1 text-sm">
            <li>{t.howTo.step1}</li>
            <li>{t.howTo.step2} <strong>{t.howTo.step2bold}</strong></li>
            <li>{t.howTo.step3}</li>
          </ol>
        </AlertDescription>
      </Alert>

      {/* API Connections Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {API_KEYS.map((api) => {
          const isConnected = apiStatus?.status?.[api.key as keyof typeof apiStatus.status];
          const Icon = api.icon;
          const apiT = t.apis[api.i18nKey];

          return (
            <Card key={api.key} className="card-executive">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`p-2.5 rounded-lg ${isConnected ? "bg-success/10" : "bg-muted"}`}>
                      <Icon className={`h-5 w-5 ${isConnected ? "text-success" : "text-muted-foreground"}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold">{apiT.name}</h3>
                      <p className="text-sm text-muted-foreground mt-0.5">{apiT.description}</p>
                      <p className="text-xs text-muted-foreground/60 font-mono mt-2">{api.envVar}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {isLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    ) : isConnected ? (
                      <Badge variant="subtle" className="bg-success/10 text-success border-success/20">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        {t.connected}
                      </Badge>
                    ) : (
                      <Badge variant="subtle" className="bg-destructive/10 text-destructive border-destructive/20">
                        <XCircle className="h-3 w-3 mr-1" />
                        {t.notConfigured}
                      </Badge>
                    )}
                    {api.docsUrl && (
                      <Button variant="ghost" size="sm" className="text-xs h-7 px-2" asChild>
                        <a href={api.docsUrl} target="_blank" rel="noopener noreferrer">
                          {t.getKey}
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

      {/* Push Notifications */}
      <PushNotificationSettings />

      <Separator />

      {/* Security Note */}
      <Card className="border-accent/30 bg-accent/5">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-lg bg-accent/10">
              <Info className="h-5 w-5 text-accent" />
            </div>
            <div>
              <h3 className="font-semibold text-accent">{t.security.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{t.security.text}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
