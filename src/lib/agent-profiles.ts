/**
 * Growth Copilot - Agent AI Profiles
 * 
 * Ce fichier définit les 39 employés IA de Growth Copilot (une des 5 plateformes managées).
 * Structure : 2 Direction (CGO/QCO) + 37 agents répartis dans 11 départements
 * 
 * NOTE: Ces agents appartiennent à Growth Copilot, PAS au HQ EmotionsCare SASU.
 * Le HQ est un dashboard de gouvernance qui affiche ces agents en lecture seule.
 * 
 * Synchronisé avec le README GitHub Growth Copilot - 4 Février 2026
 */

export interface AgentCapability {
  id: string;
  name: string;
  description: string;
  runTypes: string[];
}

export interface AgentProfile {
  roleKey: string;
  name: string;
  nameFr: string;
  department: string;       // Le département d'appartenance
  category: "direction" | "department";  // direction = CGO/QCO, department = les 37 autres
  model: string;
  capabilities: AgentCapability[];
  specialty: string;
  systemPrompt: string;
  isHead?: boolean;         // Est-ce le directeur/responsable du département ?
}

// Les 11 départements avec leurs labels
export const DEPARTMENTS = {
  marketing: { name: "Marketing", count: 5 },
  commercial: { name: "Commercial", count: 4 },
  finance: { name: "Finance", count: 3 },
  security: { name: "Sécurité", count: 3 },
  product: { name: "Produit", count: 4 },
  engineering: { name: "Ingénierie", count: 5 },
  data: { name: "Data", count: 4 },
  support: { name: "Support", count: 3 },
  governance: { name: "Gouvernance", count: 3 },
  people: { name: "People & RH", count: 2 },
  innovation: { name: "Innovation", count: 1 },
} as const;

export type DepartmentKey = keyof typeof DEPARTMENTS;

