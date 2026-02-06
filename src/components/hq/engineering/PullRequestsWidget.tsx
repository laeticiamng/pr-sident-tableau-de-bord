import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GitPullRequest, Link2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function PullRequestsWidget() {
  return (
    <Card className="card-executive">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <GitPullRequest className="h-5 w-5 text-primary" />
          Pull Requests
        </CardTitle>
        <CardDescription>PRs en attente de review ou d'action</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-muted-foreground/20 rounded-lg">
          <Link2 className="h-10 w-10 text-muted-foreground/40 mb-3" />
          <p className="text-sm font-medium text-muted-foreground">Connexion GitHub requise</p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            Connectez l'API GitHub pour afficher les Pull Requests en temps réel
          </p>
          <Badge variant="outline" className="mt-3">GitHub API</Badge>
        </div>
      </CardContent>
    </Card>
  );
}
