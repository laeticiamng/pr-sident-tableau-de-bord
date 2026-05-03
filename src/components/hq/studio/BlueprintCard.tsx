import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  BLUEPRINT_STATUS_LABEL,
  type StudioBlueprint,
} from "@/lib/studio-types";
import { FileText, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import { StudioBlueprintDetailDialog } from "./StudioBlueprintDetailDialog";

interface BlueprintCardProps {
  blueprint: StudioBlueprint;
}

const STATUS_TONE: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  in_review: "bg-warning/10 text-warning",
  finalized: "bg-success/10 text-success",
  sent: "bg-primary/10 text-primary",
  archived: "bg-muted/50 text-muted-foreground",
};

export function BlueprintCard({ blueprint }: BlueprintCardProps) {
  return (
    <Card className="border-border/60 hover:border-primary/40 transition-colors">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <FileText className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium leading-tight truncate">{blueprint.title}</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className={cn("text-[10px]", STATUS_TONE[blueprint.status])}>
                {BLUEPRINT_STATUS_LABEL[blueprint.status]}
              </Badge>
              <Badge variant="outline" className="text-[10px] gap-1">
                <Layers className="h-3 w-3" /> v{blueprint.version}
              </Badge>
            </div>
          </div>
        </div>
        <p className="text-[11px] text-muted-foreground">
          Mis à jour {new Date(blueprint.updated_at).toLocaleDateString("fr-FR")}
        </p>
        <div className="flex justify-end">
          <StudioBlueprintDetailDialog blueprint={blueprint} />
        </div>
      </CardContent>
    </Card>
  );
}
