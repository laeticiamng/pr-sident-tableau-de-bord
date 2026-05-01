import { forwardRef } from "react";
import { Database, ShieldCheck, Layers, Cloud, Workflow, Bot, Activity } from "lucide-react";
import { useTranslation } from "@/contexts/LanguageContext";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { cn } from "@/lib/utils";

const translations = {
  fr: {
    label: "Notre méthode",
    title: "Comment nos 10 logiciels",
    titleAccent: "tiennent debout",
    subtitle:
      "Chaque plateforme suit la même méthode rigoureuse, pensée et créée par Laeticia Motongane. Sept couches qui garantissent que vos données restent en sécurité, que rien ne se perd et que tout reste sous contrôle — sans que vous ayez à y penser.",
    layers: [
      { icon: Database, title: "Données rangées", description: "Chaque logiciel a son propre coffre-fort. Vos informations ne se mélangent jamais avec celles des autres." },
      { icon: ShieldCheck, title: "Accès verrouillé", description: "Seules les bonnes personnes voient les bonnes choses. Tout le reste est bloqué par défaut." },
      { icon: Layers, title: "Portes officielles uniquement", description: "Aucun raccourci possible. Toute donnée entre ou sort par un point de passage contrôlé et tracé." },
      { icon: Cloud, title: "Services connectés en sécurité", description: "Les fonctions automatisées vérifient toujours qui parle, ce qui est demandé, et nettoient leurs erreurs." },
      { icon: Workflow, title: "Aucune tâche perdue", description: "Si une action rate, elle est mise de côté et réessayée automatiquement, jusqu'à passer ou être signalée." },
      { icon: Bot, title: "Pilote automatique encadré", description: "Nos assistants IA travaillent seuls, mais ne se marchent jamais dessus et ne se relancent pas inutilement." },
      { icon: Activity, title: "Visibilité totale", description: "On voit en temps réel ce qui marche, ce qui ralentit et ce qui demande votre attention. Aucune zone grise." },
    ],
    signature: "Méthode pensée et déployée par Laeticia Motongane, Présidente d'EMOTIONSCARE SASU.",
    promise: "Résultat : vous utilisez. Nous garantissons.",
  },
  en: {
    label: "Our method",
    title: "How our 10 products",
    titleAccent: "stay rock-solid",
    subtitle:
      "Every platform follows the same rigorous method, designed and built by Laeticia Motongane. Seven layers that keep your data safe, ensure nothing is ever lost and keep everything under control — so you don't have to think about it.",
    layers: [
      { icon: Database, title: "Data, neatly stored", description: "Each product has its own vault. Your information never mixes with anyone else's." },
      { icon: ShieldCheck, title: "Locked access", description: "Only the right people see the right things. Everything else is blocked by default." },
      { icon: Layers, title: "Official doors only", description: "No shortcuts. Every piece of data goes through a controlled, traced checkpoint." },
      { icon: Cloud, title: "Safe connected services", description: "Automated functions always check who's asking, what's requested, and clean up their errors." },
      { icon: Workflow, title: "No task ever lost", description: "If an action fails, it is set aside and retried automatically until it passes or is flagged." },
      { icon: Bot, title: "Autopilot with guardrails", description: "Our AI assistants work on their own but never collide and never run twice for nothing." },
      { icon: Activity, title: "Full visibility", description: "You see in real time what works, what slows down, and what needs your attention. No grey zones." },
    ],
    signature: "Method designed and deployed by Laeticia Motongane, President of EMOTIONSCARE SASU.",
    promise: "Result: you use. We guarantee.",
  },
  de: {
    label: "Unsere Methode",
    title: "Wie unsere 10 Produkte",
    titleAccent: "felsenfest bleiben",
    subtitle:
      "Jede Plattform folgt derselben strengen Methode, entworfen und entwickelt von Laeticia Motongane. Sieben Schichten halten Ihre Daten sicher, sorgen dafür, dass nichts verloren geht und alles unter Kontrolle bleibt — ohne dass Sie daran denken müssen.",
    layers: [
      { icon: Database, title: "Daten geordnet abgelegt", description: "Jedes Produkt hat seinen eigenen Tresor. Ihre Daten vermischen sich nie mit anderen." },
      { icon: ShieldCheck, title: "Verriegelter Zugang", description: "Nur die richtigen Personen sehen die richtigen Dinge. Alles andere ist standardmäßig blockiert." },
      { icon: Layers, title: "Nur offizielle Türen", description: "Keine Abkürzungen. Jede Daten passiert einen kontrollierten, nachverfolgten Übergang." },
      { icon: Cloud, title: "Sicher verbundene Dienste", description: "Automatisierte Funktionen prüfen stets, wer fragt, was verlangt wird, und räumen ihre Fehler auf." },
      { icon: Workflow, title: "Keine Aufgabe geht verloren", description: "Wenn eine Aktion scheitert, wird sie zurückgestellt und automatisch wiederholt, bis sie gelingt oder gemeldet wird." },
      { icon: Bot, title: "Autopilot mit Leitplanken", description: "Unsere KI-Assistenten arbeiten allein, kollidieren nie und laufen nie unnötig doppelt." },
      { icon: Activity, title: "Volle Sichtbarkeit", description: "Sie sehen in Echtzeit, was läuft, was bremst und was Ihre Aufmerksamkeit verdient. Keine Grauzonen." },
    ],
    signature: "Methode entworfen und eingesetzt von Laeticia Motongane, Präsidentin von EMOTIONSCARE SASU.",
    promise: "Ergebnis: Sie nutzen. Wir garantieren.",
  },
} as const;

