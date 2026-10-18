import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { useStripeKPIs, formatCurrency, formatPercentage } from "@/hooks/useStripeKPIs";
import { CohortRetentionTable } from "@/components/hq/data/CohortRetentionTable";
import { ARPUTrendChart } from "@/components/hq/charts/ARPUTrendChart";
import { LTVSegmentChart } from "@/components/hq/data/LTVSegmentChart";
import { FeatureAdoptionChart } from "@/components/hq/data/FeatureAdoptionChart";
import { UserSegmentation } from "@/components/hq/data/UserSegmentation";
import { cn } from "@/lib/utils";
import { ExecutiveHeader } from "@/components/hq/ExecutiveDataSource";
import { MethodologyDisclosure } from "@/components/hq/MethodologyDisclosure";
import { DonneesIndisponibles } from "@/components/hq/DonneesIndisponibles";
import { DONNEES_INDISPONIBLES, messageIndisponibilite } from "@/lib/stripe-kpis-adapter";

interface MetricCardProps {
  title: string;
  value: string;
  change?: number;
  icon: React.ReactNode;
  loading?: boolean;
  /** Valeur sans source vérifiée : « Données indisponibles » au lieu d'un nombre. */
  unavailable?: boolean;
}

function MetricCard({ title, value, change, icon, loading, unavailable }: MetricCardProps) {
  if (loading) {
    return (
      <Card className="card-executive">
        <CardContent className="p-4">
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    );
  }

  const isPositive = change && change > 0;
  const isNegative = change && change < 0;

  return (
    <Card className="card-executive hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            {unavailable ? (
              <p className="text-sm font-medium text-muted-foreground py-1">{DONNEES_INDISPONIBLES}</p>
            ) : (
              <p className="text-2xl font-bold">{value}</p>
            )}
            {!unavailable && change !== undefined && (
              <div className="flex items-center gap-1 text-xs">
                {isPositive ? (
                  <ArrowUpRight className="h-3 w-3 text-success" />
                ) : isNegative ? (
                  <ArrowDownRight className="h-3 w-3 text-destructive" />
                ) : null}
                <span className={cn(
                  isPositive ? "text-success" : 
                  isNegative ? "text-destructive" : 
                  "text-muted-foreground"
                )}>
                  {formatPercentage(change)} vs mois dernier
                </span>
              </div>
            )}
          </div>
          <div className="p-2 rounded-lg bg-accent/10">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DataAnalyticsPage() {
  const { data: stripeData, isLoading } = useStripeKPIs();
  const kpis = stripeData?.kpis ?? null;
  const raison = messageIndisponibilite(stripeData?.reason);

  // Variation relative du nombre d'abonnés actifs depuis le 1er du mois (base = actifs au 1er).
  const baseAbonnes = kpis && kpis.activeSubscriptionsChange !== null
    ? kpis.activeSubscriptions - kpis.activeSubscriptionsChange
    : 0;
  const variationAbonnes = kpis && kpis.activeSubscriptionsChange !== null && baseAbonnes > 0
    ? (kpis.activeSubscriptionsChange / baseAbonnes) * 100
    : undefined;

  return (
    <div className="space-y-8 animate-fade-in">
      <ExecutiveHeader
        title="Data & Analytics"
        subtitle="Analyse des cohortes, LTV, ROI et métriques business"
        source={kpis ? { source: "stripe", lastUpdated: kpis.lastUpdated || undefined, confidence: "high" } : undefined}
      />

      {!isLoading && !kpis && (
        <DonneesIndisponibles reason={raison} />
      )}

      {/* KPIs principaux depuis Stripe (réels uniquement) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="MRR"
          value={kpis ? formatCurrency(kpis.mrr, kpis.currency) : DONNEES_INDISPONIBLES}
          change={kpis?.mrrChange ?? undefined}
          icon={<DollarSign className="h-5 w-5 text-accent" />}
          loading={isLoading}
          unavailable={!kpis}
        />
        <MetricCard
          title="Abonnés Actifs"
          value={kpis ? kpis.activeSubscriptions.toString() : DONNEES_INDISPONIBLES}
          change={variationAbonnes}
          icon={<Users className="h-5 w-5 text-accent" />}
          loading={isLoading}
          unavailable={!kpis}
        />
        <MetricCard
          title="Taux de Churn"
          value={kpis?.churnRate != null ? `${kpis.churnRate}%` : DONNEES_INDISPONIBLES}
          change={kpis?.churnRateChange ?? undefined}
          icon={<TrendingDown className="h-5 w-5 text-accent" />}
          loading={isLoading}
          unavailable={!kpis || kpis.churnRate === null}
        />
        <MetricCard
          title="Clients réels nouveaux ce mois"
          value={kpis?.clients ? kpis.clients.nouveauxReelsCeMois.toString() : DONNEES_INDISPONIBLES}
          icon={<TrendingUp className="h-5 w-5 text-accent" />}
          loading={isLoading}
          unavailable={!kpis?.clients}
        />
      </div>

      {/* Funnel de conversion : aucune source (analytics) connectée */}
      <DonneesIndisponibles
        title="Funnel de Conversion"
        description="Parcours utilisateur de la visite à la récurrence"
        reason="Aucune source vérifiée n'est connectée (analytics de visites et d'inscriptions)."
      />

      {/* Analyse de cohortes - Composants dédiés */}
      <div className="grid gap-6 lg:grid-cols-2">
        <CohortRetentionTable />
        <ARPUTrendChart />
      </div>

      {/* LTV par Segment et Adoption des Features */}
      <div className="grid gap-6 lg:grid-cols-2">
        <LTVSegmentChart />
        <FeatureAdoptionChart />
      </div>

      {/* User Segmentation */}
      <UserSegmentation />

      {/* LTV et ROI : aucune donnée vérifiée (CAC et investissement marketing non suivis) */}
      <div className="grid md:grid-cols-2 gap-6">
        <DonneesIndisponibles
          title="Customer Lifetime Value"
          description="LTV, CAC et ratio LTV:CAC"
          reason="Le coût d'acquisition (CAC) n'est suivi dans aucune source vérifiée."
        />
        <DonneesIndisponibles
          title="ROI Marketing"
          description="ROI, investissement et revenus générés"
          reason="Aucune source vérifiée ne suit les dépenses marketing ni leur attribution."
        />
      </div>

      <MethodologyDisclosure
        sources={[
          kpis
            ? { name: "Stripe API", type: "api", refreshRate: "À chaque chargement", reliability: "verified", description: "MRR, abonnés, encaissements, nouveaux clients (churn non mesuré)" }
            : { name: "Stripe API", type: "api", reliability: "estimated", description: "Non connectée : aucune donnée affichée" },
        ]}
        calculations={[
          {
            metric: "Taux de churn",
            formula: "Non mesuré : Stripe ne donne que le statut actuel des abonnements, la base du 1er du mois n'est pas reconstituable",
            limitations: ["Toujours indisponible tant qu'un historique des statuts n'est pas conservé", "Aucune estimation n'est affichée à la place"],
          },
        ]}
        dataQuality={kpis ? "high" : "low"}
      />
    </div>
  );
}
