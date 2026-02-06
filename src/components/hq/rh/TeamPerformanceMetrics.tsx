import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Database } from "lucide-react";

export function TeamPerformanceMetrics() {
  return (
    <Card className="card-executive">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Performance Équipe IA
        </CardTitle>
        <CardDescription>Métriques de performance des agents IA ce mois</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-muted-foreground/20 rounded-lg">
          <Database className="h-10 w-10 text-muted-foreground/40 mb-3" />
          <p className="text-sm font-medium text-muted-foreground">Métriques non disponibles</p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            Les métriques de performance seront disponibles une fois les agents opérationnels
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
