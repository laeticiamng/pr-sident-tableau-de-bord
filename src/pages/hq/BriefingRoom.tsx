import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Phone, 
  FileText, 
  Shield, 
  TrendingUp, 
  Rocket,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Loader2,
  RefreshCw
} from "lucide-react";
import { usePlatforms, usePendingApprovals, useRecentRuns, useExecuteRun } from "@/hooks/useHQData";
import { useState } from "react";
import { Link } from "react-router-dom";

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

export default function BriefingRoom() {
  const { data: platforms, isLoading: platformsLoading } = usePlatforms();
  const { data: pendingApprovals, isLoading: approvalsLoading } = usePendingApprovals();
  const { data: recentRuns, isLoading: runsLoading, refetch: refetchRuns } = useRecentRuns(5);
  const executeRun = useExecuteRun();
  const [generatingBrief, setGeneratingBrief] = useState(false);

  const currentTime = new Date();
  const greeting = currentTime.getHours() < 12 ? "Bonjour" : currentTime.getHours() < 18 ? "Bon après-midi" : "Bonsoir";

  const handleGenerateBrief = async () => {
    setGeneratingBrief(true);
    try {
      await executeRun.mutateAsync({ run_type: "DAILY_EXECUTIVE_BRIEF" });
      refetchRuns();
    } finally {
      setGeneratingBrief(false);
    }
  };

  const handleCallDG = async () => {
    await executeRun.mutateAsync({ run_type: "CEO_STANDUP_MEETING" });
    refetchRuns();
  };

  // Get the latest daily brief
  const latestBrief = recentRuns?.find(r => r.run_type === "DAILY_EXECUTIVE_BRIEF");

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-headline-1 mb-2">{greeting}, Madame la Présidente</h1>
          <p className="text-muted-foreground text-lg">
            Voici l'état de votre entreprise.
          </p>
        </div>
        <Button 
          variant="executive" 
          size="lg" 
          className="gap-2"
          onClick={handleCallDG}
          disabled={executeRun.isPending}
        >
          {executeRun.isPending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Phone className="h-5 w-5" />
          )}
          Appeler le DG
        </Button>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Button 
          variant="outline" 
          className="h-auto py-4 flex-col gap-2"
          onClick={handleGenerateBrief}
          disabled={generatingBrief}
        >
          {generatingBrief ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <FileText className="h-5 w-5" />
          )}
          <span className="text-xs">Brief Exécutif</span>
        </Button>
        <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
          <Link to="/hq/equipe-executive">
            <Users className="h-5 w-5" />
            <span className="text-xs">Réunion Directeurs</span>
          </Link>
        </Button>
        <Button 
          variant="outline" 
          className="h-auto py-4 flex-col gap-2"
          onClick={() => executeRun.mutate({ run_type: "SECURITY_AUDIT_RLS" })}
          disabled={executeRun.isPending}
        >
          <Shield className="h-5 w-5" />
          <span className="text-xs">Audit Sécurité</span>
        </Button>
        <Button 
          variant="outline" 
          className="h-auto py-4 flex-col gap-2"
          onClick={() => executeRun.mutate({ run_type: "MARKETING_WEEK_PLAN" })}
          disabled={executeRun.isPending}
        >
          <TrendingUp className="h-5 w-5" />
          <span className="text-xs">Plan Marketing</span>
        </Button>
        <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
          <Link to="/hq/plateformes">
            <Rocket className="h-5 w-5" />
            <span className="text-xs">Préparer Release</span>
          </Link>
        </Button>
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Daily Brief */}
        <Card className="card-executive lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Brief Exécutif Quotidien
              </CardTitle>
              <CardDescription>
                {latestBrief 
                  ? `Généré le ${new Date(latestBrief.completed_at || latestBrief.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })}`
                  : "Aucun brief récent"
                }
              </CardDescription>
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleGenerateBrief}
              disabled={generatingBrief}
            >
              {generatingBrief ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          </CardHeader>
          <CardContent>
            {runsLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            ) : latestBrief?.executive_summary ? (
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {latestBrief.executive_summary}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Aucun brief généré aujourd'hui.</p>
                <Button 
                  variant="executive" 
                  className="mt-4"
                  onClick={handleGenerateBrief}
                  disabled={generatingBrief}
                >
                  {generatingBrief ? "Génération en cours..." : "Générer le Brief"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Approvals Inbox */}
        <Card className="card-executive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              Approbations
            </CardTitle>
            <CardDescription>
              {approvalsLoading ? "..." : `${pendingApprovals?.length || 0} en attente`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {approvalsLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : pendingApprovals && pendingApprovals.length > 0 ? (
              <div className="space-y-3">
                {pendingApprovals.slice(0, 3).map((action) => (
                  <div
                    key={action.id}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div>
                      <p className="font-medium text-sm">{action.title}</p>
                      <Badge 
                        variant={action.risk_level === "critical" || action.risk_level === "high" ? "destructive" : "subtle"}
                        className="mt-1"
                      >
                        {action.risk_level}
                      </Badge>
                    </div>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </div>
                ))}
                {pendingApprovals.length > 3 && (
                  <Button variant="ghost" size="sm" className="w-full" asChild>
                    <Link to="/hq/approbations">
                      Voir tout ({pendingApprovals.length})
                    </Link>
                  </Button>
                )}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 text-success" />
                <p className="text-sm">Aucune approbation en attente</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Platform Status Grid */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Statut des Plateformes</h2>
        {platformsLoading ? (
          <div className="grid gap-4 md:grid-cols-5">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-5">
            {platforms?.map((platform) => (
              <Link 
                key={platform.key} 
                to={`/hq/plateformes?platform=${platform.key}`}
                className="block"
              >
                <Card className="card-executive hover:border-primary/50 transition-colors cursor-pointer h-full">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className={`h-3 w-3 rounded-full ${statusColors[platform.status]}`} />
                      <span className="font-medium text-sm truncate">{platform.name}</span>
                    </div>
                    <Badge variant="subtle" className="text-xs">
                      {statusLabels[platform.status]}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                      {platform.status_reason || "Pas de détails"}
                    </p>
                    <div className="mt-3 text-xs text-muted-foreground">
                      Uptime: {platform.uptime_percent?.toFixed(1)}%
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <Card className="card-executive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Activité Récente
          </CardTitle>
        </CardHeader>
        <CardContent>
          {runsLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : recentRuns && recentRuns.length > 0 ? (
            <div className="space-y-3">
              {recentRuns.map((run) => (
                <div
                  key={run.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    {run.status === "completed" ? (
                      <CheckCircle className="h-5 w-5 text-success" />
                    ) : run.status === "failed" ? (
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                    ) : (
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    )}
                    <div>
                      <p className="font-medium text-sm">
                        {run.run_type.replace(/_/g, " ")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {run.platform_key || "Global"}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(run.created_at).toLocaleTimeString("fr-FR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Aucune activité récente</p>
              <p className="text-xs mt-1">Générez un brief pour commencer</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
