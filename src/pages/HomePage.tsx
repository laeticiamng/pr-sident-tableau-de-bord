import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  Sparkles,
  Building2,
  Heart,
  GraduationCap,
  Plane,
  Rocket,
  Shield,
  Lock,
  Flag,
  FileCheck,
  Layers,
  Compass,
  Lightbulb,
  Target,
  Award,
} from "lucide-react";
import { PlatformShowcase } from "@/components/home/PlatformShowcase";
import { HowItWorks } from "@/components/home/HowItWorks";
import { HomeFAQ } from "@/components/home/HomeFAQ";
import { HomeArchitecture } from "@/components/home/HomeArchitecture";
import { HeroVerifiedSlot } from "@/components/HeroVerifiedSlot";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { usePageMeta } from "@/hooks/usePageMeta";
import { cn } from "@/lib/utils";
import { MANAGED_PLATFORMS } from "@/lib/constants";
import { getPlatformConfig } from "@/lib/platformConfig";
import { getHomePageSchemas } from "@/lib/geo-schemas";
import { useTranslation } from "@/contexts/LanguageContext";
import { homeTranslations } from "@/i18n/home";
import heroAmbientVideo from "@/assets/videos/hero-ambient-45s.mp4";
import dataAmbientVideo from "@/assets/videos/data-ambient-45s.mp4";

import { forwardRef } from "react";

