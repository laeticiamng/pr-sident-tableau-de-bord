import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Code2, Link2 } from "lucide-react";

export function CodeCoverageWidget() {
  return (
    <Card className="card-executive">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <Code2 className="h-5 w-5 text-primary" />
          Couverture de Code
        </CardTitle>
        <CardDescription>
          Taux de couverture par plateforme et type de test
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-muted-foreground/20 rounded-lg">
          <Link2 className="h-10 w-10 text-muted-foreground/40 mb-3" />
          <p className="text-sm font-medium text-muted-foreground">Connexion CI/CD requise</p>
          <p className="text-xs text-muted-foreground mt-1">La couverture de code nécessite une intégration avec le pipeline CI</p>
          <Badge variant="outline" className="mt-3">GitHub Actions / Codecov</Badge>
        </div>
      </CardContent>
    </Card>
  );
}
