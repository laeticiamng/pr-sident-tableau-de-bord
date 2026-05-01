import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { ExecutiveHeader } from "@/components/hq/ExecutiveDataSource";
import { MethodologyDisclosure } from "@/components/hq/MethodologyDisclosure";
import {
  ARCHITECTURE_LAYERS,
  PLATFORM_ARCHITECTURE,
  getCoverageScore,
  type PlatformArchitectureProfile,
} from "@/data/systemArchitecture";
import { Layers, ShieldCheck, Database, Cloud, Workflow, Bot, Activity, CheckCircle2, AlertTriangle, Circle } from "lucide-react";

const LAYER_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  schema: Database,
  rls: ShieldCheck,
  rpc: Layers,
  edge: Cloud,
  runs: Workflow,
  autopilot: Bot,
  observability: Activity,
};

function StatusDot({ value }: { value?: "applied" | "partial" | "todo" }) {
  if (value === "applied")
    return <CheckCircle2 className="h-4 w-4 text-status-green" aria-label="Appliqué" />;
  if (value === "partial")
    return <AlertTriangle className="h-4 w-4 text-status-amber" aria-label="Partiel" />;
  return <Circle className="h-4 w-4 text-muted-foreground/50" aria-label="À faire" />;
}

function GlobalStatusBadge({ status }: { status: PlatformArchitectureProfile["status"] }) {
  if (status === "applied") return <Badge variant="success">Pattern complet</Badge>;
  if (status === "partial") return <Badge variant="warning">Industrialisation en cours</Badge>;
  return <Badge variant="destructive">À démarrer</Badge>;
}

export default function ArchitecturePage() {
  const sorted = useMemo(
    () => [...PLATFORM_ARCHITECTURE].sort((a, b) => getCoverageScore(b) - getCoverageScore(a)),
    [],
  );
  const globalCoverage = Math.round(
    sorted.reduce((s, p) => s + getCoverageScore(p), 0) / sorted.length,
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <ExecutiveHeader
        title="Architecture Système"
        subtitle="Pattern HQ répliqué sur chacune des plateformes"
        context="Logique d'architecture systémique commune : schéma isolé, RLS stricte, RPC SECURITY DEFINER, Edge Functions sécurisées, Run Engine + DLQ, Autopilot anti-duplication, observabilité complète."
        source={{
          source: "supabase",
          confidence: "high",
          methodology: "Source : src/data/systemArchitecture.ts (registre versionné). Mise à jour requise à chaque évolution du pattern.",
        }}
      />

      {/* KPI couverture globale */}
      <div className="card-executive p-6 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Couverture globale du pattern
          </h2>
          <p className="text-4xl font-bold mt-2">{globalCoverage}%</p>
          <p className="text-sm text-muted-foreground mt-1">
            Moyenne pondérée des 7 couches sur les {sorted.length} plateformes
          </p>
        </div>
        <div className="text-right space-y-1">
          <div className="text-xs text-muted-foreground">
            ✅ {sorted.filter((p) => p.status === "applied").length} complètes
          </div>
          <div className="text-xs text-muted-foreground">
            🟡 {sorted.filter((p) => p.status === "partial").length} en cours
          </div>
          <div className="text-xs text-muted-foreground">
            🔴 {sorted.filter((p) => p.status === "todo").length} à démarrer
          </div>
        </div>
      </div>

      {/* Description des 7 couches */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Les 7 couches du pattern</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {ARCHITECTURE_LAYERS.map((layer) => {
            const Icon = LAYER_ICONS[layer.key] ?? Layers;
            return (
              <div key={layer.key} className="card-executive p-5">
                <div className="flex items-start gap-3 mb-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary flex-shrink-0">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{layer.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{layer.description}</p>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground border-t border-border pt-3">
                  <span className="font-medium text-foreground">Implémentation HQ : </span>
                  {layer.patternHQ}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Matrice par plateforme */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Application par plateforme</h2>
        <div className="card-executive overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
                <th className="text-left p-4">Plateforme</th>
                <th className="text-left p-4">Statut</th>
                <th className="text-center p-4 tabular-nums">Couv.</th>
                {ARCHITECTURE_LAYERS.map((l) => (
                  <th key={l.key} className="text-center p-2 font-medium" title={l.title}>
                    {l.title.split(". ")[0]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((p) => (
                <tr key={p.key} className="border-b border-border last:border-0 hover:bg-accent/20">
                  <td className="p-4">
                    <div className="font-medium">{p.name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{p.notes}</div>
                  </td>
                  <td className="p-4">
                    <GlobalStatusBadge status={p.status} />
                  </td>
                  <td className="p-4 text-center font-mono tabular-nums font-semibold">
                    {getCoverageScore(p)}%
                  </td>
                  {ARCHITECTURE_LAYERS.map((l) => (
                    <td key={l.key} className="p-2 text-center">
                      <div className="flex justify-center">
                        <StatusDot value={p.layers[l.key]} />
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <MethodologyDisclosure
        title="Méthodologie"
        sources={[
          {
            name: "Registre TS systemArchitecture.ts",
            type: "manual",
            reliability: "verified",
            description: "Source de vérité versionnée dans le repo. Mise à jour requise à chaque évolution du pattern (TS + docs/SYSTEM_ARCHITECTURE.md simultanément).",
          },
        ]}
        calculations={[
          {
            metric: "Couverture par plateforme",
            formula: "Σ(applied=1, partial=0.5) / 7 couches × 100",
            assumptions: ["Pondération uniforme des 7 couches", "Recalculée à chaque rendu"],
          },
        ]}
        dataQuality="high"
      />
    </div>
  );
}