const Reveal = forwardRef<HTMLDivElement, { children: React.ReactNode; className?: string; delay?: number }>(
  function Reveal({ children, className, delay = 0 }, _ref) {
    const { ref, isVisible } = useScrollAnimation<HTMLDivElement>();
    return (
      <div
        ref={ref}
        className={cn(
          "transition-all duration-700 ease-out",
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6",
          className,
        )}
        style={{ transitionDelay: `${delay}ms` }}
      >
        {children}
      </div>
    );
  },
);

export function HomeArchitecture() {
  const t = useTranslation(translations);

  return (
    <section
      aria-label="Méthode d'architecture EMOTIONSCARE"
      className="relative py-20 md:py-28 bg-background overflow-hidden"
    >
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,hsl(var(--accent)/0.08),transparent)]"
        aria-hidden="true"
      />
      <div className="container relative px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <Reveal className="text-center mb-14">
            <p className="text-sm font-medium text-accent tracking-[0.2em] uppercase mb-4">
              {t.label}
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold mb-6">
              {t.title} <span className="text-accent">{t.titleAccent}</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              {t.subtitle}
            </p>
          </Reveal>

          {/* 7 couches en cartes simples + numérotées */}
          <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {t.layers.map((layer, index) => {
              const Icon = layer.icon;
              return (
                <Reveal key={layer.title} delay={index * 60}>
                  <div className="group relative h-full rounded-2xl border border-border/60 bg-card p-5 sm:p-6 hover:border-accent/40 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-2.5 rounded-xl bg-accent/10 text-accent w-fit transition-transform group-hover:scale-110">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span
                        className="text-3xl font-bold text-muted-foreground/20 tabular-nums"
                        aria-hidden="true"
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <h3 className="text-base font-semibold mb-2">{layer.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {layer.description}
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </div>

          {/* Promesse + signature */}
          <Reveal delay={500} className="mt-12 text-center">
            <div className="inline-flex flex-col items-center gap-3 px-6 py-5 rounded-2xl bg-secondary/40 border border-border/50 max-w-2xl mx-auto">
              <p className="text-lg font-medium text-foreground">{t.promise}</p>
              <p className="text-sm text-muted-foreground italic">{t.signature}</p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}