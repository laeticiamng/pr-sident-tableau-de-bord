import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, FileText, Scale, ShieldAlert } from "lucide-react";

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  trigger: string;
  importance: "obligatoire" | "fortement_recommande" | "selon_contexte";
}

const CHECKLIST: ChecklistItem[] = [
  {
    id: "nda",
    title: "NDA mutuel signé",
    description: "Confidentialité avant transmission de tout Blueprint complet ou note d'opportunité élaborée.",
    trigger: "Avant envoi du Blueprint",
    importance: "obligatoire",
  },
  {
    id: "esoleau",
    title: "Preuve d'antériorité (e-Soleau / dépôt INPI)",
    description: "Horodatage du concept fondateur, du Blueprint et des éléments de propriété intellectuelle.",
    trigger: "Avant toute réunion stratégique externe",
    importance: "obligatoire",
  },
  {
    id: "non-circumvention",
    title: "Clause de non-contournement",
    description: "Empêche le porteur de projet de contacter directement les partenaires identifiés sans EmotionSphere.",
    trigger: "Avant transmission de la matrice partenaires",
    importance: "obligatoire",
  },
  {
    id: "lettre-mission",
    title: "Lettre de mission signée",
    description: "Cadre la prestation de conception (périmètre, livrables, calendrier, rémunération).",
    trigger: "Avant production effective",
    importance: "obligatoire",
  },
  {
    id: "term-sheet",
    title: "Term sheet signée",
    description: "Synthèse juridique du deal proposé (equity, governance, cash, success fee, vesting, sortie).",
    trigger: "Avant rédaction du pacte",
    importance: "fortement_recommande",
  },
  {
    id: "advisory-contract",
    title: "Contrat d'advisory",
    description: "Définit cadence, périmètre, rémunération mensuelle, BSA advisor éventuel et clauses de sortie.",
    trigger: "Si advisory continu post-Blueprint",
    importance: "fortement_recommande",
  },
  {
    id: "shareholder-pact",
    title: "Pacte d'associés",
    description: "Gouvernance, anti-dilution, droits politiques, drag/tag, sortie. Indispensable dès qu'EmotionSphere prend une participation significative.",
    trigger: "Si participation directe ≥ 5%",
    importance: "fortement_recommande",
  },
  {
    id: "valuation",
    title: "Valorisation indépendante",
    description: "Avis d'un expert-comptable ou commissaire aux apports si BSA, AGA ou apport en industrie.",
    trigger: "Si rémunération en titres",
    importance: "selon_contexte",
  },
  {
    id: "bsa-doc",
    title: "Documentation BSA / BSPCE",
    description: "Émission, vesting, conditions de levée, clauses de bad/good leaver.",
    trigger: "Si BSA advisor",
    importance: "selon_contexte",
  },
  {
    id: "rgpd",
    title: "Validation RGPD / éthique",
    description: "Si le projet traite des données sensibles (santé, mineurs, biométrie), validation DPO + analyse d'impact.",
    trigger: "Selon nature du projet",
    importance: "obligatoire",
  },
  {
    id: "ai-act",
    title: "Conformité AI Act",
    description: "Si IA générative, IA à risque ou prise de décision automatisée, vérifier le niveau de risque européen.",
    trigger: "Si composante IA",
    importance: "obligatoire",
  },
  {
    id: "validation-avocat",
    title: "Validation finale par avocat / expert-comptable",
    description: "Aucun document structurant n'est signé sans relecture juridique et fiscale qualifiée.",
    trigger: "Avant signature finale",
    importance: "obligatoire",
  },
];

const IMPORTANCE_TONE: Record<ChecklistItem["importance"], string> = {
  obligatoire: "bg-destructive/10 text-destructive",
  fortement_recommande: "bg-warning/10 text-warning",
  selon_contexte: "bg-muted text-muted-foreground",
};

const IMPORTANCE_LABEL: Record<ChecklistItem["importance"], string> = {
  obligatoire: "Obligatoire",
  fortement_recommande: "Fortement recommandé",
  selon_contexte: "Selon contexte",
};

export function LegalChecklist() {
  return (
    <Card className="border-border/60">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Scale className="h-4 w-4 text-primary" />
          Checklist juridique Studio
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {CHECKLIST.map((item) => (
            <div
              key={item.id}
              className="flex items-start gap-3 rounded-lg border border-border/60 bg-background/50 p-3"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted/40 text-muted-foreground flex-shrink-0">
                <FileText className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium leading-tight">{item.title}</p>
                  <Badge variant="outline" className={`text-[10px] ${IMPORTANCE_TONE[item.importance]}`}>
                    {IMPORTANCE_LABEL[item.importance]}
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground">{item.description}</p>
                <p className="text-[11px] text-primary/80 inline-flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Déclencheur : {item.trigger}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-md border border-warning/30 bg-warning/5 p-3 text-[11px] text-muted-foreground inline-flex items-start gap-2">
          <ShieldAlert className="h-4 w-4 text-warning flex-shrink-0 mt-0.5" />
          <span>
            <span className="font-semibold text-foreground">Disclaimer.</span> Cette checklist est une aide à la décision interne. Elle ne se substitue pas aux conseils d'un avocat ou d'un expert-comptable. Toute structuration juridique doit être validée par un professionnel qualifié.
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
