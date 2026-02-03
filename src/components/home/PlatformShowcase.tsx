import { useState } from "react";
import { Link } from "react-router-dom";
import { MANAGED_PLATFORMS } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ArrowRight, 
  ChevronRight,
  Heart,
  Compass,
  Rocket,
  Music,
  Users,
  Database,
  Cpu,
  GitBranch,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

// Icon mapping for each platform
const platformIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  "emotionscare": Heart,
  "pixel-perfect-replica": Users,
  "system-compass": Compass,
  "growth-copilot": Rocket,
  "med-mng": Music,
};

// Unique gradient for each platform (using semantic tokens via opacity)
const platformGradients: Record<string, string> = {
  "emotionscare": "from-platform-health/20 via-platform-health/10 to-transparent",
  "pixel-perfect-replica": "from-platform-social/20 via-platform-social/10 to-transparent",
  "system-compass": "from-platform-compass/20 via-platform-compass/10 to-transparent",
  "growth-copilot": "from-platform-growth/20 via-platform-growth/10 to-transparent",
  "med-mng": "from-platform-medical/20 via-platform-medical/10 to-transparent",
};

// Accent colors per platform (semantic tokens)
const platformAccents: Record<string, string> = {
  "emotionscare": "text-platform-health",
  "pixel-perfect-replica": "text-platform-social",
  "system-compass": "text-platform-compass",
  "growth-copilot": "text-platform-growth",
  "med-mng": "text-platform-medical",
};

const platformBorders: Record<string, string> = {
  "emotionscare": "group-hover:border-platform-health/30",
  "pixel-perfect-replica": "group-hover:border-platform-social/30",
  "system-compass": "group-hover:border-platform-compass/30",
  "growth-copilot": "group-hover:border-platform-growth/30",
  "med-mng": "group-hover:border-platform-medical/30",
};

const platformBgAccents: Record<string, string> = {
  "emotionscare": "bg-platform-health",
  "pixel-perfect-replica": "bg-platform-social",
  "system-compass": "bg-platform-compass",
  "growth-copilot": "bg-platform-growth",
  "med-mng": "bg-platform-medical",
};

