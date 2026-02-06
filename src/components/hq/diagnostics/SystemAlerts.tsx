import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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
import { useConsolidatedMetrics, useRefreshPlatformMonitor } from "@/hooks/usePlatformMonitor";

interface Alert {
  id: string;
  type: "critical" | "warning" | "info";
  title: string;
  message: string;
  timestamp: string;
  platform?: string;
  acknowledged: boolean;
}

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
  const { metrics, isLoading, isCritical } = useConsolidatedMetrics();
  const refreshMonitor = useRefreshPlatformMonitor();

  // Generate alerts from real platform monitoring data
  const generatedAlerts: Alert[] = [];
  
  if (!isLoading) {
    metrics.platforms.forEach((platform) => {
      if (platform.status === "red") {
        generatedAlerts.push({
          id: `${platform.key}-red`,
          type: "critical",
          title: `${platform.key.replace(/-/g, " ")} — Indisponible`,
          message: platform.error || "La plateforme ne répond pas",
          timestamp: new Date().toISOString(),
          platform: platform.key,
          acknowledged: false,
        });
      } else if (platform.status === "amber") {
        generatedAlerts.push({
          id: `${platform.key}-amber`,
          type: "warning",
          title: `${platform.key.replace(/-/g, " ")} — Latence élevée`,
          message: platform.responseTime 
            ? `Temps de réponse : ${platform.responseTime}ms` 
            : "Performance dégradée détectée",
          timestamp: new Date().toISOString(),
          platform: platform.key,
          acknowledged: false,
        });
      }
    });
  }

  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [acknowledgedIds, setAcknowledgedIds] = useState<Set<string>>(new Set());

  const visibleAlerts = generatedAlerts.filter(a => !dismissedIds.has(a.id));
  const unacknowledgedCount = visibleAlerts.filter(a => !acknowledgedIds.has(a.id)).length;

  const handleAcknowledge = (alertId: string) => {
    setAcknowledgedIds(prev => new Set([...prev, alertId]));
  };

  const handleDismiss = (alertId: string) => {
    setDismissedIds(prev => new Set([...prev, alertId]));
  };

  if (isLoading) {
    return (
      <Card className="card-executive">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Bell className="h-5 w-5 text-primary" />
            Alertes Système
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2].map(i => <Skeleton key={i} className="h-16 w-full" />)}
          </div>
        </CardContent>
      </Card>
    );
  }

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
          Alertes générées depuis le monitoring en temps réel
        </CardDescription>
      </CardHeader>
      <CardContent>
        {visibleAlerts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle className="h-12 w-12 mx-auto mb-4 text-success opacity-50" />
            <p className="font-medium">Aucune alerte active</p>
            <p className="text-sm mt-1">Tous les systèmes fonctionnent normalement</p>
          </div>
        ) : (
          <div className="space-y-3">
            {visibleAlerts.map((alert) => {
              const config = alertConfig[alert.type];
              const AlertIcon = config.icon;
              const isAcknowledged = acknowledgedIds.has(alert.id);
              
              return (
                <div 
                  key={alert.id}
                  className={cn(
                    "p-4 rounded-lg border transition-all",
                    config.bg,
                    config.border,
                    isAcknowledged && "opacity-60"
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
                          Détecté maintenant
                          {isAcknowledged && (
                            <Badge variant="subtle" className="text-xs">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Acquitté
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      {!isAcknowledged && (
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
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-muted-foreground"
            onClick={() => refreshMonitor.mutate(undefined)}
            disabled={refreshMonitor.isPending}
          >
            <RefreshCw className={cn("h-3 w-3 mr-2", refreshMonitor.isPending && "animate-spin")} />
            Actualiser les alertes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
