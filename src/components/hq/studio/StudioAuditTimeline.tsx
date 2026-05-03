import { useStudioAuditTrail } from "@/hooks/useStudio";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { History, Bot, ShieldCheck, User2, Sparkles } from "lucide-react";

interface Props {
  resourceType: "studio_opportunity" | "studio_blueprint" | "studio_deal";
  resourceId: string;
}

function actorIcon(actorType: string) {
  if (actorType === "owner") return <ShieldCheck className="h-3.5 w-3.5 text-primary" />;
  if (actorType === "ai" || actorType === "system") return <Bot className="h-3.5 w-3.5 text-accent" />;
  if (actorType === "public") return <Sparkles className="h-3.5 w-3.5 text-warning" />;
  return <User2 className="h-3.5 w-3.5 text-muted-foreground" />;
}

function describeAction(action: string): string {
  const map: Record<string, string> = {
    "studio.opportunity.created": "Opportunité créée",
    "studio.call.created": "Appel à projets ajouté",
    "studio.public_submission.created": "Soumission publique reçue",
    "studio.public_submission.converted": "Soumission convertie en opportunité",
    "studio.approval.requested": "Approbation demandée",
    "studio.approval.approved": "Approbation accordée",
    "studio.approval.rejected": "Approbation refusée",
    "studio.approval.executed": "Action exécutée",
    "studio.approval.cancelled": "Action annulée",
  };
  return map[action] ?? action;
}

export function StudioAuditTimeline({ resourceType, resourceId }: Props) {
  const { data, isLoading, error } = useStudioAuditTrail(resourceType, resourceId);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <History className="h-4 w-4 text-primary" />
        Historique d'audit
      </div>
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
        </div>
      ) : error ? (
        <p className="text-xs text-destructive">Impossible de charger l'historique.</p>
      ) : !data || data.length === 0 ? (
        <p className="text-xs text-muted-foreground italic">Aucune action enregistrée pour cette ressource.</p>
      ) : (
        <ol className="space-y-2 border-l border-border/60 pl-4">
          {data.map((entry) => (
            <li key={entry.id} className="relative">
              <span className="absolute -left-[22px] top-1 flex h-4 w-4 items-center justify-center rounded-full bg-background border border-border/60">
                {actorIcon(entry.actor_type)}
              </span>
              <div className="flex flex-wrap items-baseline gap-2">
                <p className="text-xs font-medium">{describeAction(entry.action)}</p>
                <Badge variant="outline" className="text-[10px] capitalize">{entry.actor_type}</Badge>
                <span className="text-[10px] text-muted-foreground">
                  {new Date(entry.occurred_at).toLocaleString("fr-FR")}
                </span>
              </div>
              {entry.details && Object.keys(entry.details).length > 0 && (
                <pre className="mt-1 text-[10px] text-muted-foreground whitespace-pre-wrap break-all bg-muted/30 rounded p-1.5 max-h-24 overflow-auto">
                  {JSON.stringify(entry.details, null, 2)}
                </pre>
              )}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}