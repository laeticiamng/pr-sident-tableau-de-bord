import { useMemo } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExecutiveHeader } from "@/components/hq/ExecutiveDataSource";
import { MethodologyDisclosure } from "@/components/hq/MethodologyDisclosure";
import {
  ARCHITECTURE_LAYERS,
  PLATFORM_ARCHITECTURE,
  getCoverageScore,
  getAuditActionsForPlatform,
  getGaps,
  type AuditActionStatus,
} from "@/data/systemArchitecture";
import { useRecentRuns } from "@/hooks/hq/useRuns";
import { useDLQEntries } from "@/hooks/hq/useReliability";
import {
  ArrowLeft,
  Layers,
  ShieldCheck,
  Database,
  Cloud,
  Workflow,
  Bot,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Circle,
  AlertOctagon,
} from "lucide-react";

const LAYER_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  schema: Database,
  rls: ShieldCheck,
  rpc: Layers,
  edge: Cloud,
  runs: Workflow,
  autopilot: Bot,
  observability: Activity,
};

/** Couches déclenchées par les runs / DLQ / autopilot / observabilité. */
const RUN_DRIVEN_LAYERS = new Set(["runs", "autopilot", "observability"]);

function StatusBadge({ value }: { value?: "applied" | "partial" | "todo" }) {
  if (value === "applied") return <Badge variant="success">Appliqué</Badge>;
  if (value === "partial") return <Badge variant="warning">Partiel</Badge>;
  return <Badge variant="subtle">À faire</Badge>;
}

function StatusIcon({ value }: { value?: "applied" | "partial" | "todo" }) {
  if (value === "applied") return <CheckCircle2 className="h-4 w-4 text-status-green" />;
  if (value === "partial") return <AlertTriangle className="h-4 w-4 text-status-amber" />;
  return <Circle className="h-4 w-4 text-muted-foreground/50" />;
}

function AuditStatusBadge({ status }: { status: AuditActionStatus }) {
  switch (status) {
    case "done":
      return <Badge variant="success">Fait</Badge>;
    case "in_progress":
      return <Badge variant="warning">En cours</Badge>;
    case "blocked":
      return <Badge variant="destructive">Bloqué</Badge>;
    case "planned":
    default:
      return <Badge variant="subtle">Planifié</Badge>;
  }
}

