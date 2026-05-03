import { Scale } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { LegalChecklist } from "@/components/hq/studio/LegalChecklist";
import { RequestApprovalButton } from "@/components/hq/studio/RequestApprovalButton";

export default function StudioLegalPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
          <Scale className="h-5 w-5 text-primary" />
          Protection juridique Studio
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Sécuriser chaque blueprint, chaque deal, chaque mission advisory : NDA, e-Soleau, lettre de mission, term sheet, pacte d'associés, validation avocat / expert-comptable.
        </p>
      </div>

      <Card className="border-border/60 bg-muted/20">
        <CardContent className="p-4 text-xs text-muted-foreground space-y-1">
          <p>
            <span className="font-semibold text-foreground">Principe.</span> Aucun blueprint complet n'est transmis sans NDA + preuve d'antériorité. Aucun deal structurant n'est signé sans validation avocat. EmotionSphere protège ses concepts et son rôle d'architecte stratégique.
          </p>
        </CardContent>
      </Card>

      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-sm font-semibold">Envoi d'un document légal</p>
            <p className="text-xs text-muted-foreground">
              NDA, term sheet, pacte d'associés ou lettre de mission : la porte d'approbation sécurise tout envoi externe.
            </p>
          </div>
          <RequestApprovalButton
            gateKey="send_legal_document"
            input={{
              action_type: "send_legal_document",
              title: "Envoi d'un document légal Studio",
              description: "Demande de validation pour transmettre un document juridique à un partenaire externe.",
              risk_level: "high",
            }}
            label="Demander validation envoi"
          />
        </CardContent>
      </Card>

      <LegalChecklist />
    </div>
  );
}
