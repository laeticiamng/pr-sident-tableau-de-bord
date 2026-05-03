import { Handshake, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { DealSimulator } from "@/components/hq/studio/DealSimulator";
import { RequestApprovalButton } from "@/components/hq/studio/RequestApprovalButton";
import { useStudioDeals } from "@/hooks/useStudio";
import {
  DEAL_STATUS_LABEL,
  DEAL_TYPE_LABEL,
  type StudioDealStatus,
} from "@/lib/studio-types";
import { ExecutionRiskBadge } from "@/components/hq/studio/ExecutionRiskBadge";
import { cn } from "@/lib/utils";

const STATUS_TONE: Record<StudioDealStatus, string> = {
  draft: "bg-muted text-muted-foreground",
  proposed: "bg-warning/10 text-warning",
  in_negotiation: "bg-warning/15 text-warning",
  accepted: "bg-success/10 text-success",
  signed: "bg-success/15 text-success",
  rejected: "bg-destructive/10 text-destructive",
  archived: "bg-muted/50 text-muted-foreground",
};

export default function StudioDealsPage() {
  const { data, isLoading } = useStudioDeals();

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
          <Handshake className="h-5 w-5 text-primary" />
          Equity Deals & rémunération stratégique
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          EmotionSphere intervient comme architecte stratégique. Selon le niveau d'apport et le potentiel du projet, la contrepartie peut prendre la forme d'une participation minoritaire, d'un success fee, d'un advisory mensuel ou d'un modèle hybride.
        </p>
      </div>

      <Card className="border-border/60 bg-muted/20">
        <CardContent className="p-4 text-xs text-muted-foreground space-y-1">
          <p>
            <span className="font-semibold text-foreground">Logique centrale.</span> EmotionSphere ne vend pas du temps, elle crée de la valeur stratégique. Le simulateur ci-dessous est une grille de discussion : chaque deal final doit être validé juridiquement.
          </p>
        </CardContent>
      </Card>

      <DealSimulator />

      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-sm font-semibold">Création d'un nouveau deal</p>
            <p className="text-xs text-muted-foreground">
              Toute création de deal stratégique passe par la file d'approbations présidentielles si la porte est active.
            </p>
          </div>
          <RequestApprovalButton
            gateKey="create_deal"
            input={{
              action_type: "create_deal",
              title: "Création d'un equity deal",
              description: "Demande de validation pour structurer un nouveau deal selon la simulation en cours.",
              risk_level: "high",
            }}
            label="Demander validation deal"
          />
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-4 w-4 text-primary" />
            Deals enregistrés
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : (data ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Aucun deal enregistré. Le simulateur vous aide à structurer le premier.
            </p>
          ) : (
            <div className="space-y-2">
              {(data ?? []).map((deal) => (
                <div
                  key={deal.id}
                  className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-lg border border-border/60 bg-background/50 p-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium leading-tight truncate">{deal.project_name}</p>
                      <Badge variant="outline" className="text-[10px]">
                        {DEAL_TYPE_LABEL[deal.deal_type]}
                      </Badge>
                    </div>
                    {deal.partner_name && (
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Partenaire : {deal.partner_name}
                      </p>
                    )}
                    {deal.next_action && (
                      <p className="text-[11px] text-primary/80 mt-0.5">→ {deal.next_action}</p>
                    )}
                  </div>
                  <div className="flex flex-col sm:items-end gap-1">
                    <Badge
                      variant="outline"
                      className={cn("text-[10px]", STATUS_TONE[deal.status])}
                    >
                      {DEAL_STATUS_LABEL[deal.status]}
                    </Badge>
                    <ExecutionRiskBadge level={deal.risk_level} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
