import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Clock, AlertTriangle, ArrowRight } from "lucide-react";

// Mock data for approvals
const pendingApprovals = [
  {
    id: "1",
    title: "Déploiement EmotionsCare v2.1.0",
    type: "RELEASE",
    platform: "EmotionsCare",
    risk: "medium",
    requestedBy: "CTO_AGENT",
    requestedAt: new Date().toISOString(),
    summary: "Mise en production de la version 2.1.0 avec nouvelles fonctionnalités de dashboard.",
  },
  {
    id: "2",
    title: "Mise à jour politique RLS",
    type: "DB_CHANGE",
    platform: "System Compass",
    risk: "high",
    requestedBy: "CISO_AGENT",
    requestedAt: new Date(Date.now() - 86400000).toISOString(),
    summary: "Renforcement des règles de sécurité Row Level Security sur les tables utilisateurs.",
  },
];

const recentDecisions = [
  {
    id: "3",
    title: "Campagne email Q1",
    type: "MARKETING",
    decision: "approved",
    decidedAt: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: "4",
    title: "Nouvelle API endpoint",
    type: "ENGINEERING",
    decision: "approved",
    decidedAt: new Date(Date.now() - 259200000).toISOString(),
  },
  {
    id: "5",
    title: "Accès base prod",
    type: "SECURITY",
    decision: "rejected",
    decidedAt: new Date(Date.now() - 345600000).toISOString(),
  },
];

export default function ApprobationsPage() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-headline-1 mb-2">Approbations</h1>
        <p className="text-muted-foreground text-lg">
          Décisions en attente de votre validation.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="card-executive p-6">
          <div className="flex items-center gap-3">
            <Clock className="h-8 w-8 text-warning" />
            <div>
              <div className="text-3xl font-bold">{pendingApprovals.length}</div>
              <div className="text-sm text-muted-foreground">En attente</div>
            </div>
          </div>
        </div>
        <div className="card-executive p-6">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-8 w-8 text-success" />
            <div>
              <div className="text-3xl font-bold">12</div>
              <div className="text-sm text-muted-foreground">Approuvées ce mois</div>
            </div>
          </div>
        </div>
        <div className="card-executive p-6">
          <div className="flex items-center gap-3">
            <XCircle className="h-8 w-8 text-destructive" />
            <div>
              <div className="text-3xl font-bold">2</div>
              <div className="text-sm text-muted-foreground">Rejetées ce mois</div>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Approvals */}
      <div className="card-executive p-6">
        <h2 className="text-xl font-semibold mb-6">En attente de décision</h2>
        <div className="space-y-4">
          {pendingApprovals.map((approval) => (
            <div key={approval.id} className="p-6 rounded-lg border hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg">{approval.title}</h3>
                    <Badge variant={approval.risk === "high" ? "status-amber" : "subtle"}>
                      {approval.risk === "high" ? "Risque Élevé" : "Risque Moyen"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Plateforme: {approval.platform}</span>
                    <span>Type: {approval.type}</span>
                    <span>Par: {approval.requestedBy}</span>
                  </div>
                </div>
              </div>
              <p className="text-muted-foreground mb-6">{approval.summary}</p>
              <div className="flex items-center gap-3">
                <Button variant="executive">
                  <CheckCircle className="h-4 w-4" />
                  Approuver
                </Button>
                <Button variant="outline">
                  <XCircle className="h-4 w-4" />
                  Rejeter
                </Button>
                <Button variant="ghost">
                  Voir les détails
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Decisions */}
      <div className="card-executive p-6">
        <h2 className="text-xl font-semibold mb-6">Décisions récentes</h2>
        <div className="space-y-3">
          {recentDecisions.map((decision) => (
            <div key={decision.id} className="flex items-center justify-between p-4 rounded-lg border">
              <div className="flex items-center gap-4">
                {decision.decision === "approved" ? (
                  <CheckCircle className="h-5 w-5 text-success" />
                ) : (
                  <XCircle className="h-5 w-5 text-destructive" />
                )}
                <div>
                  <span className="font-medium">{decision.title}</span>
                  <Badge variant="subtle" className="ml-3">{decision.type}</Badge>
                </div>
              </div>
              <span className="text-sm text-muted-foreground">
                {new Date(decision.decidedAt).toLocaleDateString("fr-FR")}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
