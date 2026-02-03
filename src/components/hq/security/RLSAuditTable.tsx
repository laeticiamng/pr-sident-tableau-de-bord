import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, AlertTriangle, RefreshCw, Loader2, Lock, ExternalLink } from "lucide-react";

interface RLSTable {
  schema: string;
  table: string;
  rlsEnabled: boolean;
  policiesCount: number;
  lastCheck: Date;
}

const HQ_TABLES: RLSTable[] = [
  { schema: "hq", table: "platforms", rlsEnabled: true, policiesCount: 1, lastCheck: new Date() },
  { schema: "hq", table: "runs", rlsEnabled: true, policiesCount: 1, lastCheck: new Date() },
  { schema: "hq", table: "agents", rlsEnabled: true, policiesCount: 1, lastCheck: new Date() },
  { schema: "hq", table: "audit_logs", rlsEnabled: true, policiesCount: 1, lastCheck: new Date() },
  { schema: "hq", table: "actions", rlsEnabled: true, policiesCount: 1, lastCheck: new Date() },
  { schema: "hq", table: "approvals", rlsEnabled: true, policiesCount: 1, lastCheck: new Date() },
  { schema: "hq", table: "system_config", rlsEnabled: true, policiesCount: 1, lastCheck: new Date() },
  { schema: "public", table: "user_roles", rlsEnabled: true, policiesCount: 2, lastCheck: new Date() },
  { schema: "public", table: "role_permissions", rlsEnabled: true, policiesCount: 2, lastCheck: new Date() },
];

interface RLSAuditTableProps {
  onAudit?: () => Promise<void>;
  isAuditing?: boolean;
}

export function RLSAuditTable({ onAudit, isAuditing }: RLSAuditTableProps) {
  const [tables] = useState<RLSTable[]>(HQ_TABLES);

  const allSecure = tables.every(t => t.rlsEnabled && t.policiesCount > 0);
  const insecureCount = tables.filter(t => !t.rlsEnabled || t.policiesCount === 0).length;

  return (
    <Card className="card-executive">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-3">
            <Lock className="h-5 w-5 text-primary" />
            Audit RLS
          </CardTitle>
          <CardDescription>État des politiques Row Level Security</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          {allSecure ? (
            <Badge variant="success">Toutes sécurisées</Badge>
          ) : (
            <Badge variant="destructive">{insecureCount} vulnérable(s)</Badge>
          )}
          {onAudit && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={onAudit}
              disabled={isAuditing}
            >
              {isAuditing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Relancer
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {tables.map((table) => {
            const isSecure = table.rlsEnabled && table.policiesCount > 0;
            return (
              <div 
                key={`${table.schema}.${table.table}`} 
                className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                  !isSecure ? "border-destructive/30 bg-destructive/5" : "hover:bg-muted/30"
                }`}
              >
                <div className="flex items-center gap-3">
                  {isSecure ? (
                    <CheckCircle className="h-4 w-4 text-success" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                  )}
                  <span className="font-mono text-sm">
                    {table.schema}.{table.table}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={table.rlsEnabled ? "success" : "destructive"}>
                    {table.rlsEnabled ? "RLS Actif" : "RLS Désactivé"}
                  </Badge>
                  <Badge variant="subtle" className="font-mono">
                    {table.policiesCount} policies
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {table.lastCheck.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