export function PlatformShowcase() {
  const [hoveredPlatform, setHoveredPlatform] = useState<string | null>(null);

  return (
    <section className="py-16 sm:py-24 md:py-32 lg:py-40 bg-background relative overflow-hidden">
      {/* Ambient background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(var(--accent)/0.05),transparent)]" />
      <div className="hidden sm:block absolute top-1/4 right-0 w-64 sm:w-96 lg:w-[500px] h-64 sm:h-96 lg:h-[500px] bg-accent/5 rounded-full blur-[80px] lg:blur-[120px]" />
      <div className="hidden sm:block absolute bottom-0 left-0 w-48 sm:w-80 lg:w-[400px] h-48 sm:h-80 lg:h-[400px] bg-primary/5 rounded-full blur-[60px] lg:blur-[100px]" />
      
      <div className="container relative px-4 sm:px-6 lg:px-8">
        {/* Section Header — Apple Style */}
        <div className="max-w-4xl mx-auto text-center mb-12 sm:mb-16 md:mb-20">
          <Badge variant="gold" className="mb-4 sm:mb-6">
            <Sparkles className="w-3 h-3 mr-1.5" />
            Écosystème Premium
          </Badge>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight mb-4 sm:mb-6 px-2">
            Cinq plateformes.
            <br />
            <span className="text-gradient">Une vision.</span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
            Chaque plateforme répond à un besoin spécifique, toutes sont pilotées 
            depuis notre siège numérique avec les mêmes standards d'excellence.
          </p>
        </div>

        {/* Featured Platform — Hero Card */}
        <div className="mb-10 sm:mb-12 md:mb-16">
          <div 
            className="group block"
            onMouseEnter={() => setHoveredPlatform(MANAGED_PLATFORMS[0].key)}
            onMouseLeave={() => setHoveredPlatform(null)}
          >
            <div className={cn(
              "relative rounded-2xl sm:rounded-3xl border bg-card p-5 sm:p-8 md:p-12 overflow-hidden transition-all duration-700",
              "hover:shadow-2xl",
              platformBorders["emotionscare"]
            )}>
              {/* Gradient Overlay */}
              <div className={cn(
                "absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-700",
                platformGradients[MANAGED_PLATFORMS[0].key],
                hoveredPlatform === MANAGED_PLATFORMS[0].key && "opacity-100"
              )} />
              
              {/* Floating Icon - Hidden on mobile */}
              <div className="hidden md:block absolute -top-8 -right-8 md:top-8 md:right-8 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
                <Heart className="w-48 h-48 md:w-64 md:h-64" />
              </div>

              <div className="relative grid md:grid-cols-2 gap-6 sm:gap-8 items-center">
                {/* Left — Content */}
                <div>
                  <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                    <div className={cn("w-2 h-2 sm:w-3 sm:h-3 rounded-full animate-pulse", platformBgAccents["emotionscare"])} />
                    <span className={cn("text-[10px] sm:text-xs font-semibold uppercase tracking-wider", platformAccents["emotionscare"])}>
                      Production • 33 Modules
                    </span>
                  </div>
                  
                  <h3 className={cn(
                    "text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-3 sm:mb-4 transition-colors duration-300",
                    "group-hover:text-platform-health"
                  )}>
                    {MANAGED_PLATFORMS[0].name}
                  </h3>
                  
                  <p className="text-sm sm:text-base md:text-lg text-muted-foreground mb-4 sm:mb-6 leading-relaxed">
                    {MANAGED_PLATFORMS[0].tagline}
                  </p>
                  
                  <p className="hidden sm:block text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 line-clamp-3">
                    {MANAGED_PLATFORMS[0].description}
                  </p>

                  {/* Features Pills */}
                  <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-6 sm:mb-8">
                    {MANAGED_PLATFORMS[0].features.slice(0, 4).map((feature) => (
                      <span 
                        key={feature}
                        className="px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-medium bg-secondary/80 rounded-full border border-border/50"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                    <Button asChild size="sm" className="bg-platform-health hover:bg-platform-health/90 text-white text-xs sm:text-sm">
                      <a href={MANAGED_PLATFORMS[0].liveUrl} target="_blank" rel="noopener noreferrer">
                        Visiter le site
                        <ArrowRight className="ml-1.5 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                      </a>
                    </Button>
                    <Link to="/plateformes">
                      <Button variant="ghost" size="sm" className="text-platform-health hover:text-platform-health/80 hover:bg-transparent text-xs sm:text-sm">
                        Détails
                        <ChevronRight className="ml-1 h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Right — Stats Grid */}
                <div className="grid grid-cols-2 gap-2 sm:gap-4 mt-4 md:mt-0">
                  {[
                    { icon: Cpu, value: MANAGED_PLATFORMS[0].stats.modules, label: "Modules", suffix: "" },
                    { icon: Database, value: MANAGED_PLATFORMS[0].stats.tables, label: "Tables", suffix: "" },
                    { icon: Sparkles, value: MANAGED_PLATFORMS[0].stats.edgeFunctions, label: "Edge Fn.", suffix: "" },
                    { icon: GitBranch, value: MANAGED_PLATFORMS[0].stats.branches, label: "Branches", suffix: "" },
                  ].map((stat) => (
                    <div 
                      key={stat.label}
                      className="p-3 sm:p-4 md:p-6 rounded-xl sm:rounded-2xl bg-background/50 backdrop-blur-sm border border-border/50 text-center group-hover:border-platform-health/20 transition-colors duration-500"
                    >
                      <stat.icon className="w-4 h-4 sm:w-5 sm:h-5 mx-auto mb-2 sm:mb-3 text-muted-foreground" />
                      <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-foreground mb-0.5 sm:mb-1">
                        {stat.value}{stat.suffix}
                      </div>
                      <div className="text-[9px] sm:text-[10px] md:text-xs text-muted-foreground uppercase tracking-wider">
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Other Platforms — Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {MANAGED_PLATFORMS.slice(1).map((platform, index) => {
            const Icon = platformIcons[platform.key] || Rocket;
            const isHovered = hoveredPlatform === platform.key;
            
            return (
              <div
                key={platform.key}
                className="group block"
                onMouseEnter={() => setHoveredPlatform(platform.key)}
                onMouseLeave={() => setHoveredPlatform(null)}
              >
                <div 
                  className={cn(
                    "relative h-full rounded-xl sm:rounded-2xl border bg-card p-4 sm:p-6 overflow-hidden transition-all duration-500",
                    "hover:shadow-xl hover:-translate-y-1",
                    platformBorders[platform.key]
                  )}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Gradient Overlay */}
                  <div className={cn(
                    "absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-500",
                    platformGradients[platform.key],
                    isHovered && "opacity-100"
                  )} />

                  <div className="relative">
                    {/* Icon & Status */}
                    <div className="flex items-center justify-between mb-4 sm:mb-6">
                      <div className={cn(
                        "w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center bg-secondary/50 transition-all duration-300",
                        "group-hover:scale-110",
                        isHovered && "bg-opacity-100"
                      )}>
                        <Icon className={cn("w-5 h-5 sm:w-6 sm:h-6 transition-colors duration-300", platformAccents[platform.key])} />
                      </div>
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <div className={cn(
                          "w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full",
                          platform.status === "production" ? "bg-status-green" : "bg-status-amber"
                        )} />
                        <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-muted-foreground">
                          {platform.status === "production" ? "Prod" : "Proto"}
                        </span>
                      </div>
                    </div>

                    {/* Title & Description */}
                    <h3 className={cn(
                      "text-lg sm:text-xl font-semibold mb-1.5 sm:mb-2 transition-colors duration-300",
                      platformAccents[platform.key]
                    )}>
                      {platform.name}
                    </h3>
                    
                    <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4 line-clamp-2">
                      {platform.shortDescription}
                    </p>

                    {/* Stats Row */}
                    <div className="flex items-center gap-3 sm:gap-4 text-[10px] sm:text-xs text-muted-foreground mb-3 sm:mb-4">
                      <span>{platform.stats.modules} modules</span>
                      <span>•</span>
                      <span>{platform.stats.tables} tables</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                      <a 
                        href={platform.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                          "flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm font-medium transition-all duration-300",
                          platformAccents[platform.key],
                          "hover:underline"
                        )}
                      >
                        Visiter
                        <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="mt-10 sm:mt-12 md:mt-16 text-center">
          <Link to="/plateformes">
            <Button variant="outline" size="default" className="group text-sm sm:text-base">
              Voir toutes les plateformes
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
