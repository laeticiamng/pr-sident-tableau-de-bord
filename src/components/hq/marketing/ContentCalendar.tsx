import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Link2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function ContentCalendar() {
  return (
    <Card className="card-executive">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <Calendar className="h-5 w-5 text-primary" />
          Calendrier de Contenu
        </CardTitle>
        <CardDescription>Planification du contenu pour les 7 plateformes</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-muted-foreground/20 rounded-lg">
          <Link2 className="h-10 w-10 text-muted-foreground/40 mb-3" />
          <p className="text-sm font-medium text-muted-foreground">Calendrier non configuré</p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            Connectez un outil de planification (Notion, Buffer, HubSpot) pour alimenter le calendrier
          </p>
          <Badge variant="outline" className="mt-3">CMS / Marketing Platform</Badge>
        </div>
      </CardContent>
    </Card>
  );
}
