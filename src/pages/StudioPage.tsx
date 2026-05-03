import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { usePageMeta } from "@/hooks/usePageMeta";
import {
  Sparkles,
  ArrowRight,
  Lightbulb,
  Layers,
  Network,
  Award,
  Compass,
  Building2,
  HeartPulse,
  Brain,
  Leaf,
  GraduationCap,
  Workflow,
  Users,
} from "lucide-react";

const DOMAINS = [
  { label: "Santé", icon: HeartPulse },
  { label: "IA", icon: Brain },
  { label: "Énergie", icon: Leaf },
  { label: "Territoires", icon: Building2 },
  { label: "Formation", icon: GraduationCap },
  { label: "Organisation", icon: Workflow },
  { label: "Social", icon: Users },
  { label: "Environnement", icon: Leaf },
  { label: "Immobilier", icon: Building2 },
  { label: "Services innovants", icon: Sparkles },
];

const METHODS = [
  {
    title: "1 — Cadrer",
    description: "Comprendre la problématique, l'écosystème, les contraintes réelles, les acteurs en présence.",
    icon: Compass,
  },
  {
    title: "2 — Concevoir",
    description: "Produire un Blueprint 360° structuré : problème, opportunité, solution, modèle, partenaires, KPIs, risques.",
    icon: Lightbulb,
  },
  {
    title: "3 — Activer",
    description: "Cartographier les financements, les partenaires, les institutions, et préparer le dossier de conviction.",
    icon: Layers,
  },
  {
    title: "4 — Accompagner",
    description: "Rester architecte stratégique : advisory, suivi, arbitrages clés. L'exécution reste portée par le partenaire.",
    icon: Network,
  },
];

const FORMATS = [
  {
    title: "Blueprint 360°",
    description: "Dossier stratégique complet en 12 sections — livrable signature du Studio.",
  },
  {
    title: "Réponse à appel à projets / AMI",
    description: "Architecture stratégique, angle gagnant, matrice partenaires, plan de déploiement.",
  },
  {
    title: "Advisory & participation minoritaire",
    description: "Implication continue comme architecte stratégique avec rémunération mixte cash + equity.",
  },
];

const CTAS = [
  { label: "Proposer une problématique", icon: Lightbulb },
  { label: "Demander un Blueprint 360°", icon: Sparkles },
  { label: "Soumettre un appel à projets", icon: Award },
];

export default function StudioPage() {
  usePageMeta({
    title: "EmotionSphere Studio — Architecture stratégique pour projets complexes",
    description:
      "EmotionSphere Studio transforme les problématiques complexes en projets clairs, crédibles, finançables et activables. Blueprint 360°, advisory, equity deals.",
    canonicalPath: "/studio",
  });

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center px-4">
            <Badge variant="gold" className="mb-6 inline-flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> EmotionSphere Studio
            </Badge>
            <p className="text-sm font-medium text-accent tracking-[0.2em] uppercase mb-4">
              Studio d'architecture stratégique
            </p>
            <h1 className="text-headline-1 md:text-display-2 mb-6 text-white">
              Du problème au projet.
              <span className="block text-accent">De la vision au blueprint.</span>
            </h1>
            <p className="text-lg md:text-xl text-white/80 font-medium leading-relaxed">
              Nous transformons les problématiques complexes en projets clairs, crédibles et activables.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button asChild size="lg" variant="secondary">
                <Link to="/contact" state={{ subject: "Studio — proposition de problématique" }}>
                  Proposer une problématique <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/20 bg-transparent text-white hover:bg-white/10">
                <Link to="/contact" state={{ subject: "Studio — demande de Blueprint 360°" }}>
                  Demander un Blueprint 360°
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Ce que nous faisons */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-headline-1 mb-4">Ce que nous faisons</h2>
            <p className="text-body-lg text-muted-foreground">
              EmotionSphere Studio conçoit des solutions stratégiques à partir de problématiques complexes, d'appels à projets ou d'opportunités émergentes. Une idée, un besoin ou une contrainte devient un projet structuré, crédible, finançable et activable.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {FORMATS.map((format) => (
              <div key={format.title} className="card-executive p-8">
                <h3 className="text-xl font-semibold mb-2">{format.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{format.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pour qui */}
      <section className="py-20 md:py-28 bg-muted/30">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center mb-12">
            <h2 className="text-headline-1 mb-4">Pour qui</h2>
            <p className="text-body-lg text-muted-foreground">
              Particuliers, entreprises, institutions, collectivités, opérateurs publics, porteurs de projets — toute organisation faisant face à une problématique complexe à transformer en projet activable.
            </p>
          </div>
        </div>
      </section>

      {/* Domaines */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center mb-12">
            <h2 className="text-headline-1 mb-4">Domaines d'intervention</h2>
            <p className="text-body-lg text-muted-foreground">
              La santé est notre socle de crédibilité, pas notre limite. EmotionSphere intervient sur tout sujet stratégique complexe.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 max-w-3xl mx-auto">
            {DOMAINS.map((domain) => (
              <div
                key={domain.label}
                className="flex flex-col items-center gap-2 rounded-lg border bg-card p-4 text-center"
              >
                <domain.icon className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">{domain.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Méthode */}
      <section className="py-20 md:py-28 bg-muted/30">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center mb-12">
            <h2 className="text-headline-1 mb-4">Méthode</h2>
            <p className="text-body-lg text-muted-foreground">
              Une démarche en 4 temps qui sépare la conception stratégique de l'exécution opérationnelle.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
            {METHODS.map((m) => (
              <div key={m.title} className="card-executive p-6 flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                  <m.icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">{m.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{m.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Advisory & equity */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-headline-1 mb-4">Advisory & prise de participation</h2>
            <p className="text-body-lg text-muted-foreground">
              Lorsque le projet présente un fort potentiel, EmotionSphere peut intervenir comme architecte stratégique associée, avec une participation minoritaire, un contrat d'advisory, un success fee ou un modèle hybride. Chaque deal est validé par un avocat ou un expert-comptable.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-headline-1 mb-4 text-white">Démarrer une conversation</h2>
            <p className="text-body-lg text-white/80 mb-8">
              Trois portes d'entrée pour activer EmotionSphere Studio sur votre problématique.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {CTAS.map((cta) => (
                <Button
                  asChild
                  key={cta.label}
                  size="lg"
                  variant="secondary"
                  className="gap-2"
                >
                  <Link to="/contact" state={{ subject: `Studio — ${cta.label}` }}>
                    <cta.icon className="h-4 w-4" /> {cta.label}
                  </Link>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
