import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Shield, Clock, CheckCircle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

// Mock compliance alerts
const COMPLIANCE_ALERTS = [
  {
    id: "1",
    type: "deadline",
    severity: "high",
    title: "Audit AIPD requis",
    description: "L'analyse d'impact sur la protection des données doit être finalisée.",
    dueDate: "2026-02-28",
    regulation: "RGPD Art. 35",
    status: "pending"
  },
  {
    id: "2",
    type: "update",
    severity: "medium",
    title: "Mise à jour CGV nécessaire",
    description: "Nouvelles clauses requises suite à la directive européenne DSA.",
    dueDate: "2026-03-15",
    regulation: "DSA",
    status: "in_progress"
  },
  {
    id: "3",
    type: "review",
    severity: "low",
    title: "Revue annuelle politique cookies",
    description: "Vérification de la conformité du bandeau de consentement.",
    dueDate: "2026-04-01",
    regulation: "ePrivacy",
    status: "pending"
  },
  {
    id: "4",
    type: "resolved",
    severity: "none",
    title: "Registre des traitements mis à jour",
    description: "Documentation de tous les traitements de données personnelles.",
    dueDate: null,
    regulation: "RGPD Art. 30",
    status: "completed"
  },
];

const severityConfig = {
  high: { color: "text-destructive", bg: "bg-destructive/10", label: "Urgent" },
  medium: { color: "text-warning", bg: "bg-warning/10", label: "Important" },
  low: { color: "text-muted-foreground", bg: "bg-muted", label: "Info" },
  none: { color: "text-success", bg: "bg-success/10", label: "Résolu" },
};

interface ComplianceAlertsProps {
  className?: string;
}

export function ComplianceAlerts({ className }: ComplianceAlertsProps) {
  const pendingAlerts = COMPLIANCE_ALERTS.filter(a => a.status !== "completed");
  const urgentCount = COMPLIANCE_ALERTS.filter(a => a.severity === "high").length;

  return (
    <Card className={cn("card-executive", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-warning/10">
              <AlertTriangle className="h-5 w-5 text-warning" />
            </div>
            <div>
              <CardTitle>Alertes Conformité</CardTitle>
              <CardDescription>
                {pendingAlerts.length} action(s) requise(s), {urgentCount} urgente(s)
              </CardDescription>
            </div>
          </div>
          <Badge variant={urgentCount > 0 ? "destructive" : "success"}>
            {urgentCount > 0 ? `${urgentCount} urgent` : "Tout OK"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {COMPLIANCE_ALERTS.map((alert) => {
          const severity = severityConfig[alert.severity as keyof typeof severityConfig];
          
          return (
            <div 
              key={alert.id}
              className={cn(
                "p-4 rounded-lg border transition-all hover:shadow-sm",
                alert.status === "completed" && "opacity-60"
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {alert.status === "completed" ? (
                      <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
                    ) : (
                      <Shield className={cn("h-4 w-4 flex-shrink-0", severity.color)} />
                    )}
                    <h4 className="font-medium text-sm truncate">{alert.title}</h4>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                    {alert.description}
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="subtle" className="text-xs">
                      {alert.regulation}
                    </Badge>
                    {alert.dueDate && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Échéance: {new Date(alert.dueDate).toLocaleDateString("fr-FR")}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge 
                    variant={alert.status === "completed" ? "success" : "outline"}
                    className={cn("text-xs", severity.bg, severity.color)}
                  >
                    {severity.label}
                  </Badge>
                  {alert.status !== "completed" && (
                    <Button variant="ghost" size="sm" className="h-7 text-xs">
                      Traiter <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
