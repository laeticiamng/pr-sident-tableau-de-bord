import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, RefreshCw, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface StructuredLog {
  id: string;
  level: string;
  source: string;
  message: string;
  metadata: Record<string, unknown> | null;
  run_id: string | null;
  created_at: string;
}

const LEVEL_CONFIG: Record<string, { icon: typeof Info; color: string; bg: string }> = {
  info: { icon: Info, color: "text-primary", bg: "bg-primary/10" },
  warn: { icon: AlertTriangle, color: "text-warning", bg: "bg-warning/10" },
  error: { icon: AlertCircle, color: "text-destructive", bg: "bg-destructive/10" },
};

interface StructuredLogsViewerProps {
  className?: string;
  limit?: number;
}

export function StructuredLogsViewer({ className, limit = 50 }: StructuredLogsViewerProps) {
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");

  const { data: logs, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["hq", "structured_logs", levelFilter, sourceFilter, limit],
    queryFn: async (): Promise<StructuredLog[]> => {
      const { data, error } = await supabase.rpc("get_hq_logs", {
        limit_count: limit,
        level_filter: levelFilter === "all" ? null : levelFilter,
        source_filter: sourceFilter === "all" ? null : sourceFilter,
      });
      if (error) throw error;
      return (data as StructuredLog[]) || [];
    },
    refetchInterval: 30000,
  });

  // Extract unique sources for filter
  const sources = [...new Set(logs?.map(l => l.source) || [])];

  return (
    <Card className={cn("card-executive", className)}>
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            Logs Structurés
            {logs && <Badge variant="outline" className="text-xs">{logs.length}</Badge>}
          </CardTitle>
          <div className="flex items-center gap-2 flex-wrap">
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger className="h-8 w-[110px] text-xs">
                <SelectValue placeholder="Niveau" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="warn">Warn</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="h-8 w-[140px] text-xs">
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes</SelectItem>
                {sources.map(s => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" className="h-8" onClick={() => refetch()} disabled={isFetching}>
              <RefreshCw className={cn("h-3.5 w-3.5", isFetching && "animate-spin")} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-4 space-y-2">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        ) : !logs?.length ? (
          <div className="p-8 text-center text-muted-foreground">
            <FileText className="h-8 w-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">Aucun log trouvé</p>
          </div>
        ) : (
          <ScrollArea className="h-[350px]">
            <div className="divide-y divide-border">
              {logs.map(log => {
                const config = LEVEL_CONFIG[log.level] || LEVEL_CONFIG.info;
                const Icon = config.icon;
                return (
                  <div key={log.id} className="px-4 py-3 hover:bg-muted/20 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className={cn("p-1 rounded shrink-0 mt-0.5", config.bg)}>
                        <Icon className={cn("h-3.5 w-3.5", config.color)} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          <Badge variant="outline" className="text-[10px] font-mono">{log.source}</Badge>
                          <span className="text-xs font-medium">{log.message}</span>
                          <span className="text-[10px] text-muted-foreground ml-auto shrink-0">
                            {formatDistanceToNow(new Date(log.created_at), { addSuffix: true, locale: fr })}
                          </span>
                        </div>
                        {log.metadata && Object.keys(log.metadata).length > 0 && (
                          <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
                            {Object.entries(log.metadata).map(([k, v]) => (
                              <span key={k} className="text-[10px] text-muted-foreground font-mono">
                                {k}=<span className="text-foreground/70">{String(v)}</span>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
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