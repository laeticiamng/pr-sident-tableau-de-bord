import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  History, 
  Search, 
  Filter, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Clock,
  Loader2,
  ChevronDown,
  ChevronUp,
  Eye
} from "lucide-react";
import { useRecentRuns } from "@/hooks/useHQData";
import { RunDetailsPanel } from "@/components/hq/history/RunDetailsPanel";
import { RunExportButton } from "@/components/hq/history/RunExportButton";

const runTypeLabels: Record<string, string> = {
  DAILY_EXECUTIVE_BRIEF: "Brief Exécutif",
  CEO_STANDUP_MEETING: "Standup DG",
  PLATFORM_STATUS_REVIEW: "Revue Plateforme",
  SECURITY_AUDIT_RLS: "Audit Sécurité",
  MARKETING_WEEK_PLAN: "Plan Marketing",
  RELEASE_GATE_CHECK: "Validation Release",
  WEEKLY_EXEC_REVIEW: "Revue Exécutive",
  COMPETITIVE_ANALYSIS: "Analyse Concurrentielle",
};

export default function HistoriquePage() {
  const { data: runs, isLoading, refetch } = useRecentRuns(50);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [expandedRun, setExpandedRun] = useState<string | null>(null);
  const [selectedRun, setSelectedRun] = useState<any | null>(null);

  const filteredRuns = runs?.filter(run => {
    const matchesSearch = !searchTerm || 
      run.run_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      run.executive_summary?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterType === "all" || run.run_type === filterType;
    
    return matchesSearch && matchesFilter;
  });

  const runTypes = [...new Set(runs?.map(r => r.run_type) || [])];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle className="h-5 w-5 text-success" />;
      case "failed": return <XCircle className="h-5 w-5 text-destructive" />;
      case "running": return <Loader2 className="h-5 w-5 animate-spin text-primary" />;
      default: return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-headline-1 mb-2">Historique des Runs</h1>
          <p className="text-muted-foreground text-lg">
            Consultez l'historique complet des exécutions des agents.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <RunExportButton runs={runs || []} />
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
              {isLoading ? "..." : runs?.length || 0}
            </div>
            <div className="text-sm text-muted-foreground">Total Runs</div>
          </CardContent>
        </Card>
        <Card className="card-executive">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-success mb-1">
              {isLoading ? "..." : runs?.filter(r => r.status === "completed").length || 0}
            </div>
            <div className="text-sm text-muted-foreground">Complétés</div>
          </CardContent>
        </Card>
        <Card className="card-executive">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-destructive mb-1">
              {isLoading ? "..." : runs?.filter(r => r.status === "failed").length || 0}
            </div>
            <div className="text-sm text-muted-foreground">Échoués</div>
          </CardContent>
        </Card>
        <Card className="card-executive">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-primary mb-1">
              {isLoading ? "..." : runTypes.length}
            </div>
            <div className="text-sm text-muted-foreground">Types de Run</div>
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
                placeholder="Rechercher dans les runs..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Badge 
                variant={filterType === "all" ? "default" : "outline"} 
                className="cursor-pointer"
                onClick={() => setFilterType("all")}
              >
                Tous
              </Badge>
              {runTypes.slice(0, 4).map(type => (
                <Badge 
                  key={type}
                  variant={filterType === type ? "default" : "outline"} 
                  className="cursor-pointer"
                  onClick={() => setFilterType(type)}
                >
                  {runTypeLabels[type] || type}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Runs List */}
      <Card className="card-executive">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <History className="h-5 w-5 text-primary" />
            Exécutions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : filteredRuns && filteredRuns.length > 0 ? (
            <div className="space-y-3">
              {filteredRuns.map((run) => (
                <div 
                  key={run.id} 
                  className="rounded-lg border overflow-hidden"
                >
                  <div 
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/30"
                    onClick={() => setExpandedRun(expandedRun === run.id ? null : run.id)}
                  >
                    <div className="flex items-center gap-4">
                      {getStatusIcon(run.status)}
                      <div>
                        <h3 className="font-semibold">
                          {runTypeLabels[run.run_type] || run.run_type}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>
                            {new Date(run.created_at).toLocaleDateString("fr-FR", {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit"
                            })}
                          </span>
                          {run.platform_key && (
                            <Badge variant="subtle" className="text-xs">
                              {run.platform_key}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRun(run);
                        }}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Détails
                      </Button>
                      <Badge 
                        variant={run.status === "completed" ? "success" : run.status === "failed" ? "destructive" : "subtle"}
                      >
                        {run.status === "completed" ? "Terminé" : run.status === "failed" ? "Échoué" : run.status}
                      </Badge>
                      {expandedRun === run.id ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </div>
                  {expandedRun === run.id && run.executive_summary && (
                    <div className="p-4 border-t bg-muted/30">
                      <h4 className="font-medium mb-2 text-sm">Résumé Exécutif</h4>
                      <div className="text-sm whitespace-pre-wrap">
                        {run.executive_summary}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Aucun run trouvé</p>
              <p className="text-sm mt-1">Les exécutions apparaîtront ici.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Run Details Panel */}
      {selectedRun && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedRun(null)}>
          <div className="max-w-2xl w-full max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
            <RunDetailsPanel run={selectedRun} onClose={() => setSelectedRun(null)} />
          </div>
        </div>
      )}
    </div>
  );
}
