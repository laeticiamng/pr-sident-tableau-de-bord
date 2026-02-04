import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Bell, 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  CheckCircle,
  X,
  Clock,
  RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Alert {
  id: string;
  type: "critical" | "warning" | "info";
  title: string;
  message: string;
  timestamp: string;
  platform?: string;
  acknowledged: boolean;
}

const MOCK_ALERTS: Alert[] = [
  {
    id: "1",
    type: "warning",
    title: "Latence élevée détectée",
    message: "La latence moyenne sur EmotionsCare dépasse le seuil de 500ms",
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    platform: "EmotionsCare",
    acknowledged: false,
  },
  {
    id: "2",
    type: "info",
    title: "Mise à jour système planifiée",
    message: "Maintenance prévue le 10 février à 03h00 UTC",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    acknowledged: true,
  },
  {
    id: "3",
    type: "warning",
    title: "Quota API proche de la limite",
    message: "85% du quota Stripe API utilisé ce mois",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    acknowledged: false,
  },
];

const alertConfig = {
  critical: { 
    icon: AlertCircle, 
    color: "text-destructive", 
    bg: "bg-destructive/10",
    border: "border-destructive/30",
    badge: "destructive" as const
  },
  warning: { 
    icon: AlertTriangle, 
    color: "text-warning", 
    bg: "bg-warning/10",
    border: "border-warning/30",
    badge: "warning" as const
  },
  info: { 
    icon: Info, 
    color: "text-primary", 
    bg: "bg-primary/10",
    border: "border-primary/30",
    badge: "default" as const
  },
};

export function SystemAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>(MOCK_ALERTS);

  const handleAcknowledge = (alertId: string) => {
    setAlerts(prev => 
      prev.map(a => a.id === alertId ? { ...a, acknowledged: true } : a)
    );
  };

  const handleDismiss = (alertId: string) => {
    setAlerts(prev => prev.filter(a => a.id !== alertId));
  };

  const unacknowledgedCount = alerts.filter(a => !a.acknowledged).length;

  return (
    <Card className="card-executive">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <Bell className="h-5 w-5 text-primary" />
          Alertes Système
          {unacknowledgedCount > 0 && (
            <Badge variant="destructive">{unacknowledgedCount} nouvelle(s)</Badge>
          )}
        </CardTitle>
        <CardDescription>
          Notifications et alertes de surveillance
        </CardDescription>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle className="h-12 w-12 mx-auto mb-4 text-success opacity-50" />
            <p className="font-medium">Aucune alerte active</p>
            <p className="text-sm mt-1">Tous les systèmes fonctionnent normalement</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => {
              const config = alertConfig[alert.type];
              const AlertIcon = config.icon;
              
              return (
                <div 
                  key={alert.id}
                  className={cn(
                    "p-4 rounded-lg border transition-all",
                    config.bg,
                    config.border,
                    alert.acknowledged && "opacity-60"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <AlertIcon className={cn("h-5 w-5 mt-0.5", config.color)} />
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{alert.title}</span>
                          {alert.platform && (
                            <Badge variant="subtle" className="text-xs">
                              {alert.platform}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{alert.message}</p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {new Date(alert.timestamp).toLocaleString("fr-FR")}
                          {alert.acknowledged && (
                            <Badge variant="subtle" className="text-xs">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Acquitté
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      {!alert.acknowledged && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleAcknowledge(alert.id)}
                          className="h-7"
                        >
                          <CheckCircle className="h-3 w-3" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDismiss(alert.id)}
                        className="h-7"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Refresh Button */}
        <div className="mt-4 pt-4 border-t text-center">
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            <RefreshCw className="h-3 w-3 mr-2" />
            Actualiser les alertes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
