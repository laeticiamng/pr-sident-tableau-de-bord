import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ExternalLink, 
  GitBranch, 
  AlertTriangle, 
  Rocket, 
  Activity,
  Clock,
  CheckCircle,
  Loader2,
  RefreshCw,
  GitCommit,
  TestTube2,
  Database
} from "lucide-react";
import { usePlatforms, useExecuteRun } from "@/hooks/useHQData";
import { MultiPlatformUptimeChart } from "@/components/hq/platforms/MultiPlatformUptimeChart";
import { MANAGED_PLATFORMS } from "@/lib/constants";

// Helper to get real stats from constants
const getPlatformStats = (key: string) => {
  const platform = MANAGED_PLATFORMS.find(p => p.key === key);
  return platform?.stats || { commits: 0, branches: 0, tests: 0, tables: 0 };
};

const statusColors = {
  green: "bg-status-green",
  amber: "bg-status-amber",
  red: "bg-status-red",
};

const statusLabels = {
  green: "Opérationnel",
  amber: "Attention",
  red: "Critique",
};

export default function HQPlateformesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedPlatform = searchParams.get("platform") || "all";
  const { data: platforms, isLoading, refetch } = usePlatforms();
  const executeRun = useExecuteRun();
  const [preparingRelease, setPreparingRelease] = useState<string | null>(null);

  const handlePrepareRelease = async (platformKey: string) => {
    setPreparingRelease(platformKey);
    try {
      await executeRun.mutateAsync({ 
        run_type: "RELEASE_GATE_CHECK",
        platform_key: platformKey 
      });
    } finally {
      setPreparingRelease(null);
    }
  };

  const handleStatusReview = async (platformKey: string) => {
    await executeRun.mutateAsync({ 
      run_type: "PLATFORM_STATUS_REVIEW",
      platform_key: platformKey 
    });
  };

  const filteredPlatforms = selectedPlatform === "all" 
    ? platforms 
    : platforms?.filter(p => p.key === selectedPlatform);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-headline-1 mb-2">Cockpit Plateformes</h1>
          <p className="text-muted-foreground text-lg">
            Supervision des 5 plateformes gérées.
          </p>
        </div>
        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualiser
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="card-executive">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-success mb-1">
              {platforms?.length || 0}
            </div>
            <div className="text-sm text-muted-foreground">Plateformes Actives</div>
          </CardContent>
        </Card>
        <Card className="card-executive">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-success mb-1">
              {platforms?.filter(p => p.status === "green").length || 0}
            </div>
            <div className="text-sm text-muted-foreground">Statut Vert</div>
          </CardContent>
        </Card>
        <Card className="card-executive">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-warning mb-1">
              {platforms?.filter(p => p.status === "amber").length || 0}
            </div>
            <div className="text-sm text-muted-foreground">Statut Ambre</div>
          </CardContent>
        </Card>
        <Card className="card-executive">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-destructive mb-1">
              {platforms?.filter(p => p.status === "red").length || 0}
            </div>
            <div className="text-sm text-muted-foreground">Statut Rouge</div>
          </CardContent>
        </Card>
      </div>

      {/* Multi-Platform Uptime Chart */}
      <MultiPlatformUptimeChart />

      {/* Platform Selector */}
      <Tabs 
        value={selectedPlatform} 
        onValueChange={(v) => setSearchParams({ platform: v })}
      >
        <TabsList className="flex-wrap h-auto gap-2 bg-transparent">
          <TabsTrigger value="all" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Toutes
          </TabsTrigger>
          {platforms?.map((p) => (
            <TabsTrigger 
              key={p.key} 
              value={p.key} 
              className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <div className={`h-2 w-2 rounded-full ${statusColors[p.status]}`} />
              {p.name}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedPlatform} className="mt-6">
          {isLoading ? (
            <div className="grid gap-6">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-64 w-full" />
              ))}
            </div>
          ) : (
            <div className="grid gap-6">
              {filteredPlatforms?.map((platform) => (
                <Card key={platform.key} className="card-executive">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-3">
                          <div className={`h-4 w-4 rounded-full ${statusColors[platform.status]}`} />
                          {platform.name}
                          <Badge variant="subtle">{statusLabels[platform.status]}</Badge>
                        </CardTitle>
                        <CardDescription className="mt-2">
                          {platform.description}
                        </CardDescription>
                      </div>
                      {platform.github_url && (
                        <a
                          href={platform.github_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <ExternalLink className="h-5 w-5" />
                        </a>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Metrics - Real GitHub Stats */}
                    {(() => {
                      const stats = getPlatformStats(platform.key);
                      return (
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                          <div className="text-center p-4 rounded-lg bg-muted/50">
                            <Activity className="h-5 w-5 mx-auto mb-2 text-primary" />
                            <div className="text-2xl font-bold">{platform.uptime_percent?.toFixed(1)}%</div>
                            <div className="text-xs text-muted-foreground">Uptime</div>
                          </div>
                          <div className="text-center p-4 rounded-lg bg-muted/50">
                            <GitCommit className="h-5 w-5 mx-auto mb-2 text-primary" />
                            <div className="text-2xl font-bold">
                              {stats.commits > 1000 ? `${(stats.commits / 1000).toFixed(1)}K` : stats.commits}
                            </div>
                            <div className="text-xs text-muted-foreground">Commits</div>
                          </div>
                          <div className="text-center p-4 rounded-lg bg-muted/50">
                            <GitBranch className="h-5 w-5 mx-auto mb-2 text-accent" />
                            <div className="text-2xl font-bold">{stats.branches}</div>
                            <div className="text-xs text-muted-foreground">Branches</div>
                          </div>
                          <div className="text-center p-4 rounded-lg bg-muted/50">
                            <TestTube2 className="h-5 w-5 mx-auto mb-2 text-success" />
                            <div className="text-2xl font-bold">{stats.tests}</div>
                            <div className="text-xs text-muted-foreground">Tests</div>
                          </div>
                          <div className="text-center p-4 rounded-lg bg-muted/50">
                            <Database className="h-5 w-5 mx-auto mb-2 text-warning" />
                            <div className="text-2xl font-bold">{stats.tables}</div>
                            <div className="text-xs text-muted-foreground">Tables</div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Status Reason */}
                    <div className="p-4 rounded-lg border">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Statut actuel</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {platform.status_reason || "Aucun détail disponible."}
                      </p>
                    </div>

                    {/* Last Update */}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      Mis à jour le {new Date(platform.updated_at).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-3 pt-4 border-t">
                      <Button 
                        variant="executive"
                        onClick={() => handlePrepareRelease(platform.key)}
                        disabled={preparingRelease === platform.key}
                      >
                        {preparingRelease === platform.key ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Rocket className="h-4 w-4 mr-2" />
                        )}
                        Préparer Release
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => handleStatusReview(platform.key)}
                        disabled={executeRun.isPending}
                      >
                        <Activity className="h-4 w-4 mr-2" />
                        Revue de Statut
                      </Button>
                      {platform.github_url && (
                        <Button variant="outline" asChild>
                          <a href={platform.github_url} target="_blank" rel="noopener noreferrer">
                            <GitBranch className="h-4 w-4 mr-2" />
                            GitHub
                          </a>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
