import { useMemo, useState } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ExecutiveHeader } from "@/components/hq/ExecutiveDataSource";
import { MethodologyDisclosure } from "@/components/hq/MethodologyDisclosure";
import {
  ARCHITECTURE_LAYERS,
  PLATFORM_ARCHITECTURE,
  getCoverageScore,
  getAuditActionsForPlatform,
  getGaps,
  getProposedActionsForLayer,
  type ProposedAction,
  type AuditActionStatus,
} from "@/data/systemArchitecture";
import { useRecentRuns } from "@/hooks/hq/useRuns";
import { useDLQEntries } from "@/hooks/hq/useReliability";
import { useCreateJournalEntry, useJournalEntries, type JournalEntry } from "@/hooks/useJournal";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";
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
  Send,
  CheckCheck,
  History,
  Paperclip,
  MessageSquare,
  Upload,
  FileText,
  X,
  Loader2,
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

  // Demande d'approbation Présidente — persistée dans le journal stratégique
  const { user } = useAuth();
  const createEntry = useCreateJournalEntry();
  const { data: journalEntries = [] } = useJournalEntries();
  const [requested, setRequested] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  // Dialog d'approbation avec commentaire + pièce jointe optionnels
  const [dialogState, setDialogState] = useState<{
    layerKey: string;
    action: ProposedAction;
  } | null>(null);
  const [comment, setComment] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  /** Pré-remplit le commentaire à partir du contexte (plateforme · couche · risque · effort). */
  const buildPrefillComment = (layerKey: string, action: ProposedAction) => {
    const layer = ARCHITECTURE_LAYERS.find((l) => l.key === layerKey);
    const layerTitle = layer?.title ?? layerKey;
    const v = profile.layers[layerKey as keyof typeof profile.layers];
    const stateLabel = v === "applied" ? "appliqué" : v === "partial" ? "partiel" : "à faire";
    const riskLabel =
      action.risk === "critical"
        ? "critique"
        : action.risk === "high"
          ? "élevé"
          : action.risk === "medium"
            ? "moyen"
            : "faible";
    return [
      `Contexte : ${profile.name} — couche « ${layerTitle} » actuellement ${stateLabel}.`,
      `Action : ${action.title}.`,
      `Risque : ${riskLabel} · effort estimé : ~${action.effortHours} h.`,
      "",
      "Justification : ",
      "Impact attendu : ",
      "Plan de rollback : ",
    ].join("\n");
  };

  const openApprovalDialog = (layerKey: string, action: ProposedAction) => {
    setComment(buildPrefillComment(layerKey, action));
    setFile(null);
    setDialogState({ layerKey, action });
  };

  /** Upload du fichier dans le bucket privé `architecture-approvals`, puis génère un lien signé 7 jours. */
  const uploadAttachment = async (
    f: File,
    requestId: string,
  ): Promise<{ path: string; signedUrl: string; sizeBytes: number; mime: string } | null> => {
    if (f.size > 50 * 1024 * 1024) {
      toast({
        title: "Fichier trop volumineux",
        description: "Taille maximale : 50 Mo.",
        variant: "destructive",
      });
      return null;
    }
    const safeName = f.name.replace(/[^\w.\-]+/g, "_").slice(0, 120);
    const path = `${profile.key}/${requestId}/${Date.now()}-${safeName}`;
    const { error: upErr } = await supabase.storage
      .from("architecture-approvals")
      .upload(path, f, { contentType: f.type || "application/octet-stream", upsert: false });
    if (upErr) {
      logger.error("[Architecture] Upload failed:", upErr);
      toast({
        title: "Échec de l'upload",
        description: upErr.message,
        variant: "destructive",
      });
      return null;
    }
    const { data: signed, error: signErr } = await supabase.storage
      .from("architecture-approvals")
      .createSignedUrl(path, 60 * 60 * 24 * 7); // 7 jours
    if (signErr || !signed) {
      logger.error("[Architecture] Signed URL failed:", signErr);
      toast({
        title: "Lien sécurisé indisponible",
        description: "Le fichier est stocké mais le lien n'a pas pu être généré.",
        variant: "destructive",
      });
      return null;
    }
    return {
      path,
      signedUrl: signed.signedUrl,
      sizeBytes: f.size,
      mime: f.type || "application/octet-stream",
    };
  };

  const submitApproval = async () => {
    if (!dialogState) return;
    const { layerKey, action } = dialogState;
    const layer = ARCHITECTURE_LAYERS.find((l) => l.key === layerKey);
    const requestId = `${profile.key}::${layerKey}::${action.id}`;
    const title = `Demande d'approbation — ${profile.name} · ${action.title}`;
    const trimmedComment = comment.trim();

    let attachment: { path: string; signedUrl: string; sizeBytes: number; mime: string } | null = null;
    if (file) {
      setUploading(true);
      attachment = await uploadAttachment(file, requestId);
      setUploading(false);
      if (!attachment) return; // toast déjà émis
    }

    const lines = [
      `Plateforme : **${profile.name}** (${profile.key})`,
      `Couche : ${layer?.title ?? layerKey}`,
      `Action proposée : ${action.title}`,
      `Description : ${action.description}`,
      `Risque : ${action.risk}`,
      `Effort estimé : ${action.effortHours} h`,
      `Demandeur : ${user?.email ?? "—"}`,
      `Référence : ${requestId}`,
    ];
    if (trimmedComment) {
      lines.push("", "**Commentaire du demandeur :**", trimmedComment);
    }
    if (attachment && file) {
      const sizeKb = Math.round(attachment.sizeBytes / 1024);
      lines.push(
        "",
        `**Pièce jointe :** [${file.name}](${attachment.signedUrl}) (${sizeKb} Ko, ${attachment.mime})`,
        `_Lien sécurisé valable 7 jours · chemin : \`${attachment.path}\`_`,
      );
    }
    const content = lines.join("\n");
    const tags = [
      "architecture",
      "approval-request",
      String(profile.key),
      layerKey,
      `action:${action.id}`,
      `risk:${action.risk}`,
    ];
    if (trimmedComment) tags.push("has-comment");
    if (attachment) tags.push("has-attachment");
    createEntry.mutate(
      {
        title,
        content,
        entry_type: "decision",
        tags,
      },
      {
        onSuccess: () => {
          setRequested((prev) => new Set(prev).add(requestId));
          setDialogState(null);
          // Notifie la Présidente — best-effort, on n'interrompt pas le flux UI
          const urgency =
            action.risk === "critical" || action.risk === "high" ? "high" : "medium";
          supabase.functions
            .invoke("send-push-notification", {
              body: {
                title: `🛂 Approbation requise — ${profile.name}`,
                message: `${layer?.title ?? layerKey} · ${action.title} (risque ${action.risk}, ~${action.effortHours} h)`,
                urgency,
                type: "architecture_approval",
                url: `/hq/architecture/${profile.key}`,
                data: {
                  platformKey: String(profile.key),
                  layerKey,
                  actionId: action.id,
                  requestId,
                  hasComment: Boolean(trimmedComment),
                  hasAttachment: Boolean(attachment),
                },
              },
            })
            .catch((err) => {
              logger.warn("[Architecture] Push notification failed (non-blocking):", err);
            });
        },
      },
    );
  };

  /** Historique des demandes d'approbation (journal) indexées par couche pour cette plateforme. */
  const approvalsByLayer = useMemo(() => {
    const map = new Map<string, JournalEntry[]>();
    for (const entry of journalEntries) {
      const tags = entry.tags ?? [];
      if (!tags.includes("approval-request")) continue;
      if (!tags.includes(String(profile.key))) continue;
      const layerTag = tags.find((t) => ARCHITECTURE_LAYERS.some((l) => l.key === t));
      if (!layerTag) continue;
      const list = map.get(layerTag) ?? [];
      list.push(entry);
      map.set(layerTag, list);
    }
    // Tri antéchronologique
    for (const [k, list] of map) {
      map.set(
        k,
        [...list].sort((a, b) => b.created_at.localeCompare(a.created_at)),
      );
    }
    return map;
  }, [journalEntries, profile.key]);

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
          <div className="space-y-4">
            {gaps.map((layer) => {
              const v = profile.layers[layer.key];
              const Icon = LAYER_ICONS[layer.key] ?? Layers;
              const proposed = getProposedActionsForLayer(layer.key);
              return (
                <div key={layer.key} className="card-executive p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-start gap-3">
                      <StatusIcon value={v} />
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium text-sm">{layer.title}</span>
                          <StatusBadge value={v} />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{layer.patternHQ}</p>
                      </div>
                    </div>
                  </div>

                  {proposed.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic">
                      Aucune action standard — à spécifier au cas par cas.
                    </p>
                  ) : (
                    <div className="border-t border-border pt-3 space-y-2">
                      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                        Actions proposées
                      </div>
                      {proposed.map((action) => {
                        const reqId = `${profile.key}::${layer.key}::${action.id}`;
                        const isRequested = requested.has(reqId);
                        const isPending = createEntry.isPending;
                        const layerEntries = approvalsByLayer.get(layer.key) ?? [];
                        const actionEntries = layerEntries.filter((e) =>
                          (e.tags ?? []).includes(`action:${action.id}`),
                        );
                        return (
                          <div
                            key={action.id}
                            className="flex items-start gap-3 p-3 rounded-md bg-accent/10 border border-border"
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-medium">{action.title}</span>
                                <Badge
                                  variant={
                                    action.risk === "critical" || action.risk === "high"
                                      ? "destructive"
                                      : action.risk === "medium"
                                        ? "warning"
                                        : "subtle"
                                  }
                                >
                                  Risque {action.risk}
                                </Badge>
                                <span className="text-[11px] text-muted-foreground tabular-nums">
                                  ~{action.effortHours} h
                                </span>
                                {actionEntries.length > 0 && (
                                  <Link
                                    to={`/hq/journal?tag=action:${action.id}`}
                                    className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline"
                                    aria-label={`Voir l'historique d'approbation de ${action.title}`}
                                  >
                                    <History className="h-3 w-3" />
                                    {actionEntries.length} demande{actionEntries.length > 1 ? "s" : ""}
                                  </Link>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                {action.description}
                              </p>
                              {actionEntries.length > 0 && (
                                <ul className="mt-2 space-y-1 border-t border-border/60 pt-2">
                                  {actionEntries.slice(0, 3).map((e) => (
                                    <li
                                      key={e.id}
                                      className="flex items-center gap-2 text-[11px] text-muted-foreground"
                                    >
                                      <span className="font-mono tabular-nums">
                                        {formatDate(e.created_at)}
                                      </span>
                                      <span aria-hidden>•</span>
                                      {e.impact_measured ? (
                                        <Badge variant="success">Décidée</Badge>
                                      ) : (
                                        <Badge variant="warning">En attente</Badge>
                                      )}
                                       <Link
                                         to={`/hq/journal#${e.id}`}
                                         className="hover:underline truncate"
                                         title={e.title}
                                       >
                                         {e.title}
                                       </Link>
                                       {(e.tags ?? []).includes("has-comment") && (
                                         <MessageSquare
                                           className="h-3 w-3 text-muted-foreground"
                                           aria-label="Commentaire joint"
                                         />
                                       )}
                                       {(e.tags ?? []).includes("has-attachment") && (
                                         <Paperclip
                                           className="h-3 w-3 text-muted-foreground"
                                           aria-label="Pièce jointe"
                                         />
                                       )}
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                            <Button
                              size="sm"
                              variant={isRequested ? "outline" : "default"}
                              onClick={() => openApprovalDialog(layer.key, action)}
                              disabled={isRequested || isPending}
                              className="flex-shrink-0"
                            >
                              {isRequested ? (
                                <>
                                  <CheckCheck className="h-3.5 w-3.5 mr-1" /> Demande envoyée
                                </>
                              ) : (
                                <>
                                  <Send className="h-3.5 w-3.5 mr-1" /> Demander l'approbation
                                </>
                              )}
                            </Button>
                          </div>
                        );
                      })}
                      <p className="text-[11px] text-muted-foreground pt-1">
                        Les demandes sont consignées dans le{" "}
                        <Link to="/hq/journal" className="underline hover:text-foreground">
                          Journal stratégique
                        </Link>{" "}
                        avec tag <code className="font-mono">approval-request</code>.
                      </p>
                    </div>
                  )}
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

      <Dialog open={!!dialogState} onOpenChange={(open) => !open && setDialogState(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Demande d'approbation</DialogTitle>
            <DialogDescription>
              {dialogState
                ? `${profile.name} · ${dialogState.action.title} (risque ${dialogState.action.risk}, ~${dialogState.action.effortHours} h)`
                : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="approval-comment" className="flex items-center gap-2">
                <MessageSquare className="h-3.5 w-3.5" /> Commentaire (optionnel)
              </Label>
              <Textarea
                id="approval-comment"
                placeholder="Contexte, justification, contraintes…"
                value={comment}
                onChange={(e) => setComment(e.target.value.slice(0, 2000))}
                rows={4}
              />
              <p className="text-[11px] text-muted-foreground tabular-nums text-right">
                {comment.length}/2000
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="approval-attachment-file" className="flex items-center gap-2">
                <Paperclip className="h-3.5 w-3.5" /> Pièce jointe (optionnel)
              </Label>
              {file ? (
                <div className="flex items-center gap-3 p-3 rounded-md border border-border bg-accent/10">
                  <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-[11px] text-muted-foreground tabular-nums">
                      {(file.size / 1024).toFixed(1)} Ko · {file.type || "type inconnu"}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setFile(null)}
                    aria-label="Retirer la pièce jointe"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <label
                  htmlFor="approval-attachment-file"
                  className="flex items-center justify-center gap-2 p-4 rounded-md border border-dashed border-border bg-accent/5 cursor-pointer hover:bg-accent/15 transition-colors"
                >
                  <Upload className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Cliquer pour sélectionner un fichier
                  </span>
                </label>
              )}
              <Input
                id="approval-attachment-file"
                type="file"
                className="hidden"
                accept=".pdf,.png,.jpg,.jpeg,.webp,.gif,.txt,.md,.csv,.json,.zip,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) setFile(f);
                  e.target.value = ""; // reset pour pouvoir re-sélectionner le même fichier
                }}
              />
              <p className="text-[11px] text-muted-foreground">
                Stockage privé · lien sécurisé valable 7 jours · max 50 Mo (PDF, images, Office, texte).
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogState(null)}>
              Annuler
            </Button>
            <Button onClick={submitApproval} disabled={createEntry.isPending || uploading}>
              {uploading || createEntry.isPending ? (
                <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
              ) : (
                <Send className="h-3.5 w-3.5 mr-1" />
              )}
              {uploading ? "Upload…" : createEntry.isPending ? "Envoi…" : "Envoyer la demande"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}