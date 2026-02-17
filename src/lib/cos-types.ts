// COS (Chief Operating System) — Types et constantes
// Framework de pilotage opérationnel orienté résultats

// ─── Statuts du portfolio ────────────────────────────────────────────
export type ProjectStatus = "incubation" | "actif" | "en_lancement" | "monetise" | "maintenance";

export const PROJECT_STATUS_CONFIG: Record<ProjectStatus, {
  label: string;
  description: string;
  color: string;
  bgColor: string;
  borderColor: string;
}> = {
  incubation: {
    label: "Incubation",
    description: "Idees et notes uniquement. Execution interdite.",
    color: "text-muted-foreground",
    bgColor: "bg-muted/50",
    borderColor: "border-muted",
  },
  actif: {
    label: "Actif",
    description: "Execution quotidienne. Max 2 projets.",
    color: "text-primary",
    bgColor: "bg-primary/10",
    borderColor: "border-primary/30",
  },
  en_lancement: {
    label: "En lancement",
    description: "Preparation marketing + beta.",
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
  },
  monetise: {
    label: "Monetise",
    description: "Objectif ventes/abonnements, optimisation conversion.",
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/30",
  },
  maintenance: {
    label: "Maintenance",
    description: "Corrections minimales, pas de nouveaux chantiers.",
    color: "text-slate-400",
    bgColor: "bg-slate-400/10",
    borderColor: "border-slate-400/30",
  },
};

// ─── Projet COS ─────────────────────────────────────────────────────
export interface COSProject {
  id: string;
  platformKey: string;
  name: string;
  status: ProjectStatus;
  isCashFirst: boolean;
  startDate: string; // ISO date
  promesse: string; // "ce que ca resout" en une phrase
  cibleUtilisateur: string;
  actionUnique: string; // acheter / s'inscrire / reserver / demander demo
  mecanismeLivraison: string;
  deadlines: COSDeadlines;
  moneyMetrics: COSMoneyMetrics;
}

// ─── Deadlines escalier ─────────────────────────────────────────────
export interface COSDeadlines {
  d3: COSDeadlineStep; // Offre + prix + landing + CTA
  d7: COSDeadlineStep; // Livraison minimal + capture leads/paiement
  d14: COSDeadlineStep; // Release publique + 1ere vente
  d30: COSDeadlineStep; // Objectif traction
}

export interface COSDeadlineStep {
  targetDate: string; // ISO date
  label: string;
  description: string;
  status: "pending" | "in_progress" | "done" | "overdue" | "scope_cut";
  scopeCut?: string; // Si overdue, ce qui a ete coupe
}

// ─── Money Dashboard ────────────────────────────────────────────────
export interface COSMoneyMetrics {
  mrr: number;
  mrrTarget: number;
  conversionRate: number; // visite → action (%)
  arpu: number;
  churn: number; // %
  cac: number;
  revenueOneShot: number;
  totalCustomers: number;
  activeTrials: number;
}

// ─── Daily Briefing ─────────────────────────────────────────────────
export interface COSDailyEntry {
  date: string; // ISO date
  type: "morning" | "evening";
  // Morning
  focusDuJour?: string; // 1 seul livrable principal
  actions?: [string, string?, string?]; // 3 actions max
  risquePrincipal?: string;
  decisionBloquante?: string;
  // Evening
  livre?: boolean; // binaire
  causeRacine?: string; // scope trop large / distraction / sommeil / etc
  correctifDemain?: string;
}

// ─── Anti-Burnout ───────────────────────────────────────────────────
export interface COSBurnoutMetrics {
  heureFinTravail: string; // "19:00"
  sommeilHeures: number;
  sommeilObjectif: number; // default 7
  joursConsecutifsSommeilBas: number;
  activitePhysiqueSemaine: number; // sessions cette semaine
  activitePhysiqueObjectif: number; // default 3
  euphorieDetectee: boolean;
  pressionInterneHaute: boolean;
  multiProjet: boolean;
  drapeauRouge: boolean; // Calcule: euphorie + sommeil bas + pression + multi-projet
  jourMaintenanceForce: boolean;
}

// ─── Etat global COS ────────────────────────────────────────────────
export interface COSState {
  projects: COSProject[];
  dailyEntries: COSDailyEntry[];
  burnout: COSBurnoutMetrics;
  lastUpdated: string;
  initialized: boolean;
}

// ─── Definition of Done (checklist) ─────────────────────────────────
export interface COSDefinitionOfDone {
  promesseClaire: boolean;
  utilisateurCible: boolean;
  actionUnique: boolean;
  mecanismeLivraison: boolean;
  retourUtilisateur: boolean;
}

// ─── Constantes ─────────────────────────────────────────────────────
export const COS_RULES = {
  MAX_ACTIVE_PROJECTS: 2,
  MIN_CASH_FIRST_PROJECTS: 1,
  RELEASE_CADENCE_DAYS: 14,
  DEADLINE_STEPS: ["d3", "d7", "d14", "d30"] as const,
  SLEEP_MIN_HOURS: 7,
  EXERCISE_MIN_SESSIONS: 3,
  CUTOFF_DEFAULT: "19:00",
  LOW_SLEEP_CONSECUTIVE_LIMIT: 2,
} as const;

// Etat initial
export function createInitialCOSState(): COSState {
  return {
    projects: [],
    dailyEntries: [],
    burnout: {
      heureFinTravail: COS_RULES.CUTOFF_DEFAULT,
      sommeilHeures: 7,
      sommeilObjectif: COS_RULES.SLEEP_MIN_HOURS,
      joursConsecutifsSommeilBas: 0,
      activitePhysiqueSemaine: 0,
      activitePhysiqueObjectif: COS_RULES.EXERCISE_MIN_SESSIONS,
      euphorieDetectee: false,
      pressionInterneHaute: false,
      multiProjet: false,
      drapeauRouge: false,
      jourMaintenanceForce: false,
    },
    lastUpdated: new Date().toISOString(),
    initialized: false,
  };
}

// Helper pour creer les deadlines depuis une date de debut
export function createDeadlinesFromStart(startDate: string): COSDeadlines {
  const start = new Date(startDate);
  const addDays = (d: Date, days: number) => {
    const r = new Date(d);
    r.setDate(r.getDate() + days);
    return r.toISOString().split("T")[0];
  };

  return {
    d3: {
      targetDate: addDays(start, 3),
      label: "D+3 : Offre visible",
      description: "Offre + prix + landing + CTA (meme basique)",
      status: "pending",
    },
    d7: {
      targetDate: addDays(start, 7),
      label: "D+7 : Livraison minimale",
      description: "Mecanisme livraison + capture leads/paiement + 1er test utilisateur",
      status: "pending",
    },
    d14: {
      targetDate: addDays(start, 14),
      label: "D+14 : Release publique",
      description: "Release publique + 1ere vente ou 10 beta testeurs engages",
      status: "pending",
    },
    d30: {
      targetDate: addDays(start, 30),
      label: "D+30 : Traction",
      description: "10 ventes / 20 essais / 50 leads qualifies",
      status: "pending",
    },
  };
}