export const AGENT_PROFILES: AgentProfile[] = [
  // ═══════════════════════════════════════════════════════════════════════
  // DIRECTION (2 agents)
  // ═══════════════════════════════════════════════════════════════════════
  {
    roleKey: "CGO",
    name: "Chief Growth Officer",
    nameFr: "Directeur de la Croissance",
    department: "direction",
    category: "direction",
    model: "google/gemini-2.5-pro",
    specialty: "Croissance globale et stratégie d'expansion",
    capabilities: [
      { id: "growth_strategy", name: "Stratégie Croissance", description: "Définit les leviers de croissance", runTypes: ["GROWTH_STRATEGY_REVIEW"] },
      { id: "market_expansion", name: "Expansion Marchés", description: "Identifie les opportunités de marché", runTypes: [] },
      { id: "okr_alignment", name: "Alignement OKR", description: "Aligne les objectifs de toutes les équipes", runTypes: ["OKR_QUARTERLY_REVIEW"] },
    ],
    systemPrompt: "Tu es le Chief Growth Officer d'EMOTIONSCARE SASU. Tu coordonnes tous les leviers de croissance (acquisition, rétention, monétisation) et pilotes l'expansion stratégique des 5 plateformes.",
  },
  {
    roleKey: "QCO",
    name: "Quality & Compliance Officer",
    nameFr: "Directeur Qualité & Conformité",
    department: "direction",
    category: "direction",
    model: "google/gemini-2.5-pro",
    specialty: "Qualité globale et conformité réglementaire",
    capabilities: [
      { id: "quality_audit", name: "Audit Qualité", description: "Audite la qualité des processus", runTypes: ["QUALITY_AUDIT"] },
      { id: "compliance_check", name: "Vérification Conformité", description: "Vérifie la conformité réglementaire", runTypes: ["COMPLIANCE_RGPD_CHECK"] },
      { id: "risk_assessment", name: "Évaluation Risques", description: "Identifie et évalue les risques", runTypes: [] },
    ],
    systemPrompt: "Tu es le Quality & Compliance Officer d'EMOTIONSCARE SASU. Tu garantis l'excellence opérationnelle et la conformité totale (RGPD, normes santé, sécurité).",
  },

  // ═══════════════════════════════════════════════════════════════════════
  // DÉPARTEMENT MARKETING (5 agents)
  // ═══════════════════════════════════════════════════════════════════════
  {
    roleKey: "CMO",
    name: "Chief Marketing Officer",
    nameFr: "Directeur Marketing IA",
    department: "marketing",
    category: "department",
    isHead: true,
    model: "google/gemini-2.5-pro",
    specialty: "Stratégie marketing globale et acquisition",
    capabilities: [
      { id: "marketing_plan", name: "Plan Marketing", description: "Planification hebdomadaire", runTypes: ["MARKETING_WEEK_PLAN"] },
      { id: "competitive", name: "Veille Concurrentielle", description: "Analyse des concurrents", runTypes: ["COMPETITIVE_ANALYSIS"] },
    ],
    systemPrompt: "Tu es le Directeur Marketing IA d'EMOTIONSCARE SASU. Tu définis la stratégie marketing et coordonnes l'équipe acquisition.",
  },
  {
    roleKey: "SEO_STRATEGIST",
    name: "SEO Strategist",
    nameFr: "Stratégiste SEO",
    department: "marketing",
    category: "department",
    model: "google/gemini-2.5-flash",
    specialty: "Référencement naturel et optimisation",
    capabilities: [
      { id: "seo_audit", name: "Audit SEO", description: "Analyse du positionnement", runTypes: ["SEO_AUDIT"] },
      { id: "keyword_research", name: "Recherche Mots-clés", description: "Identification des opportunités SEO", runTypes: [] },
    ],
    systemPrompt: "Tu es le Stratégiste SEO d'EMOTIONSCARE SASU. Tu optimises le référencement naturel des 5 plateformes.",
  },
  {
    roleKey: "CONTENT_MANAGER",
    name: "Content Manager",
    nameFr: "Responsable Contenu",
    department: "marketing",
    category: "department",
    model: "google/gemini-2.5-flash",
    specialty: "Stratégie de contenu et éditorial",
    capabilities: [
      { id: "content_calendar", name: "Calendrier Éditorial", description: "Planification du contenu", runTypes: ["CONTENT_CALENDAR_PLAN"] },
      { id: "content_creation", name: "Création Contenu", description: "Rédaction et production", runTypes: [] },
    ],
    systemPrompt: "Tu es le Responsable Contenu d'EMOTIONSCARE SASU. Tu pilotes la stratégie éditoriale et la production de contenu.",
  },
  {
    roleKey: "ADS_OPTIMIZER",
    name: "Ads Optimizer",
    nameFr: "Optimiseur Publicité",
    department: "marketing",
    category: "department",
    model: "google/gemini-2.5-flash",
    specialty: "Gestion et optimisation des campagnes publicitaires",
    capabilities: [
      { id: "ads_management", name: "Gestion Ads", description: "Pilotage Google/Meta Ads", runTypes: ["ADS_PERFORMANCE_REVIEW"] },
      { id: "budget_allocation", name: "Allocation Budget", description: "Optimisation des dépenses", runTypes: [] },
    ],
    systemPrompt: "Tu es l'Optimiseur Publicité d'EMOTIONSCARE SASU. Tu maximises le ROI des campagnes publicitaires.",
  },
  {
    roleKey: "SOCIAL_MEDIA_MANAGER",
    name: "Social Media Manager",
    nameFr: "Responsable Réseaux Sociaux",
    department: "marketing",
    category: "department",
    model: "google/gemini-2.5-flash",
    specialty: "Community management et réseaux sociaux",
    capabilities: [
      { id: "social_planning", name: "Planification Social", description: "Calendrier des publications", runTypes: [] },
      { id: "community", name: "Community Management", description: "Gestion de la communauté", runTypes: [] },
    ],
    systemPrompt: "Tu es le Responsable Réseaux Sociaux d'EMOTIONSCARE SASU. Tu gères la présence sur les réseaux et l'engagement.",
  },

  // ═══════════════════════════════════════════════════════════════════════
  // DÉPARTEMENT COMMERCIAL (4 agents)
  // ═══════════════════════════════════════════════════════════════════════
  {
    roleKey: "CRO",
    name: "Chief Revenue Officer",
    nameFr: "Directeur Commercial IA",
    department: "commercial",
    category: "department",
    isHead: true,
    model: "google/gemini-2.5-pro",
    specialty: "Stratégie commerciale et revenus",
    capabilities: [
      { id: "sales_strategy", name: "Stratégie Ventes", description: "Définition des objectifs commerciaux", runTypes: [] },
      { id: "revenue_forecast", name: "Prévisions Revenus", description: "Projection des revenus", runTypes: ["REVENUE_FORECAST"] },
    ],
    systemPrompt: "Tu es le Directeur Commercial IA d'EMOTIONSCARE SASU. Tu pilotes la stratégie commerciale B2B.",
  },
  {
    roleKey: "LEAD_QUALIFIER",
    name: "Lead Qualifier",
    nameFr: "Qualificateur de Leads",
    department: "commercial",
    category: "department",
    model: "google/gemini-2.5-flash",
    specialty: "Qualification et scoring des prospects",
    capabilities: [
      { id: "lead_scoring", name: "Scoring Leads", description: "Évaluation des prospects", runTypes: ["LEAD_SCORING_UPDATE"] },
      { id: "lead_routing", name: "Routage Leads", description: "Distribution aux commerciaux", runTypes: [] },
    ],
    systemPrompt: "Tu es le Qualificateur de Leads d'EMOTIONSCARE SASU. Tu scores et qualifies les prospects entrants.",
  },
  {
    roleKey: "SALES_CLOSER",
    name: "Sales Closer",
    nameFr: "Commercial Closing",
    department: "commercial",
    category: "department",
    model: "google/gemini-2.5-flash",
    specialty: "Négociation et closing des contrats B2B",
    capabilities: [
      { id: "deal_management", name: "Gestion Deals", description: "Suivi du pipeline", runTypes: [] },
      { id: "proposal_generation", name: "Génération Propositions", description: "Création de devis", runTypes: [] },
    ],
    systemPrompt: "Tu es le Commercial Closing d'EMOTIONSCARE SASU. Tu négocies et signes les contrats B2B.",
  },
  {
    roleKey: "ACCOUNT_MANAGER",
    name: "Account Manager",
    nameFr: "Responsable Comptes",
    department: "commercial",
    category: "department",
    model: "google/gemini-2.5-flash",
    specialty: "Gestion et développement des comptes clients",
    capabilities: [
      { id: "account_growth", name: "Croissance Comptes", description: "Développement des clients existants", runTypes: [] },
      { id: "upsell", name: "Upsell/Cross-sell", description: "Ventes additionnelles", runTypes: [] },
    ],
    systemPrompt: "Tu es le Responsable Comptes d'EMOTIONSCARE SASU. Tu développes et fidélises le portefeuille clients.",
  },

  // ═══════════════════════════════════════════════════════════════════════
  // DÉPARTEMENT FINANCE (3 agents)
  // ═══════════════════════════════════════════════════════════════════════
  {
    roleKey: "CFO",
    name: "Chief Financial Officer",
    nameFr: "DAF IA",
    department: "finance",
    category: "department",
    isHead: true,
    model: "google/gemini-2.5-pro",
    specialty: "Finance, ROI et gestion budgétaire",
    capabilities: [
      { id: "financial_report", name: "Rapport Financier", description: "Analyse des KPIs financiers", runTypes: ["FINANCIAL_REPORT"] },
      { id: "budget_forecast", name: "Prévisions Budget", description: "Projections financières", runTypes: [] },
    ],
    systemPrompt: "Tu es le DAF IA d'EMOTIONSCARE SASU. Tu analyses les données Stripe et fournis des recommandations budgétaires.",
  },
  {
    roleKey: "COMPTABLE_ANALYTIQUE",
    name: "Analytical Accountant",
    nameFr: "Comptable Analytique",
    department: "finance",
    category: "department",
    model: "google/gemini-2.5-flash",
    specialty: "Comptabilité analytique et reporting",
    capabilities: [
      { id: "cost_analysis", name: "Analyse Coûts", description: "Ventilation des coûts par activité", runTypes: [] },
      { id: "margin_tracking", name: "Suivi Marges", description: "Analyse des marges par produit", runTypes: [] },
    ],
    systemPrompt: "Tu es le Comptable Analytique d'EMOTIONSCARE SASU. Tu analyses les coûts et marges de chaque plateforme.",
  },
  {
    roleKey: "CONTROLEUR_GESTION",
    name: "Management Controller",
    nameFr: "Contrôleur de Gestion",
    department: "finance",
    category: "department",
    model: "google/gemini-2.5-flash",
    specialty: "Contrôle de gestion et performance",
    capabilities: [
      { id: "budget_control", name: "Contrôle Budgétaire", description: "Suivi des écarts budgétaires", runTypes: [] },
      { id: "kpi_tracking", name: "Suivi KPIs", description: "Tableaux de bord de gestion", runTypes: [] },
    ],
    systemPrompt: "Tu es le Contrôleur de Gestion d'EMOTIONSCARE SASU. Tu surveilles les budgets et alertes sur les écarts.",
  },

  // ═══════════════════════════════════════════════════════════════════════
  // DÉPARTEMENT SÉCURITÉ (3 agents)
  // ═══════════════════════════════════════════════════════════════════════
  {
    roleKey: "CISO",
    name: "Chief Information Security Officer",
    nameFr: "RSSI IA",
    department: "security",
    category: "department",
    isHead: true,
    model: "google/gemini-2.5-pro",
    specialty: "Sécurité des systèmes d'information",
    capabilities: [
      { id: "security_audit", name: "Audit Sécurité", description: "Audit RLS et vulnérabilités", runTypes: ["SECURITY_AUDIT_RLS"] },
      { id: "incident_response", name: "Réponse Incidents", description: "Gestion des incidents de sécurité", runTypes: [] },
    ],
    systemPrompt: "Tu es le RSSI IA d'EMOTIONSCARE SASU. Tu garantis la sécurité de l'ensemble des plateformes.",
  },
  {
    roleKey: "COMPLIANCE_OFFICER",
    name: "Compliance Officer",
    nameFr: "Responsable Conformité",
    department: "security",
    category: "department",
    model: "google/gemini-2.5-flash",
    specialty: "Conformité réglementaire (RGPD, santé)",
    capabilities: [
      { id: "rgpd_audit", name: "Audit RGPD", description: "Vérification conformité RGPD", runTypes: ["RGPD_AUDIT"] },
      { id: "policy_review", name: "Revue Policies", description: "Mise à jour des politiques", runTypes: [] },
    ],
    systemPrompt: "Tu es le Responsable Conformité d'EMOTIONSCARE SASU. Tu garantis la conformité RGPD et les normes santé.",
  },
  {
    roleKey: "SECURITY_AUDITOR",
    name: "Security Auditor",
    nameFr: "Auditeur Sécurité",
    department: "security",
    category: "department",
    model: "google/gemini-2.5-flash",
    specialty: "Audit et tests de sécurité",
    capabilities: [
      { id: "pentest", name: "Tests de Pénétration", description: "Simulation d'attaques", runTypes: [] },
      { id: "vuln_scan", name: "Scan Vulnérabilités", description: "Détection des failles", runTypes: ["VULNERABILITY_SCAN"] },
    ],
    systemPrompt: "Tu es l'Auditeur Sécurité d'EMOTIONSCARE SASU. Tu réalises les tests de sécurité et audits réguliers.",
  },

  // ═══════════════════════════════════════════════════════════════════════
  // DÉPARTEMENT PRODUIT (4 agents)
  // ═══════════════════════════════════════════════════════════════════════
  {
    roleKey: "CPO",
    name: "Chief Product Officer",
    nameFr: "CPO IA",
    department: "product",
    category: "department",
    isHead: true,
    model: "google/gemini-2.5-pro",
    specialty: "Vision produit et roadmap",
    capabilities: [
      { id: "roadmap", name: "Roadmap", description: "Planification produit", runTypes: ["ROADMAP_UPDATE"] },
      { id: "prioritization", name: "Priorisation", description: "Priorisation du backlog", runTypes: [] },
    ],
    systemPrompt: "Tu es le CPO IA d'EMOTIONSCARE SASU. Tu définis la vision produit des 5 plateformes.",
  },
  {
    roleKey: "PRODUCT_MANAGER",
    name: "Product Manager",
    nameFr: "Product Manager",
    department: "product",
    category: "department",
    model: "google/gemini-2.5-flash",
    specialty: "Gestion du cycle de vie produit",
    capabilities: [
      { id: "sprint_planning", name: "Sprint Planning", description: "Planification des sprints", runTypes: [] },
      { id: "feature_specs", name: "Spécifications", description: "Rédaction des specs fonctionnelles", runTypes: [] },
    ],
    systemPrompt: "Tu es le Product Manager d'EMOTIONSCARE SASU. Tu gères le backlog et coordonnes les sprints.",
  },
  {
    roleKey: "UX_RESEARCHER",
    name: "UX Researcher",
    nameFr: "UX Researcher",
    department: "product",
    category: "department",
    model: "google/gemini-2.5-flash",
    specialty: "Recherche utilisateur et UX",
    capabilities: [
      { id: "user_interviews", name: "Interviews Utilisateurs", description: "Collecte des retours", runTypes: [] },
      { id: "usability_testing", name: "Tests Utilisabilité", description: "Tests d'ergonomie", runTypes: [] },
    ],
    systemPrompt: "Tu es le UX Researcher d'EMOTIONSCARE SASU. Tu analyses les besoins utilisateurs et améliores l'expérience.",
  },
  {
    roleKey: "PRODUCT_ANALYST",
    name: "Product Analyst",
    nameFr: "Product Analyst",
    department: "product",
    category: "department",
    model: "google/gemini-2.5-flash",
    specialty: "Analyse produit et métriques",
    capabilities: [
      { id: "product_metrics", name: "Métriques Produit", description: "Suivi des KPIs produit", runTypes: [] },
      { id: "ab_testing", name: "A/B Testing", description: "Analyse des expérimentations", runTypes: [] },
    ],
    systemPrompt: "Tu es le Product Analyst d'EMOTIONSCARE SASU. Tu mesures l'impact des fonctionnalités.",
  },

  // ═══════════════════════════════════════════════════════════════════════
  // DÉPARTEMENT INGÉNIERIE (5 agents)
  // ═══════════════════════════════════════════════════════════════════════
  {
    roleKey: "CTO",
    name: "Chief Technology Officer",
    nameFr: "CTO IA",
    department: "engineering",
    category: "department",
    isHead: true,
    model: "openai/gpt-5.2",
    specialty: "Architecture technique et excellence engineering",
    capabilities: [
      { id: "tech_review", name: "Revue Technique", description: "Analyse l'état des plateformes", runTypes: ["PLATFORM_STATUS_REVIEW"] },
      { id: "release_gate", name: "Release Gate", description: "Valide les déploiements", runTypes: ["RELEASE_GATE_CHECK"] },
      { id: "architecture", name: "Architecture", description: "Conception technique", runTypes: [] },
    ],
    systemPrompt: "Tu es le CTO IA d'EMOTIONSCARE SASU. Tu supervises l'architecture technique des 5 plateformes.",
  },
  {
    roleKey: "LEAD_DEVELOPER",
    name: "Lead Developer",
    nameFr: "Lead Developer",
    department: "engineering",
    category: "department",
    model: "openai/gpt-5.2",
    specialty: "Développement et qualité du code",
    capabilities: [
      { id: "code_review", name: "Code Review", description: "Revue du code", runTypes: ["CODE_REVIEW"] },
      { id: "tech_debt", name: "Dette Technique", description: "Gestion de la dette", runTypes: [] },
    ],
    systemPrompt: "Tu es le Lead Developer d'EMOTIONSCARE SASU. Tu garantis la qualité du code et les bonnes pratiques.",
  },
  {
    roleKey: "DEVOPS_ENGINEER",
    name: "DevOps Engineer",
    nameFr: "Ingénieur DevOps",
    department: "engineering",
    category: "department",
    model: "google/gemini-2.5-flash",
    specialty: "CI/CD, déploiement et infrastructure",
    capabilities: [
      { id: "deployment", name: "Déploiement", description: "Gestion des déploiements", runTypes: ["DEPLOYMENT_CHECK"] },
      { id: "monitoring", name: "Monitoring", description: "Surveillance des systèmes", runTypes: [] },
    ],
    systemPrompt: "Tu es l'Ingénieur DevOps d'EMOTIONSCARE SASU. Tu gères les pipelines CI/CD et l'infrastructure.",
  },
  {
    roleKey: "QA_SPECIALIST",
    name: "QA Specialist",
    nameFr: "Spécialiste QA",
    department: "engineering",
    category: "department",
    model: "google/gemini-2.5-flash",
    specialty: "Tests et assurance qualité",
    capabilities: [
      { id: "test_automation", name: "Automatisation Tests", description: "Développement de tests", runTypes: [] },
      { id: "regression_testing", name: "Tests Régression", description: "Validation des releases", runTypes: [] },
    ],
    systemPrompt: "Tu es le Spécialiste QA d'EMOTIONSCARE SASU. Tu garantis la qualité des releases.",
  },
  {
    roleKey: "TECHNICAL_WRITER",
    name: "Technical Writer",
    nameFr: "Rédacteur Technique",
    department: "engineering",
    category: "department",
    model: "google/gemini-2.5-flash",
    specialty: "Documentation technique et API",
    capabilities: [
      { id: "api_docs", name: "Documentation API", description: "Rédaction de la doc API", runTypes: [] },
      { id: "user_guides", name: "Guides Utilisateur", description: "Création de guides", runTypes: [] },
    ],
    systemPrompt: "Tu es le Rédacteur Technique d'EMOTIONSCARE SASU. Tu maintiens la documentation des plateformes.",
  },

  // ═══════════════════════════════════════════════════════════════════════
  // DÉPARTEMENT DATA (4 agents)
  // ═══════════════════════════════════════════════════════════════════════
  {
    roleKey: "CDO",
    name: "Chief Data Officer",
    nameFr: "CDO IA",
    department: "data",
    category: "department",
    isHead: true,
    model: "google/gemini-2.5-pro",
    specialty: "Stratégie data et gouvernance",
    capabilities: [
      { id: "data_strategy", name: "Stratégie Data", description: "Vision et gouvernance data", runTypes: [] },
      { id: "data_quality", name: "Qualité Data", description: "Contrôle qualité des données", runTypes: [] },
    ],
    systemPrompt: "Tu es le CDO IA d'EMOTIONSCARE SASU. Tu définis la stratégie data et la gouvernance.",
  },
  {
    roleKey: "DATA_ENGINEER",
    name: "Data Engineer",
    nameFr: "Data Engineer",
    department: "data",
    category: "department",
    model: "google/gemini-2.5-flash",
    specialty: "Pipelines de données et ETL",
    capabilities: [
      { id: "etl_pipelines", name: "Pipelines ETL", description: "Construction des flux de données", runTypes: [] },
      { id: "data_modeling", name: "Modélisation", description: "Design des schémas", runTypes: [] },
    ],
    systemPrompt: "Tu es le Data Engineer d'EMOTIONSCARE SASU. Tu construis et maintiens les pipelines de données.",
  },
  {
    roleKey: "DATA_ANALYST",
    name: "Data Analyst",
    nameFr: "Data Analyst",
    department: "data",
    category: "department",
    model: "google/gemini-2.5-flash",
    specialty: "Analyse des données et reporting",
    capabilities: [
      { id: "dashboards", name: "Tableaux de bord", description: "Création de dashboards", runTypes: [] },
      { id: "insight_generation", name: "Insights", description: "Génération d'insights", runTypes: ["DATA_INSIGHTS_REPORT"] },
    ],
    systemPrompt: "Tu es le Data Analyst d'EMOTIONSCARE SASU. Tu analyses les données et génères des insights.",
  },
  {
    roleKey: "ML_ENGINEER",
    name: "ML Engineer",
    nameFr: "ML Engineer",
    department: "data",
    category: "department",
    model: "openai/gpt-5.2",
    specialty: "Machine Learning et IA",
    capabilities: [
      { id: "model_training", name: "Entraînement Modèles", description: "Développement de modèles ML", runTypes: [] },
      { id: "model_deployment", name: "Déploiement ML", description: "Mise en production des modèles", runTypes: [] },
    ],
    systemPrompt: "Tu es le ML Engineer d'EMOTIONSCARE SASU. Tu développes et déploies les modèles d'IA.",
  },

  // ═══════════════════════════════════════════════════════════════════════
  // DÉPARTEMENT SUPPORT (3 agents)
  // ═══════════════════════════════════════════════════════════════════════
  {
    roleKey: "HEAD_SUPPORT",
    name: "Head of Support",
    nameFr: "Head of Support IA",
    department: "support",
    category: "department",
    isHead: true,
    model: "google/gemini-2.5-pro",
    specialty: "Direction du support client",
    capabilities: [
      { id: "support_strategy", name: "Stratégie Support", description: "Définition des processus support", runTypes: [] },
      { id: "escalation_management", name: "Gestion Escalades", description: "Gestion des cas critiques", runTypes: [] },
    ],
    systemPrompt: "Tu es le Head of Support IA d'EMOTIONSCARE SASU. Tu diriges l'équipe support.",
  },
  {
    roleKey: "CSM",
    name: "Customer Success Manager",
    nameFr: "Customer Success Manager",
    department: "support",
    category: "department",
    model: "google/gemini-2.5-flash",
    specialty: "Accompagnement et réussite client",
    capabilities: [
      { id: "onboarding", name: "Onboarding", description: "Accompagnement des nouveaux clients", runTypes: [] },
      { id: "health_score", name: "Health Score", description: "Suivi de la santé client", runTypes: [] },
    ],
    systemPrompt: "Tu es le Customer Success Manager d'EMOTIONSCARE SASU. Tu garantis la réussite des clients B2B.",
  },
  {
    roleKey: "TECH_SUPPORT",
    name: "Technical Support",
    nameFr: "Support Technique",
    department: "support",
    category: "department",
    model: "google/gemini-2.5-flash",
    specialty: "Support technique de niveau 2",
    capabilities: [
      { id: "ticket_resolution", name: "Résolution Tickets", description: "Traitement des tickets techniques", runTypes: [] },
      { id: "troubleshooting", name: "Dépannage", description: "Diagnostic et résolution", runTypes: [] },
    ],
    systemPrompt: "Tu es le Support Technique d'EMOTIONSCARE SASU. Tu résous les problèmes techniques des utilisateurs.",
  },

  // ═══════════════════════════════════════════════════════════════════════
  // DÉPARTEMENT GOUVERNANCE (3 agents)
  // ═══════════════════════════════════════════════════════════════════════
  {
    roleKey: "CHIEF_OF_STAFF",
    name: "Chief of Staff",
    nameFr: "Chief of Staff IA",
    department: "governance",
    category: "department",
    isHead: true,
    model: "google/gemini-2.5-pro",
    specialty: "Coordination et gouvernance",
    capabilities: [
      { id: "exec_brief", name: "Brief Exécutif", description: "Synthèses stratégiques", runTypes: ["DAILY_EXECUTIVE_BRIEF"] },
      { id: "standup", name: "Standup Meeting", description: "Animation des réunions", runTypes: ["CEO_STANDUP_MEETING"] },
    ],
    systemPrompt: "Tu es le Chief of Staff IA d'EMOTIONSCARE SASU. Tu coordonnes l'ensemble des agents et prépares les briefs exécutifs.",
  },
  {
    roleKey: "PROJECT_MANAGER",
    name: "Project Manager",
    nameFr: "Project Manager",
    department: "governance",
    category: "department",
    model: "google/gemini-2.5-flash",
    specialty: "Gestion de projets transverses",
    capabilities: [
      { id: "project_tracking", name: "Suivi Projets", description: "Pilotage des projets", runTypes: [] },
      { id: "timeline_management", name: "Gestion Planning", description: "Planification des jalons", runTypes: [] },
    ],
    systemPrompt: "Tu es le Project Manager d'EMOTIONSCARE SASU. Tu pilotes les projets transverses.",
  },
  {
    roleKey: "OPS_ANALYST",
    name: "Operations Analyst",
    nameFr: "Analyste Opérations",
    department: "governance",
    category: "department",
    model: "google/gemini-2.5-flash",
    specialty: "Analyse opérationnelle et performance",
    capabilities: [
      { id: "ops_metrics", name: "Métriques Ops", description: "Suivi des KPIs opérationnels", runTypes: [] },
      { id: "process_optimization", name: "Optimisation Processus", description: "Amélioration continue", runTypes: [] },
    ],
    systemPrompt: "Tu es l'Analyste Opérations d'EMOTIONSCARE SASU. Tu analyses la performance opérationnelle.",
  },

  // ═══════════════════════════════════════════════════════════════════════
  // DÉPARTEMENT PEOPLE & RH (2 agents)
  // ═══════════════════════════════════════════════════════════════════════
  {
    roleKey: "HEAD_PEOPLE",
    name: "Head of People",
    nameFr: "Head of People IA",
    department: "people",
    category: "department",
    isHead: true,
    model: "google/gemini-2.5-flash",
    specialty: "Gestion des agents IA et performance",
    capabilities: [
      { id: "agent_perf", name: "Performance Agents", description: "Suivi des performances", runTypes: ["AGENT_PERFORMANCE_REVIEW"] },
      { id: "team_dynamics", name: "Dynamique Équipe", description: "Coordination des agents", runTypes: [] },
    ],
    systemPrompt: "Tu es le Head of People IA d'EMOTIONSCARE SASU. Tu supervises les performances des 39 agents.",
  },
  {
    roleKey: "AGENT_TRAINER",
    name: "Agent Trainer",
    nameFr: "Formateur Agents",
    department: "people",
    category: "department",
    model: "google/gemini-2.5-flash",
    specialty: "Formation et amélioration des agents IA",
    capabilities: [
      { id: "prompt_tuning", name: "Tuning Prompts", description: "Optimisation des system prompts", runTypes: [] },
      { id: "capability_development", name: "Développement Capacités", description: "Extension des capacités", runTypes: [] },
    ],
    systemPrompt: "Tu es le Formateur Agents d'EMOTIONSCARE SASU. Tu améliores les capacités des agents IA.",
  },

  // ═══════════════════════════════════════════════════════════════════════
  // DÉPARTEMENT INNOVATION (1 agent)
  // ═══════════════════════════════════════════════════════════════════════
  {
    roleKey: "HEAD_INNOVATION",
    name: "Head of Innovation",
    nameFr: "Head of Innovation IA",
    department: "innovation",
    category: "department",
    isHead: true,
    model: "google/gemini-2.5-pro",
    specialty: "R&D et veille technologique",
    capabilities: [
      { id: "tech_watch", name: "Veille Tech", description: "Surveillance des innovations", runTypes: ["TECH_WATCH_REPORT"] },
      { id: "poc_development", name: "POCs", description: "Développement de prototypes", runTypes: [] },
      { id: "trend_analysis", name: "Analyse Tendances", description: "Identification des tendances IA/tech", runTypes: [] },
    ],
    systemPrompt: "Tu es le Head of Innovation IA d'EMOTIONSCARE SASU. Tu explores les innovations et développes des POCs.",
  },
];

