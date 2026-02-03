import { lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Layers, Shield, Zap, Sparkles, Globe } from "lucide-react";
import { CardGridLoader } from "@/components/ui/skeleton-loader";

// Lazy load heavy component
const PlatformShowcase = lazy(() => 
  import("@/components/home/PlatformShowcase").then(module => ({
    default: module.PlatformShowcase
  }))
);

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section — Full Screen Immersive */}
      <section className="relative min-h-[85vh] sm:min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-hero-gradient" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(var(--accent)/0.15),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_80%_at_80%_50%,hsl(var(--primary)/0.3),transparent)]" />
        
        {/* Floating Orbs - Hidden on very small screens */}
        <div className="hidden sm:block absolute top-1/4 left-1/4 w-64 md:w-96 h-64 md:h-96 bg-accent/5 rounded-full blur-3xl animate-pulse" />
        <div className="hidden sm:block absolute bottom-1/4 right-1/4 w-48 md:w-80 h-48 md:h-80 bg-primary-foreground/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        
        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(hsl(var(--muted)/0.1)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--muted)/0.1)_1px,transparent_1px)] bg-[size:40px_40px] sm:bg-[size:60px_60px]" />

        <div className="container relative z-10 py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl text-center">
            {/* Pre-title Badge */}
            <div className="mb-6 sm:mb-8 animate-fade-in">
              <Badge variant="gold" className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium tracking-wide glow-gold">
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                Siège Social Numérique
              </Badge>
            </div>

            {/* Main Title */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[5.5rem] font-bold tracking-tighter text-primary-foreground mb-2 animate-slide-up leading-[0.95]">
              EMOTIONSCARE
            </h1>
            <div className="flex items-center justify-center gap-2 sm:gap-4 mb-6 sm:mb-8 animate-slide-up" style={{ animationDelay: "0.1s" }}>
              <div className="h-px w-8 sm:w-16 bg-gradient-to-r from-transparent to-accent/50" />
              <span className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-light text-accent tracking-[0.2em] sm:tracking-[0.3em]">
                SASU
              </span>
              <div className="h-px w-8 sm:w-16 bg-gradient-to-l from-transparent to-accent/50" />
            </div>

            {/* Tagline */}
            <p className="text-lg sm:text-xl md:text-2xl text-primary-foreground/70 mb-4 sm:mb-6 max-w-2xl mx-auto animate-slide-up font-light tracking-wide px-4" style={{ animationDelay: "0.15s" }}>
              Éditeur de logiciels applicatifs
            </p>
            <p className="text-base sm:text-lg text-primary-foreground/50 mb-8 sm:mb-12 max-w-xl mx-auto animate-slide-up px-4" style={{ animationDelay: "0.2s" }}>
              5 plateformes innovantes pilotées depuis notre siège numérique
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center animate-slide-up px-4" style={{ animationDelay: "0.25s" }}>
              <Link to="/plateformes" className="w-full sm:w-auto">
                <Button variant="hero" size="lg" className="group w-full sm:w-auto sm:min-w-[200px] md:min-w-[220px]">
                  <span>Découvrir</span>
                  <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link to="/vision" className="w-full sm:w-auto">
                <Button 
                  variant="ghost" 
                  size="lg" 
                  className="w-full sm:w-auto sm:min-w-[200px] md:min-w-[220px] border border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10 hover:border-primary-foreground/40"
                >
                  Notre vision
                </Button>
              </Link>
            </div>

            {/* Scroll Indicator - Hidden on mobile */}
            <div className="hidden sm:block mt-16 md:mt-20 animate-bounce">
              <div className="w-6 h-10 mx-auto border-2 border-primary-foreground/30 rounded-full flex items-start justify-center p-1">
                <div className="w-1.5 h-3 bg-accent rounded-full animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Proposition — Minimalist */}
      <section className="py-16 sm:py-24 md:py-32 lg:py-40 bg-background">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            {/* Section Header */}
            <div className="text-center mb-12 sm:mb-16 md:mb-20">
              <p className="text-xs sm:text-sm font-medium text-accent tracking-[0.15em] sm:tracking-[0.2em] uppercase mb-3 sm:mb-4">
                Pourquoi nous choisir
              </p>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-balance mb-4 sm:mb-6 px-2">
                L'excellence par la <span className="text-accent">simplicité</span>
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
                Une approche centralisée et structurée pour piloter l'innovation technologique.
              </p>
            </div>
            
            {/* Features Grid */}
            <div className="grid gap-6 sm:gap-8 md:gap-12 grid-cols-1 sm:grid-cols-3">
              {[
                {
                  icon: Layers,
                  title: "5 Plateformes",
                  description: "Un écosystème cohérent de solutions logicielles, toutes pilotées depuis un seul centre de commandement.",
                },
                {
                  icon: Shield,
                  title: "Sécurité",
                  description: "Standards de sécurité unifiés et gouvernance centralisée pour toutes nos solutions.",
                },
                {
                  icon: Zap,
                  title: "Agilité",
                  description: "Décisions rapides et informées grâce à un système de pilotage exécutif intelligent.",
                },
              ].map((feature, index) => (
                <div
                  key={feature.title}
                  className="group text-center p-6 sm:p-8 rounded-2xl hover:bg-secondary/50 transition-all duration-500 animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="mx-auto mb-4 sm:mb-6 flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-xl sm:rounded-2xl bg-accent/10 text-accent transition-all duration-300 group-hover:bg-accent group-hover:text-accent-foreground group-hover:scale-110 group-hover:shadow-lg">
                    <feature.icon className="h-6 w-6 sm:h-8 sm:w-8" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">{feature.title}</h3>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Platforms Showcase — Premium Apple-like (Lazy Loaded) */}
      <Suspense fallback={
        <section className="py-16 sm:py-24 md:py-32 lg:py-40 bg-background">
          <div className="container px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="h-8 w-48 mx-auto bg-muted/50 rounded-full animate-pulse mb-6" />
              <div className="h-12 w-64 mx-auto bg-muted/50 rounded-lg animate-pulse mb-4" />
              <div className="h-6 w-96 max-w-full mx-auto bg-muted/30 rounded-lg animate-pulse" />
            </div>
            <CardGridLoader count={4} />
          </div>
        </section>
      }>
        <PlatformShowcase />
      </Suspense>

      {/* Stats Section — Minimal & Impactful */}
      <section className="py-16 sm:py-24 md:py-32 bg-primary text-primary-foreground">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:gap-12 grid-cols-2 md:grid-cols-4 text-center">
            {[
              { value: "5", label: "Plateformes" },
              { value: "1", label: "Siège Unifié" },
              { value: "100%", label: "Made in France" },
              { value: "∞", label: "Possibilités" },
            ].map((stat, index) => (
              <div 
                key={stat.label}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold text-accent mb-1 sm:mb-3">
                  {stat.value}
                </div>
                <div className="text-sm sm:text-base md:text-lg text-primary-foreground/60 tracking-wide">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA — Full Width Premium */}
      <section className="py-20 sm:py-28 md:py-32 lg:py-40 bg-background relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-16 sm:h-24 bg-gradient-to-b from-transparent via-accent/30 to-transparent" />
        
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-accent/10 text-accent mb-6 sm:mb-8">
              <Globe className="h-7 w-7 sm:h-10 sm:w-10" />
            </div>
            
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold mb-4 sm:mb-6">
              Prêt à collaborer ?
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-8 sm:mb-10 max-w-xl mx-auto px-4">
              Discutons de vos besoins et découvrez comment notre écosystème peut vous accompagner.
            </p>
            
            <Link to="/contact" className="inline-block">
              <Button variant="executive" size="lg" className="group min-w-[200px] sm:min-w-[240px]">
                <span>Nous contacter</span>
                <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            
            <p className="mt-6 sm:mt-8 text-xs sm:text-sm text-muted-foreground">
              Basé à Amiens, France
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
