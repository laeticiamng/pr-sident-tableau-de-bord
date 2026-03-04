import { useState, useMemo } from "react";
import { MANAGED_PLATFORMS } from "@/lib/constants";
import { PLATFORM_ICONS, PLATFORM_ACCENTS, PLATFORM_BG_ACCENTS, PLATFORM_GRADIENTS, PLATFORM_BORDERS } from "@/lib/platformConfig";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Database,
  Cpu,
  GitBranch,
  GitCommit,
  Sparkles,
  Layers,
  TestTube2,
  Calendar,
  ArrowRight,
  Rocket,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { usePageMeta } from "@/hooks/usePageMeta";
import { getPlateformesPageSchemas } from "@/lib/geo-schemas";
import { useTranslation } from "@/contexts/LanguageContext";
import { platformsTranslations } from "@/i18n/platforms";
import { useLanguage } from "@/contexts/LanguageContext";

const platformIcons = PLATFORM_ICONS;
const platformAccents = PLATFORM_ACCENTS;
const platformBgAccents = PLATFORM_BG_ACCENTS;
const platformGradients = PLATFORM_GRADIENTS;
const platformBorders = PLATFORM_BORDERS;

export default function PlateformesPage() {
  const [hoveredPlatform, setHoveredPlatform] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | "production" | "prototype">("all");
  const t = useTranslation(platformsTranslations);
  const { language } = useLanguage();

  const geoSchemas = useMemo(() => getPlateformesPageSchemas(), []);

  usePageMeta({
    title: t.hero.title + " " + t.hero.titleAccent,
    description: t.hero.subtitle,
    ogImageAlt: "EMOTIONSCARE — " + t.hero.badge,
    jsonLd: geoSchemas,
  });

  const statusIcons = {
    production: { icon: CheckCircle, color: "text-success", bg: "bg-success" },
    prototype: { icon: AlertCircle, color: "text-warning", bg: "bg-warning" },
    development: { icon: Sparkles, color: "text-muted-foreground", bg: "bg-muted-foreground" },
  };

  const allPlatforms = MANAGED_PLATFORMS;
  const platforms = statusFilter === "all"
    ? allPlatforms
    : allPlatforms.filter(p => p.status === statusFilter);

  const prodCount = allPlatforms.filter(p => p.status === "production").length;
  const protoCount = allPlatforms.filter(p => p.status === "prototype").length;

  const totals = (platforms as readonly typeof MANAGED_PLATFORMS[number][]).reduce(
    (acc, p) => ({
      modules: acc.modules + (p.stats.modules || 0),
      tables: acc.tables + (p.stats.tables || 0),
      functions: acc.functions + (p.stats.edgeFunctions || 0),
      branches: acc.branches + (p.stats.branches || 0),
      commits: acc.commits + (p.stats.commits || 0),
      tests: acc.tests + (p.stats.tests || 0),
    }),
    { modules: 0, tables: 0, functions: 0, branches: 0, commits: 0, tests: 0 }
  );

  const formatNumber = (num: number) => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  const dateLocale = language === "de" ? "de-DE" : language === "en" ? "en-GB" : "fr-FR";

  return (
    <div className="flex flex-col animate-fade-in">
      {/* HERO */}
      <section className="relative py-32 md:py-40 overflow-hidden">
        <div className="absolute inset-0 bg-hero-gradient" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_-10%,hsl(var(--accent)/0.2),transparent)]" />
        <div className="absolute top-1/3 left-1/4 w-[600px] h-[600px] bg-platform-health/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-platform-compass/10 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[linear-gradient(hsl(0_0%_100%/0.05)_1px,transparent_1px),linear-gradient(90deg,hsl(0_0%_100%/0.05)_1px,transparent_1px)] bg-[size:80px_80px]" />

        <div className="container relative z-10 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <Badge variant="gold" className="mb-8">
              <Layers className="w-4 h-4 mr-2" />
              {t.hero.badge}
            </Badge>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-6 leading-[0.95]">
              {t.hero.title} <span className="text-accent">{t.hero.titleAccent}</span>
            </h1>
            
            <p className="text-lg sm:text-xl md:text-2xl text-white/80 max-w-2xl mx-auto mb-12 leading-relaxed">
              {t.hero.subtitle}
            </p>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 max-w-4xl mx-auto">
              {[
                { value: "7", label: t.stats.platforms },
                { value: formatNumber(totals.commits), label: t.stats.evolutions },
                { value: formatNumber(totals.tests), label: t.stats.tests },
                { value: `${totals.tables}`, label: t.stats.structures },
                { value: `${totals.functions}`, label: t.stats.integrations },
              ].map((stat, i) => (
                <div 
                  key={stat.label}
                  className="p-5 md:p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 animate-fade-in transition-all duration-300 hover:-translate-y-1 hover:bg-white/10 hover:border-accent/30"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-accent mb-1">
                    {stat.value}
                  </div>
                  <div className="text-xs md:text-sm text-white/70">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce hidden sm:block">
          <div className="w-6 h-10 border-2 border-primary-foreground/30 rounded-full flex items-start justify-center p-1">
            <div className="w-1.5 h-3 bg-accent rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* STATUS FILTER */}
      <section className="py-6 bg-background border-b">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button
              variant={statusFilter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("all")}
              className="gap-2"
            >
              <Layers className="h-4 w-4" />
              {t.filter.all} ({allPlatforms.length})
            </Button>
            <Button
              variant={statusFilter === "production" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("production")}
              className="gap-2"
            >
              <CheckCircle className="h-4 w-4 text-success" />
              {t.filter.production} ({prodCount})
            </Button>
            <Button
              variant={statusFilter === "prototype" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("prototype")}
              className="gap-2"
            >
              <AlertCircle className="h-4 w-4 text-warning" />
              {t.filter.prototype} ({protoCount})
            </Button>
          </div>
        </div>
      </section>

      {/* PLATFORMS SHOWCASE */}
      <section className="py-20 md:py-32 bg-background">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="space-y-12 md:space-y-20">
            {platforms.map((platform, index) => {
              const Icon = platformIcons[platform.key] || Rocket;
              const statusKey = platform.status as keyof typeof statusIcons;
              const sIcon = statusIcons[statusKey] || statusIcons.development;
              const StatusIcon = sIcon.icon;
              const isHovered = hoveredPlatform === platform.key;
              const isEven = index % 2 === 0;

              return (
                <div
                  key={platform.key}
                  className={cn(
                    "group relative rounded-2xl md:rounded-3xl border bg-card overflow-hidden transition-all duration-700",
                    "hover:shadow-2xl animate-fade-in",
                    platformBorders[platform.key]
                  )}
                  style={{ animationDelay: `${index * 0.1}s` }}
                  onMouseEnter={() => setHoveredPlatform(platform.key)}
                  onMouseLeave={() => setHoveredPlatform(null)}
                >
                  <div className={cn(
                    "absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-700",
                    platformGradients[platform.key],
                    isHovered && "opacity-100"
                  )} />

                  <div className={cn(
                    "absolute opacity-[0.03] transition-opacity duration-500 group-hover:opacity-[0.08]",
                    isEven ? "-right-16 -bottom-16" : "-left-16 -bottom-16"
                  )}>
                    <Icon className="w-[300px] h-[300px] md:w-[400px] md:h-[400px]" />
                  </div>

                  <div className={cn(
                    "relative grid md:grid-cols-2 gap-6 lg:gap-12 p-6 md:p-10 lg:p-14 items-center"
                  )}>
                    <div className={cn(!isEven && "md:order-2")}>
                      <div className="flex flex-wrap items-center gap-3 mb-5">
                        <div className="flex items-center gap-2">
                          <div className={cn("w-2.5 h-2.5 rounded-full animate-pulse", sIcon.bg)} />
                          <span className={cn("text-xs font-semibold uppercase tracking-wider", sIcon.color)}>
                            {t.status[statusKey] || statusKey}
                          </span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {platform.stats.modules} {t.labels.modules}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-4 mb-4">
                        <div className={cn(
                          "w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center transition-all duration-300",
                          "bg-secondary/50 group-hover:scale-110",
                          isHovered && "shadow-lg"
                        )}>
                          <Icon className={cn("w-6 h-6 md:w-7 md:h-7", platformAccents[platform.key])} />
                        </div>
                        <h2 className={cn(
                          "text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold transition-colors duration-300",
                          isHovered && platformAccents[platform.key]
                        )}>
                          {platform.name}
                        </h2>
                      </div>

                      <p className={cn("text-base md:text-lg font-medium mb-3", platformAccents[platform.key])}>
                        "{platform.tagline}"
                      </p>

                      <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-5">
                        {platform.description}
                      </p>

                      <div className="flex flex-wrap gap-2 mb-6">
                        {platform.features.map((feature) => (
                          <span 
                            key={feature}
                            className="px-2.5 py-1 text-xs font-medium bg-secondary/80 rounded-full border border-border/50 transition-colors duration-300 hover:border-accent/30"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <Button 
                          size="default"
                          className={cn("group/btn", platformBgAccents[platform.key], "hover:opacity-90 text-white")}
                          asChild
                        >
                          <a href={platform.liveUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            {t.labels.visitSite}
                          </a>
                        </Button>
                      </div>
                    </div>

                    <div className={cn(!isEven && "md:order-1")}>
                      <div className="grid grid-cols-3 md:grid-cols-2 gap-3 md:gap-4">
                        {[
                          { icon: GitCommit, value: formatNumber(platform.stats.commits), label: t.labels.evolutions },
                          { icon: Database, value: platform.stats.tables, label: t.labels.structures },
                          { icon: TestTube2, value: formatNumber(platform.stats.tests), label: t.labels.tests },
                          { icon: GitBranch, value: platform.stats.branches, label: t.labels.versions },
                          { icon: Cpu, value: platform.stats.edgeFunctions, label: t.labels.integrations },
                          { icon: Layers, value: platform.stats.modules, label: t.labels.modulesLabel },
                        ].map((stat) => (
                          <div 
                            key={stat.label}
                            className={cn(
                              "p-4 md:p-5 rounded-xl md:rounded-2xl bg-secondary/30 backdrop-blur-sm border border-border/50 text-center transition-all duration-500",
                              isHovered && "border-opacity-100 shadow-sm"
                            )}
                          >
                            <stat.icon className={cn(
                              "w-4 h-4 md:w-5 md:h-5 mx-auto mb-2",
                              isHovered ? platformAccents[platform.key] : "text-muted-foreground"
                            )} />
                            <div className="text-xl md:text-2xl lg:text-3xl font-bold text-foreground mb-1">
                              {stat.value || "—"}
                            </div>
                            <div className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-wider">
                              {stat.label}
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {platform.lastCommit && (
                        <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span>{t.labels.lastUpdate} : {new Date(platform.lastCommit).toLocaleDateString(dateLocale)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* GOVERNANCE */}
      <section className="py-20 md:py-32 bg-hero-gradient text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_50%_at_50%_50%,hsl(var(--accent)/0.1),transparent)]" />
        
        <div className="container relative px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <Badge variant="gold" className="mb-8">
              <Sparkles className="w-4 h-4 mr-2" />
              {t.governance.badge}
            </Badge>
            
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              {t.governance.title1}
              <br />
              <span className="text-accent">{t.governance.title2}</span>
            </h2>
            
            <p className="text-lg md:text-xl text-white/80 mb-12 max-w-2xl mx-auto">
              {t.governance.subtitle}
            </p>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6 mb-12">
              {[
                { value: "7", label: t.stats.platforms, icon: Layers },
                { value: formatNumber(totals.commits), label: t.stats.evolutions, icon: GitCommit },
                { value: formatNumber(totals.tests), label: t.stats.tests, icon: TestTube2 },
                { value: `${totals.tables}`, label: t.stats.structures, icon: Database },
                { value: `${totals.functions}`, label: t.stats.integrations, icon: Cpu },
              ].map((stat, i) => (
                <div 
                  key={stat.label}
                  className="p-5 md:p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 animate-fade-in transition-all duration-300 hover:-translate-y-1 hover:bg-white/10 hover:border-accent/30"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <stat.icon className="w-5 h-5 md:w-6 md:h-6 mx-auto mb-2 md:mb-3 text-accent" />
                  <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-accent mb-1">
                    {stat.value}
                  </div>
                  <div className="text-xs md:text-sm text-white/70">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            <Link to="/contact">
              <Button variant="hero" size="lg" className="group">
                {t.governance.cta}
                <ArrowRight className="h-5 w-5 ml-2 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
