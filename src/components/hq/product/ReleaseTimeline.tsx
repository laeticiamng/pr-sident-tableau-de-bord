import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Link2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function ReleaseTimeline() {
  return (
    <Card className="card-executive">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <Calendar className="h-5 w-5 text-primary" />
          Timeline des Releases
        </CardTitle>
        <CardDescription>
          Historique et prochaines versions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-muted-foreground/20 rounded-lg">
          <Link2 className="h-10 w-10 text-muted-foreground/40 mb-3" />
          <p className="text-sm font-medium text-muted-foreground">Aucune release enregistrée</p>
          <p className="text-xs text-muted-foreground mt-1">La synchronisation des releases nécessite une connexion GitHub</p>
          <Badge variant="outline" className="mt-3">GitHub Releases</Badge>
        </div>
      </CardContent>
    </Card>
  );
}
