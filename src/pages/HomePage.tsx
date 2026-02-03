import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MANAGED_PLATFORMS } from "@/lib/constants";
import { ArrowRight, Building2, Layers, Shield, Zap } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-hero-gradient text-primary-foreground">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-accent/20 via-transparent to-transparent" />
        <div className="container relative py-24 md:py-32 lg:py-40">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="gold" className="mb-6 animate-fade-in">
              Siège Social Numérique
            </Badge>
            <h1 className="text-display-2 md:text-display-1 text-balance mb-6 animate-slide-up">
              EMOTIONSCARE
              <span className="block text-accent">SASU</span>
            </h1>
            <p className="text-body-lg text-primary-foreground/80 mb-10 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: "0.1s" }}>
              Éditeur de logiciels applicatifs. Nous pilotons 5 plateformes innovantes 
              depuis notre siège numérique à Amiens.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <Link to="/plateformes">
                <Button variant="hero" size="xl">
                  Découvrir nos plateformes
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/vision">
                <Button variant="executive-outline" size="xl" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                  Notre vision
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Decorative bottom wave */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-background" style={{ clipPath: "ellipse(70% 100% at 50% 100%)" }} />
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-headline-1 mb-4">Pourquoi EMOTIONSCARE ?</h2>
            <p className="text-body-lg text-muted-foreground">
              Une approche centralisée et structurée pour piloter l'innovation.
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                icon: Layers,
                title: "5 Plateformes",
                description: "Un écosystème cohérent de solutions logicielles innovantes, toutes pilotées depuis un seul siège.",
              },
              {
                icon: Shield,
                title: "Sécurité Renforcée",
                description: "Chaque plateforme bénéficie des mêmes standards de sécurité et de gouvernance.",
              },
              {
                icon: Zap,
                title: "Agilité Exécutive",
                description: "Des décisions rapides et informées grâce à un système de pilotage centralisé.",
              },
            ].map((feature, index) => (
              <div
                key={feature.title}
                className="card-executive p-8 text-center group animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 text-accent transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
                  <feature.icon className="h-7 w-7" />
                </div>
                <h3 className="text-headline-2 mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platforms Preview */}
      <section className="py-20 md:py-28 bg-subtle-gradient">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-headline-1 mb-4">Nos Plateformes</h2>
            <p className="text-body-lg text-muted-foreground">
              5 solutions logicielles, un seul objectif : l'excellence.
            </p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {MANAGED_PLATFORMS.slice(0, 3).map((platform, index) => (
              <div
                key={platform.key}
                className="card-executive p-6 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`w-3 h-3 rounded-full ${platform.color} mb-4`} />
                <h3 className="text-xl font-semibold mb-2">{platform.name}</h3>
                <p className="text-sm text-muted-foreground">{platform.description}</p>
              </div>
            ))}
          </div>
          
          <div className="mt-10 text-center">
            <Link to="/plateformes">
              <Button variant="executive-outline" size="lg">
                Voir toutes les plateformes
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center card-executive p-12 md:p-16 bg-primary text-primary-foreground">
            <Building2 className="h-12 w-12 mx-auto mb-6 text-accent" />
            <h2 className="text-headline-1 mb-4">Prêt à nous contacter ?</h2>
            <p className="text-body-lg text-primary-foreground/80 mb-8">
              Discutons de vos besoins et découvrez comment nos plateformes 
              peuvent vous accompagner.
            </p>
            <Link to="/contact">
              <Button variant="hero" size="xl">
                Nous contacter
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
