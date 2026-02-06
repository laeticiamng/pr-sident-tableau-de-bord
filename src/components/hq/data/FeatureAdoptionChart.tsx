import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Database } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeatureAdoptionChartProps {
  className?: string;
}

export function FeatureAdoptionChart({ className }: FeatureAdoptionChartProps) {
  return (
    <Card className={cn("card-executive", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Adoption des Fonctionnalités
        </CardTitle>
        <CardDescription>Taux d'utilisation par feature</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-muted-foreground/20 rounded-lg">
          <Database className="h-10 w-10 text-muted-foreground/40 mb-3" />
          <p className="text-sm font-medium text-muted-foreground">Données d'adoption non disponibles</p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            Les métriques d'adoption seront disponibles avec le tracking des événements utilisateur
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
