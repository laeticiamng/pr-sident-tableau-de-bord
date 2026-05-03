import { useEffect, useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle2, XCircle, PlayCircle, Ban, ShieldCheck, ScrollText, Loader2,
} from "lucide-react";
import { useDecideStudioApproval } from "@/hooks/useStudio";
import { StudioAuditTimeline } from "./StudioAuditTimeline";
import type { StudioApproval, StudioApprovalStatus } from "@/lib/studio-types";
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

interface Props {
  approval: StudioApproval | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StudioApprovalDetailDialog({ approval, open, onOpenChange }: Props) {
  const decide = useDecideStudioApproval();
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (open) setReason("");
  }, [open, approval?.id]);

  if (!approval) return null;

  const handleDecision = async (decision: StudioApprovalStatus) => {
    await decide.mutateAsync({ id: approval.id, decision, reason: reason.trim() || undefined });
    onOpenChange(false);
  };

  const isPending = approval.status === "pending";
  const isApproved = approval.status === "approved";
  const payloadEntries = Object.entries(approval.payload ?? {});

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            {approval.title}
          </DialogTitle>
          <DialogDescription className="flex flex-wrap items-center gap-2 pt-1">
            <Badge variant="outline" className="text-[10px] font-mono">{approval.action_type}</Badge>
            <Badge variant="outline" className="text-[10px] capitalize">Risque : {approval.risk_level}</Badge>
            <Badge variant="outline" className={cn("text-[10px]", STATUS_TONE[approval.status])}>
              {STATUS_LABEL[approval.status]}
            </Badge>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {approval.description && (
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{approval.description}</p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="rounded-md border border-border/60 p-3">
              <p className="text-[10px] uppercase text-muted-foreground">Demandé le</p>
              <p className="font-medium mt-0.5">{new Date(approval.created_at).toLocaleString("fr-FR")}</p>
              <p className="text-[10px] text-muted-foreground mt-1 truncate">
                Par : {approval.requested_by ?? "—"}
              </p>
            </div>
            <div className="rounded-md border border-border/60 p-3">
              <p className="text-[10px] uppercase text-muted-foreground">Décidé le</p>
              <p className="font-medium mt-0.5">
                {approval.decided_at ? new Date(approval.decided_at).toLocaleString("fr-FR") : "—"}
              </p>
              <p className="text-[10px] text-muted-foreground mt-1 truncate">
                Par : {approval.decided_by ?? "—"}
              </p>
            </div>
          </div>

          {approval.decision_reason && (
            <div className="rounded-md border border-border/60 bg-muted/30 p-3">
              <p className="text-[10px] uppercase text-muted-foreground">Motif de décision</p>
              <p className="text-sm mt-1 whitespace-pre-wrap">{approval.decision_reason}</p>
            </div>
          )}

          {payloadEntries.length > 0 && (
            <div>
              <p className="text-xs font-semibold flex items-center gap-2 mb-1.5">
                <ScrollText className="h-3.5 w-3.5" /> Charge utile (payload)
              </p>
              <pre className="text-[11px] bg-muted/30 rounded-md p-3 max-h-40 overflow-auto whitespace-pre-wrap break-all">
                {JSON.stringify(approval.payload, null, 2)}
              </pre>
            </div>
          )}

          <Separator />

          {(isPending || isApproved) && (
            <div className="space-y-2">
              <label className="text-xs font-semibold" htmlFor="decision-reason">
                Commentaire de décision (optionnel)
              </label>
              <Textarea
                id="decision-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Ex : Validé après revue juridique. À exécuter dès NDA signé."
                className="min-h-[80px] text-sm"
              />
              <div className="flex flex-wrap gap-2 justify-end pt-1">
                {isPending && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDecision("cancelled")}
                      disabled={decide.isPending}
                    >
                      <Ban className="h-3.5 w-3.5 mr-1.5" /> Annuler la demande
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDecision("rejected")}
                      disabled={decide.isPending}
                      className="border-destructive/40 text-destructive hover:bg-destructive/10"
                    >
                      <XCircle className="h-3.5 w-3.5 mr-1.5" /> Rejeter
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleDecision("approved")}
                      disabled={decide.isPending}
                    >
                      {decide.isPending ? (
                        <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                      ) : (
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                      )}
                      Approuver
                    </Button>
                  </>
                )}
                {isApproved && (
                  <Button
                    size="sm"
                    onClick={() => handleDecision("executed")}
                    disabled={decide.isPending}
                  >
                    <PlayCircle className="h-3.5 w-3.5 mr-1.5" /> Marquer comme exécutée
                  </Button>
                )}
              </div>
              {isPending && (
                <p className="text-[11px] text-muted-foreground">
                  L'action critique ne sera exécutée qu'après votre approbation. Vous pourrez ensuite la marquer comme exécutée une fois l'opération réelle effectuée.
                </p>
              )}
            </div>
          )}

          <Separator />

          <StudioAuditTimeline resourceType="studio_approval" resourceId={approval.id} />
        </div>
      </DialogContent>
    </Dialog>
  );
}