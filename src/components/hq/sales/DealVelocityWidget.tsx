import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Timer, AlertCircle, Link2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface DealVelocityWidgetProps {
  className?: string;
}

export function DealVelocityWidget({ className }: DealVelocityWidgetProps) {
  return (
    <Card className={cn("card-executive", className)}>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-accent/10">
            <Timer className="h-5 w-5 text-accent" />
          </div>
          <div>
            <CardTitle>Vélocité des Deals</CardTitle>
            <CardDescription>Temps moyen de conversion par étape</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-muted-foreground">
          <Link2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="font-medium">Connexion CRM requise</p>
          <p className="text-sm mt-1">
            Intégrez HubSpot ou Pipedrive pour afficher la vélocité des deals en temps réel
          </p>
          <Badge variant="subtle" className="mt-3">
            <AlertCircle className="h-3 w-3 mr-1" />
            Source : HubSpot / Pipedrive
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
