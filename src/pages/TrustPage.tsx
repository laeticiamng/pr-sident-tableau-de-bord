import { useMemo } from "react";
import { usePageMeta } from "@/hooks/usePageMeta";
import { Shield, Lock, Eye, Server, FileCheck, ExternalLink, CheckCircle2, Activity } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { getTrustPageSchemas } from "@/lib/geo-schemas";
import { useConsolidatedMetrics } from "@/hooks/usePlatformMonitor";
import { useTranslation } from "@/contexts/LanguageContext";
import { trustTranslations } from "@/i18n/trust";
import { useLanguage } from "@/contexts/LanguageContext";

const SECURITY_ICONS = [Lock, Shield, Server, Eye, FileCheck, Lock];

const complianceLinks = [
  "/legal/rgpd",
  "/legal/confidentialite",
  "/legal/cgv",
  "/legal/mentions",
];

export default function TrustPage() {
  const geoSchemas = useMemo(() => getTrustPageSchemas(), []);
  const t = useTranslation(trustTranslations);
  const { language } = useLanguage();

  usePageMeta({
    title: t.meta.title,
    description: t.meta.description,
    ogImageAlt: t.meta.title + " — EMOTIONSCARE",
    jsonLd: geoSchemas,
  });

  const { user } = useAuth();
  const { metrics, isLoading: metricsLoading } = useConsolidatedMetrics();

  const locale = language === 'de' ? 'de-DE' : language === 'en' ? 'en-GB' : 'fr-FR';
  const dynamicAuditDate = new Date().toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="py-16 sm:py-24">
        <div className="container px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 border border-success/20 mb-6">
            <CheckCircle2 className="h-4 w-4 text-success" />
            <span className="text-sm font-medium text-success">{t.hero.verifiedLabel} : {dynamicAuditDate}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4">{t.hero.title}</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{t.hero.subtitle}</p>
        </div>
      </section>

      {/* Security */}
      <section className="pb-16 sm:pb-24">
        <div className="container px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-center">{t.security.title}</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {t.security.items.map((measure, i) => {
              const Icon = SECURITY_ICONS[i];
              return (
                <Card key={i} className="card-executive">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10"><Icon className="h-5 w-5 text-primary" /></div>
                      <CardTitle className="text-base">{measure.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent><p className="text-sm text-muted-foreground leading-relaxed">{measure.description}</p></CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <Separator className="max-w-5xl mx-auto" />

      {/* Architecture */}
      <section className="py-16 sm:py-24">
        <div className="container px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-4 text-center">{t.architecture.title}</h2>
          <p className="text-muted-foreground text-center mb-8 max-w-2xl mx-auto">{t.architecture.subtitle}</p>

          {!metricsLoading && metrics.totalPlatforms > 0 && (
            <div className="flex justify-center mb-6">
              <div className="inline-flex items-center gap-3 px-5 py-3 rounded-lg bg-muted/30 border">
                <Activity className="h-5 w-5 text-success" />
                <div className="text-sm">
                  <span className="font-semibold">{metrics.uptimePercent.toFixed(0)}%</span>
                  <span className="text-muted-foreground ml-1">
                    {t.architecture.uptimeLabel} ({metrics.greenPlatforms}/{metrics.totalPlatforms} {t.architecture.uptimePlatforms})
                  </span>
                </div>
              </div>
            </div>
          )}

          <Card className="card-executive">
            <CardContent className="pt-6">
              <ul className="space-y-3">
                {t.architecture.points.map((point, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-success mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">{point}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Badge variant="outline" className="gap-2 px-4 py-2"><Shield className="h-3.5 w-3.5" />{t.architecture.owaspBadge}</Badge>
            <Link to={user ? "/hq/agents-monitoring" : "/auth"}>
              <Badge variant="outline" className="gap-2 px-4 py-2 cursor-pointer hover:bg-muted/50 transition-colors"><Activity className="h-3.5 w-3.5" />{t.architecture.monitoringBadge}</Badge>
            </Link>
            <Link to="/status">
              <Badge variant="outline" className="gap-2 px-4 py-2 cursor-pointer hover:bg-muted/50 transition-colors"><Server className="h-3.5 w-3.5" />{t.architecture.statusBadge}</Badge>
            </Link>
          </div>
        </div>
      </section>

      <Separator className="max-w-5xl mx-auto" />

      {/* Compliance */}
      <section className="py-16 sm:py-24">
        <div className="container px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold mb-4 text-center">{t.compliance.title}</h2>
          <p className="text-muted-foreground text-center mb-8 max-w-2xl mx-auto">{t.compliance.subtitle}</p>
          <div className="grid gap-4 sm:grid-cols-2">
            {t.compliance.items.map((item, i) => (
              <Card key={i} className="card-executive">
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
                  <Link to={complianceLinks[i]} className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
                    {item.linkLabel}<ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="pb-16 sm:pb-24">
        <div className="container px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto text-center">
          <Card className="card-executive bg-secondary/30">
            <CardContent className="pt-6 pb-6">
              <h3 className="font-semibold mb-2">{t.contactSection.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">{t.contactSection.subtitle}</p>
              <Link to="/contact" className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
                {t.contactSection.cta}<ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
