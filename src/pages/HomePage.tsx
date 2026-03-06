import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  Sparkles,
  Brain,
  Activity,
  CheckCircle,
  Search,
  Building2
} from "lucide-react";
import { PlatformShowcase } from "@/components/home/PlatformShowcase";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { usePageMeta } from "@/hooks/usePageMeta";
import { cn } from "@/lib/utils";
import { MANAGED_PLATFORMS } from "@/lib/constants";
import { getHomePageSchemas } from "@/lib/geo-schemas";
import { useTranslation } from "@/contexts/LanguageContext";
import { homeTranslations } from "@/i18n/home";

const FEATURE_ICONS = [Brain, Activity, CheckCircle, Search];
const FEATURE_STYLES = [
  { color: "text-accent", bgColor: "bg-accent/10" },
  { color: "text-success", bgColor: "bg-success/10" },
  { color: "text-primary", bgColor: "bg-primary/10" },
  { color: "text-warning", bgColor: "bg-warning/10" },
];

function ScrollReveal({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const { ref, isVisible } = useScrollAnimation<HTMLDivElement>();
  return (
    <div ref={ref} className={cn("transition-all duration-700 ease-out", isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8", className)} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

export default function HomePage() {
  const geoSchemas = useMemo(() => getHomePageSchemas(), []);
  const t = useTranslation(homeTranslations);

  usePageMeta({
    title: t.hero.badge,
    description: t.hero.description,
    canonicalPath: "/",
    jsonLd: geoSchemas,
    ogImageAlt: "EMOTIONSCARE — " + t.hero.badge,
  });

  return (
    <div className="flex flex-col">
      {/* HERO */}
      <section aria-label="Presentation EMOTIONSCARE" className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-hero-gradient" aria-hidden="true" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(38_92%_50%/0.2),transparent)]" aria-hidden="true" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_80%_at_80%_50%,hsl(0_0%_100%/0.1),transparent)]" aria-hidden="true" />
        <div className="absolute inset-0 bg-[linear-gradient(hsl(0_0%_100%/0.05)_1px,transparent_1px),linear-gradient(90deg,hsl(0_0%_100%/0.05)_1px,transparent_1px)] bg-[size:60px_60px]" aria-hidden="true" />

        <div className="container relative z-10 py-16 md:py-24 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl text-center">
            <div className="mb-8 animate-fade-in flex flex-wrap items-center justify-center gap-3">
              <Badge variant="gold" className="px-4 py-2 text-sm font-medium tracking-wide">
                <Building2 className="w-4 h-4 mr-2" />
                {t.hero.badge}
              </Badge>
              <Badge variant="outline" className="px-3 py-1.5 text-xs font-medium text-white/80 border-white/20 backdrop-blur-sm">
                {t.hero.madeIn}
              </Badge>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-6 animate-slide-up">
              {t.hero.title}
            </h1>
            <p className="text-xl sm:text-2xl md:text-3xl text-white/90 mb-4 max-w-3xl mx-auto animate-slide-up font-light" style={{ animationDelay: "0.1s" }}>
              {t.hero.subtitle}
            </p>
            <p className="text-base sm:text-lg md:text-xl text-white/70 mb-10 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: "0.15s" }}>
              {t.hero.description}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <Link to="/plateformes" className="w-full sm:w-auto">
                <Button variant="hero" size="lg" className="group w-full min-w-[200px]">
                  {t.hero.cta}
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link to="/contact" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full min-w-[200px] border-white/30 text-white hover:bg-white/10 hover:text-white">
                  {t.hero.ctaContact}
                </Button>
              </Link>
            </div>

            <div className="hidden sm:block mt-20 animate-bounce">
              <div className="w-6 h-10 mx-auto border-2 border-white/30 rounded-full flex items-start justify-center p-1">
                <div className="w-1.5 h-3 bg-accent rounded-full animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-20 md:py-32 bg-background">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <ScrollReveal className="text-center mb-16">
              <p className="text-sm font-medium text-accent tracking-[0.2em] uppercase mb-4">{t.features.label}</p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold mb-6">
                {t.features.title} <span className="text-accent">{t.features.titleAccent}</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{t.features.subtitle}</p>
            </ScrollReveal>

            <div className="grid gap-6 md:grid-cols-2">
              {t.features.items.map((feature, index) => {
                const Icon = FEATURE_ICONS[index];
                const style = FEATURE_STYLES[index];
                return (
                  <ScrollReveal key={index} delay={index * 100}>
                    <Card className="group border-border/60 hover:border-accent/40 hover:shadow-lg transition-all duration-300 h-full">
                      <CardContent className="p-8">
                        <div className="flex items-start gap-5">
                          <div className={`p-3 rounded-xl ${style.bgColor} transition-transform group-hover:scale-110`}>
                            <Icon className={`h-6 w-6 ${style.color}`} />
                          </div>
                          <div>
                            <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                            <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </ScrollReveal>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <PlatformShowcase />

      {/* STATS */}
      <section className="py-16 md:py-24 bg-hero-gradient text-white">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 grid-cols-2 md:grid-cols-4 text-center">
            {[
              { value: `${MANAGED_PLATFORMS.length}`, label: t.stats.platforms },
              { value: `${(MANAGED_PLATFORMS.reduce((acc, p) => acc + p.stats.commits, 0) / 1000).toFixed(1)}K`, label: t.stats.evolutions },
              { value: "100%", label: t.stats.madeInFrance },
              { value: "24/7", label: t.stats.monitoring },
            ].map((stat, index) => (
              <ScrollReveal key={stat.label} delay={index * 100}>
                <div className="text-4xl md:text-5xl lg:text-6xl font-bold text-accent mb-2">{stat.value}</div>
                <div className="text-sm md:text-base text-white/70 tracking-wide">{stat.label}</div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-32 bg-background">
        <div className="container px-4 sm:px-6 lg:px-8">
          <ScrollReveal className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/10 text-accent mb-8">
              <Sparkles className="h-8 w-8" />
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold mb-6">{t.cta.title}</h2>
            <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto">{t.cta.subtitle}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/plateformes">
                <Button variant="executive" size="lg" className="group min-w-[240px]">
                  <span>{t.cta.button}</span>
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link to="/contact">
                <Button variant="outline" size="lg" className="min-w-[240px]">
                  {t.cta.contactButton}
                </Button>
              </Link>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">EMOTIONSCARE SASU — SIREN 944 505 445 — Amiens, France</p>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
