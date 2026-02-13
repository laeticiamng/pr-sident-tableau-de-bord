export type PlatformHealthStatus = "green" | "orange" | "red";

export interface PlatformKPI {
  key: string;
  nom: string;
  domaine: string;
  url: string;
  modules: number;
  utilisateursActifs: number;
  uptime: number;
  derniereMaj: string;
  alertes: number;
  statut: PlatformHealthStatus;
  variationUtilisateursPct: number;
}

export interface CriticalAction {
  id: string;
  plateformeKey: string;
  titre: string;
  description: string;
  niveauRisque: "Moyen" | "Élevé" | "Critique";
  demandeePar: string;
  dateDemande: string;
}

export interface StrategicWatchItem {
  id: string;
  source: string;
  titre: string;
  impact: "Faible" | "Moyen" | "Élevé";
  resume: string;
}

export const PLATFORMS_KPI_MOCK: PlatformKPI[] = [
  {
    key: "emotionscare",
    nom: "EmotionsCare",
    domaine: "Bien-être soignants",
    url: "https://emotionscare.com",
    modules: 37,
    utilisateursActifs: 14280,
    uptime: 99.92,
    derniereMaj: "2026-02-09T08:42:00Z",
    alertes: 1,
    statut: "green",
    variationUtilisateursPct: 4.1,
  },
  {
    key: "nearvity",
    nom: "NEARVITY",
    domaine: "Connexion sociale étudiants",
    url: "https://pixel-perfect-clone-6574.lovable.app",
    modules: 10,
    utilisateursActifs: 8920,
    uptime: 99.47,
    derniereMaj: "2026-02-10T06:20:00Z",
    alertes: 2,
    statut: "orange",
    variationUtilisateursPct: 2.6,
  },
  {
    key: "system-compass",
    nom: "System Compass",
    domaine: "Relocalisation internationale",
    url: "https://world-alignment.lovable.app",
    modules: 20,
    utilisateursActifs: 5130,
    uptime: 99.75,
    derniereMaj: "2026-02-10T05:15:00Z",
    alertes: 0,
    statut: "green",
    variationUtilisateursPct: 3.4,
  },
  {
    key: "growth-copilot",
    nom: "Growth Copilot",
    domaine: "Automatisation growth & IA",
    url: "https://agent-growth-automator.com",
    modules: 11,
    utilisateursActifs: 11640,
    uptime: 98.83,
    derniereMaj: "2026-02-09T22:55:00Z",
    alertes: 4,
    statut: "orange",
    variationUtilisateursPct: 6.9,
  },
  {
    key: "med-mng",
    nom: "Med MNG",
    domaine: "Apprentissage médical par musique",
    url: "https://medmng.com",
    modules: 15,
    utilisateursActifs: 6740,
    uptime: 99.61,
    derniereMaj: "2026-02-08T16:05:00Z",
    alertes: 1,
    statut: "green",
    variationUtilisateursPct: 1.9,
  },
  {
    key: "swift-care-hub",
    nom: "UrgenceOS",
    domaine: "Urgences hospitalières",
    url: "https://flow-pulse-assist.lovable.app",
    modules: 7,
    utilisateursActifs: 2980,
    uptime: 97.88,
    derniereMaj: "2026-02-10T03:58:00Z",
    alertes: 5,
    statut: "red",
    variationUtilisateursPct: -0.8,
  },
  {
    key: "track-triumph-tavern",
    nom: "Track Triumph",
    domaine: "Compétition musicale",
    url: "https://track-triumph-tavern.lovable.app",
    modules: 12,
    utilisateursActifs: 4310,
    uptime: 99.19,
    derniereMaj: "2026-02-09T19:25:00Z",
    alertes: 2,
    statut: "orange",
    variationUtilisateursPct: 5.2,
  },
];

export const CRITICAL_ACTIONS_MOCK: CriticalAction[] = [
  {
    id: "ACT-4021",
    plateformeKey: "swift-care-hub",
    titre: "Déploiement correctif triage prioritaire",
    description: "Patch critique de latence sur l'orchestration des alertes SAMU.",
    niveauRisque: "Critique",
    demandeePar: "CTO — UrgenceOS",
    dateDemande: "2026-02-10T07:10:00Z",
  },
  {
    id: "ACT-4022",
    plateformeKey: "growth-copilot",
    titre: "Activation nouvel agent IA d'enrichissement CRM",
    description: "Ajout d'un expert IA sur le département Sales Ops.",
    niveauRisque: "Élevé",
    demandeePar: "Head of Growth",
    dateDemande: "2026-02-10T08:00:00Z",
  },
  {
    id: "ACT-4023",
    plateformeKey: "nearvity",
    titre: "Mise à jour politique anti-spam communautaire",
    description: "Renforcement des seuils de modération automatisée.",
    niveauRisque: "Moyen",
    demandeePar: "Responsable Trust & Safety",
    dateDemande: "2026-02-10T08:35:00Z",
  },
];

export const STRATEGIC_WATCH_MOCK: StrategicWatchItem[] = [
  {
    id: "V-1",
    source: "FrenchHealthTech Monitor",
    titre: "Hausse des appels d'offres e-santé régionaux en Hauts-de-France",
    impact: "Élevé",
    resume: "Opportunité commerciale directe pour EmotionsCare et UrgenceOS sur les prochains 2 trimestres.",
  },
  {
    id: "V-2",
    source: "EU Digital Campus Report",
    titre: "Accélération des programmes de bien-être étudiant dans 5 pays UE",
    impact: "Moyen",
    resume: "Potentiel d'extension internationale pour NEARVITY via des partenariats universités.",
  },
  {
    id: "V-3",
    source: "AI Ops Benchmark 2026",
    titre: "Progression des standards de gouvernance IA explicable en SaaS B2B",
    impact: "Élevé",
    resume: "Prioriser la traçabilité des décisions IA pour Growth Copilot et conformité RGPD.",
  },
];
