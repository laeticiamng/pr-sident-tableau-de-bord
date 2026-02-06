import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Activity, Server, User, Bot, AlertTriangle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const typeIcons: Record<string, React.ElementType> = {
  system: Server,
  owner: User,
  agent: Bot,
  default: Activity,
};

const actionSeverity = (action: string): string => {
  if (action.includes("error") || action.includes("fail")) return "text-destructive";
  if (action.includes("warning") || action.includes("risk")) return "text-warning";
  return "text-muted-foreground";
};

export function LiveActivityStream() {
  const { data: logs, isLoading } = useQuery({
    queryKey: ["live-activity-stream"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_hq_audit_logs", { limit_count: 20 });
      if (error) throw error;
      return data || [];
    },
    refetchInterval: 15000, // Poll every 15s
  });

  const hasData = logs && logs.length > 0;

  return (
    <Card className="card-executive">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3">
            <Activity className="h-5 w-5 text-primary" />
            Flux d'Activité Live
            {hasData && (
              <Badge variant="success" className="animate-pulse">
                <span className="w-2 h-2 rounded-full bg-success mr-1" />
                En direct
              </Badge>
            )}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-14 bg-muted/30 animate-pulse rounded-lg" />
            ))}
          </div>
        ) : !hasData ? (
          <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-muted-foreground/20 rounded-lg">
            <Activity className="h-10 w-10 text-muted-foreground/40 mb-3" />
            <p className="text-sm font-medium text-muted-foreground">Aucune activité enregistrée</p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              Les actions système et utilisateur apparaîtront ici en temps réel
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[300px]">
            <div className="space-y-2">
              {logs.map((log) => {
                const Icon = typeIcons[log.actor_type] || typeIcons.default;
                return (
                  <div
                    key={log.id}
                    className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/30 transition-colors"
                  >
                    <Icon className={`h-4 w-4 mt-0.5 ${actionSeverity(log.action)}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">{log.action}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(log.created_at).toLocaleString("fr-FR")}
                        {log.resource_type && ` • ${log.resource_type}`}
                      </p>
                    </div>
                    <Badge variant="subtle" className="text-[10px] capitalize">
                      {log.actor_type}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
