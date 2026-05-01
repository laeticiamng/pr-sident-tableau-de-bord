import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ExecutiveHeader } from "@/components/hq/ExecutiveDataSource";
import { MethodologyDisclosure } from "@/components/hq/MethodologyDisclosure";
import {
  ARCHITECTURE_LAYERS,
  PLATFORM_ARCHITECTURE,
  ARCHITECTURE_AUDIT_LOG,
  getCoverageScore,
  type PlatformArchitectureProfile,
  type AuditActionStatus,
} from "@/data/systemArchitecture";
import {
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
  ArrowRight,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  Search,
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

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ArchitecturePage() {
  const allSorted = useMemo(
    () => [...PLATFORM_ARCHITECTURE].sort((a, b) => getCoverageScore(b) - getCoverageScore(a)),
    [],
  );

  // Filtre multi-plateformes (vide = toutes)
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const togglePlatform = (key: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  const clearFilter = () => setSelected(new Set());

  const visible = useMemo(
    () => (selected.size === 0 ? allSorted : allSorted.filter((p) => selected.has(String(p.key)))),
    [allSorted, selected],
  );

  const globalCoverage = Math.round(
    visible.reduce((s, p) => s + getCoverageScore(p), 0) / Math.max(1, visible.length),
  );

  const visibleAudit = useMemo(() => {
    const keys = visible.map((p) => String(p.key));
    return [...ARCHITECTURE_AUDIT_LOG]
      .filter((a) => keys.includes(String(a.platformKey)))
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }, [visible]);

  // Recherche journal d'audit : couche, statut, mots-clés
  const [layerFilter, setLayerFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [keywords, setKeywords] = useState<string>("");
  const filteredAudit = useMemo(() => {
    const q = keywords.trim().toLowerCase();
    return visibleAudit.filter((a) => {
      if (layerFilter !== "all" && a.layerKey !== layerFilter) return false;
      if (statusFilter !== "all" && a.status !== statusFilter) return false;
      if (q.length > 0) {
        const platform = allSorted.find((p) => String(p.key) === String(a.platformKey));
        const hay = [
          a.action,
          a.notes ?? "",
          a.actor,
          platform?.name ?? "",
          String(a.platformKey),
          a.layerKey,
        ]
          .join(" \u2022 ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [visibleAudit, layerFilter, statusFilter, keywords, allSorted]);
  const resetSearch = () => {
    setLayerFilter("all");
    setStatusFilter("all");
    setKeywords("");
  };

  // Pagination journal d'audit
  const PAGE_SIZE_OPTIONS = [10, 25, 50] as const;
  const [pageSize, setPageSize] = useState<number>(10);
  const [page, setPage] = useState<number>(1);
  const totalPages = Math.max(1, Math.ceil(filteredAudit.length / pageSize));
  // Reset à la page 1 quand un filtre, la recherche ou la taille de page change
  useEffect(() => {
    setPage(1);
  }, [pageSize, selected, layerFilter, statusFilter, keywords]);
  const safePage = Math.min(page, totalPages);
  const pageStart = (safePage - 1) * pageSize;
  const pageEnd = pageStart + pageSize;
  const pageRows = filteredAudit.slice(pageStart, pageEnd);

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

      {/* Filtre plateformes */}
      <div className="card-executive p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Filter className="h-4 w-4 text-muted-foreground" />
            Filtrer les plateformes
            <span className="text-xs text-muted-foreground font-normal">
              ({selected.size === 0 ? "toutes" : `${selected.size} sélectionnée${selected.size > 1 ? "s" : ""}`})
            </span>
          </div>
          {selected.size > 0 && (
            <Button variant="ghost" size="sm" onClick={clearFilter}>
              <X className="h-3.5 w-3.5 mr-1" /> Réinitialiser
            </Button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {allSorted.map((p) => {
            const isOn = selected.has(String(p.key));
            return (
              <button
                key={String(p.key)}
                type="button"
                onClick={() => togglePlatform(String(p.key))}
                className={
                  "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors " +
                  (isOn
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-foreground border-border hover:bg-accent/40")
                }
              >
                {p.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* KPI couverture globale */}
      <div className="card-executive p-6 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            {selected.size === 0 ? "Couverture globale du pattern" : "Couverture (sélection)"}
          </h2>
          <p className="text-4xl font-bold mt-2">{globalCoverage}%</p>
          <p className="text-sm text-muted-foreground mt-1">
            Moyenne pondérée des 7 couches sur les {visible.length} plateforme{visible.length > 1 ? "s" : ""}
          </p>
        </div>
        <div className="text-right space-y-1">
          <div className="text-xs text-muted-foreground">
            ✅ {visible.filter((p) => p.status === "applied").length} complètes
          </div>
          <div className="text-xs text-muted-foreground">
            🟡 {visible.filter((p) => p.status === "partial").length} en cours
          </div>
          <div className="text-xs text-muted-foreground">
            🔴 {visible.filter((p) => p.status === "todo").length} à démarrer
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
                <th className="p-2"></th>
              </tr>
            </thead>
            <tbody>
              {visible.map((p) => (
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
                  <td className="p-2 text-right">
                    <Button asChild variant="ghost" size="sm">
                      <Link to={`/hq/architecture/${p.key}`} aria-label={`Détail ${p.name}`}>
                        Détail <ArrowRight className="h-3.5 w-3.5 ml-1" />
                      </Link>
                    </Button>
                  </td>
                </tr>
              ))}
              {visible.length === 0 && (
                <tr>
                  <td colSpan={ARCHITECTURE_LAYERS.length + 4} className="p-6 text-center text-sm text-muted-foreground">
                    Aucune plateforme ne correspond au filtre actuel.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Tableau d'audit des actions */}
      <section>
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-lg font-semibold">Journal d'audit des actions</h2>
          <span className="text-xs text-muted-foreground">
            {filteredAudit.length} / {visibleAudit.length} action{visibleAudit.length > 1 ? "s" : ""} ·{" "}
            {selected.size === 0 ? "toutes plateformes" : `${selected.size} sélectionnée${selected.size > 1 ? "s" : ""}`}
          </span>
        </div>

        {/* Barre de recherche multi-critères */}
        <div className="card-executive p-3 mb-3">
          <div className="grid gap-2 md:grid-cols-[1fr_auto_auto_auto]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              <Input
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="Rechercher (action, notes, plateforme, acteur…)"
                className="pl-9 h-9 text-sm"
                aria-label="Recherche mots-clés"
              />
            </div>
            <select
              value={layerFilter}
              onChange={(e) => setLayerFilter(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-2 text-xs"
              aria-label="Filtrer par couche"
            >
              <option value="all">Toutes les couches</option>
              {ARCHITECTURE_LAYERS.map((l) => (
                <option key={l.key} value={l.key}>
                  {l.title}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-2 text-xs"
              aria-label="Filtrer par statut"
            >
              <option value="all">Tous statuts</option>
              <option value="done">Fait</option>
              <option value="in_progress">En cours</option>
              <option value="blocked">Bloqué</option>
              <option value="planned">Planifié</option>
            </select>
            <Button
              variant="ghost"
              size="sm"
              onClick={resetSearch}
              disabled={layerFilter === "all" && statusFilter === "all" && keywords === ""}
            >
              <X className="h-3.5 w-3.5 mr-1" /> Effacer
            </Button>
          </div>
        </div>

        <div className="card-executive overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
                <th className="text-left p-3">Horodatage</th>
                <th className="text-left p-3">Plateforme</th>
                <th className="text-left p-3">Couche</th>
                <th className="text-left p-3">Action</th>
                <th className="text-left p-3">Statut</th>
                <th className="text-left p-3">Acteur</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((a) => {
                const layer = ARCHITECTURE_LAYERS.find((l) => l.key === a.layerKey);
                const platform = allSorted.find((p) => String(p.key) === String(a.platformKey));
                return (
                  <tr key={a.id} className="border-b border-border last:border-0 hover:bg-accent/20">
                    <td className="p-3 text-xs font-mono tabular-nums text-muted-foreground whitespace-nowrap">
                      {formatDate(a.timestamp)}
                    </td>
                    <td className="p-3 font-medium whitespace-nowrap">
                      <Link
                        to={`/hq/architecture/${a.platformKey}`}
                        className="hover:underline"
                      >
                        {platform?.name ?? String(a.platformKey)}
                      </Link>
                    </td>
                    <td className="p-3 text-xs text-muted-foreground whitespace-nowrap">
                      {layer?.title ?? a.layerKey}
                    </td>
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
              })}
              {pageRows.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-sm text-muted-foreground">
                    Aucune action enregistrée pour cette sélection.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Barre de pagination */}
          {filteredAudit.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-3 py-3 border-t border-border text-xs">
              <div className="flex items-center gap-2 text-muted-foreground">
                <span>Lignes par page :</span>
                {PAGE_SIZE_OPTIONS.map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setPageSize(n)}
                    className={
                      "px-2 py-1 rounded border transition-colors " +
                      (pageSize === n
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background border-border hover:bg-accent/40")
                    }
                  >
                    {n}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-muted-foreground tabular-nums">
                  {filteredAudit.length === 0
                    ? "0"
                    : `${pageStart + 1}–${Math.min(pageEnd, filteredAudit.length)} sur ${filteredAudit.length}`}
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={safePage <= 1}
                    aria-label="Page précédente"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </Button>
                  <span className="px-2 tabular-nums">
                    {safePage} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={safePage >= totalPages}
                    aria-label="Page suivante"
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          )}
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
          {
            name: "Journal d'audit ARCHITECTURE_AUDIT_LOG",
            type: "manual",
            reliability: "verified",
            description: "Actions horodatées d'industrialisation par plateforme et par couche. À compléter à chaque évolution réelle.",
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