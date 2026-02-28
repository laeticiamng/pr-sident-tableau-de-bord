/**
 * Run Types Registry — Source unique de vérité pour tous les run types
 * Utilisé par AgentMonitoringDashboard, AICostWidget, et run-engine
 */

export const RUN_TYPES_REGISTRY = {
  DAILY_EXECUTIVE_BRIEF: {
    label: "Brief Exécutif Quotidien",
    agent: { name: "CEO Agent", role: "Directeur Général", emoji: "👔" },
    model: "gemini-2.5-pro",
    costEstimate: 0.10,
  },
  CEO_STANDUP_MEETING: {
    label: "Réunion Standup DG",
    agent: { name: "CEO Agent", role: "Directeur Général", emoji: "👔" },
    model: "gemini-3-flash",
    costEstimate: 0.05,
  },
  PLATFORM_STATUS_REVIEW: {
    label: "Revue de Statut Plateforme",
    agent: { name: "CTO Agent", role: "Directeur Technique", emoji: "⚙️" },
    model: "gemini-2.5-flash",
    costEstimate: 0.02,
  },
  SECURITY_AUDIT_RLS: {
    label: "Audit Sécurité RLS",
    agent: { name: "CISO Agent", role: "Directeur Sécurité", emoji: "🔒" },
    model: "gemini-2.5-pro",
    costEstimate: 0.18,
  },
  RELEASE_GATE_CHECK: {
    label: "Vérification Gate Release",
    agent: { name: "CTO Agent", role: "Directeur Technique", emoji: "⚙️" },
    model: "gemini-2.5-pro",
    costEstimate: 0.12,
  },
  DEPLOY_TO_PRODUCTION: {
    label: "Déploiement Production",
    agent: { name: "CTO Agent", role: "Directeur Technique", emoji: "⚙️" },
    model: "gemini-2.5-pro",
    costEstimate: 0.15,
  },
  RLS_POLICY_UPDATE: {
    label: "Modification Politique RLS",
    agent: { name: "CISO Agent", role: "Directeur Sécurité", emoji: "🔒" },
    model: "gemini-2.5-pro",
    costEstimate: 0.20,
  },
  COMPETITIVE_ANALYSIS: {
    label: "Analyse Concurrentielle",
    agent: { name: "CSO Agent", role: "Directeur Stratégie", emoji: "🎯" },
    model: "gemini-2.5-pro",
    costEstimate: 0.25,
  },
  QUALITY_AUDIT: {
    label: "Audit Qualité",
    agent: { name: "CTO Agent", role: "Directeur Technique", emoji: "⚙️" },
    model: "gemini-2.5-pro",
    costEstimate: 0.15,
  },
  ADS_PERFORMANCE_REVIEW: {
    label: "Revue Performance Publicitaire",
    agent: { name: "CMO Agent", role: "Directeur Marketing", emoji: "📣" },
    model: "gemini-2.5-flash",
    costEstimate: 0.10,
  },
  GROWTH_STRATEGY_REVIEW: {
    label: "Revue Stratégie Croissance",
    agent: { name: "CGO Agent", role: "Directeur Croissance", emoji: "📈" },
    model: "gemini-2.5-pro",
    costEstimate: 0.22,
  },
  OKR_QUARTERLY_REVIEW: {
    label: "Revue OKR Trimestrielle",
    agent: { name: "COO Agent", role: "Directeur Opérations", emoji: "📋" },
    model: "gemini-2.5-flash",
    costEstimate: 0.08,
  },
  COMPLIANCE_RGPD_CHECK: {
    label: "Vérification Conformité RGPD",
    agent: { name: "DPO Agent", role: "Délégué Protection Données", emoji: "🛡️" },
    model: "gemini-2.5-pro",
    costEstimate: 0.16,
  },
  SEO_AUDIT: {
    label: "Audit SEO",
    agent: { name: "CMO Agent", role: "Directeur Marketing", emoji: "📣" },
    model: "gemini-2.5-flash",
    costEstimate: 0.20,
  },
  CONTENT_CALENDAR_PLAN: {
    label: "Plan Calendrier Éditorial",
    agent: { name: "CMO Agent", role: "Directeur Marketing", emoji: "📣" },
    model: "gemini-3-flash",
    costEstimate: 0.06,
  },
  REVENUE_FORECAST: {
    label: "Prévisions Revenus",
    agent: { name: "CFO Agent", role: "Directeur Financier", emoji: "💰" },
    model: "gemini-2.5-pro",
    costEstimate: 0.14,
  },
  LEAD_SCORING_UPDATE: {
    label: "Mise à Jour Scoring Leads",
    agent: { name: "CGO Agent", role: "Directeur Croissance", emoji: "📈" },
    model: "gemini-2.5-flash",
    costEstimate: 0.07,
  },
  FINANCIAL_REPORT: {
    label: "Rapport Financier",
    agent: { name: "CFO Agent", role: "Directeur Financier", emoji: "💰" },
    model: "gemini-2.5-pro",
    costEstimate: 0.12,
  },
  RGPD_AUDIT: {
    label: "Audit RGPD",
    agent: { name: "DPO Agent", role: "Délégué Protection Données", emoji: "🛡️" },
    model: "gemini-2.5-pro",
    costEstimate: 0.16,
  },
  VULNERABILITY_SCAN: {
    label: "Scan Vulnérabilités",
    agent: { name: "CISO Agent", role: "Directeur Sécurité", emoji: "🔒" },
    model: "gemini-2.5-pro",
    costEstimate: 0.18,
  },
  ROADMAP_UPDATE: {
    label: "Mise à Jour Roadmap",
    agent: { name: "CPO Agent", role: "Directeur Produit", emoji: "🗺️" },
    model: "gemini-2.5-flash",
    costEstimate: 0.08,
  },
  CODE_REVIEW: {
    label: "Revue de Code",
    agent: { name: "CTO Agent", role: "Directeur Technique", emoji: "⚙️" },
    model: "gemini-2.5-pro",
    costEstimate: 0.12,
  },
  DEPLOYMENT_CHECK: {
    label: "Vérification Déploiements",
    agent: { name: "CTO Agent", role: "Directeur Technique", emoji: "⚙️" },
    model: "gemini-2.5-flash",
    costEstimate: 0.06,
  },
  DATA_INSIGHTS_REPORT: {
    label: "Rapport Insights Data",
    agent: { name: "CDO Agent", role: "Directeur Data", emoji: "📊" },
    model: "gemini-2.5-pro",
    costEstimate: 0.14,
  },
  AGENT_PERFORMANCE_REVIEW: {
    label: "Revue Performance Agents",
    agent: { name: "COO Agent", role: "Directeur Opérations", emoji: "📋" },
    model: "gemini-2.5-flash",
    costEstimate: 0.08,
  },
  TECH_WATCH_REPORT: {
    label: "Rapport Veille Technologique",
    agent: { name: "CTO Agent", role: "Directeur Technique", emoji: "⚙️" },
    model: "gemini-2.5-flash",
    costEstimate: 0.10,
  },
  MARKETING_WEEK_PLAN: {
    label: "Plan Marketing Hebdomadaire",
    agent: { name: "CMO Agent", role: "Directeur Marketing", emoji: "📣" },
    model: "gemini-3-flash",
    costEstimate: 0.04,
  },
  MASS_EMAIL_CAMPAIGN: {
    label: "Campagne Email de Masse",
    agent: { name: "CMO Agent", role: "Directeur Marketing", emoji: "📣" },
    model: "gemini-2.5-pro",
    costEstimate: 0.15,
  },
  PRICING_CHANGE: {
    label: "Modification Tarifs",
    agent: { name: "CFO Agent", role: "Directeur Financier", emoji: "💰" },
    model: "gemini-2.5-pro",
    costEstimate: 0.20,
  },
} as const;

