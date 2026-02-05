import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PieChart, Database, Link2 } from "lucide-react";

export function ChannelROIChart() {
  // État vide - aucune donnée réelle
  return (
    <Card className="card-executive border-dashed border-2 border-muted-foreground/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <PieChart className="h-5 w-5 text-primary" />
          ROI par Canal Marketing
        </CardTitle>
        <CardDescription>
          Performance par source
        </CardDescription>
      </CardHeader>
      <CardContent className="py-8 text-center">
        <Database className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
        <h3 className="text-sm font-semibold mb-1">Connexion requise</h3>
        <p className="text-xs text-muted-foreground mb-3">
          Connectez vos sources marketing pour le ROI par canal.
        </p>
        <Badge variant="outline" className="text-[10px] gap-1">
          <Link2 className="h-2.5 w-2.5" />
          Sources : GA4, Meta Ads, Google Ads
        </Badge>
      </CardContent>
    </Card>
  );
}
