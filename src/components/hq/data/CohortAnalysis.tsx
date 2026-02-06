import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Link2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function CohortAnalysis() {
  return (
    <Card className="card-executive">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <Users className="h-5 w-5 text-primary" />
          Analyse de Cohorte
        </CardTitle>
        <CardDescription>Rétention mensuelle des utilisateurs</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-muted-foreground/20 rounded-lg">
          <Link2 className="h-10 w-10 text-muted-foreground/40 mb-3" />
          <p className="text-sm font-medium text-muted-foreground">Connexion Analytics requise</p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            Connectez GA4 ou Mixpanel pour analyser la rétention par cohorte
          </p>
          <Badge variant="outline" className="mt-3">GA4 / Mixpanel</Badge>
        </div>
      </CardContent>
    </Card>
  );
}
