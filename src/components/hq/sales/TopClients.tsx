import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Database, Link2 } from "lucide-react";

export function TopClients() {
  // État vide - aucune donnée réelle
  return (
    <Card className="card-executive border-dashed border-2 border-muted-foreground/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-3">
              <Crown className="h-5 w-5 text-primary" />
              Top Clients
            </CardTitle>
            <CardDescription>
              Clients à plus forte valeur (ARR)
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="py-8 text-center">
        <Database className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
        <h3 className="text-sm font-semibold mb-1">Connexion CRM requise</h3>
        <p className="text-xs text-muted-foreground mb-3">
          Connectez votre CRM pour voir vos meilleurs clients.
        </p>
        <Badge variant="outline" className="text-[10px] gap-1">
          <Link2 className="h-2.5 w-2.5" />
          Sources : HubSpot, Stripe
        </Badge>
      </CardContent>
    </Card>
  );
}
