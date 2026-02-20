import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MessageSquare,
  CheckCircle,
  FileText,
  RefreshCw,
  Database,
  Link2,
  AlertTriangle,
  Brain,
  Clock,
  Loader2,
  Bot,
} from "lucide-react";
import { SLAMonitor } from "@/components/hq/support/SLAMonitor";
import { TicketsByPriority } from "@/components/hq/support/TicketsByPriority";
import { TicketTrendChart } from "@/components/hq/support/TicketTrendChart";
import { EscalationQueue } from "@/components/hq/support/EscalationQueue";
import { TicketDistributionChart } from "@/components/hq/support/TicketDistributionChart";
import { useExecuteRun, useRecentRuns } from "@/hooks/useHQData";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import ReactMarkdown from "react-markdown";

export default function SupportPage() {
  const executeRun = useExecuteRun();
  const { data: runs, isLoading, refetch, isFetching } = useRecentRuns(20);

  // Runs de type support (platform review = monitoring santé & support)
  const supportRuns = runs?.filter(r => r.run_type === "PLATFORM_STATUS_REVIEW");
  const latestSupportReport = supportRuns?.[0];

  const handleGenerateReport = async () => {
    try {
      await executeRun.mutateAsync({ run_type: "PLATFORM_STATUS_REVIEW" });
    } catch {}
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-headline-1 mb-2">Support Console</h1>
          <p className="text-muted-foreground text-lg">
            Monitoring plateformes + rapports générés par les agents IA.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? "animate-spin" : ""}`} />
            Actualiser
          </Button>
          <Button
            variant="executive"
            onClick={handleGenerateReport}
            disabled={executeRun.isPending}
          >
            {executeRun.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Brain className="h-4 w-4 mr-2" />
            )}
            Rapport Plateformes
          </Button>
        </div>
      </div>

      {/* Rapport IA Plateformes (données réelles) */}
      <Card className="card-executive">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              Rapport Santé Plateformes — Agent CTO
            </CardTitle>
            {latestSupportReport ? (
              <Badge variant="subtle" className="text-xs">
                <CheckCircle className="h-3 w-3 mr-1" />
                Dernière revue {formatDistanceToNow(new Date(latestSupportReport.created_at), { addSuffix: true, locale: fr })}
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs border-destructive/50 text-destructive">
                <AlertTriangle className="h-2.5 w-2.5 mr-0.5" />
                Aucun rapport
              </Badge>
            )}
          </div>
          <CardDescription>
            Statut des 7 plateformes et incidents en cours
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[1,2,3].map(i => <Skeleton key={i} className="h-4 w-full" />)}
            </div>
          ) : latestSupportReport?.executive_summary ? (
            <div className="prose prose-sm max-w-none dark:prose-invert text-xs max-h-72 overflow-y-auto">
              <ReactMarkdown>{latestSupportReport.executive_summary}</ReactMarkdown>
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <Brain className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm mb-3">
                Lancez un rapport pour voir l'état des plateformes analysé par l'IA.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerateReport}
                disabled={executeRun.isPending}
              >
                Générer le rapport
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ticket Overview & Trend */}
      <div className="grid gap-6 lg:grid-cols-2">
        <TicketsByPriority />
        <TicketTrendChart />
      </div>

      {/* Ticket Distribution */}
      <TicketDistributionChart />

      {/* Escalation Queue */}
      <EscalationQueue />

      {/* SLA Monitoring */}
      <SLAMonitor />

      {/* Connexion Helpdesk (état réel) */}
      <Card className="card-executive border-dashed border-2 border-muted-foreground/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Tickets Helpdesk Externes
            </CardTitle>
            <Badge variant="outline" className="text-[9px] gap-1">
              <AlertTriangle className="h-2.5 w-2.5" />
              Connexion requise
            </Badge>
          </div>
          <CardDescription>
            Zendesk, Freshdesk ou Intercom
          </CardDescription>
        </CardHeader>
        <CardContent className="py-4 text-center">
          <Database className="h-7 w-7 mx-auto mb-2 text-muted-foreground" />
          <p className="text-xs text-muted-foreground mb-2">
            Connectez votre helpdesk pour importer les tickets en temps réel.
          </p>
          <Badge variant="outline" className="text-[10px] gap-1">
            <Link2 className="h-2.5 w-2.5" />
            Sources : Zendesk, Freshdesk, Intercom
          </Badge>
        </CardContent>
      </Card>
    </div>
  );
}
