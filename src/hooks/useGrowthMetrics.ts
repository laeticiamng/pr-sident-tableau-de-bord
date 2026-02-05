 import { useQuery } from "@tanstack/react-query";
 import { supabase } from "@/integrations/supabase/client";
 import { useStripeKPIs } from "./useStripeKPIs";
 import { 
   ACQUISITION_METRICS, 
   CONVERSION_FUNNEL, 
   CHANNEL_ATTRIBUTION,
   RETENTION_COHORTS,
   USER_SEGMENTS,
   AUTOMATION_WORKFLOWS,
   AI_PREDICTIONS,
   AI_RECOMMENDATIONS,
   GROWTH_HISTORY
 } from "@/lib/growth-data";
 
 export interface GrowthMetrics {
   // Core Acquisition Metrics
   cac: { value: number; trend: number; benchmark: number | null };
   ltv: { value: number; trend: number; benchmark: number | null };
   ltvCacRatio: { value: number; trend: number; benchmark: number | null };
   arpu: { value: number; trend: number; benchmark: number | null };
   paybackPeriod: { value: number; trend: number; benchmark: number | null };
   mau: { value: number; trend: number; benchmark: number | null };
   dau: { value: number; trend: number; benchmark: number | null };
   dauMauRatio: { value: number; trend: number; benchmark: number | null };
   
   // MRR from Stripe
   mrr: { value: number; trend: number; benchmark: number | null };
   churn: { value: number; trend: number; benchmark: number | null };
   
   // Source indicators
   isRealData: boolean;
   lastUpdated: string;
 }
 
 export interface GrowthData {
   metrics: GrowthMetrics;
   funnel: typeof CONVERSION_FUNNEL;
   channels: typeof CHANNEL_ATTRIBUTION;
   cohorts: typeof RETENTION_COHORTS;
   segments: typeof USER_SEGMENTS;
   workflows: typeof AUTOMATION_WORKFLOWS;
   predictions: typeof AI_PREDICTIONS;
   recommendations: typeof AI_RECOMMENDATIONS;
   history: typeof GROWTH_HISTORY;
   isLoading: boolean;
   error: Error | null;
 }
 
 /**
  * Hook unifié pour les métriques Growth OS
  * Fusionne données Stripe réelles + données calculées/mock
  */
 export function useGrowthMetrics(): GrowthData {
   const { data: stripeData, isLoading: stripeLoading, error: stripeError } = useStripeKPIs();
   
   // Calcul des métriques enrichies à partir de Stripe
   const computeMetrics = (): GrowthMetrics => {
     const isRealData = stripeData?.success && !stripeData?.mock;
     const kpis = stripeData?.kpis;
     
     if (isRealData && kpis && kpis.mrr > 0) {
       // Données réelles Stripe disponibles
       const totalUsers = kpis.totalCustomers || 1;
       const arpu = kpis.mrr / totalUsers;
       const ltv = arpu * 24; // Estimation LTV sur 24 mois avec churn
       const estimatedCAC = arpu * 1.8; // Estimation CAC basée sur payback ~1.8 mois
       
       return {
         cac: { 
           value: Math.round(estimatedCAC), 
           trend: -5.2, // Amélioration estimée
           benchmark: 65 
         },
         ltv: { 
           value: Math.round(ltv), 
           trend: kpis.mrrChange || 0, 
           benchmark: 400 
         },
         ltvCacRatio: { 
           value: Math.round((ltv / estimatedCAC) * 10) / 10, 
           trend: 5.2, 
           benchmark: 3.0 
         },
         arpu: { 
           value: Math.round(arpu * 100) / 100, 
           trend: kpis.mrrChange || 0, 
           benchmark: 25 
         },
         paybackPeriod: { 
           value: 1.8, 
           trend: -15.2, 
           benchmark: 6 
         },
         mau: { 
           value: kpis.totalCustomers || 0, 
           trend: ((kpis.newCustomersThisMonth || 0) / Math.max(kpis.totalCustomers || 1, 1)) * 100, 
           benchmark: null 
         },
         dau: { 
           value: Math.round((kpis.totalCustomers || 0) * 0.42), // Estimation DAU/MAU ~42%
           trend: 18.5, 
           benchmark: null 
         },
         dauMauRatio: { 
           value: 42, 
           trend: 3.2, 
           benchmark: 40 
         },
         mrr: { 
           value: kpis.mrr, 
           trend: kpis.mrrChange || 0, 
           benchmark: null 
         },
         churn: { 
           value: kpis.churnRate || 0, 
           trend: kpis.churnRateChange || 0, 
           benchmark: 5.0 
         },
         isRealData: true,
         lastUpdated: kpis.lastUpdated || new Date().toISOString(),
       };
     }
     
     // Fallback sur données mock
     return {
       ...ACQUISITION_METRICS,
       mrr: { value: 24500, trend: 6.9, benchmark: null },
       churn: { value: 3.2, trend: -0.4, benchmark: 5.0 },
       isRealData: false,
       lastUpdated: new Date().toISOString(),
     };
   };
   
   // Mise à jour des prédictions IA basées sur les données réelles
   const computePredictions = () => {
     const kpis = stripeData?.kpis;
     if (kpis && kpis.mrr > 0) {
       const monthlyGrowth = (kpis.mrrChange || 5) / 100;
       return {
         mrr: {
           current: kpis.mrr,
           predicted30d: Math.round(kpis.mrr * (1 + monthlyGrowth)),
           predicted90d: Math.round(kpis.mrr * Math.pow(1 + monthlyGrowth, 3)),
           confidence: 78,
         },
         churn: {
           current: kpis.churnRate || 3.2,
           predicted30d: Math.max(0, (kpis.churnRate || 3.2) - 0.3),
           predicted90d: Math.max(0, (kpis.churnRate || 3.2) - 0.8),
           confidence: 72,
         },
         newUsers: {
           current: kpis.newCustomersThisMonth || 0,
           predicted30d: Math.round((kpis.newCustomersThisMonth || 50) * 1.15),
           predicted90d: Math.round((kpis.newCustomersThisMonth || 50) * 1.5),
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
     return AI_PREDICTIONS;
   };
   
   // Mise à jour de l'historique avec les données réelles
   const computeHistory = () => {
     const kpis = stripeData?.kpis;
     if (kpis && kpis.mrr > 0) {
       // Inject real current data into history
       const updatedHistory = [...GROWTH_HISTORY];
       const lastIdx = updatedHistory.length - 1;
       updatedHistory[lastIdx] = {
         ...updatedHistory[lastIdx],
         mrr: kpis.mrr,
         users: kpis.totalCustomers || updatedHistory[lastIdx].users,
         churn: kpis.churnRate || updatedHistory[lastIdx].churn,
       };
       return updatedHistory;
     }
     return GROWTH_HISTORY;
   };
 
   return {
     metrics: computeMetrics(),
     funnel: CONVERSION_FUNNEL,
     channels: CHANNEL_ATTRIBUTION,
     cohorts: RETENTION_COHORTS,
     segments: USER_SEGMENTS,
     workflows: AUTOMATION_WORKFLOWS,
     predictions: computePredictions(),
     recommendations: AI_RECOMMENDATIONS,
     history: computeHistory(),
     isLoading: stripeLoading,
     error: stripeError as Error | null,
   };
 }