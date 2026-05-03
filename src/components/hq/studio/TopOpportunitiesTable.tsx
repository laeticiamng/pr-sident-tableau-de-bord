import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useStudioOpportunities } from "@/hooks/useStudio";
import { Star } from "lucide-react";
import {
  OPPORTUNITY_STATUS_LABEL,
  OPPORTUNITY_STATUS_TONE,
} from "@/lib/studio-types";
import { Link } from "react-router-dom";
import { StrategicValueScore } from "./StrategicValueScore";

export function TopOpportunitiesTable() {
  const { data, isLoading } = useStudioOpportunities();

  if (isLoading) return <Skeleton className="h-48 w-full" />;

  const top = (data ?? [])
    .filter((o) => o.status !== "archived" && o.status !== "rejected")
    .slice()
    .sort(
      (a, b) =>
        (b.strategic_value_score ?? 0) - (a.strategic_value_score ?? 0) ||
        (b.opportunity_score ?? 0) - (a.opportunity_score ?? 0),
    )
    .slice(0, 6);

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-base">
          <Star className="h-4 w-4 text-warning" />
          Top opportunités
        </CardTitle>
        <Link
          to="/hq/studio/opportunites"
          className="text-xs text-primary hover:underline"
        >
          Voir tout
        </Link>
      </CardHeader>
      <CardContent>
        {top.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            Aucune opportunité en cours. Ajoutez-en une depuis le radar.
          </p>
        ) : (
          <div className="space-y-2">
            {top.map((opp) => (
              <div
                key={opp.id}
                className="flex items-center gap-4 rounded-lg border border-border/60 bg-background/50 p-3 hover:bg-muted/30 transition-colors"
              >
                <StrategicValueScore
                  score={opp.strategic_value_score}
                  size="sm"
                  showLabel={false}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{opp.title}</p>
                  <div className="flex flex-wrap gap-2 mt-1 text-[11px] text-muted-foreground">
                    {opp.domain && <span>{opp.domain}</span>}
                    {opp.recommended_action && (
                      <span className="truncate">→ {opp.recommended_action}</span>
                    )}
                  </div>
                </div>
                <Badge variant="outline" className={`text-[10px] ${OPPORTUNITY_STATUS_TONE[opp.status]}`}>
                  {OPPORTUNITY_STATUS_LABEL[opp.status]}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
