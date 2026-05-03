import { Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { AdvisoryTracker } from "@/components/hq/studio/AdvisoryTracker";

export default function StudioAdvisoryPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Suivi des missions advisory
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Lorsque le projet est signé, EmotionSphere reste consultable comme architecte stratégique. Cette page suit la cadence des revues, les sujets abordés et les engagements pris.
        </p>
      </div>

      <Card className="border-border/60 bg-muted/20">
        <CardContent className="p-4 text-xs text-muted-foreground space-y-1">
          <p>
            <span className="font-semibold text-foreground">Périmètre advisory.</span> Architecte non exécutif, partenaire minoritaire ou consultante stratégique. Frontière claire entre conception et exécution opérationnelle, qui reste à la charge du porteur de projet.
          </p>
        </CardContent>
      </Card>

      <AdvisoryTracker />
    </div>
  );
}
