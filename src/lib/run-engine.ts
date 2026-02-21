/**
 * Run Engine - Moteur de "Runs" structuré
 * Chaque action devient une exécution structurée avec type, étapes, preuves et actions proposées
 */

export type RunRiskLevel = "low" | "medium" | "high" | "critical";

export type RunStatus = "pending" | "running" | "awaiting_approval" | "completed" | "failed" | "cancelled";

export interface RunStep {
  id: string;
  name: string;
  status: "pending" | "running" | "completed" | "failed" | "skipped";
  startedAt?: string;
  completedAt?: string;
  output?: string;
  error?: string;
}

export interface EvidenceBundle {
  github?: {
    commits: Array<{ sha: string; message: string; date: string; author: string }>;
    issues: Array<{ number: number; title: string; state: string }>;
    pullRequests: Array<{ number: number; title: string; state: string }>;
  };
  metrics?: {
    uptime?: number;
    responseTime?: number;
    errorRate?: number;
    activeUsers?: number;
  };
  logs?: Array<{ timestamp: string; level: string; message: string }>;
  intelligence?: {
    source: string;
    query: string;
    response: string;
    citations?: string[];
  };
}

export interface ProposedAction {
  id: string;
  title: string;
  description: string;
  riskLevel: RunRiskLevel;
  requiresApproval: boolean;
  autoExecutable: boolean;
  payload?: Record<string, unknown>;
}

export interface StructuredRun {
  id: string;
  type: string;
  title: string;
  description: string;
  platformKey?: string;
  directorAgentId?: string;
  status: RunStatus;
  riskLevel: RunRiskLevel;
  steps: RunStep[];
  evidenceBundle: EvidenceBundle;
  proposedActions: ProposedAction[];
  executiveSummary?: string;
  aiJustification?: string;
  dataSources: string[];
  modelUsed?: string;
  ownerRequested: boolean;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
}

