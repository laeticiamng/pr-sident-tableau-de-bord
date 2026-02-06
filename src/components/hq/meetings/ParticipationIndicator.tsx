import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Database } from "lucide-react";

export function ParticipationIndicator() {
  return (
    <Card className="card-executive">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <Users className="h-5 w-5 text-primary" />
          Indicateur de Participation
        </CardTitle>
        <CardDescription>Taux de présence aux réunions exécutives</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-muted-foreground/20 rounded-lg">
          <Database className="h-10 w-10 text-muted-foreground/40 mb-3" />
          <p className="text-sm font-medium text-muted-foreground">Données de participation non disponibles</p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            Les taux de participation seront calculés après les premières réunions enregistrées
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
