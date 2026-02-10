import { useMemo, useState } from "react";
import {
  CRITICAL_ACTIONS_MOCK,
  PLATFORMS_KPI_MOCK,
  STRATEGIC_WATCH_MOCK,
  type CriticalAction,
  type PlatformHealthStatus,
} from "@/data/executiveDashboardMock";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { AlertTriangle, CheckCircle2, Clock3, ShieldCheck, XCircle } from "lucide-react";

interface ValidationHistoryItem {
  actionId: string;
  actionTitle: string;
  decision: "Approuvée" | "Rejetée";
  decidedAt: string;
}

const statusMap: Record<PlatformHealthStatus, { label: string; dotClass: string; badgeVariant: "success" | "warning" | "destructive" }> = {
  green: { label: "Vert", dotClass: "bg-success", badgeVariant: "success" },
  orange: { label: "Orange", dotClass: "bg-warning", badgeVariant: "warning" },
  red: { label: "Rouge", dotClass: "bg-destructive", badgeVariant: "destructive" },
};

const riskClassMap: Record<CriticalAction["niveauRisque"], string> = {
  Moyen: "border-warning/50",
  Élevé: "border-orange-500/50",
  Critique: "border-destructive/50",
};

export function ExecutiveDashboardSection() {
  const [selectedPlatformKey, setSelectedPlatformKey] = useState<string>("all");
  const [pendingActions, setPendingActions] = useState<CriticalAction[]>(CRITICAL_ACTIONS_MOCK);
  const [history, setHistory] = useState<ValidationHistoryItem[]>([]);

  const filteredPlatforms = useMemo(() => {
    if (selectedPlatformKey === "all") {
      return PLATFORMS_KPI_MOCK;
    }

    return PLATFORMS_KPI_MOCK.filter((platform) => platform.key === selectedPlatformKey);
  }, [selectedPlatformKey]);

  const metrics = useMemo(() => {
    const uptimeMoyen = filteredPlatforms.reduce((sum, platform) => sum + platform.uptime, 0) / filteredPlatforms.length;
    const utilisateursTotal = filteredPlatforms.reduce((sum, platform) => sum + platform.utilisateursActifs, 0);
    const alertesTotal = filteredPlatforms.reduce((sum, platform) => sum + platform.alertes, 0);

    return {
      uptimeMoyen,
      utilisateursTotal,
      alertesTotal,
      plateformeCritique: filteredPlatforms.find((platform) => platform.statut === "red")?.nom ?? "Aucune",
    };
  }, [filteredPlatforms]);

  const rapportDuJour = useMemo(() => {
    const plateformesCritiques = PLATFORMS_KPI_MOCK.filter((platform) => platform.statut === "red").length;
    const plateformesAttention = PLATFORMS_KPI_MOCK.filter((platform) => platform.statut === "orange").length;

    return {
      resume: `Surveillance consolidée des 7 plateformes : ${plateformesCritiques} critique(s), ${plateformesAttention} en vigilance renforcée, disponibilité moyenne à ${metrics.uptimeMoyen.toFixed(2)}%.`,
      actionsAValider: pendingActions.length,
      priorite: pendingActions[0]?.titre ?? "Aucune action critique en attente",
    };
  }, [metrics.uptimeMoyen, pendingActions]);

  const handleDecision = (actionId: string, decision: ValidationHistoryItem["decision"]) => {
    setPendingActions((current) => {
      const action = current.find((item) => item.id === actionId);

      if (!action) {
        return current;
      }

      setHistory((existing) => [
        {
          actionId: action.id,
          actionTitle: action.titre,
          decision,
          decidedAt: new Date().toISOString(),
        },
        ...existing,
      ]);

      return current.filter((item) => item.id !== actionId);
    });
  };

  return (
    <section className="py-20 md:py-24 bg-muted/20">
      <div className="container px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="space-y-3">
          <p className="text-sm font-medium text-accent tracking-[0.2em] uppercase">Pilotage exécutif</p>
          <h2 className="text-3xl sm:text-4xl font-semibold">Dashboard présidentiel interactif</h2>
          <p className="text-muted-foreground max-w-3xl">
            Vue unifiée des KPI, du monitoring temps réel, des validations critiques et de la veille stratégique. Les données sont mockées et prêtes à être branchées sur Supabase.
          </p>
        </div>

        <Card className="border-border/70">
          <CardHeader className="gap-4">
            <CardTitle className="text-xl">Filtre plateforme</CardTitle>
            <div className="flex gap-2 overflow-x-auto pb-1">
              <Button
                variant={selectedPlatformKey === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPlatformKey("all")}
              >
                Toutes les plateformes
              </Button>
              {PLATFORMS_KPI_MOCK.map((platform) => (
                <Button
                  key={platform.key}
                  variant={selectedPlatformKey === platform.key ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedPlatformKey(platform.key)}
                >
                  {platform.nom}
                </Button>
              ))}
            </div>
          </CardHeader>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">Uptime moyen</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-semibold">{metrics.uptimeMoyen.toFixed(2)}%</CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">Utilisateurs actifs</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-semibold">{metrics.utilisateursTotal.toLocaleString("fr-FR")}</CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">Alertes ouvertes</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-semibold">{metrics.alertesTotal}</CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">Plateforme critique</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-semibold">{metrics.plateformeCritique}</CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-5">
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="text-xl">Monitoring temps réel</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {filteredPlatforms.map((platform) => {
                const status = statusMap[platform.statut];
                return (
                  <div key={platform.key} className="rounded-lg border border-border/60 p-4 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="font-semibold">{platform.nom}</p>
                        <p className="text-sm text-muted-foreground">{platform.domaine}</p>
                      </div>
                      <Badge variant={status.badgeVariant} className="gap-1">
                        <span className={cn("h-2 w-2 rounded-full", status.dotClass)} />
                        {status.label}
                      </Badge>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2 text-sm">
                      <p>Uptime: <span className="font-medium">{platform.uptime.toFixed(2)}%</span></p>
                      <p>Utilisateurs actifs: <span className="font-medium">{platform.utilisateursActifs.toLocaleString("fr-FR")}</span></p>
                      <p>Dernière MAJ: <span className="font-medium">{new Date(platform.derniereMaj).toLocaleString("fr-FR")}</span></p>
                      <p>Alertes: <span className="font-medium">{platform.alertes}</span></p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-xl">Rapport du jour (IA)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-muted p-4 text-sm leading-relaxed">{rapportDuJour.resume}</div>
              <div className="space-y-2 text-sm">
                <p className="flex items-center gap-2"><Clock3 className="h-4 w-4 text-accent" /> Actions à valider: <strong>{rapportDuJour.actionsAValider}</strong></p>
                <p className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-warning" /> Priorité: <strong>{rapportDuJour.priorite}</strong></p>
                <p className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-success" /> RGPD: journalisation des validations activée</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Validation présidentielle</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {pendingActions.length === 0 && (
                <p className="text-sm text-muted-foreground">Aucune action critique en attente de validation.</p>
              )}
              {pendingActions.map((action) => (
                <div key={action.id} className={cn("rounded-lg border p-4 space-y-3", riskClassMap[action.niveauRisque])}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold">{action.titre}</p>
                    <Badge variant="outline">{action.niveauRisque}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{action.description}</p>
                  <p className="text-xs text-muted-foreground">Demandée par {action.demandeePar} — {new Date(action.dateDemande).toLocaleString("fr-FR")}</p>
                  <div className="flex gap-2">
                    <Button size="sm" className="gap-1" onClick={() => handleDecision(action.id, "Approuvée")}>
                      <CheckCircle2 className="h-4 w-4" /> Approuver
                    </Button>
                    <Button size="sm" variant="destructive" className="gap-1" onClick={() => handleDecision(action.id, "Rejetée")}>
                      <XCircle className="h-4 w-4" /> Rejeter
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Historique & veille stratégique</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <h3 className="font-medium">Historique des validations</h3>
                {history.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Aucune décision enregistrée pour le moment.</p>
                ) : (
                  history.slice(0, 4).map((item) => (
                    <div key={`${item.actionId}-${item.decidedAt}`} className="rounded-md bg-muted p-3 text-sm">
                      <p className="font-medium">{item.actionTitle}</p>
                      <p className="text-muted-foreground">{item.decision} — {new Date(item.decidedAt).toLocaleString("fr-FR")}</p>
                    </div>
                  ))
                )}
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">Veille stratégique</h3>
                {STRATEGIC_WATCH_MOCK.map((item) => (
                  <div key={item.id} className="rounded-md border border-border/60 p-3 text-sm">
                    <p className="font-medium">{item.titre}</p>
                    <p className="text-muted-foreground">{item.resume}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <Badge variant="outline">{item.source}</Badge>
                      <Badge variant={item.impact === "Élevé" ? "destructive" : item.impact === "Moyen" ? "warning" : "secondary"}>
                        Impact {item.impact}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