/** Union type of all valid run type keys */
export type RunType = keyof typeof RUN_TYPES_REGISTRY;

/** All run type keys as array */
export const ALL_RUN_TYPES = Object.keys(RUN_TYPES_REGISTRY) as RunType[];

/** Default fallback cost for unknown run types */
export const DEFAULT_RUN_COST = 0.05;

/** Get cost estimate for a run type, with fallback */
export function getRunCost(runType: string): number {
  return (RUN_TYPES_REGISTRY as Record<string, { costEstimate: number }>)[runType]?.costEstimate ?? DEFAULT_RUN_COST;
}

/** Get agent info for a run type */
export function getRunAgent(runType: string) {
  return (RUN_TYPES_REGISTRY as Record<string, { agent: { name: string; role: string; emoji: string } }>)[runType]?.agent ?? { name: "Agent IA", role: "Agent", emoji: "🤖" };
}

/** Get model for a run type */
export function getRunModel(runType: string): string {
  return (RUN_TYPES_REGISTRY as Record<string, { model: string }>)[runType]?.model ?? "gemini-flash";
}

/** Get label for a run type */
export function getRunLabel(runType: string): string {
  return (RUN_TYPES_REGISTRY as Record<string, { label: string }>)[runType]?.label ?? runType.replace(/_/g, " ");
}
