import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { downloadBlueprint360Pdf, downloadPitchPdf } from "@/lib/studio-pdf";
import { BLUEPRINT_STATUS_LABEL, type StudioBlueprint, type BlueprintSection } from "@/lib/studio-types";
import { Download, FileText } from "lucide-react";
import { StudioAuditTimeline } from "./StudioAuditTimeline";

const SECTIONS: { key: keyof StudioBlueprint; label: string }[] = [
  { key: "problem", label: "Problème" },
  { key: "opportunity", label: "Opportunité" },
  { key: "solution", label: "Solution" },
  { key: "targets", label: "Cibles" },
  { key: "business_model", label: "Modèle économique" },
  { key: "partners", label: "Partenaires" },
  { key: "deployment_plan", label: "Plan de déploiement" },
  { key: "kpis", label: "KPIs" },
  { key: "risks", label: "Risques" },
  { key: "pitch", label: "Pitch" },
  { key: "emotionsphere_role", label: "Rôle EmotionSphere" },
  { key: "deal_recommendation", label: "Recommandation deal" },
];

function renderSection(label: string, sec: BlueprintSection | undefined) {
  if (!sec || (!sec.summary && !sec.bullets?.length && !sec.notes)) return null;
  return (
    <section key={label}>
      <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">{label}</h4>
      {sec.summary && <p className="text-sm whitespace-pre-wrap">{sec.summary}</p>}
      {sec.bullets?.length ? (
        <ul className="list-disc list-inside text-sm space-y-0.5 mt-1">
          {sec.bullets.map((b, i) => <li key={i}>{b}</li>)}
        </ul>
      ) : null}
      {sec.notes && <p className="text-xs text-muted-foreground mt-1 italic">{sec.notes}</p>}
    </section>
  );
}

interface Props { blueprint: StudioBlueprint }

export function StudioBlueprintDetailDialog({ blueprint }: Props) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1">
          <FileText className="h-3 w-3" /> Ouvrir
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[88vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{blueprint.title}</DialogTitle>
          <DialogDescription className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="text-[10px]">{BLUEPRINT_STATUS_LABEL[blueprint.status]}</Badge>
            <Badge variant="outline" className="text-[10px]">v{blueprint.version}</Badge>
            <span className="text-[10px] text-muted-foreground">
              Mis à jour {new Date(blueprint.updated_at).toLocaleDateString("fr-FR")}
            </span>
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="default" className="gap-2" onClick={() => downloadBlueprint360Pdf(blueprint)}>
            <Download className="h-3.5 w-3.5" /> Blueprint 360° (PDF)
          </Button>
          <Button size="sm" variant="outline" className="gap-2" onClick={() => downloadPitchPdf(blueprint)}>
            <Download className="h-3.5 w-3.5" /> Pitch synthétique (PDF)
          </Button>
        </div>
        <ScrollArea className="flex-1 pr-2">
          <div className="space-y-4 pb-4">
            {SECTIONS.map(s => renderSection(s.label, blueprint[s.key] as BlueprintSection))}
            <Separator />
            <StudioAuditTimeline resourceType="studio_blueprint" resourceId={blueprint.id} />
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}