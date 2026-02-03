import { Badge } from "@/components/ui/badge";
import { FileText, Filter, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

// Mock audit logs
const auditLogs = [
  {
    id: "1",
    timestamp: new Date().toISOString(),
    agent: "CEO_AGENT",
    action: "RUN_COMPLETED",
    resource: "DAILY_EXECUTIVE_BRIEF",
    status: "success",
    details: "Brief exécutif généré avec succès",
  },
  {
    id: "2",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    agent: "CTO_AGENT",
    action: "PROPOSAL_CREATED",
    resource: "RELEASE_GATE_CHECK",
    status: "pending",
    details: "Proposition de déploiement v2.1.0 créée",
  },
  {
    id: "3",
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    agent: "OWNER",
    action: "APPROVAL_GRANTED",
    resource: "MARKETING_CAMPAIGN",
    status: "success",
    details: "Campagne Q1 approuvée par la Présidente",
  },
  {
    id: "4",
    timestamp: new Date(Date.now() - 10800000).toISOString(),
    agent: "CISO_AGENT",
    action: "SECURITY_AUDIT",
    resource: "RLS_POLICIES",
    status: "success",
    details: "Audit RLS complété - 0 vulnérabilités",
  },
  {
    id: "5",
    timestamp: new Date(Date.now() - 14400000).toISOString(),
    agent: "GM_EMOTIONSCARE",
    action: "STATUS_REPORT",
    resource: "PLATFORM_HEALTH",
    status: "success",
    details: "Rapport de santé plateforme soumis",
  },
];

export default function AuditPage() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-headline-1 mb-2">Journal d'Audit</h1>
        <p className="text-muted-foreground text-lg">
          Historique complet de toutes les actions des agents (append-only).
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="card-executive p-6 text-center">
          <div className="text-3xl font-bold mb-1">1,247</div>
          <div className="text-sm text-muted-foreground">Total Entrées</div>
        </div>
        <div className="card-executive p-6 text-center">
          <div className="text-3xl font-bold text-success mb-1">1,198</div>
          <div className="text-sm text-muted-foreground">Succès</div>
        </div>
        <div className="card-executive p-6 text-center">
          <div className="text-3xl font-bold text-warning mb-1">42</div>
          <div className="text-sm text-muted-foreground">En Attente</div>
        </div>
        <div className="card-executive p-6 text-center">
          <div className="text-3xl font-bold text-destructive mb-1">7</div>
          <div className="text-sm text-muted-foreground">Échecs</div>
        </div>
      </div>

      {/* Filters */}
      <div className="card-executive p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Rechercher dans les logs..." className="pl-10" />
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="cursor-pointer hover:bg-secondary">
              <Filter className="h-3 w-3 mr-1" />
              Tous
            </Badge>
            <Badge variant="success" className="cursor-pointer">Succès</Badge>
            <Badge variant="warning" className="cursor-pointer">En attente</Badge>
            <Badge variant="destructive" className="cursor-pointer">Échecs</Badge>
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="card-executive overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-accent" />
            <h2 className="text-xl font-semibold">Entrées Récentes</h2>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary/30">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Horodatage</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Agent</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Action</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Ressource</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Statut</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Détails</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-secondary/20">
                  <td className="p-4 text-sm font-mono">
                    {new Date(log.timestamp).toLocaleString("fr-FR")}
                  </td>
                  <td className="p-4">
                    <Badge variant="subtle" className="font-mono text-xs">{log.agent}</Badge>
                  </td>
                  <td className="p-4 text-sm font-medium">{log.action}</td>
                  <td className="p-4 text-sm text-muted-foreground">{log.resource}</td>
                  <td className="p-4">
                    <Badge 
                      variant={
                        log.status === "success" ? "success" : 
                        log.status === "pending" ? "warning" : "destructive"
                      }
                    >
                      {log.status === "success" ? "Succès" : 
                       log.status === "pending" ? "En attente" : "Échec"}
                    </Badge>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground max-w-xs truncate">
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
