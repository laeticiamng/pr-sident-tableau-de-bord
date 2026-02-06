import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, Link2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function CampaignPerformance() {
  return (
    <Card className="card-executive">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <Target className="h-5 w-5 text-primary" />
          Performance Campagnes
        </CardTitle>
        <CardDescription>Suivi des campagnes marketing actives</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-muted-foreground">
          <Link2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="font-medium">Connexion Marketing requise</p>
          <p className="text-sm mt-1">Connectez Google Analytics ou HubSpot pour suivre vos campagnes en temps réel.</p>
          <div className="flex gap-2 justify-center mt-3">
            <Badge variant="outline">GA4</Badge>
            <Badge variant="outline">HubSpot</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
