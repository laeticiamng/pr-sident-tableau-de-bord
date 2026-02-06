import { useState, useEffect } from "react";
import { MANAGED_PLATFORMS } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ExternalLink, 
  CheckCircle, 
  AlertCircle, 
  Heart,
  Compass,
  Rocket,
  Music,
  Users,
  Database,
  Cpu,
  GitBranch,
  GitCommit,
  Sparkles,
  Layers,
  TestTube2,
  Calendar,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

const statusLabels = {
  production: { label: "Production", icon: CheckCircle, color: "text-success", bg: "bg-success" },
  prototype: { label: "Prototype", icon: AlertCircle, color: "text-warning", bg: "bg-warning" },
  development: { label: "Développement", icon: Sparkles, color: "text-muted-foreground", bg: "bg-muted-foreground" },
};

// Icon mapping for each platform
const platformIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  "emotionscare": Heart,
  "pixel-perfect-replica": Users,
  "system-compass": Compass,
  "growth-copilot": Rocket,
  "med-mng": Music,
};

// Platform accent colors (semantic tokens)
const platformAccents: Record<string, string> = {
  "emotionscare": "text-platform-health",
  "pixel-perfect-replica": "text-platform-social",
  "system-compass": "text-platform-compass",
  "growth-copilot": "text-platform-growth",
  "med-mng": "text-platform-medical",
};

const platformBgAccents: Record<string, string> = {
  "emotionscare": "bg-platform-health",
  "pixel-perfect-replica": "bg-platform-social",
  "system-compass": "bg-platform-compass",
  "growth-copilot": "bg-platform-growth",
  "med-mng": "bg-platform-medical",
};

const platformGradients: Record<string, string> = {
  "emotionscare": "from-platform-health/20 via-platform-health/5 to-transparent",
  "pixel-perfect-replica": "from-platform-social/20 via-platform-social/5 to-transparent",
  "system-compass": "from-platform-compass/20 via-platform-compass/5 to-transparent",
  "growth-copilot": "from-platform-growth/20 via-platform-growth/5 to-transparent",
  "med-mng": "from-platform-medical/20 via-platform-medical/5 to-transparent",
};

const platformBorders: Record<string, string> = {
  "emotionscare": "hover:border-platform-health/40",
  "pixel-perfect-replica": "hover:border-platform-social/40",
  "system-compass": "hover:border-platform-compass/40",
  "growth-copilot": "hover:border-platform-growth/40",
  "med-mng": "hover:border-platform-medical/40",
};

