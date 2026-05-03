import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useStudioOpportunities } from "@/hooks/useStudio";
import {
  OPPORTUNITY_STATUS_LABEL,
  type StudioOpportunity,
  type StudioOpportunityStatus,
} from "@/lib/studio-types";
import { Skeleton } from "@/components/ui/skeleton";
import { GitBranch } from "lucide-react";
import { cn } from "@/lib/utils";

const PIPELINE_COLUMNS: StudioOpportunityStatus[] = [
  "idea",
  "qualified",
  "blueprint_in_progress",
  "ready",
  "deal_proposed",
  "deal_signed",
  "advisory",
  "rejected",
];

const COLUMN_TONE: Record<StudioOpportunityStatus, string> = {
  idea: "border-l-muted-foreground/40",
  qualified: "border-l-primary",
  blueprint_in_progress: "border-l-accent",
  ready: "border-l-warning",
  deal_proposed: "border-l-warning",
  deal_signed: "border-l-success",
  advisory: "border-l-success",
  archived: "border-l-muted",
  rejected: "border-l-destructive",
};

function OpportunityCard({ opp }: { opp: StudioOpportunity }) {
  return (
    <div className={cn("border-l-2 bg-background/60 rounded-md p-3 space-y-1", COLUMN_TONE[opp.status])}>
      <p className="text-sm font-medium leading-tight line-clamp-2">{opp.title}</p>
      {opp.domain && (
        <p className="text-[11px] text-muted-foreground">{opp.domain}</p>
      )}
      {typeof opp.strategic_value_score === "number" && (
        <Badge variant="outline" className="text-[10px] font-medium">
          Score {opp.strategic_value_score}
        </Badge>
      )}
    </div>
  );
}

export function StudioPipelineKanban() {
  const { data, isLoading } = useStudioOpportunities();

  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  const items = data ?? [];
  const grouped = PIPELINE_COLUMNS.reduce<Record<StudioOpportunityStatus, StudioOpportunity[]>>(
    (acc, status) => {
      acc[status] = items.filter((it) => it.status === status);
      return acc;
    },
    {} as Record<StudioOpportunityStatus, StudioOpportunity[]>,
  );

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <GitBranch className="h-4 w-4 text-primary" />
          Pipeline Studio
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
          {PIPELINE_COLUMNS.map((status) => (
            <div key={status} className="space-y-2">
              <div className="flex items-center justify-between text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
                <span className="truncate">{OPPORTUNITY_STATUS_LABEL[status]}</span>
                <span className="tabular-nums">{grouped[status].length}</span>
              </div>
              <div className="space-y-2 min-h-[80px]">
                {grouped[status].length === 0 ? (
                  <div className="rounded-md border border-dashed border-border/60 p-3 text-[11px] text-muted-foreground text-center">
                    Aucun
                  </div>
                ) : (
                  grouped[status].slice(0, 5).map((opp) => (
                    <OpportunityCard key={opp.id} opp={opp} />
                  ))
                )}
                {grouped[status].length > 5 && (
                  <p className="text-[10px] text-muted-foreground text-center">
                    +{grouped[status].length - 5} de plus
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
