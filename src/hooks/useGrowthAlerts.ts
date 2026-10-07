 import { useEffect, useMemo } from "react";
 import { useGrowthMetrics } from "./useGrowthMetrics";
 import { useRealtimeNotifications } from "./useRealtimeNotifications";
 
 export interface GrowthAlert {
   id: string;
   type: "churn_risk" | "growth_opportunity" | "benchmark_warning" | "milestone";
   severity: "low" | "medium" | "high" | "critical";
   title: string;
   message: string;
   metric: string;
   value: number;
   threshold: number;
   action?: string;
 }
 
 // Thresholds for alert detection
 const THRESHOLDS = {
   churn: {
     warning: 4.0,    // Churn > 4% = warning
     critical: 6.0,   // Churn > 6% = critical
   },
   ltvCacRatio: {
     minimum: 3.0,    // LTV:CAC < 3 = warning
     excellent: 5.0,  // LTV:CAC > 5 = opportunity
   },
   mrrGrowth: {
     stagnation: 2.0, // Growth < 2% = warning
     excellent: 15.0, // Growth > 15% = milestone
   },
   dauMauRatio: {
     low: 30,         // DAU/MAU < 30% = low engagement
     high: 50,        // DAU/MAU > 50% = excellent engagement
   },
 };
 
 export function useGrowthAlerts() {
   const { metrics, predictions, isLoading } = useGrowthMetrics();
   const { addNotification } = useRealtimeNotifications({ showToasts: false });
 
   // Analyze metrics and generate alerts
   const alerts = useMemo<GrowthAlert[]>(() => {
     // Ne générer des alertes que si on a des données réelles
     if (isLoading || !metrics || !metrics.isRealData) return [];
     
     const newAlerts: GrowthAlert[] = [];
 
     // 1. Churn Risk Detection
     if (metrics.churn.value > 0 && metrics.churn.value >= THRESHOLDS.churn.critical) {
       newAlerts.push({
         id: "churn_critical",
         type: "churn_risk",
         severity: "critical",
         title: "🚨 Churn Critique Détecté",
         message: `Le taux de churn (${metrics.churn.value}%) dépasse le seuil critique de ${THRESHOLDS.churn.critical}%. Action immédiate requise.`,
         metric: "churn",
         value: metrics.churn.value,
         threshold: THRESHOLDS.churn.critical,
         action: "Lancer une campagne de rétention urgente",
       });
     } else if (metrics.churn.value > 0 && metrics.churn.value >= THRESHOLDS.churn.warning) {
       newAlerts.push({
         id: "churn_warning",
         type: "churn_risk",
         severity: "high",
         title: "⚠️ Risque de Churn Élevé",
         message: `Le taux de churn (${metrics.churn.value}%) approche du seuil critique. Surveiller de près.`,
         metric: "churn",
         value: metrics.churn.value,
         threshold: THRESHOLDS.churn.warning,
         action: "Analyser les segments à risque",
       });
     }
 
     // 2. Churn Prediction Alert
     if (predictions && predictions.churn.predicted30d > metrics.churn.value + 1) {
       newAlerts.push({
         id: "churn_prediction",
         type: "churn_risk",
         severity: "medium",
         title: "📈 Hausse du Churn Prédite",
         message: `L'IA prédit une augmentation du churn à ${predictions.churn.predicted30d.toFixed(1)}% dans 30 jours.`,
         metric: "churn_predicted",
         value: predictions.churn.predicted30d,
         threshold: metrics.churn.value,
         action: "Activer les workflows de rétention préventive",
       });
     }
 
     // 3. LTV:CAC Ratio Alerts
     if (metrics.ltvCacRatio.value > 0 && metrics.ltvCacRatio.value < THRESHOLDS.ltvCacRatio.minimum) {
       newAlerts.push({
         id: "ltv_cac_low",
         type: "benchmark_warning",
         severity: "high",
         title: "⚠️ Ratio LTV:CAC Insuffisant",
         message: `Le ratio LTV:CAC (${metrics.ltvCacRatio.value}x) est inférieur au minimum viable de ${THRESHOLDS.ltvCacRatio.minimum}x.`,
         metric: "ltvCacRatio",
         value: metrics.ltvCacRatio.value,
         threshold: THRESHOLDS.ltvCacRatio.minimum,
         action: "Optimiser les canaux d'acquisition ou augmenter la rétention",
       });
     } else if (metrics.ltvCacRatio.value >= THRESHOLDS.ltvCacRatio.excellent) {
       newAlerts.push({
         id: "ltv_cac_excellent",
         type: "growth_opportunity",
         severity: "low",
         title: "🚀 Excellente Rentabilité Acquisition",
         message: `Le ratio LTV:CAC de ${metrics.ltvCacRatio.value}x permet d'accélérer l'investissement marketing.`,
         metric: "ltvCacRatio",
         value: metrics.ltvCacRatio.value,
         threshold: THRESHOLDS.ltvCacRatio.excellent,
         action: "Augmenter le budget acquisition sur les canaux performants",
       });
     }
 
     // 4. MRR Growth Opportunities (uniquement si la variation du MRR est mesurée)
     const mrrTrend = metrics.mrr.trend;
     if (mrrTrend === null) {
       // Variation du MRR non mesurée : aucune alerte de croissance.
     } else if (metrics.mrr.value > 0 && mrrTrend >= THRESHOLDS.mrrGrowth.excellent) {
       newAlerts.push({
         id: "mrr_growth_milestone",
         type: "milestone",
         severity: "low",
         title: "🎉 Croissance Exceptionnelle",
         message: `La croissance MRR de +${mrrTrend.toFixed(1)}% ce mois dépasse l'objectif de ${THRESHOLDS.mrrGrowth.excellent}%.`,
         metric: "mrr_growth",
         value: mrrTrend,
         threshold: THRESHOLDS.mrrGrowth.excellent,
         action: "Capitaliser sur le momentum",
       });
     } else if (metrics.mrr.value > 0 && mrrTrend < THRESHOLDS.mrrGrowth.stagnation && mrrTrend !== 0) {
       newAlerts.push({
         id: "mrr_stagnation",
         type: "benchmark_warning",
         severity: "medium",
         title: "📊 Croissance Ralentie",
         message: `La croissance MRR (${mrrTrend > 0 ? "+" : ""}${mrrTrend.toFixed(1)}%) est inférieure à l'objectif minimal de ${THRESHOLDS.mrrGrowth.stagnation}%.`,
         metric: "mrr_growth",
         value: mrrTrend,
         threshold: THRESHOLDS.mrrGrowth.stagnation,
         action: "Revoir la stratégie d'acquisition et d'expansion",
       });
     }
 
     // 5. Engagement Alerts
     // DAU/MAU alerts only if we have analytics data (value > 0)
     if (metrics.dauMauRatio.value > 0) {
       if (metrics.dauMauRatio.value < THRESHOLDS.dauMauRatio.low) {
         newAlerts.push({
           id: "engagement_low",
           type: "churn_risk",
           severity: "medium",
           title: "📉 Engagement Faible",
           message: `Le ratio DAU/MAU de ${metrics.dauMauRatio.value}% indique un engagement insuffisant.`,
           metric: "dauMauRatio",
           value: metrics.dauMauRatio.value,
           threshold: THRESHOLDS.dauMauRatio.low,
           action: "Améliorer l'onboarding et les notifications push",
         });
       } else if (metrics.dauMauRatio.value >= THRESHOLDS.dauMauRatio.high) {
         newAlerts.push({
           id: "engagement_excellent",
           type: "growth_opportunity",
           severity: "low",
           title: "⭐ Engagement Exemplaire",
           message: `Le ratio DAU/MAU de ${metrics.dauMauRatio.value}% témoigne d'une forte adhésion produit.`,
           metric: "dauMauRatio",
           value: metrics.dauMauRatio.value,
           threshold: THRESHOLDS.dauMauRatio.high,
           action: "Exploiter pour le referral et l'upsell",
         });
       }
     }
 
     // 6. MRR Prediction Opportunity
     if (predictions?.mrr && predictions.mrr.current > 0) {
       const mrrGrowthPredicted = ((predictions.mrr.predicted90d - predictions.mrr.current) / predictions.mrr.current) * 100;
       if (mrrGrowthPredicted >= 25) {
         newAlerts.push({
           id: "mrr_prediction_opportunity",
           type: "growth_opportunity",
           severity: "low",
           title: "📈 Potentiel de Croissance Fort",
           message: `L'IA prédit +${mrrGrowthPredicted.toFixed(0)}% de MRR sur 90 jours (€${predictions.mrr.predicted90d.toLocaleString("fr-FR")}).`,
           metric: "mrr_predicted",
           value: predictions.mrr.predicted90d,
           threshold: predictions.mrr.current * 1.25,
           action: "Préparer l'infrastructure pour la montée en charge",
         });
       }
     }
 
     return newAlerts;
   }, [metrics, predictions, isLoading]);
 
   // Separate alerts by type
   const churnAlerts = alerts.filter(a => a.type === "churn_risk");
   const opportunityAlerts = alerts.filter(a => a.type === "growth_opportunity" || a.type === "milestone");
   const warningAlerts = alerts.filter(a => a.type === "benchmark_warning");
   const criticalAlerts = alerts.filter(a => a.severity === "critical" || a.severity === "high");
 
   return {
     alerts,
     churnAlerts,
     opportunityAlerts,
     warningAlerts,
     criticalAlerts,
     hasAlerts: alerts.length > 0,
     hasCritical: criticalAlerts.length > 0,
     isLoading,
   };
 }