export default function PlateformesPage() {
  const [hoveredPlatform, setHoveredPlatform] = useState<string | null>(null);

  // SEO: Update document meta for this page
  useEffect(() => {
    document.title = "Nos Plateformes — EMOTIONSCARE SASU";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", "Découvrez les 5 plateformes SaaS d'EMOTIONSCARE : EmotionsCare, Med MNG, System Compass, Growth Copilot et Pixel Perfect Replica. 16K+ commits, 875 tables, 349 Edge Functions.");
    }
    return () => {
      document.title = "EMOTIONSCARE SASU — Siège Social Numérique";
      if (metaDescription) {
        metaDescription.setAttribute("content", "Éditeur de logiciels applicatifs français. 5 plateformes innovantes pilotées depuis notre siège numérique.");
      }
    };
  }, []);

  // Use static data from constants (public page, no auth required)
  const platforms = MANAGED_PLATFORMS;

  // Calculate totals
  const totals = platforms.reduce(
    (acc, p) => ({
      modules: acc.modules + (p.stats?.modules || 0),
      tables: acc.tables + (p.stats?.tables || 0),
      functions: acc.functions + (p.stats?.edgeFunctions || 0),
      branches: acc.branches + (p.stats?.branches || 0),
      commits: acc.commits + (p.stats?.commits || 0),
      tests: acc.tests + (p.stats?.tests || 0),
    }),
    { modules: 0, tables: 0, functions: 0, branches: 0, commits: 0, tests: 0 }
  );

  // Format large numbers
  const formatNumber = (num: number) => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  return (
    <div className="flex flex-col animate-fade-in">
      {/* ============================================ */}
      {/* HERO SECTION */}
      {/* ============================================ */}
      <section className="relative py-32 md:py-40 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-hero-gradient" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_-10%,hsl(var(--accent)/0.2),transparent)]" />
        <div className="absolute top-1/3 left-1/4 w-[600px] h-[600px] bg-platform-health/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-platform-compass/10 rounded-full blur-[120px]" />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(hsl(0_0%_100%/0.05)_1px,transparent_1px),linear-gradient(90deg,hsl(0_0%_100%/0.05)_1px,transparent_1px)] bg-[size:80px_80px]" />

        <div className="container relative z-10 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <Badge variant="gold" className="mb-8">
              <Layers className="w-4 h-4 mr-2" />
              Écosystème Complet
            </Badge>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-6 leading-[0.95]">
              Nos <span className="text-accent">Plateformes</span>
            </h1>
            
            <p className="text-lg sm:text-xl md:text-2xl text-white/80 max-w-2xl mx-auto mb-12 leading-relaxed">
              Cinq solutions innovantes, une vision unifiée. 
              Chaque plateforme excelle dans son domaine.
            </p>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 max-w-4xl mx-auto">
              {[
                { value: "5", label: "Plateformes" },
                { value: formatNumber(totals.commits), label: "Commits" },
                { value: formatNumber(totals.tests), label: "Tests" },
                { value: `${totals.tables}`, label: "Tables DB" },
                { value: `${totals.functions}`, label: "Edge Functions" },
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

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce hidden sm:block">
          <div className="w-6 h-10 border-2 border-primary-foreground/30 rounded-full flex items-start justify-center p-1">
            <div className="w-1.5 h-3 bg-accent rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* PLATFORMS SHOWCASE */}
      {/* ============================================ */}
      <section className="py-20 md:py-32 bg-background">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="space-y-12 md:space-y-20">
            {platforms.map((platform, index) => {
              const Icon = platformIcons[platform.key] || Rocket;
              const statusConfig = statusLabels[platform.status as keyof typeof statusLabels] || statusLabels.development;
              const StatusIcon = statusConfig.icon;
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
                  {/* Gradient Overlay */}
                  <div className={cn(
                    "absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-700",
                    platformGradients[platform.key],
                    isHovered && "opacity-100"
                  )} />

                  {/* Large Icon Watermark */}
                  <div className={cn(
                    "absolute opacity-[0.03] transition-opacity duration-500 group-hover:opacity-[0.08]",
                    isEven ? "-right-16 -bottom-16" : "-left-16 -bottom-16"
                  )}>
                    <Icon className="w-[300px] h-[300px] md:w-[400px] md:h-[400px]" />
                  </div>

                  <div className={cn(
                    "relative grid md:grid-cols-2 gap-6 lg:gap-12 p-6 md:p-10 lg:p-14 items-center"
                  )}>
                    {/* Content Side */}
                    <div className={cn(!isEven && "md:order-2")}>
                      {/* Status Badge */}
                      <div className="flex flex-wrap items-center gap-3 mb-5">
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "w-2.5 h-2.5 rounded-full animate-pulse",
                            statusConfig.bg
                          )} />
                          <span className={cn(
                            "text-xs font-semibold uppercase tracking-wider",
                            statusConfig.color
                          )}>
                            {statusConfig.label}
                          </span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {platform.stats.modules} modules
                        </Badge>
                      </div>

                      {/* Icon & Title */}
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

                      {/* Tagline */}
                      <p className={cn(
                        "text-base md:text-lg font-medium mb-3",
                        platformAccents[platform.key]
                      )}>
                        "{platform.tagline}"
                      </p>

                      {/* Description */}
                      <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-5">
                        {platform.description}
                      </p>

                      {/* Features */}
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

                      {/* Actions */}
                      <div className="flex flex-wrap gap-3">
                        <Button 
                          size="default"
                          className={cn(
                            "group/btn",
                            platformBgAccents[platform.key],
                            "hover:opacity-90 text-white"
                          )}
                          asChild
                        >
                          <a
                            href={platform.liveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Visiter le site
                          </a>
                        </Button>
                      </div>
                    </div>

                    {/* Stats Side */}
                    <div className={cn(!isEven && "md:order-1")}>
                      <div className="grid grid-cols-3 md:grid-cols-2 gap-3 md:gap-4">
                        {[
                          { icon: GitCommit, value: formatNumber(platform.stats.commits), label: "Commits" },
                          { icon: Database, value: platform.stats.tables, label: "Tables DB" },
                          { icon: TestTube2, value: formatNumber(platform.stats.tests), label: "Tests" },
                          { icon: GitBranch, value: platform.stats.branches, label: "Branches" },
                          { icon: Cpu, value: platform.stats.edgeFunctions, label: "Edge Fns" },
                          { icon: Layers, value: platform.stats.modules, label: "Modules" },
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
                      
                      {/* Last commit info */}
                      {platform.lastCommit && (
                        <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span>Dernière MAJ : {new Date(platform.lastCommit).toLocaleDateString('fr-FR')}</span>
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

      {/* ============================================ */}
      {/* GOVERNANCE SECTION */}
      {/* ============================================ */}
      <section className="py-20 md:py-32 bg-hero-gradient text-white relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_50%_at_50%_50%,hsl(var(--accent)/0.1),transparent)]" />
        
        <div className="container relative px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <Badge variant="gold" className="mb-8">
              <Sparkles className="w-4 h-4 mr-2" />
              Gouvernance Unifiée
            </Badge>
            
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Un siège.
              <br />
              <span className="text-accent">Cinq excellences.</span>
            </h2>
            
            <p className="text-lg md:text-xl text-white/80 mb-12 max-w-2xl mx-auto">
              Toutes nos plateformes partagent la même infrastructure backend, 
              les mêmes standards de sécurité et la même rigueur d'exécution.
            </p>

            {/* Final Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6 mb-12">
              {[
                { value: "5", label: "Plateformes", icon: Layers },
                { value: formatNumber(totals.commits), label: "Commits", icon: GitCommit },
                { value: formatNumber(totals.tests), label: "Tests", icon: TestTube2 },
                { value: `${totals.tables}`, label: "Tables DB", icon: Database },
                { value: `${totals.functions}`, label: "Edge Functions", icon: Cpu },
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

            {/* CTA */}
            <Link to="/auth">
              <Button variant="hero" size="lg" className="group">
                Accéder au HQ
                <ArrowRight className="h-5 w-5 ml-2 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
