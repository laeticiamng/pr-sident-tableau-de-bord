import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  TrendingUp, 
  DollarSign, 
  Activity,
  CheckCircle,
  AlertTriangle,
  Target
} from "lucide-react";
import { usePendingApprovals } from "@/hooks/useHQData";
import { useConsolidatedMetrics } from "@/hooks/usePlatformMonitor";
import { useStripeKPIs, formatCurrency, formatPercentage } from "@/hooks/useStripeKPIs";
import { cn } from "@/lib/utils";

interface EssentialCockpitProps {
  className?: string;
}

export function EssentialCockpit({ className }: EssentialCockpitProps) {
  const { metrics, isLoading: monitorLoading, isHealthy, isCritical } = useConsolidatedMetrics();
  const { data: approvals, isLoading: approvalsLoading } = usePendingApprovals();
  const { data: stripeData, isLoading: stripeLoading } = useStripeKPIs();
  const stripeKPIs = stripeData?.kpis;

  const isLoading = monitorLoading || stripeLoading;

  // KPIs essentiels uniquement
  const essentialKPIs = {
    mrr: { 
      value: stripeKPIs ? formatCurrency(stripeKPIs.mrr, stripeKPIs.currency) : "—", 
      change: stripeKPIs ? formatPercentage(stripeKPIs.mrrChange) : "—",
    },
    platforms: {
      green: metrics.greenPlatforms,
      amber: metrics.amberPlatforms,
      red: metrics.redPlatforms,
    },
    uptime: metrics.uptimePercent,
    pendingApprovals: approvals?.length || 0,
  };

  if (isLoading) {
    return (
      <div className={cn("space-y-4", className)}>
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header simplifié */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Bonjour, Présidente</h2>
          <p className="text-muted-foreground">
            Voici l'essentiel de vos 5 plateformes
          </p>
        </div>
        <Badge 
          variant={isCritical ? "destructive" : isHealthy ? "gold" : "subtle"} 
          className="gap-1 text-sm py-1.5 px-3"
        >
          <Activity className="h-4 w-4" />
          {isCritical ? "Action requise" : isHealthy ? "Tout va bien" : "À surveiller"}
        </Badge>
      </div>

      {/* Carte principale - Santé globale */}
      <Card className="card-executive bg-gradient-to-br from-primary/5 to-transparent">
        <CardContent className="p-6">
          <div className="grid grid-cols-3 gap-6 mb-6">
            <div className="text-center p-4 rounded-xl bg-success/10 border border-success/20">
              <div className="text-4xl font-bold text-success">{essentialKPIs.platforms.green}</div>
              <div className="text-sm text-muted-foreground mt-1">Opérationnelles</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-warning/10 border border-warning/20">
              <div className="text-4xl font-bold text-warning">{essentialKPIs.platforms.amber}</div>
              <div className="text-sm text-muted-foreground mt-1">À surveiller</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-destructive/10 border border-destructive/20">
              <div className="text-4xl font-bold text-destructive">{essentialKPIs.platforms.red}</div>
              <div className="text-sm text-muted-foreground mt-1">Critiques</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Uptime global</span>
              <span className="font-mono text-lg font-bold">{essentialKPIs.uptime.toFixed(1)}%</span>
            </div>
            <Progress value={essentialKPIs.uptime} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Deux métriques clés */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Revenu */}
        <Card className="card-executive">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Revenu Mensuel</p>
                <p className="text-3xl font-bold mt-1">{essentialKPIs.mrr.value}</p>
                <p className={cn("text-sm flex items-center gap-1 mt-1", stripeKPIs ? "text-success" : "text-muted-foreground")}>
                  {stripeKPIs ? <TrendingUp className="h-4 w-4" /> : null}
                  {stripeKPIs ? `${essentialKPIs.mrr.change} ce mois` : "Données Stripe"}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-accent/10">
                <DollarSign className="h-8 w-8 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Approbations en attente */}
        <Card className={cn(
          "card-executive",
          essentialKPIs.pendingApprovals > 0 && "border-warning/50"
        )}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Décisions en attente</p>
                <p className="text-3xl font-bold mt-1">{essentialKPIs.pendingApprovals}</p>
                <p className={cn(
                  "text-sm flex items-center gap-1 mt-1",
                  essentialKPIs.pendingApprovals > 0 ? "text-warning" : "text-muted-foreground"
                )}>
                  {essentialKPIs.pendingApprovals > 0 ? (
                    <>
                      <AlertTriangle className="h-4 w-4" />
                      Votre validation requise
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 text-success" />
                      Aucune action en attente
                    </>
                  )}
                </p>
              </div>
              <div className={cn(
                "p-4 rounded-xl",
                essentialKPIs.pendingApprovals > 0 ? "bg-warning/10" : "bg-success/10"
              )}>
                {essentialKPIs.pendingApprovals > 0 ? (
                  <AlertTriangle className="h-8 w-8 text-warning" />
                ) : (
                  <CheckCircle className="h-8 w-8 text-success" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Message de guidage */}
      <Card className="card-executive bg-muted/30">
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground text-center">
            💡 Mode essentiel activé — Seuls les indicateurs clés sont affichés.
            Désactivez ce mode pour accéder à toutes les fonctionnalités.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
