import { useState } from "react";
import { MANAGED_PLATFORMS } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ExternalLink, 
  Github, 
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
  ArrowRight,
  Layers,
  TestTube2,
  Calendar
} from "lucide-react";
import { cn } from "@/lib/utils";

const statusLabels = {
  production: { label: "Production", icon: CheckCircle },
  prototype: { label: "Prototype", icon: AlertCircle },
  development: { label: "Développement", icon: Sparkles },
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

  // Calculate totals
  const totals = MANAGED_PLATFORMS.reduce(
    (acc, p) => ({
      modules: acc.modules + p.stats.modules,
      tables: acc.tables + p.stats.tables,
      functions: acc.functions + p.stats.edgeFunctions,
      branches: acc.branches + p.stats.branches,
      commits: acc.commits + p.stats.commits,
      tests: acc.tests + p.stats.tests,
    }),
    { modules: 0, tables: 0, functions: 0, branches: 0, commits: 0, tests: 0 }
  );

  return (
    <div className="flex flex-col">
      {/* Hero — Immersive */}
      <section className="relative py-32 md:py-40 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-hero-gradient" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_-10%,hsl(var(--accent)/0.15),transparent)]" />
        <div className="absolute top-1/3 left-1/4 w-[600px] h-[600px] bg-platform-health/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-platform-compass/10 rounded-full blur-[120px]" />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(hsl(220_25%_20%/0.08)_1px,transparent_1px),linear-gradient(90deg,hsl(220_25%_20%/0.08)_1px,transparent_1px)] bg-[size:80px_80px]" />

        <div className="container relative z-10">
          <div className="mx-auto max-w-4xl text-center">
            <Badge variant="gold" className="mb-8 glow-gold">
              <Layers className="w-4 h-4 mr-2" />
              Écosystème Complet
            </Badge>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-primary-foreground mb-6 leading-[0.95]">
              Nos <span className="text-gradient">Plateformes</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-white/80 max-w-2xl mx-auto mb-12 leading-relaxed">
              Cinq solutions innovantes, une vision unifiée. 
              Chaque plateforme excelle dans son domaine.
            </p>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
              {[
                { value: "5", label: "Plateformes" },
                { value: `${totals.commits.toLocaleString()}`, label: "Commits" },
                { value: `${totals.tests.toLocaleString()}`, label: "Tests" },
                { value: `${totals.tables}`, label: "Tables" },
              ].map((stat, i) => (
                <div 
                  key={stat.label}
                  className="p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 animate-fade-in transition-all duration-300 hover:-translate-y-1 hover:bg-white/10 hover:border-accent/30 hover:shadow-[0_0_30px_-5px_hsl(38_92%_50%_/_0.3)]"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <div className="text-3xl md:text-4xl font-bold text-accent mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-white/80">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-primary-foreground/30 rounded-full flex items-start justify-center p-1">
            <div className="w-1.5 h-3 bg-accent rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* Platforms — Individual Showcases */}
      <section className="py-24 md:py-32 bg-background">
        <div className="container">
          <div className="space-y-16 md:space-y-24">
            {MANAGED_PLATFORMS.map((platform, index) => {
              const Icon = platformIcons[platform.key] || Rocket;
              const statusConfig = statusLabels[platform.status as keyof typeof statusLabels] || statusLabels.development;
              const StatusIcon = statusConfig.icon;
              const isHovered = hoveredPlatform === platform.key;
              const isEven = index % 2 === 0;

              return (
                <div
                  key={platform.key}
                  className={cn(
                    "group relative rounded-3xl border bg-card overflow-hidden transition-all duration-700",
                    "hover:shadow-2xl",
                    platformBorders[platform.key]
                  )}
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
                    <Icon className="w-[400px] h-[400px]" />
                  </div>

                  <div className={cn(
                    "relative grid md:grid-cols-2 gap-8 lg:gap-12 p-8 md:p-12 lg:p-16 items-center",
                    !isEven && "md:flex-row-reverse"
                  )}>
                    {/* Content Side */}
                    <div className={cn(!isEven && "md:order-2")}>
                      {/* Status & Platform Badge */}
                      <div className="flex flex-wrap items-center gap-3 mb-6">
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "w-3 h-3 rounded-full animate-pulse",
                            platform.status === "production" ? "bg-status-green" : "bg-status-amber"
                          )} />
                          <span className={cn(
                            "text-xs font-semibold uppercase tracking-wider",
                            platform.status === "production" ? "text-status-green" : "text-status-amber"
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
                          "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300",
                          "bg-secondary/50 group-hover:scale-110",
                          isHovered && "shadow-lg"
                        )}>
                          <Icon className={cn("w-7 h-7", platformAccents[platform.key])} />
                        </div>
                        <h2 className={cn(
                          "text-3xl md:text-4xl lg:text-5xl font-bold transition-colors duration-300",
                          `group-hover:${platformAccents[platform.key]}`,
                          isHovered && platformAccents[platform.key]
                        )}>
                          {platform.name}
                        </h2>
                      </div>

                      {/* Tagline */}
                      <p className={cn(
                        "text-lg font-medium mb-4 transition-colors duration-300",
                        platformAccents[platform.key]
                      )}>
                        "{platform.tagline}"
                      </p>

                      {/* Description */}
                      <p className="text-muted-foreground leading-relaxed mb-6">
                        {platform.description}
                      </p>

                      {/* Features */}
                      <div className="flex flex-wrap gap-2 mb-8">
                        {platform.features.map((feature) => (
                          <span 
                            key={feature}
                            className="px-3 py-1.5 text-xs font-medium bg-secondary/80 rounded-full border border-border/50 transition-colors duration-300 hover:border-accent/30"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-4">
                        <Button 
                          size="lg"
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
                            <ExternalLink className="h-5 w-5 mr-2" />
                            Visiter le site
                          </a>
                        </Button>
                        <Button 
                          variant="outline" 
                          size="lg"
                          className="group/btn"
                          asChild
                        >
                          <a
                            href={platform.github}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Github className="h-5 w-5 mr-2" />
                            GitHub
                          </a>
                        </Button>
                      </div>
                    </div>

                    {/* Stats Side */}
                    <div className={cn(!isEven && "md:order-1")}>
                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { icon: GitCommit, value: platform.stats.commits.toLocaleString(), label: "Commits" },
                          { icon: Database, value: platform.stats.tables, label: "Tables DB" },
                          { icon: TestTube2, value: platform.stats.tests.toLocaleString(), label: "Tests" },
                          { icon: GitBranch, value: platform.stats.branches, label: "Branches" },
                        ].map((stat) => (
                          <div 
                            key={stat.label}
                            className={cn(
                              "p-6 rounded-2xl bg-secondary/30 backdrop-blur-sm border border-border/50 text-center transition-all duration-500",
                              isHovered && "border-opacity-100 shadow-sm"
                            )}
                          >
                            <stat.icon className={cn(
                              "w-5 h-5 mx-auto mb-3 transition-colors duration-300",
                              isHovered ? platformAccents[platform.key] : "text-muted-foreground"
                            )} />
                            <div className="text-2xl md:text-3xl font-bold text-foreground mb-1">
                              {stat.value || "—"}
                            </div>
                            <div className="text-xs text-muted-foreground uppercase tracking-wider">
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

      {/* Governance Section */}
      <section className="py-24 md:py-32 bg-primary text-primary-foreground relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_50%_at_50%_50%,hsl(var(--accent)/0.1),transparent)]" />
        
        <div className="container relative">
          <div className="mx-auto max-w-4xl text-center">
            <Badge variant="gold" className="mb-8">
              <Sparkles className="w-4 h-4 mr-2" />
              Gouvernance Unifiée
            </Badge>
            
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Un siège.
              <br />
              <span className="text-accent">Cinq excellences.</span>
            </h2>
            
            <p className="text-xl text-white/80 mb-12 max-w-2xl mx-auto">
              Toutes nos plateformes partagent la même infrastructure backend, 
              les mêmes standards de sécurité et la même rigueur d'exécution.
            </p>

            {/* Final Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { value: "5", label: "Plateformes Actives", icon: Layers },
                { value: `${(totals.commits / 1000).toFixed(1)}K`, label: "Commits GitHub", icon: GitCommit },
                { value: `${totals.tests.toLocaleString()}`, label: "Tests Passants", icon: TestTube2 },
                { value: `${totals.tables}`, label: "Tables Supabase", icon: Database },
              ].map((stat, i) => (
                <div 
                  key={stat.label}
                  className="p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 animate-fade-in transition-all duration-300 hover:-translate-y-1 hover:bg-white/10 hover:border-accent/30 hover:shadow-[0_0_30px_-5px_hsl(38_92%_50%_/_0.3)]"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <stat.icon className="w-6 h-6 mx-auto mb-4 text-accent" />
                  <div className="text-4xl md:text-5xl font-bold text-accent mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm text-white/80">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
