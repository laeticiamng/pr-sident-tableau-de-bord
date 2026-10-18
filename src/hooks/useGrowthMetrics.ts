 import { useStripeKPIs } from "./useStripeKPIs";

 /**
  * Métrique Growth : `value === null` signifie « Données indisponibles » (aucune source
  * vérifiée) ; ne jamais lui substituer 0 ni une estimation. `trend === null` : variation
  * non mesurée. `benchmark` reste null : aucune référence sectorielle n'est sourcée.
  */
 export interface MetricValue {
   value: number | null;
   trend: number | null;
   benchmark: number | null;
 }

 export interface GrowthMetrics {
   /** Indisponible : le coût d'acquisition n'est suivi dans aucune source vérifiée. */
   cac: MetricValue;
   /** Indisponible : une LTV exige un CAC / une durée de vie mesurés, pas une estimation. */
   ltv: MetricValue;
   ltvCacRatio: MetricValue;
   /** MRR ÷ abonnements actifs (Stripe), quand il y a au moins un abonnement actif. */
   arpu: MetricValue;
   paybackPeriod: MetricValue;
   /** Indisponible : nécessite un analytics produit (les clients Stripe ne sont pas des MAU). */
   mau: MetricValue;
   dau: MetricValue;
   dauMauRatio: MetricValue;
   /** trend : variation du MRR en % ; null quand elle n'est pas mesurée (affichée « — »). */
   mrr: MetricValue;
   /** Churn mensuel Stripe en % ; null si non mesurable. */
   churn: MetricValue;
   isRealData: boolean;
   lastUpdated: string | null;
 }
 
 export interface FunnelStage {
   stage: string;
   count: number;
   rate: number;
   color: string;
 }
 
 export interface ChannelData {
   channel: string;
   leads: number;
   revenue: number;
   cac: number;
   roi: number;
 }
 
 export interface CohortData {
   cohort: string;
   m0: number;
   m1: number;
   m2: number;
   m3: number;
   m4: number;
   m5: number;
 }
 
 export interface SegmentData {
   segment: string;
   users: number;
   ltv: number;
   churnRisk: string;
   engagement: number;
 }
 
 export interface WorkflowData {
   id: string;
   name: string;
   status: string;
   triggers: number;
   conversions: number;
   conversionRate: number;
   lastRun: string;
 }
 
 export interface PredictionData {
   /** null : pas de projection du MRR sans variation du MRR réellement mesurée. */
   mrr: { current: number; predicted30d: number; predicted90d: number; confidence: number } | null;
   churn: { current: number; predicted30d: number; predicted90d: number; confidence: number };
   newUsers: { current: number; predicted30d: number; predicted90d: number; confidence: number };
   ltv: { current: number; predicted30d: number; predicted90d: number; confidence: number };
 }
 
 export interface RecommendationData {
   id: string;
   priority: string;
   category: string;
   title: string;
   description: string;
   impact: string;
   confidence: number;
   effort: string;
 }
 
 export interface HistoryData {
   month: string;
   mrr: number;
   users: number;
   churn: number;
 }
 
 export interface GrowthData {
   metrics: GrowthMetrics;
   funnel: FunnelStage[] | null;
   channels: ChannelData[] | null;
   cohorts: CohortData[] | null;
   segments: SegmentData[] | null;
   workflows: WorkflowData[] | null;
   predictions: PredictionData | null;
   recommendations: RecommendationData[] | null;
   history: HistoryData[] | null;
   isLoading: boolean;
   error: Error | null;
   hasRealData: boolean;
 }
 
 const EMPTY_METRIC: MetricValue = { value: null, trend: null, benchmark: null };

/**
 * Hook unifié pour les métriques Growth OS
 * UNIQUEMENT données réelles - aucun mock, aucune estimation.
 * Sont exposés : MRR, ARPU (MRR ÷ abonnements actifs) et churn, tous issus de Stripe.
 * CAC, LTV, LTV:CAC, payback, MAU/DAU et prédictions n'ont pas de source vérifiée :
 * ils restent indisponibles (null).
 */
export function useGrowthMetrics(): GrowthData {
  const { data: stripeData, isLoading: stripeLoading, error: stripeError } = useStripeKPIs();

  const kpis = stripeData?.available === true ? stripeData.kpis : null;

  const computeMetrics = (): GrowthMetrics => {
    if (kpis) {
      // Variation du MRR : null si non mesurée. Ne jamais lui substituer la variation des
      // encaissements (paiements ponctuels/annuels, mois partiel).
      const mrrTrend = typeof kpis.mrrChange === "number" ? kpis.mrrChange : null;
      const arpu = kpis.activeSubscriptions > 0 ? Math.round((kpis.mrr / kpis.activeSubscriptions) * 100) / 100 : null;

      return {
        ...INDISPONIBLES,
        arpu: { value: arpu, trend: null, benchmark: null },
        mrr: { value: kpis.mrr, trend: mrrTrend, benchmark: null },
        churn: { value: kpis.churnRate, trend: kpis.churnRateChange, benchmark: null },
        isRealData: true,
        lastUpdated: kpis.lastUpdated || null,
      };
    }

    // Aucune donnée réelle : toutes les métriques sont indisponibles
    return { ...INDISPONIBLES, isRealData: false, lastUpdated: null };
  };

  return {
    metrics: computeMetrics(),
    funnel: null,
    channels: null,
    cohorts: null,
    segments: null,
    workflows: null,
    // Aucune projection : les extrapolations (+15 %, confiance fixe…) étaient des inventions.
    predictions: null,
    recommendations: null,
    history: null,
    isLoading: stripeLoading,
    error: stripeError as Error | null,
    hasRealData: kpis !== null,
  };
}

const INDISPONIBLES = {
  cac: EMPTY_METRIC,
  ltv: EMPTY_METRIC,
  ltvCacRatio: EMPTY_METRIC,
  arpu: EMPTY_METRIC,
  paybackPeriod: EMPTY_METRIC,
  mau: EMPTY_METRIC,
  dau: EMPTY_METRIC,
  dauMauRatio: EMPTY_METRIC,
  mrr: EMPTY_METRIC,
  churn: EMPTY_METRIC,
};
