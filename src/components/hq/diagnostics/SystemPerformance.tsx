import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Link2 } from "lucide-react";

export function SystemPerformance() {
  return (
    <Card className="card-executive">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-3">
              <Activity className="h-5 w-5 text-primary" />
              Performance Système
            </CardTitle>
            <CardDescription>
              Métriques de ressources en temps réel
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-muted-foreground/20 rounded-lg">
          <Link2 className="h-10 w-10 text-muted-foreground/40 mb-3" />
          <p className="text-sm font-medium text-muted-foreground">Monitoring non configuré</p>
          <p className="text-xs text-muted-foreground mt-1">Les métriques système nécessitent un agent de monitoring côté serveur</p>
          <Badge variant="outline" className="mt-3">Datadog / Grafana</Badge>
        </div>
      </CardContent>
    </Card>
  );
}
