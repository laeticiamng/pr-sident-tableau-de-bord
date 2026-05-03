import { useMemo, useState } from "react";
import { ShieldCheck, CheckCircle2, XCircle, Inbox, Settings2, Search, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Tabs, TabsList, TabsTrigger, TabsContent,
} from "@/components/ui/tabs";
import {
  useStudioApprovals, useStudioApprovalGates, useUpdateStudioApprovalGates,
  useStudioPublicSubmissions, useConvertStudioSubmission, useUpdateStudioSubmissionStatus,
} from "@/hooks/useStudio";
import {
  STUDIO_APPROVAL_GATE_KEYS, STUDIO_APPROVAL_GATE_LABELS,
  type StudioApprovalGateKey, type StudioApprovalGates, type StudioApproval,
  type StudioApprovalStatus,
} from "@/lib/studio-types";
import { StudioApprovalDetailDialog } from "@/components/hq/studio/StudioApprovalDetailDialog";
import { cn } from "@/lib/utils";

const STATUS_TONE: Record<StudioApprovalStatus, string> = {
  pending: "bg-warning/15 text-warning",
  approved: "bg-success/10 text-success",
  rejected: "bg-destructive/10 text-destructive",
  executed: "bg-primary/15 text-primary",
  cancelled: "bg-muted text-muted-foreground",
};

const STATUS_LABEL: Record<StudioApprovalStatus, string> = {
  pending: "En attente",
  approved: "Approuvée",
  rejected: "Refusée",
  executed: "Exécutée",
  cancelled: "Annulée",
};

export default function StudioApprovalsPage() {
  const { data: approvals, isLoading } = useStudioApprovals();
  const { data: gates } = useStudioApprovalGates();
  const updateGates = useUpdateStudioApprovalGates();
  const { data: submissions } = useStudioPublicSubmissions();
  const convert = useConvertStudioSubmission();
  const updateSub = useUpdateStudioSubmissionStatus();

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | StudioApprovalStatus>("all");
  const [selected, setSelected] = useState<StudioApproval | null>(null);

  const filtered = useMemo(() => {
    const items = approvals ?? [];
    return items.filter(a => {
      if (statusFilter !== "all" && a.status !== statusFilter) return false;
      if (!query.trim()) return true;
      const q = query.toLowerCase().trim();
      return (
        a.action_type.toLowerCase().includes(q) ||
        a.title.toLowerCase().includes(q) ||
        (a.description ?? "").toLowerCase().includes(q)
      );
    });
  }, [approvals, query, statusFilter]);

  const counts = useMemo(() => {
    const items = approvals ?? [];
    return {
      pending: items.filter(a => a.status === "pending").length,
      approved: items.filter(a => a.status === "approved").length,
      rejected: items.filter(a => a.status === "rejected").length,
      executed: items.filter(a => a.status === "executed").length,
    };
  }, [approvals]);

  function toggleGate(key: StudioApprovalGateKey, value: boolean) {
    if (!gates) return;
    updateGates.mutate({ ...gates, [key]: value } as StudioApprovalGates);
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          Approbations & soumissions Studio
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          File d'approbations présidentielles avec historique d'audit complet, soumissions publiques et configuration des portes critiques.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {([
          { key: "pending", label: "En attente", value: counts.pending, tone: "text-warning" },
          { key: "approved", label: "Approuvées", value: counts.approved, tone: "text-success" },
          { key: "rejected", label: "Refusées", value: counts.rejected, tone: "text-destructive" },
          { key: "executed", label: "Exécutées", value: counts.executed, tone: "text-primary" },
        ] as const).map((s) => (
          <Card key={s.key} className="border-border/60">
            <CardContent className="p-3">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{s.label}</p>
              <p className={cn("text-2xl font-bold tabular-nums mt-0.5", s.tone)}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" /> File d'approbations
            </CardTitle>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Rechercher par type d'action…"
                  className="pl-8 h-9 text-sm"
                />
              </div>
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
                <SelectTrigger className="h-9 text-sm w-full sm:w-40">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous statuts</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="approved">Approuvées</SelectItem>
                  <SelectItem value="rejected">Refusées</SelectItem>
                  <SelectItem value="executed">Exécutées</SelectItem>
                  <SelectItem value="cancelled">Annulées</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? (
            <Skeleton className="h-24 w-full" />
          ) : filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              {(approvals ?? []).length === 0
                ? "Aucune demande d'approbation enregistrée."
                : "Aucune demande ne correspond à la recherche."}
            </p>
          ) : (
            filtered.map(a => (
              <button
                key={a.id}
                onClick={() => setSelected(a)}
                className="w-full text-left rounded-lg border border-border/60 p-3 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium">{a.title}</p>
                      <Badge variant="outline" className="text-[10px] font-mono">{a.action_type}</Badge>
                      <Badge variant="outline" className="text-[10px] capitalize">{a.risk_level}</Badge>
                      <Badge variant="outline" className={cn("text-[10px]", STATUS_TONE[a.status])}>
                        {STATUS_LABEL[a.status]}
                      </Badge>
                    </div>
                    {a.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{a.description}</p>}
                    <p className="text-[10px] text-muted-foreground mt-1">
                      Demandé le {new Date(a.created_at).toLocaleString("fr-FR")}
                      {a.decided_at && ` · Décidé le ${new Date(a.decided_at).toLocaleString("fr-FR")}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 text-muted-foreground">
                    <Eye className="h-3.5 w-3.5" />
                    <span className="text-[11px]">Détail</span>
                  </div>
                </div>
              </button>
            ))
          )}
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2"><Inbox className="h-4 w-4 text-primary" /> Soumissions publiques /studio</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {!submissions || submissions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">Aucune soumission reçue.</p>
          ) : submissions.map(s => (
            <div key={s.id} className="rounded-lg border border-border/60 p-3 space-y-1">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium">{s.contact_name} · <span className="text-muted-foreground">{s.contact_email}</span></p>
                    <Badge variant="outline" className="text-[10px]">{s.status}</Badge>
                    {s.domain && <Badge variant="outline" className="text-[10px]">{s.domain}</Badge>}
                  </div>
                  <p className="text-xs mt-1 line-clamp-3 whitespace-pre-wrap">{s.problem_statement}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">Reçu le {new Date(s.created_at).toLocaleString("fr-FR")}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  {s.status === "new" && (
                    <>
                      <Button size="sm" variant="default" className="h-7" onClick={() => convert.mutate(s.id)}>Convertir en opportunité</Button>
                      <Button size="sm" variant="outline" className="h-7" onClick={() => updateSub.mutate({ id: s.id, status: "spam" })}>Spam</Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2"><Settings2 className="h-4 w-4 text-primary" /> Actions nécessitant approbation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {STUDIO_APPROVAL_GATE_KEYS.map(key => (
            <div key={key} className="flex items-center justify-between gap-3">
              <Label htmlFor={`gate-${key}`} className="text-sm">{STUDIO_APPROVAL_GATE_LABELS[key]}</Label>
              <Switch id={`gate-${key}`} checked={!!gates?.[key]} onCheckedChange={(v) => toggleGate(key, v)} />
            </div>
          ))}
          <p className="text-[11px] text-muted-foreground">Quand activé, l'action passe par la file d'approbation avant exécution.</p>
        </CardContent>
      </Card>

      <StudioApprovalDetailDialog
        approval={selected}
        open={!!selected}
        onOpenChange={(open) => { if (!open) setSelected(null); }}
      />
    </div>
  );
}