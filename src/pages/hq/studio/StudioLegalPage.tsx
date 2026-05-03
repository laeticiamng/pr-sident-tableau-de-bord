import { Scale } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { LegalChecklist } from "@/components/hq/studio/LegalChecklist";

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

      <LegalChecklist />
    </div>
  );
}