function formatDate(iso?: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ArchitecturePlatformDetailPage() {
  const { platformKey = "" } = useParams<{ platformKey: string }>();
  const profile = PLATFORM_ARCHITECTURE.find((p) => String(p.key) === platformKey);

  if (!profile) {
    return <Navigate to="/hq/architecture" replace />;
  }

  const coverage = getCoverageScore(profile);
  const gaps = useMemo(() => getGaps(profile), [profile]);
  const auditActions = useMemo(() => getAuditActionsForPlatform(profile.key), [profile]);

  // Données live runs / DLQ → filtrées sur la plateforme courante
  const { data: recentRuns = [], isLoading: runsLoading } = useRecentRuns(50);
  const { data: dlqEntries = [], isLoading: dlqLoading } = useDLQEntries(50);

  const platformRuns = useMemo(
    () => recentRuns.filter((r) => r.platform_key === platformKey).slice(0, 10),
    [recentRuns, platformKey],
  );
  const platformIncidents = useMemo(
    () =>
      dlqEntries
        .filter((d) => d.platform_key === platformKey)
        .sort((a, b) => b.created_at.localeCompare(a.created_at))
        .slice(0, 10),
    [dlqEntries, platformKey],
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <Button asChild variant="ghost" size="sm" className="mb-3 -ml-2">
          <Link to="/hq/architecture">
            <ArrowLeft className="h-4 w-4 mr-1" /> Retour à la matrice
          </Link>
        </Button>
        <ExecutiveHeader
          title={`Architecture · ${profile.name}`}
          subtitle={`Couverture du pattern HQ : ${coverage}%`}
          context={profile.notes}
          source={{
            source: "supabase",
            confidence: "high",
            methodology:
              "Statut par couche : registre TS systemArchitecture.ts. Runs et incidents : RPC get_hq_recent_runs et get_hq_dlq_entries.",
          }}
        />
      </div>

      {/* Synthèse couches */}
      <section>
        <h2 className="text-lg font-semibold mb-4">État des 7 couches</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {ARCHITECTURE_LAYERS.map((layer) => {
            const Icon = LAYER_ICONS[layer.key] ?? Layers;
            const v = profile.layers[layer.key];
            return (
              <div key={layer.key} className="card-executive p-5">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary flex-shrink-0">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">{layer.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{layer.description}</p>
                    </div>
                  </div>
                  <StatusBadge value={v} />
                </div>
                <div className="text-xs text-muted-foreground border-t border-border pt-3">
                  <span className="font-medium text-foreground">Référence HQ : </span>
                  {layer.patternHQ}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Gaps à industrialiser */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Gaps à industrialiser</h2>
        {gaps.length === 0 ? (
          <div className="card-executive p-6 text-sm text-muted-foreground">
            ✅ Aucune couche restante — pattern complet pour {profile.name}.
          </div>
        ) : (
          <div className="card-executive divide-y divide-border">
            {gaps.map((layer) => {
              const v = profile.layers[layer.key];
              const Icon = LAYER_ICONS[layer.key] ?? Layers;
              return (
                <div key={layer.key} className="p-4 flex items-start gap-3">
                  <StatusIcon value={v} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium text-sm">{layer.title}</span>
                      <StatusBadge value={v} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{layer.patternHQ}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Runs récents */}
      <section>
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-lg font-semibold">Runs récents (couches Run / Autopilot / Observabilité)</h2>
          <span className="text-xs text-muted-foreground">
            {platformRuns.length} run{platformRuns.length > 1 ? "s" : ""}
          </span>
        </div>
        <div className="card-executive overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
                <th className="text-left p-3">Date</th>
                <th className="text-left p-3">Type</th>
                <th className="text-left p-3">Statut</th>
                <th className="text-left p-3">Résumé</th>
              </tr>
            </thead>
            <tbody>
              {runsLoading ? (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-sm text-muted-foreground">
                    Chargement…
                  </td>
                </tr>
              ) : platformRuns.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-sm text-muted-foreground">
                    Aucun run enregistré pour {profile.name} dans la fenêtre courante.
                  </td>
                </tr>
              ) : (
                platformRuns.map((r) => (
                  <tr key={r.id} className="border-b border-border last:border-0 hover:bg-accent/20">
                    <td className="p-3 text-xs font-mono tabular-nums text-muted-foreground whitespace-nowrap">
                      {formatDate(r.created_at)}
                    </td>
                    <td className="p-3 text-xs">{r.run_type}</td>
                    <td className="p-3">
                      {r.status === "completed" ? (
                        <Badge variant="success">Terminé</Badge>
                      ) : r.status === "failed" ? (
                        <Badge variant="destructive">Échec</Badge>
                      ) : r.status === "running" ? (
                        <Badge variant="warning">En cours</Badge>
                      ) : (
                        <Badge variant="subtle">{r.status}</Badge>
                      )}
                    </td>
                    <td className="p-3 text-xs text-muted-foreground line-clamp-2">
                      {r.executive_summary ?? "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Incidents DLQ */}
      <section>
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <AlertOctagon className="h-4 w-4 text-status-amber" />
            Incidents DLQ
          </h2>
          <span className="text-xs text-muted-foreground">
            {platformIncidents.length} incident{platformIncidents.length > 1 ? "s" : ""}
          </span>
        </div>
        <div className="card-executive overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
                <th className="text-left p-3">Date</th>
                <th className="text-left p-3">Type</th>
                <th className="text-left p-3">Tentatives</th>
                <th className="text-left p-3">Statut</th>
                <th className="text-left p-3">Cause</th>
              </tr>
            </thead>
            <tbody>
              {dlqLoading ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-sm text-muted-foreground">
                    Chargement…
                  </td>
                </tr>
              ) : platformIncidents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-sm text-muted-foreground">
                    Aucun incident DLQ pour {profile.name}.
                  </td>
                </tr>
              ) : (
                platformIncidents.map((d) => (
                  <tr key={d.id} className="border-b border-border last:border-0 hover:bg-accent/20">
                    <td className="p-3 text-xs font-mono tabular-nums text-muted-foreground whitespace-nowrap">
                      {formatDate(d.created_at)}
                    </td>
                    <td className="p-3 text-xs">{d.run_type}</td>
                    <td className="p-3 text-xs tabular-nums">
                      {d.attempts}/{d.max_attempts}
                    </td>
                    <td className="p-3">
                      {d.status === "recovered" ? (
                        <Badge variant="success">Récupéré</Badge>
                      ) : d.status === "abandoned" ? (
                        <Badge variant="destructive">Abandonné</Badge>
                      ) : d.status === "in_progress" ? (
                        <Badge variant="warning">Retry</Badge>
                      ) : (
                        <Badge variant="subtle">En attente</Badge>
                      )}
                    </td>
                    <td className="p-3 text-xs text-muted-foreground line-clamp-2">
                      {d.failure_reason ?? d.last_error ?? "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Journal d'audit pour cette plateforme */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Journal d'audit — {profile.name}</h2>
        <div className="card-executive overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
                <th className="text-left p-3">Horodatage</th>
                <th className="text-left p-3">Couche</th>
                <th className="text-left p-3">Action</th>
                <th className="text-left p-3">Statut</th>
                <th className="text-left p-3">Acteur</th>
              </tr>
            </thead>
            <tbody>
              {auditActions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-sm text-muted-foreground">
                    Aucune action enregistrée pour cette plateforme.
                  </td>
                </tr>
              ) : (
                auditActions.map((a) => {
                  const layer = ARCHITECTURE_LAYERS.find((l) => l.key === a.layerKey);
                  return (
                    <tr
                      key={a.id}
                      className={
                        "border-b border-border last:border-0 hover:bg-accent/20 " +
                        (RUN_DRIVEN_LAYERS.has(a.layerKey) ? "bg-primary/[0.02]" : "")
                      }
                    >
                      <td className="p-3 text-xs font-mono tabular-nums text-muted-foreground whitespace-nowrap">
                        {formatDate(a.timestamp)}
                      </td>
                      <td className="p-3 text-xs">{layer?.title ?? a.layerKey}</td>
                      <td className="p-3">
                        <div>{a.action}</div>
                        {a.notes && (
                          <div className="text-xs text-muted-foreground mt-0.5">{a.notes}</div>
                        )}
                      </td>
                      <td className="p-3"><AuditStatusBadge status={a.status} /></td>
                      <td className="p-3 text-xs text-muted-foreground">{a.actor}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      <MethodologyDisclosure
        title="Méthodologie"
        sources={[
          {
            name: "systemArchitecture.ts",
            type: "manual",
            reliability: "verified",
            description: "Statut des 7 couches et journal d'audit (registre versionné).",
          },
          {
            name: "RPC get_hq_recent_runs",
            type: "database",
            reliability: "verified",
            description: "Runs filtrés côté client par platform_key.",
          },
          {
            name: "RPC get_hq_dlq_entries",
            type: "database",
            reliability: "verified",
            description: "Incidents DLQ liés aux couches Runs / Autopilot / Observabilité.",
          },
        ]}
        calculations={[
          {
            metric: "Couverture",
            formula: "Σ(applied=1, partial=0.5) / 7 couches × 100",
          },
        ]}
        dataQuality="high"
      />
    </div>
  );
}