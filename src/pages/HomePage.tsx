import { useEffect } from "react";
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
  ExternalLink,
  Building2
} from "lucide-react";
import { MANAGED_PLATFORMS } from "@/lib/constants";

// Feature cards data
const FEATURES = [
  {
    icon: Brain,
    title: "Intelligence IA",
    description: "Briefings quotidiens générés par IA avec données GitHub réelles. 7 types de runs : brief exécutif, standup CEO, audit sécurité, veille concurrentielle...",
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
  {
    icon: Activity,
    title: "Supervision en temps réel",
    description: "Statuts temps réel, uptime, derniers commits GitHub synchronisés. Vue unifiée de l'état de santé de tout l'écosystème.",
    color: "text-success",
    bgColor: "bg-success/10",
  },
  {
    icon: CheckCircle,
    title: "Validation des actions",
    description: "Workflow de validation pour les actions critiques. Owner Approval Gate obligatoire pour déploiements, secrets, et modifications de schéma.",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: Search,
    title: "Veille stratégique",
    description: "Intelligence concurrentielle via Perplexity AI. Recherche temps réel sur les tendances marché, analyse SWOT automatisée.",
    color: "text-warning",
    bgColor: "bg-warning/10",
  },
];

// Platform status badge
function PlatformStatusBadge({ status }: { status: string }) {
  const variants: Record<string, { label: string; className: string }> = {
    production: { label: "Production", className: "bg-success/10 text-success border-success/20" },
    prototype: { label: "Prototype", className: "bg-warning/10 text-warning border-warning/20" },
    development: { label: "En développement", className: "bg-muted text-muted-foreground border-muted" },
  };
  const variant = variants[status] || variants.development;
  return (
    <Badge variant="outline" className={variant.className}>
      {variant.label}
    </Badge>
  );
}

export default function HomePage() {

  // SEO: Update document meta for this page
  useEffect(() => {
    document.title = "EMOTIONSCARE — Siège Social Numérique";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", "Éditeur de logiciels applicatifs français. 7 plateformes SaaS innovantes pilotées depuis notre siège numérique à Amiens.");
    }
  }, []);

  return (
    <div className="flex flex-col">
      {/* ============================================ */}
      {/* HERO SECTION */}
      {/* ============================================ */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background — Fixed navy regardless of theme */}
        <div className="absolute inset-0 bg-hero-gradient" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(38_92%_50%/0.2),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_80%_at_80%_50%,hsl(0_0%_100%/0.1),transparent)]" />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(hsl(0_0%_100%/0.05)_1px,transparent_1px),linear-gradient(90deg,hsl(0_0%_100%/0.05)_1px,transparent_1px)] bg-[size:60px_60px]" />

        <div className="container relative z-10 py-16 md:py-24 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl text-center">
            {/* Badge */}
            <div className="mb-8 animate-fade-in">
              <Badge variant="gold" className="px-4 py-2 text-sm font-medium tracking-wide">
                <Building2 className="w-4 h-4 mr-2" />
                Siège Social Numérique
              </Badge>
            </div>

            {/* Main Title */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-6 animate-slide-up">
              EMOTIONSCARE
            </h1>

            {/* Subtitle */}
            <p className="text-xl sm:text-2xl md:text-3xl text-white/90 mb-4 max-w-3xl mx-auto animate-slide-up font-light" style={{ animationDelay: "0.1s" }}>
              Éditeur de logiciels SaaS — Santé, Éducation, International
            </p>
            <p className="text-base sm:text-lg md:text-xl text-white/70 mb-10 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: "0.15s" }}>
              7 plateformes innovantes pour la santé, l'éducation médicale, la relocalisation, la croissance, le social, les urgences et la performance
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <Link to="/plateformes" className="w-full sm:w-auto">
                <Button 
                  variant="hero" 
                  size="lg" 
                  className="group w-full min-w-[200px]"
                >
                  Découvrir les plateformes
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>

            {/* Scroll Indicator */}
            <div className="hidden sm:block mt-20 animate-bounce">
              <div className="w-6 h-10 mx-auto border-2 border-white/30 rounded-full flex items-start justify-center p-1">
                <div className="w-1.5 h-3 bg-accent rounded-full animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* FEATURES SECTION */}
      {/* ============================================ */}
      <section className="py-20 md:py-32 bg-background">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            {/* Section Header */}
            <div className="text-center mb-16">
               <p className="text-sm font-medium text-accent tracking-[0.2em] uppercase mb-4">
                 Fonctionnalités
               </p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold mb-6">
                Fonctionnalités du <span className="text-accent">Siège Numérique</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Un tableau de bord exécutif complet pour piloter l'ensemble de l'écosystème EMOTIONSCARE
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid gap-6 md:grid-cols-2">
              {FEATURES.map((feature, index) => (
                <Card 
                  key={feature.title}
                  className="group border-border/60 hover:border-accent/40 hover:shadow-lg transition-all duration-300 animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardContent className="p-8">
                    <div className="flex items-start gap-5">
                      <div className={`p-3 rounded-xl ${feature.bgColor} transition-transform group-hover:scale-110`}>
                        <feature.icon className={`h-6 w-6 ${feature.color}`} />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                        <p className="text-muted-foreground leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* MANAGED PLATFORMS SECTION */}
      {/* ============================================ */}
      <section className="py-20 md:py-32 bg-secondary/30">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            {/* Section Header */}
            <div className="text-center mb-16">
              <p className="text-sm font-medium text-accent tracking-[0.2em] uppercase mb-4">
                Écosystème
              </p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold mb-6">
                7 Plateformes <span className="text-accent">Managées</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Un portefeuille cohérent de solutions logicielles, toutes pilotées depuis le siège numérique
              </p>
            </div>

            {/* Platforms Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {MANAGED_PLATFORMS.map((platform, index) => (
                <Card 
                  key={platform.key}
                  className="group border-border/60 hover:border-accent/40 hover:shadow-lg transition-all duration-300 animate-fade-in overflow-hidden"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-3 h-3 rounded-full ${platform.color}`} />
                      <PlatformStatusBadge status={platform.status} />
                    </div>
                    
                    <h3 className="text-xl font-semibold mb-2">{platform.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {platform.shortDescription}
                    </p>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                      <span>{platform.stats.commits.toLocaleString()} commits</span>
                      <span>•</span>
                      <span>{platform.stats.tables} tables</span>
                    </div>

                    <div className="flex gap-2">
                      {platform.liveUrl && (
                        <a 
                          href={platform.liveUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-accent hover:underline"
                        >
                          Voir le site <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* CTA */}
            <div className="text-center mt-12">
              <Link to="/plateformes">
                <Button variant="outline" size="lg" className="group">
                  Voir toutes les plateformes en détail
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* STATS SECTION */}
      {/* ============================================ */}
      <section className="py-16 md:py-24 bg-hero-gradient text-white">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 grid-cols-2 md:grid-cols-4 text-center">
            {[
              { value: "7", label: "Plateformes" },
              { value: "1 300+", label: "Tests automatisés" },
              { value: "100%", label: "Made in France" },
              { value: "24/7", label: "Monitoring" },
            ].map((stat, index) => (
              <div 
                key={stat.label}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="text-4xl md:text-5xl lg:text-6xl font-bold text-accent mb-2">
                  {stat.value}
                </div>
                <div className="text-sm md:text-base text-white/70 tracking-wide">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* FINAL CTA SECTION */}
      {/* ============================================ */}
      <section className="py-20 md:py-32 bg-background">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/10 text-accent mb-8">
              <Sparkles className="h-8 w-8" />
            </div>
            
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold mb-6">
              Explorez l'écosystème
            </h2>
            <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
              Découvrez nos 7 plateformes innovantes et comment elles transforment leurs secteurs.
            </p>
            
            <Link to="/plateformes">
              <Button variant="executive" size="lg" className="group min-w-[240px]">
                <span>Voir les plateformes en détail</span>
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            
            <p className="mt-8 text-sm text-muted-foreground">
              EMOTIONSCARE SASU — SIREN 944 505 445 — Amiens, France
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
