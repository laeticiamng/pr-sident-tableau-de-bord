import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle, XCircle, AlertTriangle, Loader2 } from "lucide-react";
import { usePendingApprovals, useApproveAction } from "@/hooks/useHQData";
import { ApprovalHistory } from "@/components/hq/approbations/ApprovalHistory";
import { ApprovalStats } from "@/components/hq/approbations/ApprovalStats";

const riskColors = {
  low: "bg-status-green text-white",
  medium: "bg-status-amber text-white",
  high: "bg-orange-500 text-white",
  critical: "bg-destructive text-destructive-foreground",
};

const riskLabels = {
  low: "Faible",
  medium: "Moyen",
  high: "Élevé",
  critical: "Critique",
};

export default function ApprobationsPage() {
  const { data: pendingApprovals, isLoading } = usePendingApprovals();
  const approveAction = useApproveAction();
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [decision, setDecision] = useState<"approved" | "rejected" | null>(null);
  const [reason, setReason] = useState("");

  const handleDecision = (actionId: string, dec: "approved" | "rejected") => {
    setSelectedAction(actionId);
    setDecision(dec);
  };

  const confirmDecision = async () => {
    if (!selectedAction || !decision) return;
    
    await approveAction.mutateAsync({
      action_id: selectedAction,
      decision,
      reason: reason || undefined,
    });
    
    setSelectedAction(null);
    setDecision(null);
    setReason("");
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-headline-1 mb-2">Approbations</h1>
        <p className="text-muted-foreground text-lg">
          Décisions en attente de votre validation.
        </p>
      </div>

      {/* Stats Grid */}
      <ApprovalStats 
        pending={pendingApprovals?.length || 0}
        approvedThisMonth={24}
        rejectedThisMonth={3}
        avgResponseTime="< 2h"
      />

      {/* Pending Approvals */}
      <Card className="card-executive">
        <CardHeader>
          <CardTitle>En attente de décision</CardTitle>
          <CardDescription>
            Actions proposées par les agents nécessitant votre approbation
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : pendingApprovals && pendingApprovals.length > 0 ? (
            <div className="space-y-4">
              {pendingApprovals.map((action) => (
                <div key={action.id} className="p-6 rounded-lg border hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{action.title}</h3>
                        <Badge className={riskColors[action.risk_level]}>
                          Risque {riskLabels[action.risk_level]}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Type: {action.action_type}</span>
                        <span>
                          {new Date(action.created_at).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "long",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {action.description && (
                    <p className="text-muted-foreground mb-6">{action.description}</p>
                  )}
                  
                  <div className="flex items-center gap-3">
                    <Button 
                      variant="executive"
                      onClick={() => handleDecision(action.id, "approved")}
                      disabled={approveAction.isPending}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approuver
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => handleDecision(action.id, "rejected")}
                      disabled={approveAction.isPending}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Rejeter
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-success" />
              <p className="text-lg font-medium">Aucune approbation en attente</p>
              <p className="text-sm mt-1">Toutes les actions ont été traitées.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Approval History */}
      <ApprovalHistory />

      {/* Confirmation Dialog */}
      <Dialog open={!!selectedAction} onOpenChange={() => setSelectedAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {decision === "approved" ? "Confirmer l'approbation" : "Confirmer le rejet"}
            </DialogTitle>
            <DialogDescription>
              {decision === "approved" 
                ? "Cette action sera exécutée par l'agent responsable."
                : "L'action sera annulée et l'agent en sera informé."
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <label className="text-sm font-medium mb-2 block">
              Raison (optionnel)
            </label>
            <Textarea
              placeholder="Ajoutez une note pour cette décision..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedAction(null)}>
              Annuler
            </Button>
            <Button 
              variant={decision === "approved" ? "executive" : "destructive"}
              onClick={confirmDecision}
              disabled={approveAction.isPending}
            >
              {approveAction.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : decision === "approved" ? (
                <CheckCircle className="h-4 w-4 mr-2" />
              ) : (
                <XCircle className="h-4 w-4 mr-2" />
              )}
              {decision === "approved" ? "Approuver" : "Rejeter"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
