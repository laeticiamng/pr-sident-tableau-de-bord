import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { downloadOpportunityPitchPdf } from "@/lib/studio-pdf";
import { OPPORTUNITY_STATUS_LABEL, OPPORTUNITY_STATUS_TONE, type StudioOpportunity } from "@/lib/studio-types";
import { Download, Eye } from "lucide-react";
import { StudioAuditTimeline } from "./StudioAuditTimeline";

interface Props { opp: StudioOpportunity }

export function StudioOpportunityDetailDialog({ opp }: Props) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1">
          <Eye className="h-3 w-3" /> Détails
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-base">{opp.title}</DialogTitle>
          <DialogDescription className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className={`text-[10px] ${OPPORTUNITY_STATUS_TONE[opp.status]}`}>
              {OPPORTUNITY_STATUS_LABEL[opp.status]}
            </Badge>
            {opp.domain && <Badge variant="outline" className="text-[10px]">{opp.domain}</Badge>}
            <span className="text-[10px] text-muted-foreground">
              Créée le {new Date(opp.created_at).toLocaleDateString("fr-FR")}
            </span>
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" className="gap-2" onClick={() => downloadOpportunityPitchPdf(opp)}>
            <Download className="h-3.5 w-3.5" /> Télécharger la note (PDF)
          </Button>
        </div>
        <ScrollArea className="flex-1 pr-2">
          <div className="space-y-4 pb-4">
            {opp.problem_statement && (
              <section>
                <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Problème</h4>
                <p className="text-sm whitespace-pre-wrap">{opp.problem_statement}</p>
              </section>
            )}
            {opp.description && (
              <section>
                <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Contexte</h4>
                <p className="text-sm whitespace-pre-wrap">{opp.description}</p>
              </section>
            )}
            {opp.recommended_action && (
              <section>
                <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Action recommandée</h4>
                <p className="text-sm">{opp.recommended_action}</p>
              </section>
            )}
            <Separator />
            <StudioAuditTimeline resourceType="studio_opportunity" resourceId={opp.id} />
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}