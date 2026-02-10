import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";
import { useAuditLogs } from "@/hooks/useHQData";

export function ApprovalHistory() {
  const { data: allLogs, isLoading, isError } = useAuditLogs(20);

  const logs = allLogs?.filter((log) =>
    log.action?.startsWith("action.") || log.action?.startsWith("run.")
  );

  if (isLoading) {
    return (
      <Card className="card-executive">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-primary" />
            Historique des Décisions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
          </div>
        </CardContent>
      </Card>
    );
  }

  const approvedCount = logs?.filter((l) => l.action === "action.approved").length || 0;
  const rejectedCount = logs?.filter((l) => l.action === "action.rejected").length || 0;

  return (
    <Card className="card-executive">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <Clock className="h-5 w-5 text-primary" />
          Historique des Décisions
        </CardTitle>
        <CardDescription>
          {logs?.length ? `${approvedCount} approuvées • ${rejectedCount} rejetées` : "Aucune décision enregistrée"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isError ? (
          <div className="text-center py-8 text-muted-foreground">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="font-medium">Impossible de charger l'historique</p>
          </div>
        ) : !logs?.length ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="font-medium">Aucune décision enregistrée</p>
            <p className="text-sm mt-1">Les approbations et actions apparaîtront ici</p>
          </div>
        ) : (
          <div className="space-y-3">
            {logs.map((item) => {
              const isApproved = item.action?.includes("approved") || item.action?.includes("created");
              const isRejected = item.action?.includes("rejected");
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {isRejected ? (
                      <XCircle className="h-5 w-5 text-destructive" />
                    ) : (
                      <CheckCircle className="h-5 w-5 text-success" />
                    )}
                    <div>
                      <p className="font-medium text-sm">{item.action}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(item.created_at).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                        {item.resource_type && ` • ${item.resource_type}`}
                      </p>
                    </div>
                  </div>
                  <Badge variant={isRejected ? "destructive" : "success"}>
                    {isRejected ? "Rejeté" : isApproved ? "Approuvé" : item.action}
                  </Badge>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