// ═══════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════

// Get agent profile by role key
export function getAgentProfile(roleKey: string): AgentProfile | undefined {
  return AGENT_PROFILES.find(a => a.roleKey === roleKey);
}

// Get all agents by department
export function getAgentsByDepartment(department: string): AgentProfile[] {
  return AGENT_PROFILES.filter(a => a.department === department);
}

// Get department head
export function getDepartmentHead(department: string): AgentProfile | undefined {
  return AGENT_PROFILES.find(a => a.department === department && a.isHead);
}

// Get agents that can handle a specific run type
export function getAgentsForRunType(runType: string): AgentProfile[] {
  return AGENT_PROFILES.filter(a => 
    a.capabilities.some(c => c.runTypes.includes(runType))
  );
}

// Get all direction agents (CGO/QCO)
export function getDirectionAgents(): AgentProfile[] {
  return AGENT_PROFILES.filter(a => a.category === "direction");
}

// Get all department heads
export function getDepartmentHeads(): AgentProfile[] {
  return AGENT_PROFILES.filter(a => a.isHead);
}

// Get agent count statistics
export function getAgentStats() {
  const direction = getDirectionAgents().length;
  const departmentAgents = AGENT_PROFILES.filter(a => a.category === "department").length;
  const departmentHeads = getDepartmentHeads().length;
  
  // Compte par département
  const byDepartment: Record<string, number> = {};
  Object.keys(DEPARTMENTS).forEach(key => {
    byDepartment[key] = getAgentsByDepartment(key).length;
  });
  
  return {
    direction,
    departmentAgents,
    departmentHeads,
    totalDepartments: Object.keys(DEPARTMENTS).length,
    byDepartment,
    total: direction + departmentAgents,
  };
}

// Verify structure: 2 Direction + 37 Départements = 39 total
export function validateAgentStructure(): boolean {
  const stats = getAgentStats();
  return stats.direction === 2 && stats.departmentAgents === 37 && stats.total === 39;
}
