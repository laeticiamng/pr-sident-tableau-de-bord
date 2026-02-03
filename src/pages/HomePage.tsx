import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MANAGED_PLATFORMS } from "@/lib/constants";
import { ArrowRight, Building2, Layers, Shield, Zap, Sparkles, Globe, ChevronRight } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section — Full Screen Immersive */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-hero-gradient" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(38_92%_50%/0.15),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_80%_at_80%_50%,hsl(222_47%_20%/0.5),transparent)]" />
        
        {/* Floating Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary-foreground/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        
        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(hsl(220_25%_20%/0.1)_1px,transparent_1px),linear-gradient(90deg,hsl(220_25%_20%/0.1)_1px,transparent_1px)] bg-[size:60px_60px]" />

        <div className="container relative z-10 py-20">
          <div className="mx-auto max-w-5xl text-center">
            {/* Pre-title Badge */}
            <div className="mb-8 animate-fade-in">
              <Badge variant="gold" className="px-4 py-2 text-sm font-medium tracking-wide glow-gold">
                <Sparkles className="w-4 h-4 mr-2" />
                Siège Social Numérique
              </Badge>
            </div>

            {/* Main Title */}
            <h1 className="text-display-2 md:text-display-1 lg:text-[5.5rem] font-bold tracking-tighter text-primary-foreground mb-2 animate-slide-up leading-[0.9]">
              EMOTIONSCARE
            </h1>
            <div className="flex items-center justify-center gap-4 mb-8 animate-slide-up" style={{ animationDelay: "0.1s" }}>
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-accent/50" />
              <span className="text-3xl md:text-4xl lg:text-5xl font-light text-accent tracking-[0.3em]">
                SASU
              </span>
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-accent/50" />
            </div>

            {/* Tagline */}
            <p className="text-xl md:text-2xl text-primary-foreground/70 mb-6 max-w-2xl mx-auto animate-slide-up font-light tracking-wide" style={{ animationDelay: "0.15s" }}>
              Éditeur de logiciels applicatifs
            </p>
            <p className="text-lg text-primary-foreground/50 mb-12 max-w-xl mx-auto animate-slide-up" style={{ animationDelay: "0.2s" }}>
              5 plateformes innovantes pilotées depuis notre siège numérique
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: "0.25s" }}>
              <Link to="/plateformes">
                <Button variant="hero" size="xl" className="group min-w-[220px]">
                  <span>Découvrir</span>
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link to="/vision">
                <Button 
                  variant="ghost" 
                  size="xl" 
                  className="border border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10 hover:border-primary-foreground/40 min-w-[220px]"
                >
                  Notre vision
                </Button>
              </Link>
            </div>

            {/* Scroll Indicator */}
            <div className="mt-20 animate-bounce">
              <div className="w-6 h-10 mx-auto border-2 border-primary-foreground/30 rounded-full flex items-start justify-center p-1">
                <div className="w-1.5 h-3 bg-accent rounded-full animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Proposition — Minimalist */}
      <section className="py-32 md:py-40 bg-background">
        <div className="container">
          <div className="mx-auto max-w-4xl">
            {/* Section Header */}
            <div className="text-center mb-20">
              <p className="text-sm font-medium text-accent tracking-[0.2em] uppercase mb-4">
                Pourquoi nous choisir
              </p>
              <h2 className="text-headline-1 md:text-display-2 text-balance mb-6">
                L'excellence par la <span className="text-accent">simplicité</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Une approche centralisée et structurée pour piloter l'innovation technologique.
              </p>
            </div>
            
            {/* Features Grid */}
            <div className="grid gap-8 md:gap-12 md:grid-cols-3">
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
                  className="group text-center p-8 rounded-2xl hover:bg-secondary/50 transition-all duration-500 animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10 text-accent transition-all duration-300 group-hover:bg-accent group-hover:text-accent-foreground group-hover:scale-110 group-hover:shadow-lg group-hover:glow-gold">
                    <feature.icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Platforms Showcase — Premium Cards */}
      <section className="py-32 md:py-40 bg-subtle-gradient relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(38_92%_50%/0.03),transparent_50%)]" />
        
        <div className="container relative">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-16">
            <div>
              <p className="text-sm font-medium text-accent tracking-[0.2em] uppercase mb-4">
                Écosystème
              </p>
              <h2 className="text-headline-1 md:text-display-2">
                Nos Plateformes
              </h2>
            </div>
            <Link to="/plateformes" className="group">
              <span className="inline-flex items-center gap-2 text-lg font-medium text-foreground hover:text-accent transition-colors">
                Tout voir
                <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          </div>
          
          {/* Platform Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {MANAGED_PLATFORMS.map((platform, index) => (
              <div
                key={platform.key}
                className="group relative bg-card rounded-2xl border p-8 hover:shadow-xl transition-all duration-500 animate-fade-in overflow-hidden"
                style={{ animationDelay: `${index * 0.08}s` }}
              >
                {/* Hover Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative">
                  {/* Status Dot */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className={`w-3 h-3 rounded-full ${platform.color} shadow-sm`} />
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Active
                    </span>
                  </div>

                  {/* Platform Info */}
                  <h3 className="text-2xl font-semibold mb-3 group-hover:text-accent transition-colors">
                    {platform.name}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed mb-6">
                    {platform.description}
                  </p>

                  {/* Arrow Link */}
                  <div className="flex items-center gap-2 text-sm font-medium text-accent opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                    En savoir plus
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section — Minimal & Impactful */}
      <section className="py-24 md:py-32 bg-primary text-primary-foreground">
        <div className="container">
          <div className="grid gap-12 md:grid-cols-4 text-center">
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
                <div className="text-5xl md:text-6xl lg:text-7xl font-bold text-accent mb-3">
                  {stat.value}
                </div>
                <div className="text-lg text-primary-foreground/60 tracking-wide">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA — Full Width Premium */}
      <section className="py-32 md:py-40 bg-background relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-b from-transparent via-accent/30 to-transparent" />
        
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-accent/10 text-accent mb-8">
              <Globe className="h-10 w-10" />
            </div>
            
            <h2 className="text-headline-1 md:text-display-2 mb-6">
              Prêt à collaborer ?
            </h2>
            <p className="text-xl text-muted-foreground mb-10 max-w-xl mx-auto">
              Discutons de vos besoins et découvrez comment notre écosystème peut vous accompagner.
            </p>
            
            <Link to="/contact">
              <Button variant="executive" size="xl" className="group min-w-[240px]">
                <span>Nous contacter</span>
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            
            <p className="mt-8 text-sm text-muted-foreground">
              Basé à Amiens, France
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
