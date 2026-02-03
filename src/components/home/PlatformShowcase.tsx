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
    <section className="py-32 md:py-40 bg-background relative overflow-hidden">
      {/* Ambient background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(var(--accent)/0.05),transparent)]" />
      <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px]" />
      
      <div className="container relative">
        {/* Section Header — Apple Style */}
        <div className="max-w-4xl mx-auto text-center mb-20">
          <Badge variant="gold" className="mb-6">
            <Sparkles className="w-3 h-3 mr-1.5" />
            Écosystème Premium
          </Badge>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Cinq plateformes.
            <br />
            <span className="text-gradient">Une vision.</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Chaque plateforme répond à un besoin spécifique, toutes sont pilotées 
            depuis notre siège numérique avec les mêmes standards d'excellence.
          </p>
        </div>

        {/* Featured Platform — Hero Card */}
        <div className="mb-16">
          <Link 
            to="/plateformes" 
            className="group block"
            onMouseEnter={() => setHoveredPlatform(MANAGED_PLATFORMS[0].key)}
            onMouseLeave={() => setHoveredPlatform(null)}
          >
            <div className={cn(
              "relative rounded-3xl border bg-card p-8 md:p-12 overflow-hidden transition-all duration-700",
              "hover:shadow-2xl",
              platformBorders["emotionscare"]
            )}>
              {/* Gradient Overlay */}
              <div className={cn(
                "absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-700",
                platformGradients[MANAGED_PLATFORMS[0].key],
                hoveredPlatform === MANAGED_PLATFORMS[0].key && "opacity-100"
              )} />
              
              {/* Floating Icon */}
              <div className="absolute -top-8 -right-8 md:top-8 md:right-8 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
                <Heart className="w-48 h-48 md:w-64 md:h-64" />
              </div>

              <div className="relative grid md:grid-cols-2 gap-8 items-center">
                {/* Left — Content */}
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className={cn("w-3 h-3 rounded-full animate-pulse", platformBgAccents["emotionscare"])} />
                    <span className={cn("text-xs font-semibold uppercase tracking-wider", platformAccents["emotionscare"])}>
                      Production • 33 Modules
                    </span>
                  </div>
                  
                  <h3 className={cn(
                    "text-3xl md:text-4xl lg:text-5xl font-bold mb-4 transition-colors duration-300",
                    "group-hover:text-platform-health"
                  )}>
                    {MANAGED_PLATFORMS[0].name}
                  </h3>
                  
                  <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                    {MANAGED_PLATFORMS[0].tagline}
                  </p>
                  
                  <p className="text-muted-foreground mb-8 line-clamp-3">
                    {MANAGED_PLATFORMS[0].description}
                  </p>

                  {/* Features Pills */}
                  <div className="flex flex-wrap gap-2 mb-8">
                    {MANAGED_PLATFORMS[0].features.map((feature) => (
                      <span 
                        key={feature}
                        className="px-3 py-1.5 text-xs font-medium bg-secondary/80 rounded-full border border-border/50"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>

                  <Button variant="ghost" className="group/btn px-0 text-platform-health hover:text-platform-health/80 hover:bg-transparent">
                    Découvrir la plateforme
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                  </Button>
                </div>

                {/* Right — Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { icon: Cpu, value: MANAGED_PLATFORMS[0].stats.modules, label: "Modules", suffix: "" },
                    { icon: Database, value: MANAGED_PLATFORMS[0].stats.tables, label: "Tables", suffix: "" },
                    { icon: Sparkles, value: MANAGED_PLATFORMS[0].stats.edgeFunctions, label: "Edge Functions", suffix: "" },
                    { icon: GitBranch, value: MANAGED_PLATFORMS[0].stats.branches, label: "Branches", suffix: "" },
                  ].map((stat) => (
                    <div 
                      key={stat.label}
                      className="p-6 rounded-2xl bg-background/50 backdrop-blur-sm border border-border/50 text-center group-hover:border-platform-health/20 transition-colors duration-500"
                    >
                      <stat.icon className="w-5 h-5 mx-auto mb-3 text-muted-foreground" />
                      <div className="text-2xl md:text-3xl font-bold text-foreground mb-1">
                        {stat.value}{stat.suffix}
                      </div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wider">
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Other Platforms — Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {MANAGED_PLATFORMS.slice(1).map((platform, index) => {
            const Icon = platformIcons[platform.key] || Rocket;
            const isHovered = hoveredPlatform === platform.key;
            
            return (
              <Link
                key={platform.key}
                to="/plateformes"
                className="group block"
                onMouseEnter={() => setHoveredPlatform(platform.key)}
                onMouseLeave={() => setHoveredPlatform(null)}
              >
                <div 
                  className={cn(
                    "relative h-full rounded-2xl border bg-card p-6 overflow-hidden transition-all duration-500",
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
                    <div className="flex items-center justify-between mb-6">
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center bg-secondary/50 transition-all duration-300",
                        "group-hover:scale-110",
                        isHovered && "bg-opacity-100"
                      )}>
                        <Icon className={cn("w-6 h-6 transition-colors duration-300", platformAccents[platform.key])} />
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          platform.status === "production" ? "bg-status-green" : "bg-status-amber"
                        )} />
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                          {platform.status === "production" ? "Prod" : "Proto"}
                        </span>
                      </div>
                    </div>

                    {/* Title & Description */}
                    <h3 className={cn(
                      "text-xl font-semibold mb-2 transition-colors duration-300",
                      platformAccents[platform.key]
                    )}>
                      {platform.name}
                    </h3>
                    
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {platform.shortDescription}
                    </p>

                    {/* Stats Row */}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                      <span>{platform.stats.modules} modules</span>
                      <span>•</span>
                      <span>{platform.stats.tables} tables</span>
                    </div>

                    {/* Arrow */}
                    <div className="flex items-center gap-2 text-sm font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                      <span className={platformAccents[platform.key]}>Explorer</span>
                      <ChevronRight className={cn("w-4 h-4", platformAccents[platform.key])} />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <Link to="/plateformes">
            <Button variant="outline" size="lg" className="group">
              Voir toutes les plateformes
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
