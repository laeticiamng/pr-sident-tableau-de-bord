import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FolderOpen, FileText, Mail, Handshake } from "lucide-react";

interface TemplateItem {
  id: string;
  title: string;
  description: string;
  category: "blueprint" | "deal" | "communication" | "decision";
  preview: string;
  icon: React.ElementType;
}

const TEMPLATES: TemplateItem[] = [
  {
    id: "note-opportunity",
    title: "Note d'opportunité",
    description: "Synthèse 1 page d'une opportunité détectée — problème, opportunité, recommandation.",
    category: "blueprint",
    icon: FileText,
    preview:
      "Problème · Pourquoi maintenant · Solution proposée · Cibles · Modèle économique · Recommandation EmotionSphere.",
  },
  {
    id: "blueprint-360",
    title: "Blueprint 360°",
    description: "Dossier stratégique complet en 12 sections, livrable signature du Studio.",
    category: "blueprint",
    icon: FileText,
    preview:
      "Problème · Opportunité · Solution · Cibles · Modèle économique · Partenaires · Déploiement · Indicateurs · Risques · Pitch · Rôle EmotionSphere · Deal recommandé.",
  },
  {
    id: "appel-courte",
    title: "Réponse courte à un appel à projets",
    description: "Format 4 pages pour AMI ou candidature initiale.",
    category: "blueprint",
    icon: FileText,
    preview:
      "Contexte → Solution → Différenciation → Plan de déploiement → Budget → Équipe → Risques.",
  },
  {
    id: "pitch-institutionnel",
    title: "Pitch institutionnel",
    description: "Argumentaire ARS / collectivité / financeur.",
    category: "blueprint",
    icon: FileText,
    preview:
      "Storytelling 90 secondes, alignement politiques publiques, preuves d'impact, ROI sociétal.",
  },
  {
    id: "advisory-equity",
    title: "Proposition d'advisory equity",
    description: "Modèle de proposition mensuelle avec rémunération mixte cash + equity.",
    category: "deal",
    icon: Handshake,
    preview:
      "Périmètre advisory · Cadence · Engagement mensuel · Rémunération cash + BSA advisor · Sortie.",
  },
  {
    id: "deal-hybride",
    title: "Proposition de deal hybride",
    description: "Forfait + success fee + equity minoritaire pour Blueprint complet.",
    category: "deal",
    icon: Handshake,
    preview:
      "Forfait initial · Success fee à étape · Equity minoritaire avec vesting · Clause de non-contournement.",
  },
  {
    id: "checklist-juridique",
    title: "Checklist juridique",
    description: "Documents à exiger avant tout engagement structurant.",
    category: "decision",
    icon: FileText,
    preview:
      "NDA · Preuve d'antériorité (e-Soleau) · Lettre de mission · Term sheet · Pacte d'associés · Contrat advisory · Validation avocat.",
  },
  {
    id: "matrice-decision",
    title: "Matrice décisionnelle accepter / refuser",
    description: "Grille pour décider d'engager EmotionSphere sur un projet.",
    category: "decision",
    icon: FileText,
    preview:
      "Score stratégique · Risque exécution · Qualité équipe porteuse · Effort vs. valeur future · Décision.",
  },
  {
    id: "mail-institution",
    title: "E-mail de prise de contact (institution)",
    description: "Premier contact ARS, collectivité, opérateur public.",
    category: "communication",
    icon: Mail,
    preview:
      "Madame, Monsieur, EmotionSphere Studio conçoit des architectures stratégiques sur des problématiques complexes. Nous souhaitons vous présenter…",
  },
  {
    id: "mail-porteur",
    title: "E-mail de proposition (porteur de projet)",
    description: "Proposition à un porteur après détection d'une problématique.",
    category: "communication",
    icon: Mail,
    preview:
      "Bonjour, suite à notre échange sur [problématique], EmotionSphere Studio peut intervenir comme architecte stratégique du projet…",
  },
];

const CATEGORY_LABEL: Record<TemplateItem["category"], string> = {
  blueprint: "Livrable",
  deal: "Deal",
  communication: "Communication",
  decision: "Décision",
};

const CATEGORY_TONE: Record<TemplateItem["category"], string> = {
  blueprint: "bg-primary/10 text-primary",
  deal: "bg-warning/10 text-warning",
  communication: "bg-accent/10 text-accent",
  decision: "bg-success/10 text-success",
};

const PROPOSAL_STATEMENT = `EmotionSphere Studio intervient comme architecte stratégique du projet. Notre rôle consiste à structurer l'opportunité, formaliser le concept, produire le blueprint stratégique, clarifier le modèle économique, identifier les partenaires clés et accompagner les arbitrages de lancement. Selon le niveau d'implication, cette contribution peut être rémunérée par une participation minoritaire, un success fee, un contrat d'advisory ou un modèle hybride.`;

export default function StudioTemplatesPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
          <FolderOpen className="h-5 w-5 text-primary" />
          Templates Studio
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Modèles pré-formatés pour accélérer la production des livrables : Blueprint 360°, propositions de deal, checklist juridique, communications institutionnelles.
        </p>
      </div>

      <Card className="border-border/60 bg-muted/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Phrase de proposition standard</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed text-muted-foreground italic">
            « {PROPOSAL_STATEMENT} »
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {TEMPLATES.map((template) => (
          <Card key={template.id} className="border-border/60">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <template.icon className="h-4 w-4" />
                  </div>
                  <CardTitle className="text-sm leading-tight">{template.title}</CardTitle>
                </div>
                <Badge variant="outline" className={`text-[10px] ${CATEGORY_TONE[template.category]}`}>
                  {CATEGORY_LABEL[template.category]}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              <p className="text-xs text-muted-foreground">{template.description}</p>
              <div className="rounded-md border border-border/60 bg-muted/30 p-3 text-[11px] leading-relaxed text-muted-foreground">
                {template.preview}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
