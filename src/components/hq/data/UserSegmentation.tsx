import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Link2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function UserSegmentation() {
  return (
    <Card className="card-executive">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <Users className="h-5 w-5 text-primary" />
          Segmentation Utilisateurs
        </CardTitle>
        <CardDescription>Répartition par plan et comportement</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-muted-foreground">
          <Link2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="font-medium">Connexion Analytics requise</p>
          <p className="text-sm mt-1">Connectez Stripe Billing ou Google Analytics pour segmenter vos utilisateurs.</p>
          <div className="flex gap-2 justify-center mt-3">
            <Badge variant="outline">Stripe Billing</Badge>
            <Badge variant="outline">GA4</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
