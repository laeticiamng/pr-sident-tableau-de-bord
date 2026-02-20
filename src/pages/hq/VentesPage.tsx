import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  TrendingUp,
  DollarSign,
  Users,
  Target,
  Loader2,
  Brain,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  Euro,
} from "lucide-react";
import { SalesPipelineChart } from "@/components/hq/charts/SalesPipelineChart";
import { ConversionFunnelChart } from "@/components/hq/charts/ConversionFunnelChart";
import { TopClients } from "@/components/hq/sales/TopClients";
import { WinLossWidget } from "@/components/hq/sales/WinLossWidget";
import { DealVelocityWidget } from "@/components/hq/sales/DealVelocityWidget";
import { useExecuteRun, useRecentRuns } from "@/hooks/useHQData";
import { useStripeKPIs, formatCurrency } from "@/hooks/useStripeKPIs";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import ReactMarkdown from "react-markdown";

export default function VentesPage() {
  const executeRun = useExecuteRun();
  const { data: runs, isLoading: runsLoading, refetch, isFetching } = useRecentRuns(20);
  const { data: stripeData, isLoading: stripeLoading } = useStripeKPIs();

  const kpis = stripeData?.kpis;
  const salesRuns = runs?.filter(r => r.run_type === "PLATFORM_STATUS_REVIEW" || r.run_type === "COMPETITIVE_ANALYSIS");
  const latestReport = salesRuns?.[0];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-headline-1 mb-2">Ventes & Commercial</h1>
          <p className="text-muted-foreground text-lg">
            Données Stripe en temps réel + rapports générés par l'agent CSO IA.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? "animate-spin" : ""}`} />
            Actualiser
          </Button>
          <Button
            variant="executive"
            onClick={() => executeRun.mutate({ run_type: "COMPETITIVE_ANALYSIS" })}
            disabled={executeRun.isPending}
          >
            {executeRun.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Brain className="h-4 w-4 mr-2" />
            )}
            Analyse Marché
          </Button>
        </div>
      </div>

      {/* KPIs réels Stripe */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="card-executive">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Euro className="h-5 w-5 text-primary" />
              </div>
              <div>
                {stripeLoading ? <Skeleton className="h-7 w-20 mb-1" /> : (
                  <p className="text-xl font-bold">{kpis ? formatCurrency(kpis.mrr, kpis.currency) : "—"}</p>
                )}
                <p className="text-xs text-muted-foreground">MRR (Stripe)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-executive">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <Users className="h-5 w-5 text-success" />
              </div>
              <div>
                {stripeLoading ? <Skeleton className="h-7 w-16 mb-1" /> : (
                  <p className="text-xl font-bold">{kpis?.totalCustomers ?? "—"}</p>
                )}
                <p className="text-xs text-muted-foreground">Clients totaux</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-executive">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/10">
                <TrendingUp className="h-5 w-5 text-accent" />
              </div>
              <div>
                {stripeLoading ? <Skeleton className="h-7 w-16 mb-1" /> : (
                  <p className="text-xl font-bold">{kpis?.activeSubscriptions ?? "—"}</p>
                )}
                <p className="text-xs text-muted-foreground">Abonnements actifs</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-executive">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/10">
                <Target className="h-5 w-5 text-warning" />
              </div>
              <div>
                {stripeLoading ? <Skeleton className="h-7 w-16 mb-1" /> : (
                  <p className="text-xl font-bold">+{kpis?.newCustomersThisMonth ?? 0}</p>
                )}
                <p className="text-xs text-muted-foreground">Nouveaux ce mois</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pipeline Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <SalesPipelineChart />
        <ConversionFunnelChart />
      </div>

      {/* Rapport Marché IA */}
      {latestReport && (
        <Card className="card-executive">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3">
                <Brain className="h-5 w-5 text-primary" />
                Dernier Rapport Marché — Agent CSO
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="subtle" className="text-xs">
                  {latestReport.run_type.replace(/_/g, " ")}
                </Badge>
                {latestReport.status === "completed" ? (
                  <CheckCircle className="h-4 w-4 text-success" />
                ) : (
                  <XCircle className="h-4 w-4 text-destructive" />
                )}
              </div>
            </div>
            <CardDescription className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDistanceToNow(new Date(latestReport.created_at), { addSuffix: true, locale: fr })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {runsLoading ? (
              <div className="space-y-2">
                {[1,2,3].map(i => <Skeleton key={i} className="h-4 w-full" />)}
              </div>
            ) : latestReport.executive_summary ? (
              <div className="prose prose-sm max-w-none dark:prose-invert text-xs max-h-64 overflow-y-auto">
                <ReactMarkdown>{latestReport.executive_summary}</ReactMarkdown>
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}

      {/* Win/Loss & Deal Velocity */}
      <div className="grid gap-6 lg:grid-cols-2">
        <WinLossWidget />
        <DealVelocityWidget />
      </div>

      {/* Top Clients */}
      <TopClients />
    </div>
  );
}
