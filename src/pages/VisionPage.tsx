import { useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Target, Lightbulb, Heart, TrendingUp, Shield, Users, Award, Rocket, Layers } from "lucide-react";
import { AnimatedCounter } from "@/components/hq/AnimatedCounter";
import { MANAGED_PLATFORMS } from "@/lib/constants";

export default function VisionPage() {
  // SEO: Update document meta for this page
  useEffect(() => {
    document.title = "Notre Vision — EMOTIONSCARE";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", "Découvrez la vision et les valeurs d'EMOTIONSCARE : excellence, innovation, empathie et croissance. Une mission claire : créer des logiciels qui simplifient la vie.");
    }
    return () => {
      document.title = "EMOTIONSCARE — Siège Social Numérique";
      if (metaDescription) {
        metaDescription.setAttribute("content", "Éditeur de logiciels applicatifs français. 7 plateformes innovantes pilotées depuis notre siège numérique.");
      }
    };
  }, []);
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="py-20 md:py-28 bg-hero-gradient text-white">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center px-4">
            <Badge variant="gold" className="mb-6">
              Notre Vision
            </Badge>
            <p className="text-sm font-medium text-accent tracking-[0.2em] uppercase mb-4">
              7 plateformes · 1 mission
            </p>
            <h1 className="text-headline-1 md:text-display-2 mb-6 text-white">
              Construire l'avenir
              <span className="block text-accent">du logiciel</span>
            </h1>
            <p className="text-lg md:text-xl text-white/90 font-medium leading-relaxed">
              Chez EMOTIONSCARE, nous croyons que la technologie doit servir 
              l'humain, pas l'inverse. Notre mission : créer des outils 
              qui simplifient la vie et libèrent le potentiel de chacun.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-headline-1 mb-4">Nos Valeurs</h2>
            <p className="text-body-lg text-muted-foreground">
              Les principes qui guident chacune de nos décisions.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {[
              {
                icon: Target,
                title: "Excellence",
                description:
                  "Nous visons l'excellence dans chaque ligne de code, chaque interface, chaque interaction. Pas de compromis sur la qualité.",
              },
              {
                icon: Lightbulb,
                title: "Innovation",
                description:
                  "L'innovation est dans notre ADN. Nous explorons constamment de nouvelles approches pour résoudre les problèmes complexes.",
              },
              {
                icon: Heart,
                title: "Empathie",
                description:
                  "Nous concevons nos produits en pensant d'abord aux utilisateurs. Comprendre leurs besoins est notre priorité absolue.",
              },
              {
                icon: TrendingUp,
                title: "Croissance",
                description:
                  "Nous cultivons une culture d'apprentissage continu. Chaque défi est une opportunité de progresser.",
              },
            ].map((value, index) => (
              <div
                key={value.title}
                className="card-executive p-8 animate-fade-in hover:shadow-lg transition-all duration-300"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-start gap-6">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                    <value.icon className="h-7 w-7" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                    <p className="text-muted-foreground">{value.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Chiffres Clés */}
      <section className="py-16 md:py-24 bg-hero-gradient text-white">
        <div className="container">
          <div className="grid gap-8 grid-cols-2 md:grid-cols-4 text-center">
            {[
              { value: 7, suffix: "", label: "Plateformes", icon: Layers },
              { value: 39, suffix: "", label: "Agents IA", icon: Rocket },
              { value: 100, suffix: "%", label: "Made in France", icon: Shield },
              { value: 24, suffix: "/7", label: "Monitoring", icon: Award },
            ].map((stat, index) => (
              <div
                key={stat.label}
                className="p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <stat.icon className="w-6 h-6 text-accent mx-auto mb-3" />
                <div className="text-3xl md:text-4xl lg:text-5xl font-bold text-accent mb-1">
                  <AnimatedCounter value={stat.value} duration={1200} suffix={stat.suffix} />
                </div>
                <div className="text-sm text-white/70 tracking-wide">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-20 md:py-28 bg-secondary">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-headline-1 mb-8 text-foreground">Notre Mission</h2>
            <blockquote className="text-2xl md:text-3xl font-medium italic text-foreground leading-relaxed">
              "Créer des logiciels qui transforment la complexité en simplicité, 
              et qui permettent à chacun de se concentrer sur ce qui compte vraiment."
            </blockquote>
            <p className="mt-6 text-base text-muted-foreground leading-relaxed max-w-xl mx-auto">
              Depuis Amiens, nous construisons un écosystème technologique français 
              au service de la santé, de l'éducation et de l'innovation.
            </p>
            <p className="mt-4 text-accent font-medium">
              — Motongane Laeticia, Présidente
            </p>
          </div>
        </div>
      </section>

      {/* Engagements */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-headline-1 mb-4">Nos Engagements</h2>
            <p className="text-body-lg text-muted-foreground">
              Ce que nous promettons à nos utilisateurs et partenaires.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-4">
            {[
              {
                icon: Shield,
                title: "Sécurité",
                stat: "100%",
                description: "Données chiffrées et RLS activé"
              },
              {
                icon: Users,
                title: "Accessibilité",
                stat: "WCAG AA",
                description: "Interfaces inclusives"
              },
              {
                icon: Award,
                title: "Qualité",
                stat: `${MANAGED_PLATFORMS.reduce((s, p) => s + p.stats.tests, 0).toLocaleString("fr-FR")}+`,
                description: "Tests automatisés"
              },
              {
                icon: Rocket,
                title: "Performance",
                stat: "99.9%",
                description: "Disponibilité visée"
              },
            ].map((engagement, index) => (
              <div
                key={engagement.title}
                className="text-center p-6 rounded-2xl border hover:border-accent/50 transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent">
                  <engagement.icon className="h-6 w-6" />
                </div>
                <div className="text-2xl font-bold text-accent mb-1">{engagement.stat}</div>
                <h3 className="font-semibold mb-1">{engagement.title}</h3>
                <p className="text-sm text-muted-foreground">{engagement.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 md:py-28 bg-secondary/50">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-headline-1 mb-4">Notre Histoire</h2>
            <p className="text-body-lg text-muted-foreground">
              Une aventure entrepreneuriale ambitieuse.
            </p>
          </div>

          <div className="mx-auto max-w-2xl">
            <div className="relative border-l-2 border-accent/30 pl-8 space-y-12">
              <div className="relative">
                <div className="absolute -left-[41px] h-4 w-4 rounded-full bg-accent shadow-lg shadow-accent/30" />
                <div className="text-sm font-medium text-accent mb-2">Mai 2025</div>
                <h3 className="text-xl font-semibold mb-2">Création d'EMOTIONSCARE SASU</h3>
                <p className="text-muted-foreground">
                  Immatriculation au RCS d'Amiens (SIREN 944 505 445). 
                  Début de l'aventure entrepreneuriale dans l'édition de logiciels applicatifs.
                </p>
              </div>
              <div className="relative">
                <div className="absolute -left-[41px] h-4 w-4 rounded-full bg-accent/80" />
                <div className="text-sm font-medium text-accent mb-2">2025</div>
                <h3 className="text-xl font-semibold mb-2">Lancement des premières plateformes</h3>
                <p className="text-muted-foreground">
                  Développement et mise en production de l'écosystème fondateur : 
                   EmotionsCare, NEARVITY, System Compass, Growth Copilot et Med MNG.
                </p>
              </div>
              <div className="relative">
                <div className="absolute -left-[41px] h-4 w-4 rounded-full bg-accent/60" />
                <div className="text-sm font-medium text-accent mb-2">Début 2026</div>
                <h3 className="text-xl font-semibold mb-2">Siège Social Numérique & Expansion</h3>
                <p className="text-muted-foreground">
                   Création du Siège Social Numérique — Centre de commandement unifié avec IA intégrée. 
                   Lancement d'UrgenceOS (urgences hospitalières) et Track Triumph (compétition musicale), portant l'écosystème à 7 plateformes.
                </p>
              </div>
              <div className="relative">
                <div className="absolute -left-[41px] h-4 w-4 rounded-full bg-accent/40" />
                <div className="text-sm font-medium text-accent mb-2">Mi-2026</div>
                <h3 className="text-xl font-semibold mb-2">Expansion & Intégrations</h3>
                <p className="text-muted-foreground">
                  Intégration des outils tiers (CRM, Analytics, Support) et 
                  déploiement des 39 agents IA de Growth Copilot.
                </p>
              </div>
              <div className="relative">
                <div className="absolute -left-[41px] h-4 w-4 rounded-full border-2 border-accent bg-background" />
                <div className="text-sm font-medium text-muted-foreground mb-2">À venir</div>
                <h3 className="text-xl font-semibold mb-2">Et demain ?</h3>
                <p className="text-muted-foreground">
                  Expansion internationale, nouvelles plateformes et partenariats stratégiques. 
                  L'histoire continue de s'écrire...
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
