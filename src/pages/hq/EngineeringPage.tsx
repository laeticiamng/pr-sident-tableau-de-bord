import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  GitBranch, 
  GitPullRequest,
  Bug,
  Rocket,
  RefreshCw,
  Loader2,
  ExternalLink,
  GitCommit,
  CheckCircle
} from "lucide-react";
import { useExecuteRun, usePlatforms } from "@/hooks/useHQData";
import { useGitHubData, useGitHubSync } from "@/hooks/useGitHubSync";
import { ReleaseChecklist } from "@/components/hq/engineering/ReleaseChecklist";
import { PullRequestsWidget } from "@/components/hq/engineering/PullRequestsWidget";
import { DeploymentStatus } from "@/components/hq/engineering/DeploymentStatus";
import { OpenPRsWidget } from "@/components/hq/engineering/OpenPRsWidget";
import { CodeCoverageWidget } from "@/components/hq/engineering/CodeCoverageWidget";

export default function EngineeringPage() {
  const executeRun = useExecuteRun();
  const { data: platformsResult, isLoading: platformsLoading } = usePlatforms();
  const platforms = platformsResult?.platforms;
  const { data: githubData, isLoading: githubLoading } = useGitHubData();
  const githubSync = useGitHubSync();
  const [runningCheck, setRunningCheck] = useState<string | null>(null);

  const isLoading = platformsLoading || githubLoading;

  const handleReleaseGateCheck = async (platformKey: string) => {
    setRunningCheck(platformKey);
    try {
      await executeRun.mutateAsync({ 
        run_type: "RELEASE_GATE_CHECK",
        platform_key: platformKey
      });
    } finally {
      setRunningCheck(null);
    }
  };

  const getGitHubDataForPlatform = (platformKey: string) => {
    return githubData?.repos.find(r => r.key === platformKey);
  };

  // Calculate delivery KPIs from GitHub data
  const totalCommits = githubData?.repos.reduce((sum, r) => sum + r.commits.length, 0) || 0;
  const totalOpenIssues = githubData?.repos.reduce((sum, r) => sum + r.issues.filter(i => i.state === "open").length, 0) || 0;
  const totalOpenPRs = githubData?.repos.reduce((sum, r) => sum + r.pullRequests.filter(pr => pr.state === "open").length, 0) || 0;

  const deliveryKPIs = [
    { label: "Commits (7j)", value: totalCommits > 0 ? `${totalCommits}` : "—", description: "Commits récents" },
    { label: "PRs Ouvertes", value: totalOpenPRs > 0 ? `${totalOpenPRs}` : "0", description: "En attente de review" },
    { label: "Issues", value: totalOpenIssues > 0 ? `${totalOpenIssues}` : "0", description: "Issues ouvertes" },
    { label: "Dernière Sync", value: githubData?.syncedAt ? new Date(githubData.syncedAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) : "—", description: "GitHub sync" },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-headline-1 mb-2">Engineering Command</h1>
          <p className="text-muted-foreground text-lg">
            Delivery, releases et santé technique.
          </p>
        </div>
        <Button 
          variant="outline"
          onClick={() => githubSync.sync(undefined)}
          disabled={githubSync.isLoading}
        >
          {githubSync.isLoading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Sync GitHub
        </Button>
      </div>

      {/* Delivery KPIs */}
      <div className="grid gap-4 md:grid-cols-4">
        {deliveryKPIs.map((kpi) => (
          <Card key={kpi.label} className="card-executive">
            <CardContent className="p-6">
              <div className="text-2xl font-bold mb-1">{kpi.value}</div>
              <div className="text-sm font-medium">{kpi.label}</div>
              <div className="text-xs text-muted-foreground mt-1">{kpi.description}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Platform Engineering Status */}
      <Card className="card-executive">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Rocket className="h-5 w-5 text-primary" />
            Statut Engineering par Plateforme
          </CardTitle>
          <CardDescription>
            Gate checks et releases — Données GitHub en temps réel
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : (
            <div className="space-y-4">
              {platforms?.map((platform) => {
                const ghData = getGitHubDataForPlatform(platform.key);
                const openIssues = ghData?.issues.filter(i => i.state === "open").length || 0;
                const openPRs = ghData?.pullRequests.filter(pr => pr.state === "open").length || 0;
                const recentCommits = ghData?.commits.length || 0;

                return (
                  <div 
                    key={platform.key}
                    className="flex items-center justify-between p-4 rounded-lg border"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`h-3 w-3 rounded-full ${
                        platform.status === "green" ? "bg-success" :
                        platform.status === "amber" ? "bg-warning" : "bg-destructive"
                      }`} />
                      <div>
                        <h3 className="font-semibold">{platform.name}</h3>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <GitCommit className="h-3 w-3" />
                            {recentCommits} commits
                          </span>
                          <span className="flex items-center gap-1">
                            <GitPullRequest className="h-3 w-3" />
                            {openPRs} PRs
                          </span>
                          <span className="flex items-center gap-1">
                            <Bug className="h-3 w-3" />
                            {openIssues} issues
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {platform.github_url && (
                        <Button variant="ghost" size="icon" asChild>
                          <a href={platform.github_url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleReleaseGateCheck(platform.key)}
                        disabled={runningCheck === platform.key}
                      >
                        {runningCheck === platform.key ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <CheckCircle className="h-4 w-4 mr-2" />
                        )}
                        Gate Check
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Commits */}
        <Card className="card-executive">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <GitCommit className="h-5 w-5 text-primary" />
              Commits Récents
            </CardTitle>
          </CardHeader>
          <CardContent>
            {githubLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : totalCommits > 0 ? (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {githubData?.repos.flatMap(repo => 
                  repo.commits.slice(0, 3).map(commit => ({
                    ...commit,
                    repoKey: repo.key
                  }))
                ).slice(0, 10).map((commit) => (
                  <div key={commit.sha} className="flex items-start gap-3 p-3 rounded-lg border">
                    <GitCommit className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{commit.message}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="subtle" className="text-xs">{commit.repoKey}</Badge>
                        <span>{commit.author}</span>
                        <span>{new Date(commit.date).toLocaleDateString("fr-FR")}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <GitCommit className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Aucun commit récent</p>
                <p className="text-sm mt-1">
                  Synchronisez GitHub pour voir les commits.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Open Issues */}
        <Card className="card-executive">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Bug className="h-5 w-5 text-primary" />
              Issues Ouvertes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {githubLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : totalOpenIssues > 0 ? (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {githubData?.repos.flatMap(repo => 
                  repo.issues.filter(i => i.state === "open").map(issue => ({
                    ...issue,
                    repoKey: repo.key
                  }))
                ).slice(0, 10).map((issue) => (
                  <a 
                    key={`${issue.repoKey}-${issue.number}`} 
                    href={issue.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/30 transition-colors"
                  >
                    <Bug className="h-4 w-4 mt-0.5 text-warning flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">#{issue.number}: {issue.title}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <Badge variant="subtle" className="text-xs">{issue.repoKey}</Badge>
                        {issue.labels.slice(0, 2).map(label => (
                          <Badge key={label} variant="outline" className="text-xs">{label}</Badge>
                        ))}
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-success" />
                <p>Aucune issue ouverte</p>
                <p className="text-sm mt-1">Toutes les issues sont résolues.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Deployment Status */}
      <DeploymentStatus />

      {/* Pull Requests Widget */}
      <PullRequestsWidget />

      {/* Open PRs Widget - Detailed */}
      <OpenPRsWidget />

      {/* Code Coverage Widget */}
      <CodeCoverageWidget />

      {/* Release Checklist */}
      <ReleaseChecklist 
        onDeploy={() => executeRun.mutate({ run_type: "RELEASE_GATE_CHECK" })}
      />
    </div>
  );
}
