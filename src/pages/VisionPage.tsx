import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { usePageMeta } from "@/hooks/usePageMeta";
import { Target, Lightbulb, Heart, TrendingUp, Shield, Users, Award, Rocket, Layers } from "lucide-react";
import { AnimatedCounter } from "@/components/hq/AnimatedCounter";
import { MANAGED_PLATFORMS } from "@/lib/constants";
import { getVisionPageSchemas } from "@/lib/geo-schemas";
import { useTranslation } from "@/contexts/LanguageContext";
import { visionTranslations } from "@/i18n/vision";

const VALUE_ICONS = [Target, Lightbulb, Heart, TrendingUp];
const COMMITMENT_ICONS = [Shield, Users, Award, Rocket];

export default function VisionPage() {
  const geoSchemas = useMemo(() => getVisionPageSchemas(), []);
  const t = useTranslation(visionTranslations);

  usePageMeta({
    title: t.meta.title,
    description: t.meta.description,
    ogImageAlt: t.meta.title + " — EMOTIONSCARE",
    jsonLd: geoSchemas,
  });

  const testCount = MANAGED_PLATFORMS.reduce((s, p) => s + p.stats.tests, 0).toLocaleString("fr-FR");

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="py-20 md:py-28 bg-hero-gradient text-white">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center px-4">
            <Badge variant="gold" className="mb-6">{t.hero.badge}</Badge>
            <p className="text-sm font-medium text-accent tracking-[0.2em] uppercase mb-4">{t.hero.subtitle}</p>
            <h1 className="text-headline-1 md:text-display-2 mb-6 text-white">
              {t.hero.title1}
              <span className="block text-accent">{t.hero.title2}</span>
            </h1>
            <p className="text-lg md:text-xl text-white/90 font-medium leading-relaxed">{t.hero.description}</p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-headline-1 mb-4">{t.values.title}</h2>
            <p className="text-body-lg text-muted-foreground">{t.values.subtitle}</p>
          </div>
          <div className="grid gap-8 md:grid-cols-2">
            {t.values.items.map((value, index) => {
              const Icon = VALUE_ICONS[index];
              return (
                <div key={index} className="card-executive p-8 animate-fade-in hover:shadow-lg transition-all duration-300" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="flex items-start gap-6">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                      <Icon className="h-7 w-7" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                      <p className="text-muted-foreground">{value.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 md:py-24 bg-hero-gradient text-white">
        <div className="container">
          <div className="grid gap-8 grid-cols-2 md:grid-cols-4 text-center">
            {[
              { value: MANAGED_PLATFORMS.length, suffix: "", label: t.stats.platforms, icon: Layers },
              { value: 39, suffix: "", label: t.stats.aiAgents, icon: Rocket },
              { value: 100, suffix: "%", label: t.stats.madeInFrance, icon: Shield },
              { value: 24, suffix: "/7", label: t.stats.monitoring, icon: Award },
            ].map((stat, index) => (
              <div key={stat.label} className="p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <stat.icon className="w-6 h-6 text-accent mx-auto mb-3" />
                <div className="text-3xl md:text-4xl lg:text-5xl font-bold text-accent mb-1">
                  <AnimatedCounter value={stat.value} duration={1200} suffix={stat.suffix} />
                </div>
                <div className="text-sm text-white/70 tracking-wide">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 md:py-28 bg-secondary">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-headline-1 mb-8 text-foreground">{t.mission.title}</h2>
            <blockquote className="text-2xl md:text-3xl font-medium italic text-foreground leading-relaxed">{t.mission.quote}</blockquote>
            <p className="mt-6 text-base text-muted-foreground leading-relaxed max-w-xl mx-auto">{t.mission.description}</p>
            <p className="mt-4 text-accent font-medium">{t.mission.author}</p>
          </div>
        </div>
      </section>

      {/* Commitments */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-headline-1 mb-4">{t.commitments.title}</h2>
            <p className="text-body-lg text-muted-foreground">{t.commitments.subtitle}</p>
          </div>
          <div className="grid gap-6 md:grid-cols-4">
            {t.commitments.items.map((engagement, index) => {
              const Icon = COMMITMENT_ICONS[index];
              const stat = 'stat' in engagement ? engagement.stat : `${testCount}+`;
              return (
                <div key={index} className="text-center p-6 rounded-2xl border hover:border-accent/50 transition-all duration-300 animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="text-2xl font-bold text-accent mb-1">{stat}</div>
                  <h3 className="font-semibold mb-1">{engagement.title}</h3>
                  <p className="text-sm text-muted-foreground">{engagement.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 md:py-28 bg-secondary/50">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-headline-1 mb-4">{t.history.title}</h2>
            <p className="text-body-lg text-muted-foreground">{t.history.subtitle}</p>
          </div>
          <div className="mx-auto max-w-2xl">
            <div className="relative border-l-2 border-accent/30 pl-8 space-y-12">
              {t.history.items.map((item, index) => {
                const isLast = index === t.history.items.length - 1;
                return (
                  <div key={index} className="relative">
                    <div className={`absolute -left-[41px] h-4 w-4 rounded-full ${isLast ? "border-2 border-accent bg-background" : "bg-accent"}`} style={{ opacity: isLast ? 1 : 1 - index * 0.15 }} />
                    <div className={`text-sm font-medium ${isLast ? "text-muted-foreground" : "text-accent"} mb-2`}>{item.date}</div>
                    <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
