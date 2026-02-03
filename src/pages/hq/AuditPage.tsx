import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Search, RefreshCw, CheckCircle, AlertTriangle, Clock, Download } from "lucide-react";
import { useAuditLogs } from "@/hooks/useHQData";
import { AuditExportButton } from "@/components/hq/audit/AuditExportButton";

export default function AuditPage() {
  const { data: auditLogs, isLoading, refetch } = useAuditLogs(100);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const filteredLogs = auditLogs?.filter(log => {
    const matchesSearch = !searchTerm || 
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.actor_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.resource_type?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === "all") return matchesSearch;
    // For now, all logs are considered "success" since we don't have a status field
    return matchesSearch;
  });

  const getStatusIcon = (action: string) => {
    if (action.includes("failed") || action.includes("error")) {
      return <AlertTriangle className="h-4 w-4 text-destructive" />;
    }
    if (action.includes("pending")) {
      return <Clock className="h-4 w-4 text-warning" />;
    }
    return <CheckCircle className="h-4 w-4 text-success" />;
  };

  const getActorBadgeVariant = (actorType: string) => {
    switch (actorType) {
      case "owner": return "gold";
      case "agent": return "default";
      case "system": return "subtle";
      default: return "outline";
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-headline-1 mb-2">Journal d'Audit</h1>
          <p className="text-muted-foreground text-lg">
            Historique complet de toutes les actions (append-only).
          </p>
        </div>
        <div className="flex items-center gap-3">
          <AuditExportButton logs={auditLogs || []} />
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="card-executive">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold mb-1">
              {isLoading ? "..." : auditLogs?.length || 0}
            </div>
            <div className="text-sm text-muted-foreground">Total Entrées</div>
          </CardContent>
        </Card>
        <Card className="card-executive">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-primary mb-1">
              {isLoading ? "..." : auditLogs?.filter(l => l.actor_type === "owner").length || 0}
            </div>
            <div className="text-sm text-muted-foreground">Actions Owner</div>
          </CardContent>
        </Card>
        <Card className="card-executive">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-success mb-1">
              {isLoading ? "..." : auditLogs?.filter(l => l.actor_type === "agent").length || 0}
            </div>
            <div className="text-sm text-muted-foreground">Actions Agents</div>
          </CardContent>
        </Card>
        <Card className="card-executive">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-muted-foreground mb-1">
              {isLoading ? "..." : auditLogs?.filter(l => l.actor_type === "system").length || 0}
            </div>
            <div className="text-sm text-muted-foreground">Actions Système</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="card-executive">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Rechercher dans les logs..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Badge 
                variant={filterStatus === "all" ? "default" : "outline"} 
                className="cursor-pointer"
                onClick={() => setFilterStatus("all")}
              >
                Tous
              </Badge>
              <Badge 
                variant={filterStatus === "owner" ? "gold" : "outline"} 
                className="cursor-pointer"
                onClick={() => setFilterStatus("owner")}
              >
                Owner
              </Badge>
              <Badge 
                variant={filterStatus === "agent" ? "success" : "outline"} 
                className="cursor-pointer"
                onClick={() => setFilterStatus("agent")}
              >
                Agents
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Log Table */}
      <Card className="card-executive overflow-hidden">
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-primary" />
            Entrées Récentes
          </CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-6 space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : filteredLogs && filteredLogs.length > 0 ? (
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Horodatage</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Acteur</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Action</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Ressource</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Détails</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-muted/30">
                    <td className="p-4 text-sm font-mono">
                      {new Date(log.created_at).toLocaleString("fr-FR")}
                    </td>
                    <td className="p-4">
                      <Badge variant={getActorBadgeVariant(log.actor_type) as any} className="font-mono text-xs">
                        {log.actor_type === "owner" ? "OWNER" : log.actor_id || log.actor_type.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(log.action)}
                        <span className="text-sm font-medium">{log.action}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {log.resource_type && (
                        <span>
                          {log.resource_type}
                          {log.resource_id && <span className="font-mono"> #{log.resource_id.slice(0, 8)}</span>}
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-sm text-muted-foreground max-w-xs truncate">
                      {log.details ? JSON.stringify(log.details).slice(0, 50) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Aucune entrée d'audit</p>
              <p className="text-sm mt-1">Les actions seront enregistrées ici automatiquement.</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
