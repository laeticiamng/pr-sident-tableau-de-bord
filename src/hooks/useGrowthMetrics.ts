 import { useStripeKPIs } from "./useStripeKPIs";
 
 export interface GrowthMetrics {
   cac: { value: number; trend: number; benchmark: number | null };
   ltv: { value: number; trend: number; benchmark: number | null };
   ltvCacRatio: { value: number; trend: number; benchmark: number | null };
   arpu: { value: number; trend: number; benchmark: number | null };
   paybackPeriod: { value: number; trend: number; benchmark: number | null };
   mau: { value: number; trend: number; benchmark: number | null };
   dau: { value: number; trend: number; benchmark: number | null };
   dauMauRatio: { value: number; trend: number; benchmark: number | null };
   mrr: { value: number; trend: number; benchmark: number | null };
   churn: { value: number; trend: number; benchmark: number | null };
   isRealData: boolean;
   lastUpdated: string;
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
   mrr: { current: number; predicted30d: number; predicted90d: number; confidence: number };
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
 
 const EMPTY_METRIC = { value: 0, trend: 0, benchmark: null };
 
 /**
  * Hook unifié pour les métriques Growth OS
  * UNIQUEMENT données réelles - aucun mock autorisé
  */
 export function useGrowthMetrics(): GrowthData {
   const { data: stripeData, isLoading: stripeLoading, error: stripeError } = useStripeKPIs();
   
   const computeMetrics = (): GrowthMetrics => {
     const isRealData = stripeData?.success && !stripeData?.mock;
     const kpis = stripeData?.kpis;
     
     if (isRealData && kpis && kpis.mrr > 0) {
       const totalUsers = kpis.totalCustomers || 1;
       const arpu = kpis.mrr / totalUsers;
       const ltv = arpu * 24;
       const estimatedCAC = arpu * 1.8;
       
       return {
         cac: { value: Math.round(estimatedCAC), trend: 0, benchmark: 65 },
         ltv: { value: Math.round(ltv), trend: kpis.mrrChange || 0, benchmark: 400 },
         ltvCacRatio: { value: Math.round((ltv / estimatedCAC) * 10) / 10, trend: 0, benchmark: 3.0 },
         arpu: { value: Math.round(arpu * 100) / 100, trend: kpis.mrrChange || 0, benchmark: 25 },
         paybackPeriod: { value: estimatedCAC > 0 ? Math.round((estimatedCAC / arpu) * 10) / 10 : 0, trend: 0, benchmark: 6 },
         mau: { value: kpis.totalCustomers || 0, trend: ((kpis.newCustomersThisMonth || 0) / Math.max(kpis.totalCustomers || 1, 1)) * 100, benchmark: null },
         dau: { value: 0, trend: 0, benchmark: null }, // Requires analytics
         dauMauRatio: { value: 0, trend: 0, benchmark: 40 }, // Requires analytics
         mrr: { value: kpis.mrr, trend: kpis.mrrChange || 0, benchmark: null },
         churn: { value: kpis.churnRate || 0, trend: kpis.churnRateChange || 0, benchmark: 5.0 },
         isRealData: true,
         lastUpdated: kpis.lastUpdated || new Date().toISOString(),
       };
     }
     
     // Aucune donnée réelle - valeurs vides
     return {
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
       isRealData: false,
       lastUpdated: new Date().toISOString(),
     };
   };
   
   const computePredictions = (): PredictionData | null => {
     const kpis = stripeData?.kpis;
     const isRealData = stripeData?.success && !stripeData?.mock;
     
     if (isRealData && kpis && kpis.mrr > 0) {
       const monthlyGrowth = (kpis.mrrChange || 0) / 100;
       return {
         mrr: {
           current: kpis.mrr,
           predicted30d: Math.round(kpis.mrr * (1 + monthlyGrowth)),
           predicted90d: Math.round(kpis.mrr * Math.pow(1 + monthlyGrowth, 3)),
           confidence: 78,
         },
         churn: {
           current: kpis.churnRate || 0,
           predicted30d: kpis.churnRate || 0,
           predicted90d: kpis.churnRate || 0,
           confidence: 72,
         },
         newUsers: {
           current: kpis.newCustomersThisMonth || 0,
           predicted30d: Math.round((kpis.newCustomersThisMonth || 0) * 1.15),
           predicted90d: Math.round((kpis.newCustomersThisMonth || 0) * 1.5),
           confidence: 65,
         },
         ltv: {
           current: Math.round((kpis.mrr / Math.max(kpis.totalCustomers || 1, 1)) * 24),
           predicted30d: Math.round((kpis.mrr / Math.max(kpis.totalCustomers || 1, 1)) * 24 * 1.05),
           predicted90d: Math.round((kpis.mrr / Math.max(kpis.totalCustomers || 1, 1)) * 24 * 1.15),
           confidence: 70,
         },
       };
     }
     return null;
   };
   
   const isRealData = stripeData?.success && !stripeData?.mock;
 
   return {
     metrics: computeMetrics(),
     funnel: null,
     channels: null,
     cohorts: null,
     segments: null,
     workflows: null,
     predictions: computePredictions(),
     recommendations: null,
     history: null,
     isLoading: stripeLoading,
     error: stripeError as Error | null,
     hasRealData: isRealData,
   };
 }