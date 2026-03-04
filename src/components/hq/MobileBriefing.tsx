import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Phone, PhoneCall, Loader2, CheckCircle, XCircle, AlertTriangle,
  DollarSign, Wifi, ChevronRight, Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import { usePlatforms, usePendingApprovals, useExecuteRun, type ExecutiveRunResult } from "@/hooks/useHQData";
import { useStripeKPIs, formatCurrency } from "@/hooks/useStripeKPIs";
import { useMorningDigest } from "@/hooks/useMorningDigest";
import { RunResultPanel } from "@/components/hq/RunResultPanel";
import ReactMarkdown from "react-markdown";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { useState } from "react";

/**
 * MobileBriefing — Vue mobile ultra-simplifiée.
 * 3 cartes max pour piloter en 30 secondes.
 */
export function MobileBriefing() {
  const { data: platforms } = usePlatforms();
  const { data: pendingApprovals } = usePendingApprovals();
  const { data: stripeData, isError: stripeError } = useStripeKPIs();
  const { data: digest } = useMorningDigest();
  const executeRun = useExecuteRun();
  const [runResult, setRunResult] = useState<ExecutiveRunResult | null>(null);
  const [callState, setCallState] = useState<"idle" | "calling">("idle");

  const greenCount = platforms?.filter(p => p.status === "green").length || 0;
  const amberCount = platforms?.filter(p => p.status === "amber").length || 0;
  const redCount = platforms?.filter(p => p.status === "red").length || 0;
  const total = platforms?.length || 0;
  const pendingCount = pendingApprovals?.length || 0;
  const mrr = stripeError ? null : (stripeData?.kpis?.mrr ?? 0);
  const uptime = platforms?.length
    ? Math.round((platforms.reduce((s, p) => s + (p.uptime_percent || 0), 0) / Math.max(platforms.length, 1)) * 10) / 10
    : null;

  const handleCall = async () => {
    setCallState("calling");
    try {
      const result = await executeRun.mutateAsync({ run_type: "CEO_STANDUP_MEETING" });
      setRunResult(result);
    } finally {
      setCallState("idle");
    }
  };

  const greeting = new Date().getHours() < 12 ? "Bonjour" : new Date().getHours() < 18 ? "Bon après-midi" : "Bonsoir";

  return (
    <div className="space-y-4 animate-fade-in pb-6">
      {/* Greeting + CTA */}
      <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-5 text-primary-foreground">
        <h1 className="text-xl font-bold mb-1">{greeting}, Présidente</h1>
        <p className="text-primary-foreground/70 text-sm mb-4">
          {greenCount === total && total > 0
            ? "Tout est opérationnel ✓"
            : `${greenCount}/${total} plateformes OK`}
          {pendingCount > 0 && ` · ${pendingCount} décision${pendingCount > 1 ? "s" : ""}`}
        </p>
        <Button
          variant="hero"
          size="lg"
          className="w-full gap-2 py-5"
          onClick={handleCall}
          disabled={callState === "calling"}
        >
          {callState === "calling" ? (
            <><PhoneCall className="h-5 w-5 animate-pulse" /> Connexion...</>
          ) : (
            <><Phone className="h-5 w-5" /> Appeler le DG</>
          )}
        </Button>
      </div>

      {/* Run result */}
      {runResult && (
        <RunResultPanel runResult={runResult} onClose={() => setRunResult(null)} />
      )}

      {/* Card 1: KPI Strip */}
      <Card className="card-executive">
        <CardContent className="p-4">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <DollarSign className="h-4 w-4 mx-auto text-success mb-1" />
              <p className="text-lg font-bold">{mrr != null && mrr > 0 ? formatCurrency(mrr) : "—"}</p>
              <p className="text-[10px] text-muted-foreground">MRR</p>
            </div>
            <div>
              <Wifi className="h-4 w-4 mx-auto text-accent mb-1" />
              <p className="text-lg font-bold">{uptime != null && uptime > 0 ? `${uptime}%` : "—"}</p>
              <p className="text-[10px] text-muted-foreground">Uptime</p>
            </div>
            <div>
              <div className="flex justify-center gap-1 mb-1">
                {greenCount > 0 && <span className="text-success text-xs font-bold">{greenCount}✓</span>}
                {amberCount > 0 && <span className="text-warning text-xs font-bold">{amberCount}⚠</span>}
                {redCount > 0 && <span className="text-destructive text-xs font-bold">{redCount}✕</span>}
              </div>
              <p className="text-lg font-bold">{total}</p>
              <p className="text-[10px] text-muted-foreground">Plateformes</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card 2: Morning Digest (compact) */}
      {digest?.executive_summary ? (
        <Card className="card-executive border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold">Brief du jour</span>
              <span className="text-[10px] text-muted-foreground ml-auto">
                {formatDistanceToNow(new Date(digest.created_at), { addSuffix: true, locale: fr })}
              </span>
            </div>
            <div className="prose prose-sm dark:prose-invert max-w-none text-xs text-foreground/85 leading-relaxed line-clamp-6">
              <ReactMarkdown>{digest.executive_summary}</ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="card-executive border-dashed border-2 border-muted-foreground/20">
          <CardContent className="p-4 flex flex-col items-center text-center gap-3">
            <Sparkles className="h-5 w-5 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Aucun brief aujourd'hui</p>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs"
              onClick={async () => {
                const result = await executeRun.mutateAsync({ run_type: "DAILY_EXECUTIVE_BRIEF" });
                setRunResult(result);
              }}
              disabled={executeRun.isPending}
            >
              {executeRun.isPending ? (
                <><Loader2 className="h-3 w-3 animate-spin" /> Génération…</>
              ) : (
                <><Sparkles className="h-3 w-3" /> Générer le brief</>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Card 3: Quick Actions (2 max) */}
      <div className="grid grid-cols-2 gap-3">
        <Link to="/hq/plateformes" className="block">
          <Card className="card-executive h-full">
            <CardContent className="p-4 flex flex-col items-center text-center gap-2">
              <div className="flex gap-1">
                {greenCount > 0 && <CheckCircle className="h-4 w-4 text-success" />}
                {amberCount > 0 && <AlertTriangle className="h-4 w-4 text-warning" />}
                {redCount > 0 && <XCircle className="h-4 w-4 text-destructive" />}
              </div>
              <span className="text-xs font-semibold">Plateformes</span>
              <ChevronRight className="h-3 w-3 text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>

        <Link to="/hq/approbations" className="block">
          <Card className={`card-executive h-full ${pendingCount > 0 ? "border-warning/30" : ""}`}>
            <CardContent className="p-4 flex flex-col items-center text-center gap-2">
              {pendingCount > 0 ? (
                <Badge variant="destructive" className="text-[10px] px-1.5">{pendingCount}</Badge>
              ) : (
                <CheckCircle className="h-4 w-4 text-success" />
              )}
              <span className="text-xs font-semibold">Décisions</span>
              <ChevronRight className="h-3 w-3 text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
