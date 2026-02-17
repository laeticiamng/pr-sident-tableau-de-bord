import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Phone,
  PhoneCall,
  Loader2,
  Sparkles,
  Layers,
  CheckSquare,
  ChevronRight,
  CheckCircle,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import { usePlatforms, usePendingApprovals, useRecentRuns, useExecuteRun, type ExecutiveRunResult } from "@/hooks/useHQData";
import { Link } from "react-router-dom";
import { RunResultPanel } from "@/components/hq/RunResultPanel";

export default function BriefingRoom() {
  const { data: platformsResult, isLoading: platformsLoading } = usePlatforms();
  const platforms = platformsResult?.platforms;
  const isMockData = platformsResult?.isMockData ?? false;
  const { data: pendingApprovals } = usePendingApprovals();
  const { refetch: refetchRuns } = useRecentRuns(5);
  const executeRun = useExecuteRun();
  const [lastRunResult, setLastRunResult] = useState<ExecutiveRunResult | null>(null);
  const [callState, setCallState] = useState<"idle" | "calling" | "connected" | "done">("idle");

  const currentTime = new Date();
  const greeting = currentTime.getHours() < 12 ? "Bonjour" : currentTime.getHours() < 18 ? "Bon après-midi" : "Bonsoir";

  const greenCount = platforms?.filter(p => p.status === "green").length || 0;
  const amberCount = platforms?.filter(p => p.status === "amber").length || 0;
  const redCount = platforms?.filter(p => p.status === "red").length || 0;
  const totalPlatforms = platforms?.length || 7;
  const pendingCount = pendingApprovals?.length || 0;

  const handleCallDG = async () => {
    setCallState("calling");

    // Simule le démarrage de l'appel
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

  // Texte et icône du bouton selon l'état
  const callButtonContent = () => {
    switch (callState) {
      case "calling":
        return (
          <>
            <PhoneCall className="h-5 w-5 animate-pulse" />
            Connexion en cours...
          </>
        );
      case "connected":
        return (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Le DG prépare votre brief...
          </>
        );
      case "done":
        return (
          <>
            <CheckCircle className="h-5 w-5" />
            Brief reçu — voir ci-dessous
          </>
        );
      default:
        return (
          <>
            <Phone className="h-5 w-5" />
            Appeler le DG
          </>
        );
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
      {/* En-tête simple */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary to-primary/80 p-8 text-primary-foreground">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(38_92%_50%/0.15),transparent)]" />

        <div className="relative z-10 flex flex-col gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{greeting}, Madame la Présidente</h1>
            <p className="text-primary-foreground/70 text-lg">
              {platformsLoading ? "Chargement..." : (
                <>
                  {greenCount === totalPlatforms
                    ? "Toutes vos plateformes fonctionnent parfaitement."
                    : `${greenCount}/${totalPlatforms} plateformes opérationnelles.`
                  }
                  {pendingCount > 0 && ` ${pendingCount} décision${pendingCount > 1 ? "s" : ""} en attente.`}
                </>
              )}
              {isMockData && !platformsLoading && (
                <Badge variant="outline" className="ml-3 text-xs border-amber-400/50 text-amber-300">
                  Mode démo
                </Badge>
              )}
            </p>
          </div>

          {/* Bouton Appeler le DG — proéminent */}
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
            <p className="text-sm text-primary-foreground/60">
              Le résultat de votre appel s'affiche plus bas sur cette page.
            </p>
          )}
        </div>
      </div>

      {/* Résultat de l'appel (si disponible) */}
      {lastRunResult && (
        <RunResultPanel
          runResult={lastRunResult}
          onClose={() => {
            setLastRunResult(null);
            setCallState("idle");
          }}
        />
      )}

      {/* Parcours guidé — 3 actions claires */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Que souhaitez-vous faire ?</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {/* Action 1: Voir les plateformes */}
          <Link to="/hq/plateformes" className="block group">
            <Card className="card-executive h-full transition-all duration-200 group-hover:border-accent/50 group-hover:shadow-lg">
              <CardContent className="p-6 flex flex-col items-start gap-4">
                <div className="p-3 rounded-xl bg-accent/10">
                  <Layers className="h-6 w-6 text-accent" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">Voir mes plateformes</h3>
                  <p className="text-sm text-muted-foreground">
                    Consultez l'état de vos {totalPlatforms} plateformes en un coup d'oeil.
                  </p>
                </div>
                <div className="flex items-center gap-2 w-full">
                  <div className="flex items-center gap-1.5 text-xs">
                    {greenCount > 0 && (
                      <span className="flex items-center gap-1 text-success">
                        <CheckCircle className="h-3.5 w-3.5" /> {greenCount}
                      </span>
                    )}
                    {amberCount > 0 && (
                      <span className="flex items-center gap-1 text-warning">
                        <AlertTriangle className="h-3.5 w-3.5" /> {amberCount}
                      </span>
                    )}
                    {redCount > 0 && (
                      <span className="flex items-center gap-1 text-destructive">
                        <XCircle className="h-3.5 w-3.5" /> {redCount}
                      </span>
                    )}
                  </div>
                  <ChevronRight className="h-4 w-4 ml-auto text-muted-foreground group-hover:text-accent transition-colors" />
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Action 2: Approbations */}
          <Link to="/hq/approbations" className="block group">
            <Card className={`card-executive h-full transition-all duration-200 group-hover:border-accent/50 group-hover:shadow-lg ${pendingCount > 0 ? "border-warning/30" : ""}`}>
              <CardContent className="p-6 flex flex-col items-start gap-4">
                <div className={`p-3 rounded-xl ${pendingCount > 0 ? "bg-warning/10" : "bg-success/10"}`}>
                  <CheckSquare className={`h-6 w-6 ${pendingCount > 0 ? "text-warning" : "text-success"}`} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">Mes décisions en attente</h3>
                  <p className="text-sm text-muted-foreground">
                    {pendingCount > 0
                      ? `${pendingCount} action${pendingCount > 1 ? "s" : ""} nécessite${pendingCount > 1 ? "nt" : ""} votre validation.`
                      : "Aucune décision en attente. Tout est à jour."
                    }
                  </p>
                </div>
                <div className="flex items-center w-full">
                  {pendingCount > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {pendingCount} en attente
                    </Badge>
                  )}
                  <ChevronRight className="h-4 w-4 ml-auto text-muted-foreground group-hover:text-accent transition-colors" />
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Action 3: Brief exécutif */}
          <button onClick={handleBrief} disabled={executeRun.isPending} className="block group text-left w-full">
            <Card className="card-executive h-full transition-all duration-200 group-hover:border-accent/50 group-hover:shadow-lg">
              <CardContent className="p-6 flex flex-col items-start gap-4">
                <div className="p-3 rounded-xl bg-accent/10">
                  <Sparkles className="h-6 w-6 text-accent" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">Demander un brief IA</h3>
                  <p className="text-sm text-muted-foreground">
                    Recevez un résumé intelligent de l'activité de toutes vos plateformes.
                  </p>
                </div>
                <div className="flex items-center w-full">
                  {executeRun.isPending ? (
                    <span className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Génération en cours...
                    </span>
                  ) : (
                    <span className="text-xs text-accent font-medium">Lancer le brief</span>
                  )}
                  <ChevronRight className="h-4 w-4 ml-auto text-muted-foreground group-hover:text-accent transition-colors" />
                </div>
              </CardContent>
            </Card>
          </button>
        </div>
      </div>

      {/* Résumé santé — simple, 3 chiffres */}
      <Card className="card-executive">
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4">Santé de l'écosystème</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-xl bg-success/5 border border-success/20">
              <div className="text-3xl font-bold text-success">{greenCount}</div>
              <div className="text-sm text-muted-foreground mt-1">Opérationnelles</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-warning/5 border border-warning/20">
              <div className="text-3xl font-bold text-warning">{amberCount}</div>
              <div className="text-sm text-muted-foreground mt-1">À surveiller</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-destructive/5 border border-destructive/20">
              <div className="text-3xl font-bold text-destructive">{redCount}</div>
              <div className="text-sm text-muted-foreground mt-1">Critiques</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
