import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Bell, RefreshCw, CheckCircle, AlertTriangle, XCircle, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format, formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface PushLogEntry {
  id: string;
  created_at: string;
  level: string;
  message: string;
  metadata: {
    failed_runs?: number;
    red_platforms?: number;
    stale_approvals?: number;
    [key: string]: unknown;
  } | null;
}

export function PushNotificationHistory() {
  const [logs, setLogs] = useState<PushLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const { data } = await supabase.rpc("get_hq_logs", {
        source_filter: "push-triggers",
        limit_count: 30,
      });
      setLogs((data as PushLogEntry[] | null) || []);
    } catch (e) {
      console.error("Failed to fetch push logs:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const getAlertCount = (entry: PushLogEntry) => {
    const meta = entry.metadata;
    if (!meta) return 0;
    return (meta.failed_runs || 0) + (meta.red_platforms || 0) + (meta.stale_approvals || 0);
  };

  return (
    <Card className="card-executive">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-primary" />
              Historique Notifications Push
            </CardTitle>
            <CardDescription>
              Vérifications automatiques toutes les 15 min — alertes runs, plateformes, approbations
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={fetchLogs} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Rafraîchir
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Bell className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">Aucun historique</p>
            <p className="text-sm mt-1">Les vérifications push n'ont pas encore été exécutées.</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {logs.map((entry) => {
              const alertCount = getAlertCount(entry);
              const meta = entry.metadata;
              const isAlert = entry.level === "warn" || alertCount > 0;

              return (
                <div
                  key={entry.id}
                  className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                    isAlert
                      ? "border-warning/30 bg-warning/5"
                      : "border-border bg-card"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {isAlert ? (
                      <AlertTriangle className="h-4 w-4 text-warning shrink-0" />
                    ) : (
                      <CheckCircle className="h-4 w-4 text-success shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{entry.message}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        {meta?.failed_runs ? (
                          <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                            <XCircle className="h-3 w-3 mr-1" />
                            {meta.failed_runs} run{meta.failed_runs > 1 ? "s" : ""} échoué{meta.failed_runs > 1 ? "s" : ""}
                          </Badge>
                        ) : null}
                        {meta?.red_platforms ? (
                          <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                            {meta.red_platforms} plateforme{meta.red_platforms > 1 ? "s" : ""} down
                          </Badge>
                        ) : null}
                        {meta?.stale_approvals ? (
                          <Badge variant="warning" className="text-[10px] px-1.5 py-0">
                            <Clock className="h-3 w-3 mr-1" />
                            {meta.stale_approvals} approbation{meta.stale_approvals > 1 ? "s" : ""} en retard
                          </Badge>
                        ) : null}
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true, locale: fr })}
                    </p>
                    <p className="text-[10px] text-muted-foreground/60 font-mono">
                      {format(new Date(entry.created_at), "HH:mm:ss", { locale: fr })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
