 /**
  * Growth OS — Données stratégiques pour le pilotage de croissance
  * Intelligence Marketing, Acquisition, Automatisation, Prédictions IA
  */
 
 // Métriques d'acquisition détaillées
 export const ACQUISITION_METRICS = {
   cac: { value: 52, trend: -8.5, benchmark: 65 },
   ltv: { value: 487, trend: 12.3, benchmark: 400 },
   ltvCacRatio: { value: 9.4, trend: 5.2, benchmark: 3.0 },
   arpu: { value: 29.50, trend: 4.1, benchmark: 25 },
   paybackPeriod: { value: 1.8, trend: -15.2, benchmark: 6 },
   mau: { value: 4520, trend: 18.5, benchmark: null },
   dau: { value: 1890, trend: 22.1, benchmark: null },
   dauMauRatio: { value: 41.8, trend: 3.2, benchmark: 40 },
 };
 
 // Funnel de conversion multi-étapes
 export const CONVERSION_FUNNEL = [
   { stage: "Visiteurs", count: 12450, rate: 100, color: "hsl(var(--muted-foreground))" },
   { stage: "Leads", count: 2490, rate: 20, color: "hsl(var(--platform-social))" },
   { stage: "MQL", count: 747, rate: 30, color: "hsl(var(--platform-compass))" },
   { stage: "SQL", count: 299, rate: 40, color: "hsl(var(--platform-growth))" },
   { stage: "Opportunités", count: 134, rate: 45, color: "hsl(var(--warning))" },
   { stage: "Clients", count: 54, rate: 40, color: "hsl(var(--success))" },
 ];
 
 // Attribution par canal
 export const CHANNEL_ATTRIBUTION = [
   { channel: "Organique", leads: 890, revenue: 45200, cac: 12, roi: 8.5 },
   { channel: "Paid Search", leads: 520, revenue: 28900, cac: 48, roi: 3.2 },
   { channel: "Social Ads", leads: 380, revenue: 19500, cac: 62, roi: 2.1 },
   { channel: "Email", leads: 420, revenue: 32100, cac: 8, roi: 12.4 },
   { channel: "Referral", leads: 280, revenue: 24800, cac: 22, roi: 6.8 },
 ];
 
 // Cohortes de rétention
 export const RETENTION_COHORTS = [
   { cohort: "Jan 2026", m0: 100, m1: 78, m2: 62, m3: 55, m4: 48, m5: 42 },
   { cohort: "Déc 2025", m0: 100, m1: 75, m2: 58, m3: 52, m4: 45, m5: 40 },
   { cohort: "Nov 2025", m0: 100, m1: 72, m2: 55, m3: 48, m4: 42, m5: 38 },
   { cohort: "Oct 2025", m0: 100, m1: 70, m2: 52, m3: 46, m4: 40, m5: 36 },
   { cohort: "Sep 2025", m0: 100, m1: 68, m2: 50, m3: 44, m4: 38, m5: 34 },
 ];
 
 // Segments utilisateurs avec LTV
 export const USER_SEGMENTS = [
   { segment: "Champions", users: 245, ltv: 1250, churnRisk: "low", engagement: 95 },
   { segment: "Loyaux", users: 890, ltv: 680, churnRisk: "low", engagement: 78 },
   { segment: "Potentiels", users: 1120, ltv: 420, churnRisk: "medium", engagement: 55 },
   { segment: "À risque", users: 450, ltv: 280, churnRisk: "high", engagement: 25 },
   { segment: "Dormants", users: 320, ltv: 120, churnRisk: "critical", engagement: 8 },
 ];
 
 // Workflows d'automatisation actifs
 export const AUTOMATION_WORKFLOWS = [
   { 
     id: "wf-1", 
     name: "Onboarding Séquence", 
     status: "active", 
     triggers: 1245, 
     conversions: 892,
     conversionRate: 71.6,
     lastRun: "2026-02-05T08:30:00Z"
   },
   { 
     id: "wf-2", 
     name: "Réactivation Dormants", 
     status: "active", 
     triggers: 320, 
     conversions: 48,
     conversionRate: 15.0,
     lastRun: "2026-02-04T14:00:00Z"
   },
   { 
     id: "wf-3", 
     name: "Upsell Premium", 
     status: "active", 
     triggers: 560, 
     conversions: 78,
     conversionRate: 13.9,
     lastRun: "2026-02-05T06:00:00Z"
   },
   { 
     id: "wf-4", 
     name: "Churn Prevention", 
     status: "paused", 
     triggers: 145, 
     conversions: 34,
     conversionRate: 23.4,
     lastRun: "2026-02-03T12:00:00Z"
   },
   { 
     id: "wf-5", 
     name: "NPS Follow-up", 
     status: "active", 
     triggers: 892, 
     conversions: 156,
     conversionRate: 17.5,
     lastRun: "2026-02-05T10:00:00Z"
   },
 ];
 
 // Prédictions IA de croissance
 export const AI_PREDICTIONS = {
   mrr: {
     current: 24500,
     predicted30d: 27800,
     predicted90d: 38500,
     confidence: 82,
   },
   churn: {
     current: 3.2,
     predicted30d: 2.8,
     predicted90d: 2.2,
     confidence: 75,
   },
   newUsers: {
     current: 156,
     predicted30d: 185,
     predicted90d: 245,
     confidence: 68,
   },
   ltv: {
     current: 487,
     predicted30d: 520,
     predicted90d: 580,
     confidence: 71,
   },
 };
 
 // Recommandations stratégiques IA
 export const AI_RECOMMENDATIONS = [
   {
     id: "rec-1",
     priority: "high",
     category: "acquisition",
     title: "Augmenter le budget Email Marketing",
     description: "Le ROI email (12.4x) surpasse tous les autres canaux. Recommandation : +40% budget.",
     impact: "+€8,500/mois MRR",
     confidence: 88,
     effort: "low",
   },
   {
     id: "rec-2",
     priority: "high",
     category: "retention",
     title: "Programme de réactivation ciblé",
     description: "320 utilisateurs dormants représentent €38,400 LTV potentiel. Séquence de 5 emails recommandée.",
     impact: "+€12,000 LTV récupéré",
     confidence: 72,
     effort: "medium",
   },
   {
     id: "rec-3",
     priority: "medium",
     category: "conversion",
     title: "Optimiser le funnel MQL→SQL",
     description: "Taux de conversion 40% inférieur au benchmark. A/B test sur la page démo suggéré.",
     impact: "+15% conversions",
     confidence: 65,
     effort: "medium",
   },
   {
     id: "rec-4",
     priority: "medium",
     category: "expansion",
     title: "Lancer programme de referral",
     description: "CAC referral (€22) 58% inférieur à la moyenne. Programme de parrainage recommandé.",
     impact: "+80 nouveaux clients/trimestre",
     confidence: 78,
     effort: "high",
   },
 ];
 
 // Benchmarks sectoriels
 export const INDUSTRY_BENCHMARKS = {
   saas: {
     churn: { value: 5.0, label: "SaaS B2B Moyen" },
     ltvCac: { value: 3.0, label: "Seuil rentabilité" },
     nps: { value: 40, label: "Excellent SaaS" },
     payback: { value: 12, label: "Standard SaaS" },
   },
   healthtech: {
     churn: { value: 3.5, label: "HealthTech Moyen" },
     retention: { value: 85, label: "Top 25% secteur" },
     growth: { value: 15, label: "Croissance saine" },
   },
 };
 
 // Données de croissance historiques
 export const GROWTH_HISTORY = [
   { month: "Sep 2025", mrr: 18200, users: 3200, churn: 4.2 },
   { month: "Oct 2025", mrr: 19800, users: 3580, churn: 3.8 },
   { month: "Nov 2025", mrr: 21500, users: 3950, churn: 3.5 },
   { month: "Déc 2025", mrr: 23100, users: 4280, churn: 3.4 },
   { month: "Jan 2026", mrr: 24500, users: 4520, churn: 3.2 },
   { month: "Fév 2026", mrr: 26200, users: 4890, churn: 3.0 },
 ];