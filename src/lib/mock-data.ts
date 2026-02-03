/**
 * Données mock réalistes pour les modules sans intégration externe
 * Ces données sont utilisées en attendant les intégrations réelles
 */

// Marketing KPIs réalistes
export const MARKETING_KPIS = {
  monthlyVisitors: 12450,
  monthlyVisitorsChange: 8.5,
  conversionRate: 3.2,
  conversionRateChange: 0.4,
  emailsSent: 8920,
  emailsSentChange: 12.3,
  socialEngagement: 2340,
  socialEngagementChange: 15.7,
};

// Ventes KPIs réalistes
export const SALES_KPIS = {
  monthlyRevenue: 24500,
  monthlyRevenueChange: 5.2,
  activeDeals: 12,
  conversionRate: 28.5,
  activeClients: 156,
};

// Pipeline de vente
export const SALES_PIPELINE = [
  { name: "Prospects", count: 45, value: 67500 },
  { name: "Qualification", count: 23, value: 46000 },
  { name: "Proposition", count: 12, value: 36000 },
  { name: "Négociation", count: 8, value: 28000 },
  { name: "Clôture", count: 4, value: 16000 },
];

// Support KPIs réalistes
export const SUPPORT_KPIS = {
  openTickets: 8,
  avgResponseTime: "2h 15min",
  resolutionRate: 94.5,
  customerSatisfaction: 4.7,
};

// Tickets par priorité
export const SUPPORT_TICKETS_BY_PRIORITY = [
  { priority: "Critique", count: 1, color: "destructive" },
  { priority: "Haute", count: 3, color: "warning" },
  { priority: "Moyenne", count: 2, color: "default" },
  { priority: "Basse", count: 2, color: "subtle" },
];

// Tickets par plateforme
export const SUPPORT_TICKETS_BY_PLATFORM = [
  { platform: "EmotionsCare", count: 3 },
  { platform: "Growth Copilot", count: 2 },
  { platform: "System Compass", count: 2 },
  { platform: "Med MNG", count: 1 },
  { platform: "Pixel Perfect Replica", count: 0 },
];

// Knowledge Base articles
export const KNOWLEDGE_BASE_ARTICLES = [
  { id: "1", title: "Guide de démarrage rapide", category: "Onboarding", views: 1250 },
  { id: "2", title: "FAQ - Questions fréquentes", category: "Général", views: 890 },
  { id: "3", title: "Résolution des problèmes de connexion", category: "Technique", views: 645 },
  { id: "4", title: "Configuration des notifications", category: "Paramètres", views: 432 },
  { id: "5", title: "Politique de remboursement", category: "Facturation", views: 321 },
];

// Campagnes marketing actives
export const MARKETING_CAMPAIGNS = [
  { 
    id: "1", 
    name: "Lancement EmotionsCare v2", 
    status: "active", 
    startDate: "2025-01-15", 
    endDate: "2025-02-15",
    budget: 5000,
    spent: 3200,
    leads: 145
  },
  { 
    id: "2", 
    name: "Newsletter Février", 
    status: "scheduled", 
    startDate: "2025-02-01", 
    endDate: "2025-02-28",
    budget: 1500,
    spent: 0,
    leads: 0
  },
  { 
    id: "3", 
    name: "Webinar IA & Bien-être", 
    status: "completed", 
    startDate: "2025-01-20", 
    endDate: "2025-01-20",
    budget: 2000,
    spent: 1850,
    leads: 89
  },
];

// Produit - OKRs
export const PRODUCT_OKRS = [
  { 
    objective: "Améliorer l'expérience utilisateur", 
    progress: 68, 
    status: "on_track",
    keyResults: [
      { name: "Réduire le temps de chargement < 2s", progress: 85 },
      { name: "NPS > 50", progress: 72 },
      { name: "Taux d'abandon < 15%", progress: 45 },
    ]
  },
  { 
    objective: "Augmenter la rétention", 
    progress: 45, 
    status: "at_risk",
    keyResults: [
      { name: "Churn mensuel < 3%", progress: 60 },
      { name: "DAU/MAU > 40%", progress: 35 },
      { name: "Engagement +25%", progress: 40 },
    ]
  },
  { 
    objective: "Lancer de nouvelles fonctionnalités", 
    progress: 72, 
    status: "on_track",
    keyResults: [
      { name: "3 features majeures Q1", progress: 66 },
      { name: "0 bugs critiques en prod", progress: 100 },
      { name: "Documentation 100% à jour", progress: 50 },
    ]
  },
];

// Features par plateforme
export const PLATFORM_FEATURES = {
  emotionscare: { delivered: 12, inProgress: 3, blocked: 1 },
  "pixel-perfect-replica": { delivered: 4, inProgress: 2, blocked: 0 },
  "system-compass": { delivered: 18, inProgress: 5, blocked: 2 },
  "growth-copilot": { delivered: 25, inProgress: 8, blocked: 1 },
  "med-mng": { delivered: 8, inProgress: 4, blocked: 0 },
};

// Feature requests
export const FEATURE_REQUESTS = [
  { id: "1", title: "Mode hors-ligne", votes: 45, status: "planned", platform: "emotionscare" },
  { id: "2", title: "Export PDF des rapports", votes: 38, status: "in_review", platform: "growth-copilot" },
  { id: "3", title: "Intégration Slack", votes: 32, status: "planned", platform: "all" },
  { id: "4", title: "Dark mode amélioré", votes: 28, status: "completed", platform: "all" },
];

// Prochaines releases
export const UPCOMING_RELEASES = [
  { version: "v2.1.0", platform: "EmotionsCare", date: "2025-02-10", features: 5 },
  { version: "v1.3.0", platform: "Growth Copilot", date: "2025-02-15", features: 8 },
  { version: "v0.8.0", platform: "Pixel Perfect Replica", date: "2025-02-20", features: 3 },
];

// Unit Economics (calculés depuis Stripe quand disponible)
export const UNIT_ECONOMICS = {
  cac: 52,
  ltv: 487,
  ltvCacRatio: 9.4,
  arpu: 29.50,
  paybackPeriod: 1.8, // mois
};

// Données d'activités commerciales
export const SALES_ACTIVITIES = [
  { id: "1", type: "call", prospect: "TechCorp SAS", date: "2025-02-03T14:00:00", status: "scheduled" },
  { id: "2", type: "meeting", prospect: "InnovHealth", date: "2025-02-04T10:00:00", status: "scheduled" },
  { id: "3", type: "proposal", prospect: "EduNext", date: "2025-02-01T16:30:00", status: "sent" },
];

// Opportunités récentes
export const RECENT_OPPORTUNITIES = [
  { id: "1", name: "TechCorp SAS - Licence Enterprise", value: 12000, stage: "Négociation", probability: 75 },
  { id: "2", name: "InnovHealth - POC", value: 5000, stage: "Proposition", probability: 50 },
  { id: "3", name: "EduNext - Formation", value: 3500, stage: "Qualification", probability: 30 },
];
