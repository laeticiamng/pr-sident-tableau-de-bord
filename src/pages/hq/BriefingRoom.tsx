import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileBriefing } from "@/components/hq/MobileBriefing";
import {
  BrainCircuit,
  Zap,
  Loader2,
  Sparkles,
  Layers,
  CheckSquare,
  ChevronRight,
  CheckCircle,
  AlertTriangle,
  XCircle,
  DollarSign,
  Bot,
  Wifi,
  Clock,
  BookOpen,
} from "lucide-react";
import { usePlatforms, usePendingApprovals, useRecentRuns, useExecuteRun, type ExecutiveRunResult } from "@/hooks/useHQData";
import { useStripeKPIs, formatCurrency } from "@/hooks/useStripeKPIs";
import { useMorningDigest } from "@/hooks/useMorningDigest";
import { Link } from "react-router-dom";
import { RunResultPanel } from "@/components/hq/RunResultPanel";
import ReactMarkdown from "react-markdown";
import { RecentDecisionsWidget } from "@/components/hq/briefing/RecentDecisionsWidget";
import { useJournalEntries } from "@/hooks/useJournal";
import { formatDistanceToNow } from "date-fns";
import { fr, enGB, de } from "date-fns/locale";
import { useTranslation, useLanguage } from "@/contexts/LanguageContext";
import { briefingTranslations } from "@/i18n/briefing";

const dateFnsLocales = { fr, en: enGB, de };

