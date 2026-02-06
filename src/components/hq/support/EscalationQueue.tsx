import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Link2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function EscalationQueue() {
  return (
    <Card className="card-executive border-warning/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-warning" />
          File d'Escalation
        </CardTitle>
        <CardDescription>Tickets critiques nécessitant une attention immédiate</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-muted-foreground">
          <Link2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="font-medium">Connexion Support requise</p>
          <p className="text-sm mt-1">Connectez Zendesk ou Intercom pour suivre les escalations en temps réel.</p>
          <div className="flex gap-2 justify-center mt-3">
            <Badge variant="outline">Zendesk</Badge>
            <Badge variant="outline">Intercom</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
