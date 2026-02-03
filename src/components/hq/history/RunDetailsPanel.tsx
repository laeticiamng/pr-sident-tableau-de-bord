import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  X, 
  Clock, 
  CheckCircle, 
  XCircle, 
  User, 
  Layers, 
  FileText,
  Calendar,
  Loader2
} from "lucide-react";

interface Run {
  id: string;
  run_type: string;
  status: string;
  platform_key?: string;
  owner_requested?: boolean;
  executive_summary?: string;
  detailed_appendix?: any;
  created_at: string;
  started_at?: string;
  completed_at?: string;
}

interface RunDetailsPanelProps {
  run: Run;
  onClose: () => void;
}

const runTypeLabels: Record<string, string> = {
  DAILY_EXECUTIVE_BRIEF: "Brief Exécutif Quotidien",
  CEO_STANDUP_MEETING: "Réunion Standup DG",
  PLATFORM_STATUS_REVIEW: "Revue de Plateforme",
  SECURITY_AUDIT_RLS: "Audit Sécurité RLS",
  MARKETING_WEEK_PLAN: "Plan Marketing Semaine",
  RELEASE_GATE_CHECK: "Validation Release",
  WEEKLY_EXEC_REVIEW: "Revue Exécutive Hebdo",
  COMPETITIVE_ANALYSIS: "Analyse Concurrentielle",
};

export function RunDetailsPanel({ run, onClose }: RunDetailsPanelProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="success"><CheckCircle className="h-3 w-3 mr-1" />Terminé</Badge>;
      case "failed":
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Échoué</Badge>;
      case "running":
        return <Badge variant="default"><Loader2 className="h-3 w-3 mr-1 animate-spin" />En cours</Badge>;
      default:
        return <Badge variant="subtle"><Clock className="h-3 w-3 mr-1" />{status}</Badge>;
    }
  };

  const getDuration = () => {
    if (!run.started_at || !run.completed_at) return null;
    const start = new Date(run.started_at).getTime();
    const end = new Date(run.completed_at).getTime();
    const durationMs = end - start;
    if (durationMs < 1000) return `${durationMs}ms`;
    if (durationMs < 60000) return `${(durationMs / 1000).toFixed(1)}s`;
    return `${(durationMs / 60000).toFixed(1)}min`;
  };

  return (
    <Card className="card-executive">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5 text-primary" />
              {runTypeLabels[run.run_type] || run.run_type}
            </CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              <Calendar className="h-3 w-3" />
              {new Date(run.created_at).toLocaleString("fr-FR")}
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status & Metadata */}
        <div className="flex flex-wrap gap-2">
          {getStatusBadge(run.status)}
          {run.platform_key && (
            <Badge variant="subtle">
              <Layers className="h-3 w-3 mr-1" />
              {run.platform_key}
            </Badge>
          )}
          {run.owner_requested && (
            <Badge variant="gold">
              <User className="h-3 w-3 mr-1" />
              Demandé par Owner
            </Badge>
          )}
          {getDuration() && (
            <Badge variant="outline">
              <Clock className="h-3 w-3 mr-1" />
              {getDuration()}
            </Badge>
          )}
        </div>

        {/* Executive Summary */}
        {run.executive_summary && (
          <>
            <Separator />
            <div>
              <h4 className="font-semibold text-sm mb-2">Résumé Exécutif</h4>
              <div className="p-4 rounded-lg bg-muted/30 text-sm whitespace-pre-wrap">
                {run.executive_summary}
              </div>
            </div>
          </>
        )}

        {/* Detailed Appendix */}
        {run.detailed_appendix && Object.keys(run.detailed_appendix).length > 0 && (
          <>
            <Separator />
            <div>
              <h4 className="font-semibold text-sm mb-2">Annexe Détaillée</h4>
              <pre className="p-4 rounded-lg bg-muted/30 text-xs overflow-auto max-h-48 font-mono">
                {JSON.stringify(run.detailed_appendix, null, 2)}
              </pre>
            </div>
          </>
        )}

        {/* Timestamps */}
        <Separator />
        <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
          <div>
            <span className="font-medium">Créé:</span>{" "}
            {new Date(run.created_at).toLocaleString("fr-FR")}
          </div>
          {run.started_at && (
            <div>
              <span className="font-medium">Démarré:</span>{" "}
              {new Date(run.started_at).toLocaleString("fr-FR")}
            </div>
          )}
          {run.completed_at && (
            <div>
              <span className="font-medium">Terminé:</span>{" "}
              {new Date(run.completed_at).toLocaleString("fr-FR")}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