export default function BriefingRoom() {
  const isMobile = useIsMobile();
  const { data: platforms, isLoading: platformsLoading } = usePlatforms();
  const { data: pendingApprovals } = usePendingApprovals();
  const { data: runs, refetch: refetchRuns } = useRecentRuns(50);
  const { data: stripeData, isError: stripeError } = useStripeKPIs();
  const { data: morningDigest } = useMorningDigest();
  const { data: journalEntries } = useJournalEntries();
  const executeRun = useExecuteRun();
  const [lastRunResult, setLastRunResult] = useState<ExecutiveRunResult | null>(null);
  const [callState, setCallState] = useState<"idle" | "calling" | "connected" | "done">("idle");
  const t = useTranslation(briefingTranslations);
  const { language } = useLanguage();
  const locale = dateFnsLocales[language] || fr;

  const currentTime = new Date();
  const greeting = currentTime.getHours() < 12 ? t.greetingMorning : currentTime.getHours() < 18 ? t.greetingAfternoon : t.greetingEvening;

  const greenCount = platforms?.filter(p => p.status === "green").length || 0;
  const amberCount = platforms?.filter(p => p.status === "amber").length || 0;
  const redCount = platforms?.filter(p => p.status === "red").length || 0;
  const totalPlatforms = platforms?.length || 8;
  const pendingCount = pendingApprovals?.length || 0;

  const mrr = stripeError ? null : (stripeData?.kpis?.mrr ?? 0);
  const mrrChange = stripeError ? null : (stripeData?.kpis?.mrrChange ?? 0);

  const activeAgents24h = (() => {
    const now = Date.now();
    const agentTypes = new Set(
      runs?.filter(r => now - new Date(r.created_at).getTime() < 24 * 3600 * 1000)
        .map(r => r.run_type) || []
    );
    return agentTypes.size;
  })();

  const globalUptime = platforms?.length
    ? Math.round((platforms.reduce((s, p) => s + (p.uptime_percent || 0), 0) / Math.max(platforms.length, 1)) * 10) / 10
    : null;

  const lastRun = runs?.[0] || null;

  const decisionsWithoutImpact = (journalEntries || []).filter(
    e => e.entry_type === "decision" && !e.impact_measured?.summary
  ).length;

  const handleCallDG = async () => {
    setCallState("calling");
    setTimeout(() => setCallState("connected"), 1500);

    try {
      const result = await executeRun.mutateAsync({ run_type: "CEO_STANDUP_MEETING" });
      setLastRunResult(result);
      setCallState("done");
      refetchRuns();
    } catch {
      setCallState("idle");
    }
  };

  const handleBrief = async () => {
    const result = await executeRun.mutateAsync({ run_type: "DAILY_EXECUTIVE_BRIEF" });
    setLastRunResult(result);
    refetchRuns();
  };

  const callButtonContent = () => {
    switch (callState) {
      case "calling":
        return (<><Zap className="h-5 w-5 animate-pulse" />{t.launchBrief}</>);
      case "connected":
        return (<><Loader2 className="h-5 w-5 animate-spin" />{t.analyzing}</>);
      case "done":
        return (<><CheckCircle className="h-5 w-5" />{t.briefReceived}</>);
      default:
        return (<><BrainCircuit className="h-5 w-5" />{t.launchExecutiveBrief}</>);
    }
  };

  if (isMobile) return <MobileBriefing />;

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
      {/* En-tête */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary to-primary/80 p-4 sm:p-6 md:p-8 text-primary-foreground">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(38_92%_50%/0.15),transparent)]" />
        <div className="relative z-10 flex flex-col gap-6">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2">{greeting}, {t.presidentTitle}</h1>
            <p className="text-primary-foreground/70 text-lg">
              {platformsLoading ? t.loading : (
                <>
                  {greenCount === totalPlatforms
                    ? t.allOperational
                    : t.platformsOk(greenCount, totalPlatforms)
                  }
                  {pendingCount > 0 && ` ${t.pendingDecisions(pendingCount)}`}
                </>
              )}
            </p>
          </div>

          <Button
            variant="hero"
            size="lg"
            className="gap-3 w-full sm:w-auto sm:min-w-[280px] text-base py-6"
            onClick={handleCallDG}
            disabled={callState === "calling" || callState === "connected"}
          >
            {callButtonContent()}
          </Button>

          {callState === "done" && (
            <p className="text-sm text-primary-foreground/60">{t.resultBelow}</p>
          )}
        </div>
      </div>

      {/* Run result */}
      {lastRunResult && (
        <RunResultPanel
          runResult={lastRunResult}
          onClose={() => { setLastRunResult(null); setCallState("idle"); }}
        />
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <Card className="card-executive">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-success/10"><DollarSign className="h-5 w-5 text-success" /></div>
            <div>
              <p className="text-xl font-bold">{mrr != null && mrr > 0 ? formatCurrency(mrr) : "—"}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                {t.mrr}
                {stripeError && <span className="text-destructive" title="Service indisponible">⚠</span>}
                {mrrChange != null && mrrChange !== 0 && (
                  <span className={mrrChange > 0 ? "text-success" : "text-destructive"}>
                    {mrrChange > 0 ? "+" : ""}{mrrChange.toFixed(1)}%
                  </span>
                )}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="card-executive">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10"><Bot className="h-5 w-5 text-primary" /></div>
            <div>
              <p className="text-xl font-bold">{activeAgents24h}</p>
              <p className="text-xs text-muted-foreground">{t.agentsActive24h}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="card-executive">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent/10"><Wifi className="h-5 w-5 text-accent" /></div>
            <div>
              <p className="text-xl font-bold">{globalUptime != null && globalUptime > 0 ? `${globalUptime}%` : "—"}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                {t.uptimeGlobal}
                <Badge variant="outline" className="text-[9px] px-1 py-0">{t.average}</Badge>
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="card-executive">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-warning/10"><Clock className="h-5 w-5 text-warning" /></div>
            <div>
              {lastRun ? (
                <>
                  <p className="text-xl font-bold flex items-center gap-1.5">
                    {lastRun.status === "completed" ? <CheckCircle className="h-4 w-4 text-success" /> :
                     lastRun.status === "failed" ? <XCircle className="h-4 w-4 text-destructive" /> :
                     <Loader2 className="h-4 w-4 animate-spin text-primary" />}
                    <span className="text-sm font-medium truncate max-w-[80px]">
                      {lastRun.run_type.replace(/_/g, " ").slice(0, 12)}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(lastRun.created_at), { addSuffix: true, locale })}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-xl font-bold">—</p>
                  <p className="text-xs text-muted-foreground">{t.lastRun}</p>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Link to="/hq/journal">
          <Card className={`card-executive h-full transition-colors ${decisionsWithoutImpact > 0 ? "border-warning/30" : ""}`}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`p-2 rounded-lg ${decisionsWithoutImpact > 0 ? "bg-warning/10" : "bg-success/10"}`}>
                <BookOpen className={`h-5 w-5 ${decisionsWithoutImpact > 0 ? "text-warning" : "text-success"}`} />
              </div>
              <div>
                <p className="text-xl font-bold">{decisionsWithoutImpact}</p>
                <p className="text-xs text-muted-foreground">{t.withoutImpact}</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Morning Digest */}
      {morningDigest?.executive_summary ? (
        <Card className="card-executive border-primary/20 bg-primary/[0.02]">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-primary/10"><Sparkles className="h-5 w-5 text-primary" /></div>
              <div>
                <h3 className="font-semibold">{t.briefToday}</h3>
                <p className="text-xs text-muted-foreground">
                  {morningDigest.triggered_by === "manual" ? t.triggeredManually : t.triggeredAuto} — {formatDistanceToNow(new Date(morningDigest.created_at), { addSuffix: true, locale })}
                </p>
              </div>
            </div>
            <div className="prose prose-sm dark:prose-invert max-w-none text-sm text-foreground/90 leading-relaxed">
              <ReactMarkdown>{morningDigest.executive_summary}</ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="card-executive border-dashed border-2 border-muted-foreground/20">
          <CardContent className="p-6 flex flex-col items-center text-center gap-4">
            <div className="p-3 rounded-full bg-muted/50"><Sparkles className="h-6 w-6 text-muted-foreground" /></div>
            <div>
              <h3 className="font-semibold text-muted-foreground">{t.noBrief}</h3>
              <p className="text-sm text-muted-foreground/70 mt-1">{t.noBriefDesc}</p>
            </div>
            <Button variant="outline" className="gap-2" onClick={handleBrief} disabled={executeRun.isPending}>
              {executeRun.isPending ? (
                <><Loader2 className="h-4 w-4 animate-spin" />{t.generating}</>
              ) : (
                <><Sparkles className="h-4 w-4" />{t.generateBrief}</>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Recent Decisions */}
      <RecentDecisionsWidget />

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold mb-4">{t.whatToDo}</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Link to="/hq/plateformes" className="block group">
            <Card className="card-executive h-full transition-all duration-200 group-hover:border-accent/50 group-hover:shadow-lg">
              <CardContent className="p-6 flex flex-col items-start gap-4">
                <div className="p-3 rounded-xl bg-accent/10"><Layers className="h-6 w-6 text-accent" /></div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">{t.viewPlatforms}</h3>
                  <p className="text-sm text-muted-foreground">{t.viewPlatformsDesc(totalPlatforms)}</p>
                </div>
                <div className="flex items-center gap-2 w-full">
                  <div className="flex items-center gap-1.5 text-xs">
                    {greenCount > 0 && <span className="flex items-center gap-1 text-success"><CheckCircle className="h-3.5 w-3.5" /> {greenCount}</span>}
                    {amberCount > 0 && <span className="flex items-center gap-1 text-warning"><AlertTriangle className="h-3.5 w-3.5" /> {amberCount}</span>}
                    {redCount > 0 && <span className="flex items-center gap-1 text-destructive"><XCircle className="h-3.5 w-3.5" /> {redCount}</span>}
                  </div>
                  <ChevronRight className="h-4 w-4 ml-auto text-muted-foreground group-hover:text-accent transition-colors" />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to="/hq/approbations" className="block group">
            <Card className={`card-executive h-full transition-all duration-200 group-hover:border-accent/50 group-hover:shadow-lg ${pendingCount > 0 ? "border-warning/30" : ""}`}>
              <CardContent className="p-6 flex flex-col items-start gap-4">
                <div className={`p-3 rounded-xl ${pendingCount > 0 ? "bg-warning/10" : "bg-success/10"}`}>
                  <CheckSquare className={`h-6 w-6 ${pendingCount > 0 ? "text-warning" : "text-success"}`} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">{t.myPendingDecisions}</h3>
                  <p className="text-sm text-muted-foreground">
                    {pendingCount > 0 ? t.pendingActions(pendingCount) : t.noDecisionsPending}
                  </p>
                </div>
                <div className="flex items-center w-full">
                  {pendingCount > 0 && <Badge variant="destructive" className="text-xs">{t.pendingBadge(pendingCount)}</Badge>}
                  <ChevronRight className="h-4 w-4 ml-auto text-muted-foreground group-hover:text-accent transition-colors" />
                </div>
              </CardContent>
            </Card>
          </Link>

          <button onClick={handleBrief} disabled={executeRun.isPending} className="block group text-left w-full">
            <Card className="card-executive h-full transition-all duration-200 group-hover:border-accent/50 group-hover:shadow-lg">
              <CardContent className="p-6 flex flex-col items-start gap-4">
                <div className="p-3 rounded-xl bg-accent/10"><Sparkles className="h-6 w-6 text-accent" /></div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">{t.askAIBrief}</h3>
                  <p className="text-sm text-muted-foreground">{t.askAIBriefDesc}</p>
                </div>
                <div className="flex items-center w-full">
                  {executeRun.isPending && <Badge variant="outline" className="text-xs gap-1"><Loader2 className="h-3 w-3 animate-spin" />{t.generating}</Badge>}
                  <ChevronRight className="h-4 w-4 ml-auto text-muted-foreground group-hover:text-accent transition-colors" />
                </div>
              </CardContent>
            </Card>
          </button>
        </div>
      </div>
    </div>
  );
}
