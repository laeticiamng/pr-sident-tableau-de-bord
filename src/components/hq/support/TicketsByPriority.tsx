import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Database, Link2 } from "lucide-react";

interface TicketsByPriorityProps {
  loading?: boolean;
}

export function TicketsByPriority({ loading }: TicketsByPriorityProps) {
  if (loading) {
    return (
      <Card className="card-executive">
        <CardContent className="p-6">
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-12 bg-muted/30 animate-pulse rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // État vide - aucune donnée réelle
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="card-executive border-dashed border-2 border-muted-foreground/20">
        <CardHeader className="pb-2">
          <div>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-primary" />
              Tickets par Priorité
            </CardTitle>
            <CardDescription>Répartition des tickets ouverts</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="py-8 text-center">
          <Database className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">
            Connexion Helpdesk requise
          </p>
          <Badge variant="outline" className="text-[10px] gap-1 mt-2">
            <Link2 className="h-2.5 w-2.5" />
            Source requise
          </Badge>
        </CardContent>
      </Card>

      <Card className="card-executive border-dashed border-2 border-muted-foreground/20">
        <CardHeader className="pb-2">
          <CardTitle>Tickets par Plateforme</CardTitle>
          <CardDescription>Distribution sur les 7 plateformes</CardDescription>
        </CardHeader>
        <CardContent className="py-8 text-center">
          <Database className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">
            Aucun ticket
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
