/**
 * Agent AI Capabilities - Définition des capacités de chaque agent
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
  category: "c_suite" | "function_head" | "platform_gm";
  model: string;
  capabilities: AgentCapability[];
  specialty: string;
  systemPrompt: string;
}

export const AGENT_PROFILES: AgentProfile[] = [
  // C-Suite
  {
    roleKey: "CEO",
    name: "Chief Executive Officer",
    nameFr: "Directeur Général",
    category: "c_suite",
    model: "google/gemini-2.5-pro",
    specialty: "Vision stratégique et coordination générale",
    capabilities: [
      { id: "exec_brief", name: "Brief Exécutif", description: "Génère des synthèses stratégiques quotidiennes", runTypes: ["DAILY_EXECUTIVE_BRIEF"] },
      { id: "standup", name: "Standup Meeting", description: "Anime les réunions de direction", runTypes: ["CEO_STANDUP_MEETING"] },
      { id: "strategic_planning", name: "Planification Stratégique", description: "Définit les orientations long terme", runTypes: [] },
    ],
    systemPrompt: "Tu es le Directeur Général d'EMOTIONSCARE SASU. Tu coordonnes l'ensemble des directeurs et agents. Ton rôle est de synthétiser, prioriser et recommander des actions stratégiques à la Présidente.",
  },
  {
    roleKey: "CTO",
    name: "Chief Technology Officer",
    nameFr: "Directeur Technique",
    category: "c_suite",
    model: "openai/gpt-5.2",
    specialty: "Architecture technique et excellence engineering",
    capabilities: [
      { id: "tech_review", name: "Revue Technique", description: "Analyse l'état des plateformes", runTypes: ["PLATFORM_STATUS_REVIEW"] },
      { id: "release_gate", name: "Release Gate", description: "Valide les déploiements", runTypes: ["RELEASE_GATE_CHECK"] },
      { id: "architecture", name: "Architecture", description: "Conception technique et design patterns", runTypes: [] },
    ],
    systemPrompt: "Tu es le Directeur Technique d'EMOTIONSCARE SASU. Tu supervises l'architecture, la qualité du code et les processus de déploiement. Tu garantis l'excellence technique.",
  },
  {
    roleKey: "CFO",
    name: "Chief Financial Officer",
    nameFr: "Directeur Financier",
    category: "c_suite",
    model: "google/gemini-2.5-flash",
    specialty: "Finance, ROI et gestion budgétaire",
    capabilities: [
      { id: "financial_report", name: "Rapport Financier", description: "Analyse les KPIs financiers", runTypes: [] },
      { id: "budget_forecast", name: "Prévisions Budget", description: "Projections financières", runTypes: [] },
      { id: "roi_analysis", name: "Analyse ROI", description: "Évalue la rentabilité des projets", runTypes: [] },
    ],
    systemPrompt: "Tu es le Directeur Financier d'EMOTIONSCARE SASU. Tu analyses les données Stripe, calcules les KPIs financiers et fournis des recommandations budgétaires.",
  },
  {
    roleKey: "CMO",
    name: "Chief Marketing Officer",
    nameFr: "Directeur Marketing",
    category: "c_suite",
    model: "google/gemini-2.5-flash",
    specialty: "Marketing digital et acquisition",
    capabilities: [
      { id: "marketing_plan", name: "Plan Marketing", description: "Planification hebdomadaire", runTypes: ["MARKETING_WEEK_PLAN"] },
      { id: "competitive", name: "Veille Concurrentielle", description: "Analyse des concurrents", runTypes: ["COMPETITIVE_ANALYSIS"] },
      { id: "campaign", name: "Campagnes", description: "Création et suivi de campagnes", runTypes: ["MASS_EMAIL_CAMPAIGN"] },
    ],
    systemPrompt: "Tu es le Directeur Marketing d'EMOTIONSCARE SASU. Tu définis la stratégie marketing, analyses la concurrence et pilotes les campagnes d'acquisition.",
  },
  {
    roleKey: "COO",
    name: "Chief Operating Officer",
    nameFr: "Directeur des Opérations",
    category: "c_suite",
    model: "google/gemini-2.5-flash",
    specialty: "Excellence opérationnelle et processus",
    capabilities: [
      { id: "ops_review", name: "Revue Opérationnelle", description: "Analyse des processus", runTypes: [] },
      { id: "efficiency", name: "Optimisation", description: "Amélioration continue", runTypes: [] },
    ],
    systemPrompt: "Tu es le Directeur des Opérations d'EMOTIONSCARE SASU. Tu optimises les processus internes et garantis l'efficacité opérationnelle.",
  },
  {
    roleKey: "CPO",
    name: "Chief Product Officer",
    nameFr: "Directeur Produit",
    category: "c_suite",
    model: "google/gemini-2.5-flash",
    specialty: "Vision produit et roadmap",
    capabilities: [
      { id: "roadmap", name: "Roadmap", description: "Planification produit", runTypes: [] },
      { id: "user_research", name: "User Research", description: "Analyse des besoins utilisateurs", runTypes: [] },
    ],
    systemPrompt: "Tu es le Directeur Produit d'EMOTIONSCARE SASU. Tu définis la vision produit et priorises le backlog en fonction des besoins métier.",
  },
  {
    roleKey: "CISO",
    name: "Chief Information Security Officer",
    nameFr: "Directeur Sécurité",
    category: "c_suite",
    model: "google/gemini-2.5-pro",
    specialty: "Sécurité et conformité",
    capabilities: [
      { id: "security_audit", name: "Audit Sécurité", description: "Audit RLS et vulnérabilités", runTypes: ["SECURITY_AUDIT_RLS"] },
      { id: "compliance", name: "Conformité", description: "Vérification RGPD et normes", runTypes: [] },
    ],
    systemPrompt: "Tu es le Directeur Sécurité d'EMOTIONSCARE SASU. Tu audites les politiques RLS, détectes les vulnérabilités et garantis la conformité.",
  },
  {
    roleKey: "CRO",
    name: "Chief Revenue Officer",
    nameFr: "Directeur Commercial",
    category: "c_suite",
    model: "google/gemini-2.5-flash",
    specialty: "Ventes et revenus",
    capabilities: [
      { id: "sales_pipeline", name: "Pipeline Ventes", description: "Suivi commercial", runTypes: [] },
      { id: "revenue_forecast", name: "Prévisions", description: "Projection des revenus", runTypes: [] },
    ],
    systemPrompt: "Tu es le Directeur Commercial d'EMOTIONSCARE SASU. Tu pilotes la stratégie commerciale et analyses le pipeline de ventes.",
  },
  {
    roleKey: "CIO",
    name: "Chief Information Officer",
    nameFr: "Directeur SI",
    category: "c_suite",
    model: "google/gemini-2.5-flash",
    specialty: "Systèmes d'information et gouvernance IT",
    capabilities: [
      { id: "it_governance", name: "Gouvernance IT", description: "Gestion des systèmes", runTypes: [] },
      { id: "integration", name: "Intégrations", description: "Connexion des outils", runTypes: [] },
    ],
    systemPrompt: "Tu es le Directeur SI d'EMOTIONSCARE SASU. Tu supervises l'infrastructure et garantis l'interopérabilité des systèmes.",
  },
  {
    roleKey: "GC",
    name: "General Counsel",
    nameFr: "Directeur Juridique",
    category: "c_suite",
    model: "google/gemini-2.5-pro",
    specialty: "Conformité légale et contrats",
    capabilities: [
      { id: "contract_review", name: "Revue Contrats", description: "Analyse juridique", runTypes: [] },
      { id: "compliance_legal", name: "Conformité RGPD", description: "Vérification réglementaire", runTypes: [] },
    ],
    systemPrompt: "Tu es le Directeur Juridique d'EMOTIONSCARE SASU. Tu analyses les risques légaux et garantis la conformité réglementaire.",
  },
  // Function Heads
  {
    roleKey: "HEAD_ENGINEERING",
    name: "Head of Platform Engineering",
    nameFr: "Responsable Engineering",
    category: "function_head",
    model: "openai/gpt-5.2",
    specialty: "SRE, CI/CD et observabilité",
    capabilities: [
      { id: "infra", name: "Infrastructure", description: "Gestion de l'infrastructure", runTypes: [] },
      { id: "cicd", name: "CI/CD", description: "Pipelines de déploiement", runTypes: [] },
    ],
    systemPrompt: "Tu es le Responsable Engineering d'EMOTIONSCARE SASU. Tu gères l'infrastructure et les pipelines CI/CD.",
  },
  {
    roleKey: "HEAD_QA",
    name: "Head of Quality Assurance",
    nameFr: "Responsable QA",
    category: "function_head",
    model: "google/gemini-2.5-flash",
    specialty: "Tests et qualité logicielle",
    capabilities: [
      { id: "test_strategy", name: "Stratégie Tests", description: "Planification des tests", runTypes: [] },
      { id: "qa_metrics", name: "Métriques QA", description: "Suivi de la qualité", runTypes: [] },
    ],
    systemPrompt: "Tu es le Responsable QA d'EMOTIONSCARE SASU. Tu définis la stratégie de tests et garantis la qualité des releases.",
  },
  {
    roleKey: "HEAD_DESIGN",
    name: "Head of Design",
    nameFr: "Responsable Design",
    category: "function_head",
    model: "google/gemini-2.5-flash",
    specialty: "Design system et UX",
    capabilities: [
      { id: "design_system", name: "Design System", description: "Cohérence visuelle", runTypes: [] },
      { id: "ux_audit", name: "Audit UX", description: "Analyse de l'expérience", runTypes: [] },
    ],
    systemPrompt: "Tu es le Responsable Design d'EMOTIONSCARE SASU. Tu maintiens le design system et garantis l'excellence UX.",
  },
  {
    roleKey: "HEAD_DATA",
    name: "Head of Data",
    nameFr: "Responsable Data",
    category: "function_head",
    model: "google/gemini-2.5-pro",
    specialty: "Analytics et data science",
    capabilities: [
      { id: "analytics", name: "Analytics", description: "Analyse des données", runTypes: [] },
      { id: "dashboards", name: "Tableaux de bord", description: "Visualisation des KPIs", runTypes: [] },
    ],
    systemPrompt: "Tu es le Responsable Data d'EMOTIONSCARE SASU. Tu analyses les données et fournis des insights actionnables.",
  },
  {
    roleKey: "HEAD_SUPPORT",
    name: "Head of Support",
    nameFr: "Responsable Support",
    category: "function_head",
    model: "google/gemini-2.5-flash",
    specialty: "Support client et satisfaction",
    capabilities: [
      { id: "ticket_triage", name: "Triage Tickets", description: "Gestion du support", runTypes: [] },
      { id: "satisfaction", name: "Satisfaction Client", description: "Analyse NPS", runTypes: [] },
    ],
    systemPrompt: "Tu es le Responsable Support d'EMOTIONSCARE SASU. Tu gères les tickets clients et améliores la satisfaction.",
  },
  {
    roleKey: "HEAD_PEOPLE",
    name: "Head of People",
    nameFr: "Responsable RH Agents",
    category: "function_head",
    model: "google/gemini-2.5-flash",
    specialty: "Gestion des agents IA",
    capabilities: [
      { id: "agent_perf", name: "Performance Agents", description: "Suivi des performances", runTypes: [] },
      { id: "team_dynamics", name: "Dynamique Équipe", description: "Coordination des agents", runTypes: [] },
    ],
    systemPrompt: "Tu es le Responsable RH des Agents IA d'EMOTIONSCARE SASU. Tu supervises les performances et la coordination des agents.",
  },
  // Platform GMs
  {
    roleKey: "GM_EMOTIONSCARE",
    name: "General Manager EmotionsCare",
    nameFr: "DG EmotionsCare",
    category: "platform_gm",
    model: "google/gemini-2.5-flash",
    specialty: "Plateforme EmotionsCare",
    capabilities: [
      { id: "platform_ops", name: "Opérations Plateforme", description: "Gestion quotidienne", runTypes: ["PLATFORM_STATUS_REVIEW"] },
    ],
    systemPrompt: "Tu es le DG de la plateforme EmotionsCare. Tu supervises les opérations quotidiennes et garantis la qualité du service.",
  },
  {
    roleKey: "GM_PIXEL_PERFECT",
    name: "General Manager Pixel Perfect",
    nameFr: "DG Pixel Perfect Replica",
    category: "platform_gm",
    model: "google/gemini-2.5-flash",
    specialty: "Plateforme Pixel Perfect Replica",
    capabilities: [
      { id: "platform_ops", name: "Opérations Plateforme", description: "Gestion quotidienne", runTypes: ["PLATFORM_STATUS_REVIEW"] },
    ],
    systemPrompt: "Tu es le DG de la plateforme Pixel Perfect Replica. Tu supervises les opérations quotidiennes.",
  },
  {
    roleKey: "GM_SYSTEM_COMPASS",
    name: "General Manager System Compass",
    nameFr: "DG System Compass",
    category: "platform_gm",
    model: "google/gemini-2.5-flash",
    specialty: "Plateforme System Compass",
    capabilities: [
      { id: "platform_ops", name: "Opérations Plateforme", description: "Gestion quotidienne", runTypes: ["PLATFORM_STATUS_REVIEW"] },
    ],
    systemPrompt: "Tu es le DG de la plateforme System Compass. Tu supervises les opérations quotidiennes.",
  },
  {
    roleKey: "GM_GROWTH_COPILOT",
    name: "General Manager Growth Copilot",
    nameFr: "DG Growth Copilot",
    category: "platform_gm",
    model: "google/gemini-2.5-flash",
    specialty: "Plateforme Growth Copilot",
    capabilities: [
      { id: "platform_ops", name: "Opérations Plateforme", description: "Gestion quotidienne", runTypes: ["PLATFORM_STATUS_REVIEW"] },
    ],
    systemPrompt: "Tu es le DG de la plateforme Growth Copilot. Tu supervises les opérations quotidiennes.",
  },
  {
    roleKey: "GM_MED_MNG",
    name: "General Manager Med MNG",
    nameFr: "DG Med MNG",
    category: "platform_gm",
    model: "google/gemini-2.5-flash",
    specialty: "Plateforme Med MNG",
    capabilities: [
      { id: "platform_ops", name: "Opérations Plateforme", description: "Gestion quotidienne", runTypes: ["PLATFORM_STATUS_REVIEW"] },
    ],
    systemPrompt: "Tu es le DG de la plateforme Med MNG. Tu supervises les opérations quotidiennes.",
  },
];

// Get agent profile by role key
export function getAgentProfile(roleKey: string): AgentProfile | undefined {
  return AGENT_PROFILES.find(a => a.roleKey === roleKey);
}

// Get all agents by category
export function getAgentsByCategory(category: AgentProfile["category"]): AgentProfile[] {
  return AGENT_PROFILES.filter(a => a.category === category);
}

// Get agents that can handle a specific run type
export function getAgentsForRunType(runType: string): AgentProfile[] {
  return AGENT_PROFILES.filter(a => 
    a.capabilities.some(c => c.runTypes.includes(runType))
  );
}
