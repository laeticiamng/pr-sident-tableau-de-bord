import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Rocket, Link2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function DeploymentStatus() {
  return (
    <Card className="card-executive">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <Rocket className="h-5 w-5 text-primary" />
          Déploiements Récents
        </CardTitle>
        <CardDescription>Statut des derniers déploiements par plateforme</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-muted-foreground">
          <Link2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="font-medium">Connexion CI/CD requise</p>
          <p className="text-sm mt-1">Connectez GitHub Actions ou Vercel pour suivre les déploiements en temps réel.</p>
          <div className="flex gap-2 justify-center mt-3">
            <Badge variant="outline">GitHub Actions</Badge>
            <Badge variant="outline">Vercel</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
