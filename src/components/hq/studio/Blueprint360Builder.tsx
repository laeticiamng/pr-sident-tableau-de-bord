import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  Award,
  Building2,
  Compass,
  Coins,
  HeartPulse,
  Layers,
  LineChart,
  Network,
  ScrollText,
  Sparkles,
  Target,
  Users,
} from "lucide-react";

interface BlueprintSection {
  id: string;
  number: number;
  title: string;
  icon: React.ElementType;
  description: string;
  bullets: string[];
}

const SECTIONS: BlueprintSection[] = [
  {
    id: "problem",
    number: 1,
    title: "Problème",
    icon: HeartPulse,
    description: "Besoin réel, contexte, douleur, urgence, raisons de l'inaction.",
    bullets: [
      "Quel besoin ou douleur (utilisateur, institution) ?",
      "Pourquoi le problème n'est-il pas encore résolu ?",
      "Quelle urgence justifie d'agir maintenant ?",
    ],
  },
  {
    id: "opportunity",
    number: 2,
    title: "Opportunité",
    icon: Compass,
    description: "Pourquoi maintenant, pourquoi ce territoire, financements possibles.",
    bullets: [
      "Tendances favorables (réglementaires, marché, sociétales).",
      "Appels à projets ou financements activables.",
      "Fenêtres de tir politiques ou institutionnelles.",
    ],
  },
  {
    id: "solution",
    number: 3,
    title: "Solution proposée",
    icon: Sparkles,
    description: "Concept, mécanisme, parcours utilisateur, différenciation.",
    bullets: [
      "Concept en une phrase claire.",
      "Mécanisme de valeur : comment ça marche ?",
      "Différenciation par rapport à l'existant.",
    ],
  },
  {
    id: "targets",
    number: 4,
    title: "Cibles",
    icon: Target,
    description: "Bénéficiaires, clients, financeurs, partenaires, institutions.",
    bullets: [
      "Bénéficiaires finaux (qui en profite ?).",
      "Acheteurs / financeurs (qui paie ?).",
      "Partenaires institutionnels associés.",
    ],
  },
  {
    id: "business_model",
    number: 5,
    title: "Modèle économique",
    icon: Coins,
    description: "Revenus, coûts, viabilité, hypothèses à vérifier.",
    bullets: [
      "Sources de revenus identifiées.",
      "Structure de coûts critiques.",
      "Hypothèses fortes à valider rapidement.",
    ],
  },
  {
    id: "partners",
    number: 6,
    title: "Partenaires",
    icon: Network,
    description: "Opérationnels, financeurs, collectivités, experts.",
    bullets: [
      "Partenaires opérationnels indispensables.",
      "Financeurs publics / privés.",
      "Experts, associations, collectivités.",
    ],
  },
  {
    id: "deployment_plan",
    number: 7,
    title: "Déploiement",
    icon: Layers,
    description: "Phases : cadrage, pilote, expérimentation, déploiement, échelle.",
    bullets: [
      "Phase 0 : cadrage (4-8 semaines).",
      "Phase 1 : pilote restreint.",
      "Phase 2-4 : expérimentation, déploiement, échelle.",
    ],
  },
  {
    id: "kpis",
    number: 8,
    title: "Indicateurs",
    icon: LineChart,
    description: "KPI d'impact, financiers, opérationnels, utilisateurs.",
    bullets: [
      "KPI d'impact mesurable (3 max).",
      "KPI financiers / soutenabilité.",
      "Critères de succès non négociables.",
    ],
  },
  {
    id: "risks",
    number: 9,
    title: "Risques",
    icon: AlertTriangle,
    description: "Juridique, financier, opérationnel, réputationnel, exécution.",
    bullets: [
      "Risques juridiques / RGPD / éthiques.",
      "Risques financiers (cash, modèle).",
      "Risques opérationnels et dépendances critiques.",
    ],
  },
  {
    id: "pitch",
    number: 10,
    title: "Dossier de conviction",
    icon: ScrollText,
    description: "Pitch court, pitch long, argumentaire, storytelling.",
    bullets: [
      "Pitch 30 secondes.",
      "Pitch 2 minutes (institutionnel).",
      "Storytelling et preuves d'impact.",
    ],
  },
  {
    id: "emotionsphere_role",
    number: 11,
    title: "Rôle d'EmotionSphere",
    icon: Building2,
    description: "Architecte stratégique, conceptrice, advisor, partenaire minoritaire.",
    bullets: [
      "Mode d'intervention (architecte, advisor, partenaire).",
      "Modalités de suivi proposées.",
      "Frontière claire entre conception et exécution.",
    ],
  },
  {
    id: "deal_recommendation",
    number: 12,
    title: "Deal recommandé",
    icon: Award,
    description: "Equity, forfait, success fee, advisory, BSA, participation directe.",
    bullets: [
      "Type de deal recommandé.",
      "Fourchette d'equity et conditions.",
      "Documents juridiques à exiger avant engagement.",
    ],
  },
];

export function Blueprint360Builder() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {SECTIONS.map((section) => (
          <Card key={section.id} className="border-border/60">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <section.icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] tabular-nums">
                      {String(section.number).padStart(2, "0")}
                    </Badge>
                    <CardTitle className="text-sm">{section.title}</CardTitle>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              <p className="text-xs text-muted-foreground">{section.description}</p>
              <ul className="space-y-1.5 text-xs">
                {section.bullets.map((bullet, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Users className="h-3 w-3 text-primary/60 mt-0.5 flex-shrink-0" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
