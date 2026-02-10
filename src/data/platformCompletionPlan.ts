export type CompletionStatus = "complet" | "en_cours" | "a_planifier";

export interface PlatformCompletionItem {
  key: string;
  nom: string;
  modulesTotal: number;
  modulesCompletes: number;
  statut: CompletionStatus;
  prochaineEtape: string;
}

export interface DeliveryPhase {
  phase: string;
  objectif: string;
  livrables: string[];
  environnementLovable: string;
}

export const PLATFORM_COMPLETION_ITEMS: PlatformCompletionItem[] = [
  {
    key: "emotionscare",
    nom: "EmotionsCare",
    modulesTotal: 37,
    modulesCompletes: 31,
    statut: "en_cours",
    prochaineEtape: "Finaliser la supervision en temps réel des 6 modules critiques.",
  },
  {
    key: "nearvity",
    nom: "NEARVITY",
    modulesTotal: 10,
    modulesCompletes: 8,
    statut: "en_cours",
    prochaineEtape: "Ajouter le workflow de validation présidentielle pour modération sensible.",
  },
  {
    key: "system-compass",
    nom: "System Compass",
    modulesTotal: 20,
    modulesCompletes: 16,
    statut: "en_cours",
    prochaineEtape: "Connecter les KPI de conversion via Edge Function dédiée.",
  },
  {
    key: "growth-copilot",
    nom: "Growth Copilot",
    modulesTotal: 39,
    modulesCompletes: 29,
    statut: "en_cours",
    prochaineEtape: "Stabiliser le runbook d'orchestration des 39 experts IA.",
  },
  {
    key: "med-mng",
    nom: "Med MNG",
    modulesTotal: 15,
    modulesCompletes: 12,
    statut: "en_cours",
    prochaineEtape: "Compléter le reporting pédagogique quotidien dans le cockpit.",
  },
  {
    key: "swift-care-hub",
    nom: "UrgenceOS",
    modulesTotal: 7,
    modulesCompletes: 5,
    statut: "en_cours",
    prochaineEtape: "Prioriser la résilience réseau et l'alerte rouge multi-zones.",
  },
  {
    key: "track-triumph-tavern",
    nom: "Track Triumph",
    modulesTotal: 12,
    modulesCompletes: 9,
    statut: "en_cours",
    prochaineEtape: "Activer la validation manuelle des concours à fort enjeu.",
  },
];

export const DELIVERY_PHASES: DeliveryPhase[] = [
  {
    phase: "Phase 1 — Finalisation cockpit",
    objectif: "Avoir un cockpit présidentiel entièrement exploitable en production Lovable.",
    livrables: [
      "KPI harmonisés des 7 plateformes (uptime, utilisateurs, alertes)",
      "Rapport quotidien IA consolidé et historisé",
      "Validation présidentielle unifiée (approuver/rejeter + journal RGPD)",
    ],
    environnementLovable: "Privilégier les RPC Supabase avec fallback mock en cas de dégradation réseau.",
  },
  {
    phase: "Phase 2 — Monitoring et automatisation",
    objectif: "Passer d'une supervision descriptive à une supervision proactive.",
    livrables: [
      "Health checks temps réel multi-plateformes",
      "Alerting visuel vert/orange/rouge avec seuils configurables",
      "Playbooks d'actions automatisées validées par la présidence",
    ],
    environnementLovable: "Edge Functions idempotentes, courtes, et observables (logs + retries).",
  },
  {
    phase: "Phase 3 — Veille et pilotage stratégique",
    objectif: "Transformer le cockpit en outil de décision hebdomadaire et trimestrielle.",
    livrables: [
      "Radar concurrentiel par plateforme",
      "Synthèse opportunités/risques actionnable",
      "Tableau de bord décisions prises vs impacts business",
    ],
    environnementLovable: "Stockage des signaux de veille en tables dédiées + affichage dans widgets React Query.",
  },
];
