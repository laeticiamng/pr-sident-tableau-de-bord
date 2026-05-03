import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useStudioOpportunities } from "@/hooks/useStudio";
import {
  OPPORTUNITY_STATUS_LABEL,
  OPPORTUNITY_STATUS_TONE,
  type StudioOpportunity,
} from "@/lib/studio-types";
import { Radar, Search } from "lucide-react";
import { StrategicValueScore } from "./StrategicValueScore";
import { ExecutionRiskBadge } from "./ExecutionRiskBadge";
import { StudioOpportunityDetailDialog } from "./StudioOpportunityDetailDialog";

function riskFromScore(score: number | null): "low" | "medium" | "high" | "critical" {
  if (score == null) return "medium";
  if (score < 25) return "low";
  if (score < 55) return "medium";
  if (score < 80) return "high";
  return "critical";
}

interface OpportunityRowProps {
  opp: StudioOpportunity;
}

function OpportunityRow({ opp }: OpportunityRowProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr_auto_auto] gap-3 sm:gap-4 items-start sm:items-center rounded-lg border border-border/60 bg-background/50 p-3 sm:p-4">
      <StrategicValueScore score={opp.strategic_value_score} size="sm" />
      <div className="min-w-0 space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-medium leading-tight truncate">{opp.title}</p>
          {opp.domain && (
            <Badge variant="outline" className="text-[10px]">
              {opp.domain}
            </Badge>
          )}
        </div>
        {opp.problem_statement && (
          <p className="text-[12px] text-muted-foreground line-clamp-2">{opp.problem_statement}</p>
        )}
        {opp.recommended_action && (
          <p className="text-[11px] text-primary/80">→ {opp.recommended_action}</p>
        )}
      </div>
      <ExecutionRiskBadge level={riskFromScore(opp.execution_risk_score)} />
      <div className="flex items-center gap-1">
        <Badge variant="outline" className={`text-[10px] ${OPPORTUNITY_STATUS_TONE[opp.status]}`}>
          {OPPORTUNITY_STATUS_LABEL[opp.status]}
        </Badge>
        <StudioOpportunityDetailDialog opp={opp} />
      </div>
    </div>
  );
}

export function OpportunityRadar() {
  const { data, isLoading } = useStudioOpportunities();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const items = data ?? [];
    if (!query.trim()) return items;
    const q = query.trim().toLowerCase();
    return items.filter(
      (o) =>
        o.title.toLowerCase().includes(q) ||
        (o.domain ?? "").toLowerCase().includes(q) ||
        (o.description ?? "").toLowerCase().includes(q),
    );
  }, [data, query]);

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Radar className="h-4 w-4 text-primary" />
            Radar des opportunités
          </CardTitle>
          <div className="relative max-w-xs w-full">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher une opportunité…"
              className="pl-8 h-9 text-sm"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-10">
            Aucune opportunité {query ? "ne correspond à votre recherche" : "détectée"}. Ajoutez-en une pour démarrer.
          </p>
        ) : (
          <div className="space-y-2">
            {filtered.map((opp) => (
              <OpportunityRow key={opp.id} opp={opp} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
