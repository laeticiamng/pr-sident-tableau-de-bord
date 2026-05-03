import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollText, ShieldCheck, Sparkles } from "lucide-react";
import {
  DEAL_TYPE_LABEL,
  DOCUMENT_TYPE_LABEL,
  type DealSimulationOutput,
} from "@/lib/studio-types";
import { ExecutionRiskBadge } from "./ExecutionRiskBadge";

interface EquityRecommendationCardProps {
  simulation: DealSimulationOutput;
}

export function EquityRecommendationCard({ simulation }: EquityRecommendationCardProps) {
  return (
    <Card className="border-border/60 bg-gradient-to-br from-background via-background to-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="h-4 w-4 text-primary" />
          Recommandation de deal
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg bg-primary/5 border border-primary/20 p-4">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Type recommandé</p>
            <p className="text-base font-semibold mt-1">{DEAL_TYPE_LABEL[simulation.recommendedDealType]}</p>
          </div>
          <div className="rounded-lg border border-border/60 p-4">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Equity recommandé</p>
            <p className="text-2xl font-bold tabular-nums mt-1">{simulation.equityRecommended}%</p>
            <p className="text-[11px] text-muted-foreground">Fourchette {simulation.equityMin}% – {simulation.equityMax}%</p>
          </div>
          <div className="rounded-lg border border-border/60 p-4 flex flex-col gap-2">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Niveau de risque</p>
            <ExecutionRiskBadge level={simulation.riskLevel} />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <h4 className="text-sm font-semibold flex items-center gap-2 mb-2">
              <ScrollText className="h-3.5 w-3.5" /> Justification
            </h4>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              {simulation.rationale.map((line, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold flex items-center gap-2 mb-2">
              <ShieldCheck className="h-3.5 w-3.5" /> Conditions minimales
            </h4>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              {simulation.conditions.map((line, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-warning">•</span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold mb-1.5">Documents à exiger</p>
          <div className="flex flex-wrap gap-1.5">
            {simulation.documentsRequired.map((doc) => (
              <Badge key={doc} variant="outline" className="text-[10px]">
                {DOCUMENT_TYPE_LABEL[doc]}
              </Badge>
            ))}
          </div>
        </div>

        <div className="rounded-md border border-warning/30 bg-warning/5 p-3 text-[11px] text-muted-foreground">
          <span className="font-semibold text-foreground">Avertissement.</span> Les suggestions de structuration juridique, fiscale ou capitalistique sont des aides à la décision et doivent être validées par un avocat ou expert-comptable.
        </div>
      </CardContent>
    </Card>
  );
}
