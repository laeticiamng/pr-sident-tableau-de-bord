import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Inbox, FileText, Handshake, Archive, Users, Scale } from "lucide-react";
import { useStudioBlueprints, useStudioCalls, useStudioDeals, useStudioOpportunities } from "@/hooks/useStudio";
import { Skeleton } from "@/components/ui/skeleton";

interface DecisionItem {
  id: string;
  icon: React.ElementType;
  label: string;
  detail: string;
  category: "blueprint" | "deal" | "opportunity" | "advisory" | "legal" | "call";
  toneClass: string;
}

const TONE: Record<DecisionItem["category"], string> = {
  blueprint: "bg-primary/10 text-primary",
  deal: "bg-warning/15 text-warning",
  opportunity: "bg-accent/10 text-accent",
  advisory: "bg-success/10 text-success",
  legal: "bg-destructive/10 text-destructive",
  call: "bg-warning/15 text-warning",
};

const CATEGORY_LABEL: Record<DecisionItem["category"], string> = {
  blueprint: "Blueprint",
  deal: "Deal",
  opportunity: "Opportunité",
  advisory: "Advisory",
  legal: "Juridique",
  call: "Appel",
};

export function StudioDecisionInbox() {
  const blueprints = useStudioBlueprints();
  const deals = useStudioDeals();
  const opportunities = useStudioOpportunities();
  const calls = useStudioCalls();

  if (blueprints.isLoading || deals.isLoading || opportunities.isLoading || calls.isLoading) {
    return <Skeleton className="h-48 w-full" />;
  }

  const items: DecisionItem[] = [];

  for (const bp of blueprints.data ?? []) {
    if (bp.status === "in_review") {
      items.push({
        id: `bp-${bp.id}`,
        icon: FileText,
        label: `Valider le blueprint « ${bp.title} »`,
        detail: `Version ${bp.version}`,
        category: "blueprint",
        toneClass: TONE.blueprint,
      });
    }
  }
  for (const deal of deals.data ?? []) {
    if (deal.status === "draft") {
      items.push({
        id: `deal-${deal.id}`,
        icon: Handshake,
        label: `Envoyer la proposition de deal « ${deal.project_name} »`,
        detail: deal.partner_name ?? "Partenaire à définir",
        category: "deal",
        toneClass: TONE.deal,
      });
    }
    if (deal.status === "accepted") {
      items.push({
        id: `deal-sign-${deal.id}`,
        icon: Scale,
        label: `Demander la validation juridique pour « ${deal.project_name} »`,
        detail: deal.advisory_terms ?? "Avant signature finale",
        category: "legal",
        toneClass: TONE.legal,
      });
    }
  }
  for (const opp of opportunities.data ?? []) {
    if (opp.status === "ready") {
      items.push({
        id: `opp-${opp.id}`,
        icon: Archive,
        label: `Archiver ou activer « ${opp.title} »`,
        detail: opp.recommended_action ?? "Décision en attente",
        category: "opportunity",
        toneClass: TONE.opportunity,
      });
    }
    if (opp.status === "advisory") {
      items.push({
        id: `adv-${opp.id}`,
        icon: Users,
        label: `Créer la mission advisory pour « ${opp.title} »`,
        detail: "Suivi stratégique",
        category: "advisory",
        toneClass: TONE.advisory,
      });
    }
  }

  for (const call of calls.data ?? []) {
    if (call.status === "to_analyze") {
      items.push({
        id: `call-${call.id}`,
        icon: FileText,
        label: `Analyser l'appel « ${call.title} »`,
        detail: call.deadline ? `Échéance ${call.deadline}` : "Sans échéance",
        category: "call",
        toneClass: TONE.call,
      });
    }
  }

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Inbox className="h-4 w-4 text-primary" />
          Decision Inbox
          {items.length > 0 && (
            <Badge variant="outline" className="ml-1 text-[10px] tabular-nums">
              {items.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            Aucune décision en attente. Tout est sous contrôle.
          </p>
        ) : (
          <div className="space-y-2">
            {items.slice(0, 8).map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-3 rounded-lg border border-border/60 bg-background/50 p-3"
              >
                <div className={`flex h-9 w-9 items-center justify-center rounded-md ${item.toneClass}`}>
                  <item.icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-tight">{item.label}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{item.detail}</p>
                </div>
                <Badge variant="outline" className="text-[10px]">
                  {CATEGORY_LABEL[item.category]}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
