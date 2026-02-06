import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Database } from "lucide-react";

export function MeetingNotes() {
  return (
    <Card className="card-executive">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <FileText className="h-5 w-5 text-primary" />
          Notes de Réunion
        </CardTitle>
        <CardDescription>Comptes-rendus et décisions des dernières réunions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-muted-foreground/20 rounded-lg">
          <Database className="h-10 w-10 text-muted-foreground/40 mb-3" />
          <p className="text-sm font-medium text-muted-foreground">Aucune note de réunion</p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            Les comptes-rendus apparaîtront ici après chaque réunion exécutive
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