// Configuration des types de runs
export const RUN_TYPE_CONFIG: Record<string, {
  title: string;
  description: string;
  riskLevel: RunRiskLevel;
  steps: string[];
  requiresApproval: boolean;
  autoExecutable: boolean;
}> = {
  DAILY_EXECUTIVE_BRIEF: {
    title: "Brief Exécutif Quotidien",
    description: "Synthèse stratégique quotidienne avec données GitHub et veille marché",
    riskLevel: "low",
    steps: ["Sync GitHub", "Collecte métriques", "Veille marché", "Synthèse IA", "Recommandations"],
    requiresApproval: false,
    autoExecutable: true,
  },
  CEO_STANDUP_MEETING: {
    title: "Réunion Standup DG",
    description: "Compte-rendu de réunion exécutive avec points d'action",
    riskLevel: "low",
    steps: ["Préparation agenda", "Tour de table", "Synthèse", "Plan d'action"],
    requiresApproval: false,
    autoExecutable: true,
  },
  PLATFORM_STATUS_REVIEW: {
    title: "Revue de Statut Plateforme",
    description: "Analyse approfondie d'une plateforme avec données réelles",
    riskLevel: "low",
    steps: ["Fetch GitHub data", "Analyse métriques", "Évaluation risques", "Rapport"],
    requiresApproval: false,
    autoExecutable: true,
  },
  SECURITY_AUDIT_RLS: {
    title: "Audit Sécurité RLS",
    description: "Audit complet des politiques de sécurité Row-Level Security",
    riskLevel: "medium",
    steps: ["Scan tables", "Analyse politiques", "Détection vulnérabilités", "Rapport"],
    requiresApproval: false,
    autoExecutable: true,
  },
  RELEASE_GATE_CHECK: {
    title: "Vérification Gate Release",
    description: "Évaluation de la readiness d'une release",
    riskLevel: "high",
    steps: ["Fetch GitHub PRs", "Revue technique", "Revue sécurité", "Décision GO/NO-GO"],
    requiresApproval: true,
    autoExecutable: false,
  },
  DEPLOY_TO_PRODUCTION: {
    title: "Déploiement Production",
    description: "Déploiement d'une release en environnement de production",
    riskLevel: "critical",
    steps: ["Pre-deploy checks", "Backup", "Deploy", "Smoke tests", "Rollback plan"],
    requiresApproval: true,
    autoExecutable: false,
  },
  RLS_POLICY_UPDATE: {
    title: "Modification Politique RLS",
    description: "Mise à jour des règles de sécurité base de données",
    riskLevel: "critical",
    steps: ["Analyse impact", "Génération migration", "Review", "Apply"],
    requiresApproval: true,
    autoExecutable: false,
  },
  COMPETITIVE_ANALYSIS: {
    title: "Analyse Concurrentielle",
    description: "Veille stratégique et analyse des concurrents",
    riskLevel: "low",
    steps: ["Scraping", "Recherche Perplexity", "Analyse SWOT", "Recommandations"],
    requiresApproval: false,
    autoExecutable: true,
  },
  QUALITY_AUDIT: {
    title: "Audit Qualité",
    description: "Audit qualité complet du code et des tests",
    riskLevel: "medium",
    steps: ["Analyse code", "Revue tests", "Évaluation dette technique", "Scoring", "Recommandations"],
    requiresApproval: false,
    autoExecutable: true,
  },
  ADS_PERFORMANCE_REVIEW: {
    title: "Revue Performance Publicitaire",
    description: "Analyse des performances des campagnes publicitaires digitales",
    riskLevel: "low",
    steps: ["Collecte données ads", "Analyse performance", "Benchmarking", "Recommandations"],
    requiresApproval: false,
    autoExecutable: true,
  },
  GROWTH_STRATEGY_REVIEW: {
    title: "Revue Stratégie Croissance",
    description: "Analyse des leviers de croissance et recommandations",
    riskLevel: "low",
    steps: ["Analyse métriques", "Évaluation leviers", "Projections", "Recommandations"],
    requiresApproval: false,
    autoExecutable: true,
  },
  OKR_QUARTERLY_REVIEW: {
    title: "Revue OKR Trimestrielle",
    description: "Évaluation de l'atteinte des objectifs trimestriels",
    riskLevel: "low",
    steps: ["Collecte OKR", "Évaluation progression", "Analyse écarts", "Recommandations"],
    requiresApproval: false,
    autoExecutable: true,
  },
  COMPLIANCE_RGPD_CHECK: {
    title: "Vérification Conformité RGPD",
    description: "Contrôle de la conformité aux exigences RGPD",
    riskLevel: "medium",
    steps: ["Inventaire traitements", "Vérification bases légales", "Audit droits", "Rapport"],
    requiresApproval: false,
    autoExecutable: true,
  },
  SEO_AUDIT: {
    title: "Audit SEO",
    description: "Analyse du positionnement et optimisation SEO",
    riskLevel: "low",
    steps: ["Audit technique", "Analyse contenu", "Analyse backlinks", "Recommandations"],
    requiresApproval: false,
    autoExecutable: true,
  },
  CONTENT_CALENDAR_PLAN: {
    title: "Plan Calendrier Éditorial",
    description: "Planification du contenu éditorial sur 2 semaines",
    riskLevel: "low",
    steps: ["Analyse tendances", "Planification sujets", "Attribution canaux", "Calendrier"],
    requiresApproval: false,
    autoExecutable: true,
  },
  REVENUE_FORECAST: {
    title: "Prévisions Revenus",
    description: "Projection des revenus à 3/6/12 mois",
    riskLevel: "low",
    steps: ["Collecte Stripe", "Analyse pipeline", "Modélisation", "Projections"],
    requiresApproval: false,
    autoExecutable: true,
  },
  LEAD_SCORING_UPDATE: {
    title: "Mise à Jour Scoring Leads",
    description: "Évaluation et priorisation des prospects entrants",
    riskLevel: "low",
    steps: ["Collecte leads", "Application scoring", "Priorisation", "Rapport"],
    requiresApproval: false,
    autoExecutable: true,
  },
  FINANCIAL_REPORT: {
    title: "Rapport Financier",
    description: "Synthèse des KPIs financiers avec recommandations",
    riskLevel: "low",
    steps: ["Fetch Stripe data", "Calcul KPIs", "Analyse tendances", "Rapport"],
    requiresApproval: false,
    autoExecutable: true,
  },
  RGPD_AUDIT: {
    title: "Audit RGPD",
    description: "Audit complet de conformité RGPD",
    riskLevel: "medium",
    steps: ["Inventaire traitements", "Audit mesures", "Vérification droits", "Rapport"],
    requiresApproval: false,
    autoExecutable: true,
  },
  VULNERABILITY_SCAN: {
    title: "Scan Vulnérabilités",
    description: "Détection des failles de sécurité",
    riskLevel: "medium",
    steps: ["Scan dépendances", "Analyse config", "Tests sécurité", "Rapport"],
    requiresApproval: false,
    autoExecutable: true,
  },
  ROADMAP_UPDATE: {
    title: "Mise à Jour Roadmap",
    description: "Mise à jour de la roadmap produit",
    riskLevel: "low",
    steps: ["Revue livrables", "Analyse backlog", "Priorisation", "Mise à jour roadmap"],
    requiresApproval: false,
    autoExecutable: true,
  },
  CODE_REVIEW: {
    title: "Revue de Code",
    description: "Analyse qualité du code des plateformes",
    riskLevel: "low",
    steps: ["Analyse code", "Détection patterns", "Évaluation dette", "Recommandations"],
    requiresApproval: false,
    autoExecutable: true,
  },
  DEPLOYMENT_CHECK: {
    title: "Vérification Déploiements",
    description: "État des pipelines CI/CD et déploiements",
    riskLevel: "low",
    steps: ["Check pipelines", "Analyse métriques", "Évaluation risques", "Rapport"],
    requiresApproval: false,
    autoExecutable: true,
  },
  DATA_INSIGHTS_REPORT: {
    title: "Rapport Insights Data",
    description: "Analyse des données et insights actionables",
    riskLevel: "low",
    steps: ["Collecte données", "Analyse segments", "Détection tendances", "Insights"],
    requiresApproval: false,
    autoExecutable: true,
  },
  AGENT_PERFORMANCE_REVIEW: {
    title: "Revue Performance Agents",
    description: "Évaluation de la performance des 39 agents IA",
    riskLevel: "low",
    steps: ["Collecte métriques", "Analyse performance", "Évaluation coûts", "Recommandations"],
    requiresApproval: false,
    autoExecutable: true,
  },
  TECH_WATCH_REPORT: {
    title: "Rapport Veille Technologique",
    description: "Veille IA, cloud et innovations pertinentes",
    riskLevel: "low",
    steps: ["Veille IA/tech", "Analyse tendances", "Évaluation opportunités", "Rapport"],
    requiresApproval: false,
    autoExecutable: true,
  },
  MARKETING_WEEK_PLAN: {
    title: "Plan Marketing Hebdomadaire",
    description: "Planification des actions marketing de la semaine",
    riskLevel: "low",
    steps: ["Veille concurrentielle", "Revue objectifs", "Planning", "Allocation budget"],
    requiresApproval: false,
    autoExecutable: true,
  },
  MASS_EMAIL_CAMPAIGN: {
    title: "Campagne Email de Masse",
    description: "Envoi d'emails marketing à la base clients",
    riskLevel: "high",
    steps: ["Préparation contenu", "Segmentation", "Validation", "Envoi"],
    requiresApproval: true,
    autoExecutable: false,
  },
  PRICING_CHANGE: {
    title: "Modification Tarifs",
    description: "Changement de grille tarifaire",
    riskLevel: "critical",
    steps: ["Analyse impact", "Simulation", "Communication", "Application"],
    requiresApproval: true,
    autoExecutable: false,
  },
};

