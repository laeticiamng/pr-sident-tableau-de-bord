import { Card, CardContent } from "@/components/ui/card";
import { Shield, CheckCircle } from "lucide-react";

interface IncidentCounterProps {
  daysSinceLastIncident?: number;
}

export function IncidentCounter({ daysSinceLastIncident = 47 }: IncidentCounterProps) {
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
