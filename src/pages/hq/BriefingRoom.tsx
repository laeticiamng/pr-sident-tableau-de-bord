import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Phone, 
  FileText, 
  Shield, 
  Rocket,
  CheckCircle,
  Clock,
  Users,
  Loader2,
  Sparkles,
  Brain,
  GitBranch,
  Gauge
} from "lucide-react";
import { usePlatforms, usePendingApprovals, useRecentRuns, useExecuteRun } from "@/hooks/useHQData";
import { Link } from "react-router-dom";
import { PlatformHealthGrid } from "@/components/hq/PlatformHealthGrid";
import { AIInsightsWidget } from "@/components/hq/AIInsightsWidget";
import { AutopilotControl } from "@/components/hq/AutopilotControl";
import { AITransparencyPanel } from "@/components/hq/AITransparencyPanel";
import { RecentActivityFeed } from "@/components/hq/briefing/RecentActivityFeed";
import { QuickMetricsBar } from "@/components/hq/briefing/QuickMetricsBar";

export default function BriefingRoom() {
  const { data: platforms } = usePlatforms();
  const { data: pendingApprovals, isLoading: approvalsLoading } = usePendingApprovals();
  const { data: recentRuns, refetch: refetchRuns } = useRecentRuns(5);
  const executeRun = useExecuteRun();
  const [lastRunResult, setLastRunResult] = useState<any>(null);

  const currentTime = new Date();
  const greeting = currentTime.getHours() < 12 ? "Bonjour" : currentTime.getHours() < 18 ? "Bon après-midi" : "Bonsoir";

  const handleCallDG = async () => {
    const result = await executeRun.mutateAsync({ run_type: "CEO_STANDUP_MEETING" });
    setLastRunResult(result);
    refetchRuns();
  };

  const handleExecutiveAction = async (runType: string) => {
    const result = await executeRun.mutateAsync({ run_type: runType });
    setLastRunResult(result);
    refetchRuns();
  };

  // Calculate stats
  const greenCount = platforms?.filter(p => p.status === "green").length || 0;
  const totalPlatforms = platforms?.length || 5;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary to-primary/80 p-8 text-primary-foreground">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(38_92%_50%/0.15),transparent)]" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <Badge variant="gold" className="mb-4">
              <Sparkles className="h-3 w-3 mr-1" />
              Siège Social Numérique
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{greeting}, Madame la Présidente</h1>
            <p className="text-primary-foreground/70 text-lg">
              {greenCount}/{totalPlatforms} plateformes opérationnelles • Tout est sous contrôle.
            </p>
          </div>
          <Button 
            variant="hero" 
            size="lg" 
            className="gap-2 min-w-[200px]"
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
      </div>

      {/* Quick Metrics Bar */}
      <QuickMetricsBar />

      {/* Autopilot Control */}
      <AutopilotControl compact />

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Button 
          variant="outline" 
          className="h-auto py-4 flex-col gap-2 hover:border-accent hover:bg-accent/5 transition-all"
          onClick={() => handleExecutiveAction("DAILY_EXECUTIVE_BRIEF")}
          disabled={executeRun.isPending}
        >
          <div className="p-2 rounded-lg bg-accent/10">
            <FileText className="h-5 w-5 text-accent" />
          </div>
          <span className="text-xs font-medium">Brief Exécutif</span>
        </Button>
        <Button variant="outline" className="h-auto py-4 flex-col gap-2 hover:border-accent hover:bg-accent/5 transition-all" asChild>
          <Link to="/hq/equipe-executive">
            <div className="p-2 rounded-lg bg-accent/10">
              <Users className="h-5 w-5 text-accent" />
            </div>
            <span className="text-xs font-medium">Workforce Copilot</span>
          </Link>
        </Button>
        <Button 
          variant="outline" 
          className="h-auto py-4 flex-col gap-2 hover:border-accent hover:bg-accent/5 transition-all"
          onClick={() => handleExecutiveAction("SECURITY_AUDIT_RLS")}
          disabled={executeRun.isPending}
        >
          <div className="p-2 rounded-lg bg-accent/10">
            <Shield className="h-5 w-5 text-accent" />
          </div>
          <span className="text-xs font-medium">Audit Sécurité</span>
        </Button>
        <Button 
          variant="outline" 
          className="h-auto py-4 flex-col gap-2 hover:border-accent hover:bg-accent/5 transition-all"
          onClick={() => handleExecutiveAction("COMPETITIVE_ANALYSIS")}
          disabled={executeRun.isPending}
        >
          <div className="p-2 rounded-lg bg-accent/10">
            <Brain className="h-5 w-5 text-accent" />
          </div>
          <span className="text-xs font-medium">Veille Concurrentielle</span>
        </Button>
        <Button variant="outline" className="h-auto py-4 flex-col gap-2 hover:border-accent hover:bg-accent/5 transition-all" asChild>
          <Link to="/hq/cockpit">
            <div className="p-2 rounded-lg bg-accent/10">
              <Gauge className="h-5 w-5 text-accent" />
            </div>
            <span className="text-xs font-medium">Cockpit</span>
          </Link>
        </Button>
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* AI Insights Widget */}
        <AIInsightsWidget className="lg:col-span-2" />

        {/* Approvals Inbox */}
        <Card className="card-executive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-success/10">
                <CheckCircle className="h-4 w-4 text-success" />
              </div>
              Approbations
            </CardTitle>
            <CardDescription>
              {approvalsLoading ? "..." : `${pendingApprovals?.length || 0} en attente`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {approvalsLoading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="h-12 bg-muted/50 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : pendingApprovals && pendingApprovals.length > 0 ? (
              <div className="space-y-3">
                {pendingApprovals.slice(0, 3).map((action) => (
                  <div
                    key={action.id}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/30 transition-colors"
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

      {/* AI Transparency Panel */}
      <AITransparencyPanel runResult={lastRunResult} />

      {/* Recent Activity & Platform Status */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Statut des Plateformes</h2>
            <Link to="/hq/plateformes" className="text-sm text-accent hover:underline flex items-center gap-1">
              Voir détails <GitBranch className="h-3 w-3" />
            </Link>
          </div>
          <PlatformHealthGrid />
        </div>
        <RecentActivityFeed />
      </div>

      {/* Stats Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="card-executive bg-gradient-to-br from-success/5 to-transparent border-success/20">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-success mb-1">{greenCount}</div>
            <div className="text-sm text-muted-foreground">Plateformes Vertes</div>
          </CardContent>
        </Card>
        <Card className="card-executive bg-gradient-to-br from-warning/5 to-transparent border-warning/20">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-warning mb-1">
              {platforms?.filter(p => p.status === "amber").length || 0}
            </div>
            <div className="text-sm text-muted-foreground">Plateformes Ambre</div>
          </CardContent>
        </Card>
        <Card className="card-executive bg-gradient-to-br from-accent/5 to-transparent border-accent/20">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-accent mb-1">
              {pendingApprovals?.length || 0}
            </div>
            <div className="text-sm text-muted-foreground">Approbations</div>
          </CardContent>
        </Card>
        <Card className="card-executive bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold mb-1">
              {(platforms?.reduce((sum, p) => sum + (p.uptime_percent || 0), 0) / (platforms?.length || 1) || 0).toFixed(1)}%
            </div>
            <div className="text-sm text-muted-foreground">Uptime Moyen</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