// Helper pour déterminer si un run doit passer en mode approbation
export function shouldRequireApproval(runType: string, riskLevel?: RunRiskLevel): boolean {
  const config = RUN_TYPE_CONFIG[runType];
  if (!config) return true; // Par défaut, requiert approbation
  
  // Les runs critiques ou hauts nécessitent toujours approbation
  if (riskLevel === "critical" || riskLevel === "high") return true;
  
  return config.requiresApproval;
}

// Helper pour vérifier si un run peut être exécuté en autopilote
export function canAutoExecute(runType: string, autopilotEnabled: boolean): boolean {
  if (!autopilotEnabled) return false;
  
  const config = RUN_TYPE_CONFIG[runType];
  if (!config) return false;
  
  return config.autoExecutable && (config.riskLevel === "low" || config.riskLevel === "medium");
}

// Formater le type de run pour affichage
export function formatRunType(type: string): string {
  const config = RUN_TYPE_CONFIG[type];
  return config?.title || type.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
}

// Obtenir la couleur associée au niveau de risque
export function getRiskLevelColor(level: RunRiskLevel): string {
  switch (level) {
    case "low": return "text-success";
    case "medium": return "text-warning";
    case "high": return "text-orange-500";
    case "critical": return "text-destructive";
    default: return "text-muted-foreground";
  }
}

// Obtenir le badge variant pour le niveau de risque
export function getRiskLevelBadgeVariant(level: RunRiskLevel): "subtle" | "destructive" | "gold" {
  switch (level) {
    case "low": return "subtle";
    case "medium": return "gold";
    case "high":
    case "critical": return "destructive";
    default: return "subtle";
  }
}
