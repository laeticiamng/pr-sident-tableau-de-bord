import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GitPullRequest, AlertCircle, Link2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGitHubStats } from "@/hooks/useGitHubSync";
import { Skeleton } from "@/components/ui/skeleton";

interface OpenPRsWidgetProps {
  className?: string;
}

export function OpenPRsWidget({ className }: OpenPRsWidgetProps) {
  const { isLoading, totalOpenPRs, totalOpenIssues, platformStats, lastSynced } = useGitHubStats();

  if (isLoading) {
    return (
      <Card className={cn("card-executive", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent/10">
              <GitPullRequest className="h-5 w-5 text-accent" />
            </div>
            Pull Requests Ouvertes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        </CardContent>
      </Card>
    );
  }

  // If no GitHub data available, show connection required state
  if (!platformStats || platformStats.length === 0) {
    return (
      <Card className={cn("card-executive", className)}>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent/10">
              <GitPullRequest className="h-5 w-5 text-accent" />
            </div>
            <div>
              <CardTitle>Pull Requests Ouvertes</CardTitle>
              <CardDescription>Données GitHub en temps réel</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Link2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="font-medium">Connexion GitHub requise</p>
            <p className="text-sm mt-1">
              Lancez une synchronisation GitHub pour afficher les Pull Requests en temps réel
            </p>
            <Badge variant="subtle" className="mt-3">
              <AlertCircle className="h-3 w-3 mr-1" />
              Source : GitHub API
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("card-executive", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent/10">
              <GitPullRequest className="h-5 w-5 text-accent" />
            </div>
            <div>
              <CardTitle>Pull Requests Ouvertes</CardTitle>
              <CardDescription>
                {totalOpenPRs} PR(s) ouvertes • {totalOpenIssues} issues ouvertes
              </CardDescription>
            </div>
          </div>
          <Badge variant={totalOpenPRs > 0 ? "warning" : "success"}>
            {totalOpenPRs} à revoir
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {platformStats.map((platform: any) => (
          <div key={platform.key} className="p-3 rounded-lg border hover:shadow-sm transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm capitalize">{platform.key?.replace(/-/g, " ")}</p>
                <p className="text-xs text-muted-foreground">
                  {platform.open_prs ?? 0} PR • {platform.open_issues ?? 0} issues • {platform.commits ?? 0} commits
                </p>
              </div>
              <Badge variant={platform.open_prs > 0 ? "warning" : "success"} className="text-xs">
                {platform.open_prs ?? 0} PR
              </Badge>
            </div>
          </div>
        ))}
        {lastSynced && (
          <p className="text-xs text-muted-foreground text-center pt-2">
            Dernière sync : {lastSynced.toLocaleString("fr-FR")}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
