import { useState } from "react";
import { MANAGED_PLATFORMS } from "@/lib/constants";
import { PLATFORM_ICONS, PLATFORM_ACCENTS, PLATFORM_BG_ACCENTS } from "@/lib/platformConfig";
import { usePageMeta } from "@/hooks/usePageMeta";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Activity, CheckCircle, AlertCircle, ExternalLink, Rocket, Clock, RefreshCw, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/contexts/LanguageContext";
import { statusTranslations } from "@/i18n/status";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePlatformMonitor, useRefreshPlatformMonitor } from "@/hooks/usePlatformMonitor";
import { useAuth } from "@/contexts/AuthContext";

const iconesPlateforme = PLATFORM_ICONS;
const couleursAccent = PLATFORM_ACCENTS;

export default function StatusPage() {
  const [derniereVerification, setDerniereVerification] = useState(new Date());
  const t = useTranslation(statusTranslations);
  const { language } = useLanguage();
  const { user } = useAuth();

  // Use real monitoring data when authenticated, fallback to static for public
  const { data: monitorData, isLoading: monitorLoading } = usePlatformMonitor();
  const refreshMonitor = useRefreshPlatformMonitor();

  const handleRefresh = () => {
    setDerniereVerification(new Date());
    if (user) {
      refreshMonitor.mutate(undefined);
    }
  };

  // Derive operational status from real monitoring data when available
  const toutOperationnel = monitorData
    ? monitorData.summary.overall_status === "green"
    : null; // null = unknown (public visitor, not authenticated)
  const incidentCount = monitorData
    ? monitorData.summary.platforms_red
    : null;

  const plateformesProduction = MANAGED_PLATFORMS.filter((p) => p.status === "production");
  const plateformesPrototype = MANAGED_PLATFORMS.filter((p) => p.status === "prototype");

  const locale = language === 'de' ? 'de-DE' : language === 'en' ? 'en-GB' : 'fr-FR';
  const dateLocale = language === 'de' ? 'de-DE' : language === 'en' ? 'en-GB' : 'fr-FR';

  const renderPlatformList = (platforms: readonly typeof MANAGED_PLATFORMS[number][], statusLabel: string, statusColor: string, indicatorClass: string, hoverBorder: string) => (
    <div className="space-y-3">
      {platforms.map((plateforme) => {
        const Icone = iconesPlateforme[plateforme.key] || Rocket;
        return (
          <Card key={plateforme.key} className={`group border-border/60 ${hoverBorder} transition-all duration-300`}>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-4">
                <div className={cn("w-3 h-3 rounded-full animate-pulse shrink-0", indicatorClass)} />
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-secondary/50 shrink-0">
                  <Icone className={cn("w-5 h-5", couleursAccent[plateforme.key])} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-sm sm:text-base">{plateforme.name}</h3>
                    <span className={cn("text-xs font-medium", statusColor)}>{statusLabel}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">{plateforme.shortDescription}</p>
                </div>
                <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground shrink-0">
                  <div className="text-center">
                    <div className="font-semibold text-foreground">{plateforme.stats.modules}</div>
                    <div className="text-xs">{t.labels.modules}</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-foreground">
                      {plateforme.stats.commits > 1000 ? `${(plateforme.stats.commits / 1000).toFixed(1)}K` : plateforme.stats.commits}
                    </div>
                    <div className="text-xs">{t.labels.commits}</div>
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-3 shrink-0">
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(plateforme.lastCommit).toLocaleDateString(dateLocale, { day: "numeric", month: "short" })}
                  </div>
                  <a href={plateforme.liveUrl} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg hover:bg-secondary transition-colors" title={`${t.labels.visit} ${plateforme.name}`}>
                    <ExternalLink className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                  </a>
                </div>
              </div>
              <div className="sm:hidden mt-3 flex items-center justify-between">
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {t.labels.lastUpdate} : {new Date(plateforme.lastCommit).toLocaleDateString(dateLocale)}
                </div>
                <a href={plateforme.liveUrl} target="_blank" rel="noopener noreferrer" className={cn("text-xs font-medium flex items-center gap-1", couleursAccent[plateforme.key])}>
                  {t.labels.visit}<ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

  return (
    <div className="flex flex-col animate-fade-in">
      {/* Hero */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-hero-gradient" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_-10%,hsl(var(--accent)/0.15),transparent)]" />
        <div className="container relative z-10 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="gold" className="mb-6"><Activity className="w-4 h-4 mr-2" />{t.hero.badge}</Badge>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white mb-6">
              {t.hero.title} <span className="text-accent">{t.hero.titleAccent}</span>
            </h1>
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
              <div className={cn("w-3 h-3 rounded-full animate-pulse", toutOperationnel === true ? "bg-status-green" : toutOperationnel === false ? "bg-status-red" : "bg-status-amber")} />
              <span className="text-white font-medium">
                {monitorLoading ? "Vérification..." : toutOperationnel === true ? t.hero.allOperational : toutOperationnel === false ? t.hero.someIssues : t.hero.publicFallback}
              </span>
            </div>
            <p className="mt-6 text-white/60 text-sm">
              {t.hero.lastCheck} : {derniereVerification.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </p>
          </div>
        </div>
      </section>

      {/* Summary */}
      <section className="py-8 bg-background border-b">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-status-green" /><span className="text-sm font-medium">{plateformesProduction.length} {t.summary.inProduction}</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-status-amber" /><span className="text-sm font-medium">{plateformesPrototype.length} {t.summary.prototypes}</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-status-red" /><span className="text-sm font-medium">{incidentCount ?? 0} {t.summary.incidents}</span></div>
            </div>
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshMonitor.isPending}>
              {refreshMonitor.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
              {t.summary.refresh}
            </Button>
          </div>
        </div>
      </section>

      {/* Production */}
      <section className="py-12 md:py-16 bg-background">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-xl sm:text-2xl font-semibold mb-6 flex items-center gap-3">
              <CheckCircle className="h-6 w-6 text-success" />
              {t.sections.production}
              <Badge variant="outline" className="text-xs">{plateformesProduction.length}</Badge>
            </h2>
            {renderPlatformList(plateformesProduction, t.status.operational, "text-success", "bg-status-green", "hover:border-success/30")}
          </div>
        </div>
      </section>

      {/* Prototypes */}
      <section className="py-12 md:py-16 bg-secondary/20">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-xl sm:text-2xl font-semibold mb-6 flex items-center gap-3">
              <AlertCircle className="h-6 w-6 text-warning" />
              {t.sections.prototypes}
              <Badge variant="outline" className="text-xs">{plateformesPrototype.length}</Badge>
            </h2>
            {renderPlatformList(plateformesPrototype, t.status.prototypeActive, "text-warning", "bg-status-amber", "hover:border-warning/30")}
          </div>
        </div>
      </section>

      {/* Legend */}
      <section className="py-12 md:py-16 bg-background">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-lg font-semibold mb-6">{t.legend.title}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {t.legend.items.map((item) => (
                <div key={item.color} className="flex items-center gap-3 p-4 rounded-xl bg-secondary/30 border border-border/50">
                  <div className={`w-3 h-3 rounded-full bg-status-${item.color}`} />
                  <div>
                    <div className="text-sm font-medium">{item.label}</div>
                    <div className="text-xs text-muted-foreground">{item.description}</div>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-8 text-center text-xs text-muted-foreground">
              EMOTIONSCARE SASU — SIREN 944 505 445 — Amiens, France
              <br />{t.legend.updateNote}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
