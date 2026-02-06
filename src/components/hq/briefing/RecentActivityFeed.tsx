import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Activity, FileText, Shield, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

const getIcon = (action: string) => {
  if (action.includes("run")) return FileText;
  if (action.includes("config") || action.includes("action")) return Shield;
  return Activity;
};

const getStatusColor = (action: string) => {
  if (action.includes("approved")) return "text-success";
  if (action.includes("rejected")) return "text-destructive";
  return "text-primary";
};

function formatTimeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return "À l'instant";
  if (seconds < 3600) return `Il y a ${Math.floor(seconds / 60)}min`;
  if (seconds < 86400) return `Il y a ${Math.floor(seconds / 3600)}h`;
  return `Il y a ${Math.floor(seconds / 86400)}j`;
}

interface RecentActivityFeedProps {
  className?: string;
  maxItems?: number;
}

export function RecentActivityFeed({ className, maxItems = 5 }: RecentActivityFeedProps) {
  const { data: logs, isLoading } = useQuery({
    queryKey: ["audit-logs-recent", maxItems],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_hq_audit_logs", { limit_count: maxItems });
      if (error) throw error;
      return data || [];
    },
  });

  if (isLoading) {
    return (
      <Card className={`card-executive ${className}`}>
        <CardHeader><CardTitle className="flex items-center gap-3"><Activity className="h-5 w-5 text-primary" />Activité Récente</CardTitle></CardHeader>
        <CardContent><div className="space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-14 w-full" />)}</div></CardContent>
      </Card>
    );
  }

  return (
    <Card className={`card-executive ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <Activity className="h-5 w-5 text-primary" />
          Activité Récente
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!logs || logs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="font-medium">Aucune activité enregistrée</p>
            <p className="text-sm mt-1">Les actions apparaîtront ici après utilisation du système.</p>
          </div>
        ) : (
          <ScrollArea className="h-[280px] pr-4">
            <div className="space-y-4">
              {logs.map((log) => {
                const Icon = getIcon(log.action);
                return (
                  <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/30 transition-colors">
                    <div className={`mt-0.5 ${getStatusColor(log.action)}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{log.action}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {log.resource_type} • {log.actor_type}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatTimeAgo(log.created_at)}
                    </div>
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
