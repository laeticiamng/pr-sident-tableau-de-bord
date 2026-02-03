// Constantes pour les 5 plateformes managées (immuable)
export const MANAGED_PLATFORMS = [
  {
    key: "emotionscare",
    name: "EmotionsCare",
    description: "Plateforme principale de gestion émotionnelle",
    github: "https://github.com/laeticiamng/emotionscare",
    color: "bg-status-green",
  },
  {
    key: "pixel-perfect-replica",
    name: "Pixel Perfect Replica",
    description: "Réplication d'interfaces haute fidélité",
    github: "https://github.com/laeticiamng/pixel-perfect-replica",
    color: "bg-status-amber",
  },
  {
    key: "system-compass",
    name: "System Compass",
    description: "Navigation et orientation systémique",
    github: "https://github.com/laeticiamng/system-compass",
    color: "bg-primary",
  },
  {
    key: "growth-copilot",
    name: "Growth Copilot",
    description: "Intelligence marketing et croissance",
    github: "https://github.com/laeticiamng/growth-copilot",
    color: "bg-accent",
  },
  {
    key: "med-mng",
    name: "Med MNG",
    description: "Gestion médicale et suivi santé",
    github: "https://github.com/laeticiamng/med-mng",
    color: "bg-destructive",
  },
] as const;

// Profil de l'entreprise (données légales)
export const COMPANY_PROFILE = {
  legalName: "EMOTIONSCARE SASU",
  form: "SASU",
  siren: "944 505 445",
  siret: "944 505 445 00014",
  vat: "FR71944505445",
  address: "APPARTEMENT 1, 5 RUE CAUDRON, 80000 AMIENS",
  activity: "58.29C — Édition de logiciels applicatifs",
  capital: "100,00 €",
  creationDate: "07/05/2025",
  rcs: "Amiens (inscrit le 21/05/2025)",
  president: "Motongane Laeticia",
} as const;

export type PlatformKey = typeof MANAGED_PLATFORMS[number]["key"];
