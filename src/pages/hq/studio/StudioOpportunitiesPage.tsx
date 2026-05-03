import { Sparkles } from "lucide-react";
import { OpportunityRadar } from "@/components/hq/studio/OpportunityRadar";
import { NewOpportunityDialog } from "@/components/hq/studio/NewOpportunityDialog";
import { Card, CardContent } from "@/components/ui/card";

export default function StudioOpportunitiesPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Radar des opportunités
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Détectez, qualifiez et priorisez les opportunités stratégiques. Chaque opportunité peut devenir un Blueprint 360°.
          </p>
        </div>
        <NewOpportunityDialog />
      </div>

      <Card className="border-border/60 bg-muted/20">
        <CardContent className="p-4 text-xs text-muted-foreground">
          <p>
            <span className="font-semibold text-foreground">Méthode.</span> Capter une opportunité ne suffit pas : il faut la qualifier (potentiel, urgence, faisabilité, accessibilité du financement) puis décider si elle mérite un Blueprint complet et un deal stratégique.
          </p>
        </CardContent>
      </Card>

      <OpportunityRadar />
    </div>
  );
}
