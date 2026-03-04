import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Phone, PhoneCall, Loader2, CheckCircle, XCircle, AlertTriangle,
  DollarSign, Wifi, ChevronRight, Sparkles, Bot, Clock, BookOpen,
} from "lucide-react";
import { Link } from "react-router-dom";
import { usePlatforms, usePendingApprovals, useRecentRuns, useExecuteRun, type ExecutiveRunResult } from "@/hooks/useHQData";
import { useJournalEntries, type JournalEntry } from "@/hooks/useJournal";
import { useStripeKPIs, formatCurrency } from "@/hooks/useStripeKPIs";
import { useMorningDigest } from "@/hooks/useMorningDigest";
import { RunResultPanel } from "@/components/hq/RunResultPanel";
import ReactMarkdown from "react-markdown";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { useState, useCallback, useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";

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

      {/* Card 1: KPI Strip — Swipeable */}
      <KPICarousel
        mrr={mrr}
        uptime={uptime}
        greenCount={greenCount}
        amberCount={amberCount}
        redCount={redCount}
        total={total}
        pendingCount={pendingCount}
      />

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

      {/* Card 3: Recent Decisions (compact) */}
      <CompactDecisions />

      {/* Card 4: Quick Actions (2 max) */}
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

// ── Compact Decisions Widget (Mobile) ────────────────────────────────

function CompactDecisions() {
  const { data: entries, isLoading } = useJournalEntries();
  const recent = (entries || []).slice(0, 2);

  const typeLabels: Record<string, string> = {
    decision: "Décision",
    note: "Note",
    milestone: "Jalon",
    reflection: "Réflexion",
  };

  const typeColors: Record<string, string> = {
    decision: "bg-accent/10 text-accent",
    note: "bg-muted text-muted-foreground",
    milestone: "bg-success/10 text-success",
    reflection: "bg-primary/10 text-primary",
  };

  if (isLoading) {
    return (
      <Card className="card-executive">
        <CardContent className="p-3">
          <div className="h-10 rounded bg-muted/50 animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  if (recent.length === 0) {
    return (
      <Card className="card-executive border-dashed border-2 border-muted-foreground/20">
        <CardContent className="p-3 text-center">
          <p className="text-[10px] text-muted-foreground">Aucune décision récente</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-executive">
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <BookOpen className="h-3.5 w-3.5 text-accent" />
            <span className="text-xs font-semibold">Décisions récentes</span>
          </div>
          <Link to="/hq/journal" className="text-[10px] text-accent hover:underline flex items-center gap-0.5">
            Voir <ChevronRight className="h-2.5 w-2.5" />
          </Link>
        </div>
        <div className="space-y-1.5">
          {recent.map((entry) => (
            <div key={entry.id} className="flex items-center gap-2 p-2 rounded-md border bg-card">
              <Badge variant="outline" className={`text-[8px] px-1 py-0 shrink-0 ${typeColors[entry.entry_type] || ""}`}>
                {typeLabels[entry.entry_type] || entry.entry_type}
              </Badge>
              <p className="text-[11px] font-medium truncate flex-1">{entry.title}</p>
              <span className="text-[9px] text-muted-foreground shrink-0">
                {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true, locale: fr })}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ── Swipeable KPI Carousel ───────────────────────────────────────────

interface KPICarouselProps {
  mrr: number | null;
  uptime: number | null;
  greenCount: number;
  amberCount: number;
  redCount: number;
  total: number;
  pendingCount: number;
}

function KPICarousel({ mrr, uptime, greenCount, amberCount, redCount, total, pendingCount }: KPICarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    dragFree: true,
  });
  const [activeIndex, setActiveIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setActiveIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    onSelect();
    return () => { emblaApi.off("select", onSelect); };
  }, [emblaApi, onSelect]);

  const kpis = [
    {
      icon: <DollarSign className="h-5 w-5 text-success" />,
      value: mrr != null && mrr > 0 ? formatCurrency(mrr) : "—",
      label: "MRR",
      sublabel: "Revenus mensuels",
      bg: "bg-success/5 border-success/20",
    },
    {
      icon: <Wifi className="h-5 w-5 text-accent" />,
      value: uptime != null && uptime > 0 ? `${uptime}%` : "—",
      label: "Uptime",
      sublabel: "Disponibilité moyenne",
      bg: "bg-accent/5 border-accent/20",
    },
    {
      icon: <div className="flex gap-1">
        {greenCount > 0 && <CheckCircle className="h-4 w-4 text-success" />}
        {amberCount > 0 && <AlertTriangle className="h-4 w-4 text-warning" />}
        {redCount > 0 && <XCircle className="h-4 w-4 text-destructive" />}
      </div>,
      value: `${greenCount}/${total}`,
      label: "Plateformes",
      sublabel: `${greenCount} opérationnelles`,
      bg: greenCount === total ? "bg-success/5 border-success/20" : "bg-warning/5 border-warning/20",
    },
    {
      icon: pendingCount > 0
        ? <Badge variant="destructive" className="text-xs px-2">{pendingCount}</Badge>
        : <CheckCircle className="h-5 w-5 text-success" />,
      value: pendingCount > 0 ? `${pendingCount}` : "0",
      label: "Décisions",
      sublabel: pendingCount > 0 ? "en attente" : "tout à jour",
      bg: pendingCount > 0 ? "bg-warning/5 border-warning/20" : "bg-muted/30 border-border",
    },
  ];

  return (
    <div className="space-y-2">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-3">
          {kpis.map((kpi, i) => (
            <div key={i} className="flex-[0_0_70%] min-w-0">
              <Card className={`card-executive border ${kpi.bg}`}>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="flex-shrink-0">{kpi.icon}</div>
                  <div>
                    <p className="text-xl font-bold leading-tight">{kpi.value}</p>
                    <p className="text-xs font-medium">{kpi.label}</p>
                    <p className="text-[10px] text-muted-foreground">{kpi.sublabel}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
      {/* Dots indicator */}
      <div className="flex justify-center gap-1.5">
        {kpis.map((_, i) => (
          <button
            key={i}
            className={`h-1.5 rounded-full transition-all ${
              i === activeIndex ? "w-4 bg-primary" : "w-1.5 bg-muted-foreground/30"
            }`}
            onClick={() => emblaApi?.scrollTo(i)}
          />
        ))}
      </div>
    </div>
  );
}
