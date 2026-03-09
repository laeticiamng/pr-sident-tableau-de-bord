import { Search, MessageCircle, Rocket } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/contexts/LanguageContext";

const translations = {
  fr: {
    label: "Comment ça marche",
    title: "Trois étapes",
    titleAccent: "pour commencer",
    steps: [
      {
        icon: Search,
        title: "Choisissez votre plateforme",
        description: "Explorez nos 10 solutions et trouvez celle qui répond à votre besoin : santé, éducation, international ou croissance.",
      },
      {
        icon: MessageCircle,
        title: "Échangez avec notre équipe",
        description: "Contactez-nous pour découvrir la solution adaptée à votre métier. Réponse garantie sous 48h, sans engagement.",
      },
      {
        icon: Rocket,
        title: "Commencez à utiliser",
        description: "Interface intuitive, accompagnement intégré. Vous êtes opérationnel dès le premier jour.",
      },
    ],
  },
  en: {
    label: "How it works",
    title: "Three steps",
    titleAccent: "to get started",
    steps: [
      {
        icon: Search,
        title: "Choose your platform",
        description: "Browse our 10 solutions and find the one that fits your needs: healthcare, education, international or growth.",
      },
      {
        icon: MessageCircle,
        title: "Talk to our team",
        description: "Contact us to find the right solution for your profession. Guaranteed response within 48h, no commitment.",
      },
      {
        icon: Rocket,
        title: "Start using it",
        description: "Intuitive interface, built-in guidance. You're up and running from day one.",
      },
    ],
  },
  de: {
    label: "So funktioniert's",
    title: "Drei Schritte",
    titleAccent: "zum Start",
    steps: [
      {
        icon: Search,
        title: "Wählen Sie Ihre Plattform",
        description: "Entdecken Sie unsere 10 Lösungen und finden Sie die passende: Gesundheit, Bildung, International oder Wachstum.",
      },
      {
        icon: UserPlus,
        title: "Sprechen Sie mit unserem Team",
        description: "Kontaktieren Sie uns, um die richtige Lösung für Ihren Beruf zu finden. Antwort innerhalb von 48h garantiert, unverbindlich.",
      },
      {
        icon: Rocket,
        title: "Legen Sie los",
        description: "Intuitive Oberfläche, integrierte Anleitung. Ab dem ersten Tag einsatzbereit.",
      },
    ],
  },
} as const;

function StepCard({ step, index }: { step: { icon: typeof Search; title: string; description: string }; index: number }) {
  const { ref, isVisible } = useScrollAnimation<HTMLDivElement>();
  const Icon = step.icon;

  return (
    <div
      ref={ref}
      className={cn(
        "relative flex flex-col items-center text-center transition-all duration-700 ease-out",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      )}
      style={{ transitionDelay: `${index * 150}ms` }}
    >
      {/* Step number */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-xs font-bold z-10">
        {index + 1}
      </div>

      {/* Icon circle */}
      <div className="w-20 h-20 rounded-2xl bg-accent/10 flex items-center justify-center mb-5 mt-2">
        <Icon className="w-9 h-9 text-accent" />
      </div>

      <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">{step.description}</p>
    </div>
  );
}

export function HowItWorks() {
  const t = useTranslation(translations);

  return (
    <section className="py-20 md:py-28 bg-secondary/20">
      <div className="container px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-14">
            <p className="text-sm font-medium text-accent tracking-[0.2em] uppercase mb-4">{t.label}</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold">
              {t.title} <span className="text-accent">{t.titleAccent}</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 relative">
            {/* Connector line (desktop only) */}
            <div className="hidden md:block absolute top-12 left-[20%] right-[20%] h-px bg-border" aria-hidden="true" />

            {t.steps.map((step, i) => (
              <StepCard key={i} step={step} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
