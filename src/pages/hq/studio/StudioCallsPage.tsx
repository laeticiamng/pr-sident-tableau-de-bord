import { Megaphone } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { CallForProjectsTable } from "@/components/hq/studio/CallForProjectsTable";
import { NewCallDialog } from "@/components/hq/studio/NewCallDialog";

export default function StudioCallsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-primary" />
            Radar des appels
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Centralisez les appels à projets, AMI, subventions, marchés publics ou privés. Analysez chaque appel et générez une réponse stratégique adaptée.
          </p>
        </div>
        <NewCallDialog />
      </div>

      <Card className="border-border/60 bg-muted/20">
        <CardContent className="p-4 text-xs text-muted-foreground space-y-1">
          <p>
            <span className="font-semibold text-foreground">Cycle d'analyse.</span> 1) Détection → 2) Analyse stratégique IA (critères, livrables, partenaires, angle gagnant) → 3) Décision pertinent / non pertinent → 4) Génération du Blueprint 360° et de la réponse.
          </p>
          <p>
            Chaque appel transformé en Blueprint peut faire l'objet d'un deal (equity, success fee, advisory) si EmotionSphere est sollicitée comme architecte stratégique.
          </p>
        </CardContent>
      </Card>

      <CallForProjectsTable />
    </div>
  );
}