const ScrollReveal = forwardRef<HTMLDivElement, { children: React.ReactNode; className?: string; delay?: number }>(
  function ScrollReveal({ children, className, delay = 0 }, _fwdRef) {
    const { ref, isVisible } = useScrollAnimation<HTMLDivElement>();
    return (
      <div ref={ref} className={cn("transition-all duration-700 ease-out", isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8", className)} style={{ transitionDelay: `${delay}ms` }}>
        {children}
      </div>
    );
  }
);

const audienceMap = [
  { key: "caregiver" as const, href: "/plateformes?audience=soignant", icon: Heart },
  { key: "student" as const, href: "/plateformes?audience=etudiant", icon: GraduationCap },
  { key: "expat" as const, href: "/plateformes?audience=expatrie", icon: Plane },
  { key: "entrepreneur" as const, href: "/plateformes?audience=entrepreneur", icon: Rocket },
] as const;

export default function HomePage() {
  const geoSchemas = useMemo(() => getHomePageSchemas(), []);
  const t = useTranslation(homeTranslations);

  usePageMeta({
    title: t.hero.badge,
    description: t.hero.subtitle,
    canonicalPath: "/",
    jsonLd: geoSchemas,
    ogImageAlt: "EMOTIONSCARE — " + t.hero.badge,
  });

  const productionCount = MANAGED_PLATFORMS.filter(p => p.status === "production").length;

  return (
    <div className="flex flex-col">
      {/* HERO */}
      <section aria-label={t.hero.ariaLabel} className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        <video
          className="absolute inset-0 h-full w-full object-cover opacity-30"
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          aria-hidden="true"
        >
          <source src={heroAmbientVideo} type="video/mp4" />
        </video>
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
            <p className="text-xl sm:text-2xl md:text-3xl text-white/90 mb-10 max-w-3xl mx-auto animate-slide-up font-light" style={{ animationDelay: "0.1s" }}>
              {t.hero.subtitle}
            </p>
            <HeroVerifiedSlot tone="dark" />

            {/* Audience segmentation cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: "0.15s" }}>
              {audienceMap.map((audience) => {
                const Icon = audience.icon;
                return (
                  <Link key={audience.key} to={audience.href}>
                    <Card className="group border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 hover:border-accent/40 transition-all duration-300 cursor-pointer h-full">
                      <CardContent className="p-4 sm:p-5 text-center">
                        <div className="mx-auto mb-3 p-2.5 rounded-xl bg-white/10 w-fit transition-transform group-hover:scale-110">
                          <Icon className="h-5 w-5 text-accent" />
                        </div>
                        <h3 className="text-sm sm:text-base font-semibold text-white mb-1">
                          {t.hero.audiences[audience.key].label}
                        </h3>
                        <p className="text-[11px] sm:text-xs text-white/60 leading-relaxed">
                          {t.hero.audiences[audience.key].description}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <Link to="/plateformes" className="w-full sm:w-auto">
                <Button variant="hero" size="lg" className="group w-full min-w-[200px]">
                  {t.hero.cta}
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link to="/contact" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full min-w-[200px] bg-transparent border-white/30 text-white hover:bg-white/10 hover:text-white">
                  {t.hero.ctaContact}
                </Button>
              </Link>
            </div>
            <p className="mt-5 text-sm text-white/50 animate-slide-up" style={{ animationDelay: "0.3s" }}>
              {t.hero.socialProof}
            </p>
          </div>
        </div>
      </section>

      {/* FEATURES — driven by MANAGED_PLATFORMS, no parallel arrays */}
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

            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              {t.features.items.slice(0, 4).map((feature, index) => {
                const platformKey = MANAGED_PLATFORMS[index]?.key;
                const cfg = getPlatformConfig(platformKey ?? "");
                const Icon = cfg.icon;
                return (
                  <ScrollReveal key={index} delay={index * 75}>
                    <Card className="group border-border/60 hover:border-accent/40 hover:shadow-lg transition-all duration-300 h-full">
                      <CardContent className="p-5 sm:p-6">
                        <div className="flex flex-col gap-3">
                          <div className={`p-2.5 rounded-xl ${cfg.featureBg} w-fit transition-transform group-hover:scale-110`}>
                            <Icon className={`h-5 w-5 ${cfg.featureColor}`} />
                          </div>
                          <div>
                            <h3 className="text-base font-semibold mb-1.5">{feature.title}</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </ScrollReveal>
                );
              })}
            </div>

            <div className="mt-8 text-center">
              <Link to="/plateformes">
                <Button variant="outline" size="default" className="group">
                  {t.features.viewAll}
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <HowItWorks />

      {/* CTA vers la section Studio */}
      <div className="container px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8 mb-10 sm:mb-12 flex justify-center">
        <Button
          variant="hero"
          size="lg"
          className="group w-full sm:w-auto min-w-[260px]"
          onClick={() => {
            const el = document.getElementById("emotionsphere-studio");
            if (el) {
              el.scrollIntoView({ behavior: "smooth", block: "start" });
              window.history.replaceState(null, "", "#emotionsphere-studio");
            }
          }}
        >
          Découvrir EmotionSphere Studio
          <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
        </Button>
      </div>

      {/* EMOTIONSPHERE STUDIO — Studio d'architecture stratégique */}
      <section
        id="emotionsphere-studio"
        aria-label="EmotionSphere Studio"
        className="relative overflow-hidden scroll-mt-24 py-16 sm:py-20 md:py-28 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white"
      >
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,hsl(var(--accent)/0.18),transparent_70%)]"
          aria-hidden="true"
        />
        <div className="absolute -top-20 -right-16 h-64 w-64 rounded-full bg-accent/15 blur-3xl" aria-hidden="true" />
        <div className="absolute -bottom-20 -left-16 h-64 w-64 rounded-full bg-primary/15 blur-3xl" aria-hidden="true" />

        <div className="container relative z-10 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <ScrollReveal className="text-center mb-14">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm px-4 py-1.5 text-[11px] uppercase tracking-[0.2em] mb-6 border border-white/10">
                <Sparkles className="h-3 w-3 text-accent" />
                EmotionSphere Studio
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold mb-6 max-w-4xl mx-auto leading-tight">
                Studio d'architecture stratégique
                <span className="block text-accent">pour projets complexes</span>
              </h2>
              <p className="text-lg text-white/70 max-w-3xl mx-auto leading-relaxed">
                Du problème au projet. De la vision au blueprint. Du blueprint à la valeur.
                EmotionSphere Studio transforme les problématiques complexes — appels à projets, AMI, défis d'innovation — en projets crédibles, finançables et activables.
              </p>
            </ScrollReveal>

            <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-12">
              {[
                { icon: Lightbulb, title: "Détecter", description: "Veille active sur appels à projets, AMI et appels d'offres alignés à votre stratégie." },
                { icon: Compass, title: "Concevoir", description: "Un Blueprint 360° en 12 sections : problème, solution, modèle, partenaires, KPI, risques." },
                { icon: Target, title: "Activer", description: "Pitch, dossier de conviction, partenaires opérationnels et financeurs identifiés." },
                { icon: Award, title: "Valoriser", description: "Advisory, equity, success fee : un deal ajusté à votre rôle d'architecte stratégique." },
              ].map((step, index) => (
                <ScrollReveal key={step.title} delay={index * 80}>
                  <Card className="group h-full border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 hover:border-accent/40 transition-all duration-300">
                    <CardContent className="p-5 sm:p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-2.5 rounded-xl bg-accent/15 text-accent w-fit transition-transform group-hover:scale-110">
                          <step.icon className="h-5 w-5" />
                        </div>
                        <span className="text-2xl font-bold text-white/15 tabular-nums" aria-hidden="true">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                      </div>
                      <h3 className="text-base font-semibold text-white mb-2">{step.title}</h3>
                      <p className="text-sm text-white/65 leading-relaxed">{step.description}</p>
                    </CardContent>
                  </Card>
                </ScrollReveal>
              ))}
            </div>

            <ScrollReveal delay={350} className="text-center">
              <p className="text-sm text-white/60 italic max-w-2xl mx-auto mb-8">
                « EmotionSphere Studio ne donne pas des idées. Il transforme des problèmes complexes
                en projets activables, finançables et stratégiquement différenciants. »
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/studio" className="w-full sm:w-auto">
                  <Button variant="hero" size="lg" className="group w-full min-w-[240px]">
                    Découvrir le Studio
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Link to="/studio#soumettre" className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full min-w-[240px] bg-transparent border-white/30 text-white hover:bg-white/10 hover:text-white"
                  >
                    Soumettre une opportunité
                  </Button>
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <HomeArchitecture />

      <PlatformShowcase />

      <HomeFAQ />

      {/* CREDIBILITY BADGES — Premium */}
      <section className="py-12 md:py-16 bg-secondary/30 border-y border-border/50">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4">
              {[
                { icon: Flag, label: t.credibility.madeInFrance, color: "text-accent", bg: "bg-accent/10" },
                { icon: Shield, label: t.credibility.rgpd, color: "text-success", bg: "bg-success/10" },
                { icon: Lock, label: t.credibility.encryption, color: "text-success", bg: "bg-success/10" },
                { icon: FileCheck, label: t.credibility.siren, color: "text-primary", bg: "bg-primary/10" },
                { icon: Layers, label: t.credibility.platformsInProduction.replace("{count}", String(productionCount)), color: "text-accent", bg: "bg-accent/10" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex flex-col sm:flex-row items-center sm:items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl bg-background/60 backdrop-blur-sm border border-border/40 hover:border-accent/30 hover:shadow-md transition-all duration-300"
                >
                  <div className={cn("p-2 rounded-lg shrink-0", item.bg)}>
                    <item.icon className={cn("h-4 w-4 sm:h-5 sm:w-5", item.color)} />
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-foreground/90 text-center sm:text-left leading-tight">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="relative overflow-hidden py-16 md:py-24 bg-hero-gradient text-white">
        <video
          className="absolute inset-0 h-full w-full object-cover opacity-25"
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          aria-hidden="true"
        >
          <source src={dataAmbientVideo} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-hero-gradient/70" aria-hidden="true" />
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="relative z-10 grid gap-8 grid-cols-2 md:grid-cols-4 text-center">
            {[
              { value: `${productionCount}`, label: t.stats.platforms },
              { value: `${MANAGED_PLATFORMS.reduce((acc, p) => acc + p.stats.modules, 0)}`, label: t.stats.evolutions },
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
              <Link to="/plateformes" className="w-full sm:w-auto">
                <Button variant="executive" size="lg" className="group w-full min-w-[240px]">
                  <span>{t.cta.button}</span>
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link to="/contact" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full min-w-[240px]">
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
