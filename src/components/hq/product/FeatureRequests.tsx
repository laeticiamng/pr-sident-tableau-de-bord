import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb, Link2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function FeatureRequests() {
  return (
    <Card className="card-executive">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <Lightbulb className="h-5 w-5 text-primary" />
          Demandes de Fonctionnalités
        </CardTitle>
        <CardDescription>Suivi des demandes utilisateurs</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-muted-foreground">
          <Link2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="font-medium">Connexion Produit requise</p>
          <p className="text-sm mt-1">Connectez Jira, Linear ou Canny pour centraliser les demandes de fonctionnalités.</p>
          <div className="flex gap-2 justify-center mt-3">
            <Badge variant="outline">Jira</Badge>
            <Badge variant="outline">Linear</Badge>
            <Badge variant="outline">Canny</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
