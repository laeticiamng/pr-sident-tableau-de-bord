import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock } from "lucide-react";

// Mock approval history - in production would come from database
const APPROVAL_HISTORY = [
  {
    id: "1",
    title: "Déploiement EmotionsCare v2.1",
    decision: "approved",
    decidedAt: "2026-02-03T14:30:00",
    reason: "Validation après tests QA complets",
  },
  {
    id: "2",
    title: "Modification schéma base de données",
    decision: "approved",
    decidedAt: "2026-02-02T10:15:00",
    reason: null,
  },
  {
    id: "3",
    title: "Accès API externe non vérifié",
    decision: "rejected",
    decidedAt: "2026-02-01T16:45:00",
    reason: "Risque de sécurité - audit requis",
  },
  {
    id: "4",
    title: "Newsletter automatique février",
    decision: "approved",
    decidedAt: "2026-01-31T09:00:00",
    reason: null,
  },
  {
    id: "5",
    title: "Mise à jour tarifs Stripe",
    decision: "approved",
    decidedAt: "2026-01-30T11:20:00",
    reason: "Validé après analyse finance",
  },
];

export function ApprovalHistory() {
  const approvedCount = APPROVAL_HISTORY.filter(a => a.decision === "approved").length;
  const rejectedCount = APPROVAL_HISTORY.filter(a => a.decision === "rejected").length;

  return (
    <Card className="card-executive">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <Clock className="h-5 w-5 text-primary" />
          Historique des Décisions
        </CardTitle>
        <CardDescription>
          {approvedCount} approuvées • {rejectedCount} rejetées (30 derniers jours)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {APPROVAL_HISTORY.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                {item.decision === "approved" ? (
                  <CheckCircle className="h-5 w-5 text-success" />
                ) : (
                  <XCircle className="h-5 w-5 text-destructive" />
                )}
                <div>
                  <p className="font-medium text-sm">{item.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(item.decidedAt).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <Badge variant={item.decision === "approved" ? "success" : "destructive"}>
                  {item.decision === "approved" ? "Approuvé" : "Rejeté"}
                </Badge>
                {item.reason && (
                  <p className="text-xs text-muted-foreground mt-1 max-w-[150px] truncate">
                    {item.reason}
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
