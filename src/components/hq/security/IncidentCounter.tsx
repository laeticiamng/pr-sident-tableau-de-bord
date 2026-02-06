import { Card, CardContent } from "@/components/ui/card";
import { Shield, CheckCircle, Database } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface IncidentCounterProps {
  daysSinceLastIncident?: number | null;
}

export function IncidentCounter({ daysSinceLastIncident = null }: IncidentCounterProps) {
  if (daysSinceLastIncident == null) {
    return (
      <Card className="card-executive">
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center py-6 border-2 border-dashed border-muted-foreground/20 rounded-lg">
            <Database className="h-8 w-8 text-muted-foreground/40 mb-2" />
            <p className="text-sm font-medium text-muted-foreground">Aucune donnée d'incident</p>
            <Badge variant="outline" className="mt-2">Registre incidents</Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-executive bg-gradient-to-br from-success/5 to-transparent border-success/30">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-full bg-success/10">
            <Shield className="h-8 w-8 text-success" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-4xl font-bold text-success">{daysSinceLastIncident}</span>
              <span className="text-lg text-muted-foreground">jours</span>
            </div>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <CheckCircle className="h-3 w-3 text-success" />
              sans incident de sécurité
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
