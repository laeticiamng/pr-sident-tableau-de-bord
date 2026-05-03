import { ShieldCheck, CheckCircle2, XCircle, Inbox, Settings2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useStudioApprovals, useDecideStudioApproval, useStudioApprovalGates, useUpdateStudioApprovalGates,
  useStudioPublicSubmissions, useConvertStudioSubmission, useUpdateStudioSubmissionStatus } from "@/hooks/useStudio";
import { STUDIO_APPROVAL_GATE_KEYS, STUDIO_APPROVAL_GATE_LABELS, type StudioApprovalGateKey, type StudioApprovalGates } from "@/lib/studio-types";

export default function StudioApprovalsPage() {
  const { data: approvals, isLoading } = useStudioApprovals();
  const decide = useDecideStudioApproval();
  const { data: gates } = useStudioApprovalGates();
  const updateGates = useUpdateStudioApprovalGates();
  const { data: submissions } = useStudioPublicSubmissions();
  const convert = useConvertStudioSubmission();
  const updateSub = useUpdateStudioSubmissionStatus();

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
          File d'approbations présidentielles, soumissions publiques et configuration des actions critiques.
        </p>
      </div>

      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /> File d'approbations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? <Skeleton className="h-24 w-full" /> :
           !approvals || approvals.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">Aucune action en attente.</p>
          ) : approvals.map(a => (
            <div key={a.id} className="rounded-lg border border-border/60 p-3 space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium">{a.title}</p>
                    <Badge variant="outline" className="text-[10px]">{a.action_type}</Badge>
                    <Badge variant="outline" className="text-[10px] capitalize">{a.risk_level}</Badge>
                    <Badge variant="outline" className="text-[10px]">{a.status}</Badge>
                  </div>
                  {a.description && <p className="text-xs text-muted-foreground mt-1">{a.description}</p>}
                  <p className="text-[10px] text-muted-foreground mt-1">Demandé le {new Date(a.created_at).toLocaleString("fr-FR")}</p>
                </div>
                {a.status === "pending" && (
                  <div className="flex gap-1 shrink-0">
                    <Button size="sm" variant="default" className="h-7 gap-1" onClick={() => decide.mutate({ id: a.id, decision: "approved" })}>
                      <CheckCircle2 className="h-3.5 w-3.5" /> Approuver
                    </Button>
                    <Button size="sm" variant="outline" className="h-7 gap-1" onClick={() => decide.mutate({ id: a.id, decision: "rejected" })}>
                      <XCircle className="h-3.5 w-3.5" /> Refuser
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
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
    </div>
  );
}