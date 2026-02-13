// Configuration centralisée des icônes et couleurs de chaque plateforme
// Source unique — importée par toutes les pages et composants
import {
  Heart,
  Users,
  Compass,
  Rocket,
  Music,
  HeartPulse,
  Trophy,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

// Icônes par clé de plateforme
export const PLATFORM_ICONS: Record<string, LucideIcon> = {
  "emotionscare": Heart,
  "nearvity": Users,
  "system-compass": Compass,
  "growth-copilot": Rocket,
  "med-mng": Music,
  "swift-care-hub": HeartPulse,
  "track-triumph-tavern": Trophy,
};

// Couleurs d'accentuation texte (semantic tokens Tailwind)
export const PLATFORM_ACCENTS: Record<string, string> = {
  "emotionscare": "text-platform-health",
  "nearvity": "text-platform-social",
  "system-compass": "text-platform-compass",
  "growth-copilot": "text-platform-growth",
  "med-mng": "text-platform-medical",
  "swift-care-hub": "text-platform-emergency",
  "track-triumph-tavern": "text-platform-triumph",
};

// Couleurs d'accentuation fond
export const PLATFORM_BG_ACCENTS: Record<string, string> = {
  "emotionscare": "bg-platform-health",
  "nearvity": "bg-platform-social",
  "system-compass": "bg-platform-compass",
  "growth-copilot": "bg-platform-growth",
  "med-mng": "bg-platform-medical",
  "swift-care-hub": "bg-platform-emergency",
  "track-triumph-tavern": "bg-platform-triumph",
};

// Dégradés pour les cartes (hover)
export const PLATFORM_GRADIENTS: Record<string, string> = {
  "emotionscare": "from-platform-health/20 via-platform-health/5 to-transparent",
  "nearvity": "from-platform-social/20 via-platform-social/5 to-transparent",
  "system-compass": "from-platform-compass/20 via-platform-compass/5 to-transparent",
  "growth-copilot": "from-platform-growth/20 via-platform-growth/5 to-transparent",
  "med-mng": "from-platform-medical/20 via-platform-medical/5 to-transparent",
  "swift-care-hub": "from-platform-emergency/20 via-platform-emergency/5 to-transparent",
  "track-triumph-tavern": "from-platform-triumph/20 via-platform-triumph/5 to-transparent",
};

// Bordures hover
export const PLATFORM_BORDERS: Record<string, string> = {
  "emotionscare": "hover:border-platform-health/40",
  "nearvity": "hover:border-platform-social/40",
  "system-compass": "hover:border-platform-compass/40",
  "growth-copilot": "hover:border-platform-growth/40",
  "med-mng": "hover:border-platform-medical/40",
  "swift-care-hub": "hover:border-platform-emergency/40",
  "track-triumph-tavern": "hover:border-platform-triumph/40",
};

// Bordures hover pour les cartes groupe
export const PLATFORM_GROUP_BORDERS: Record<string, string> = {
  "emotionscare": "group-hover:border-platform-health/30",
  "nearvity": "group-hover:border-platform-social/30",
  "system-compass": "group-hover:border-platform-compass/30",
  "growth-copilot": "group-hover:border-platform-growth/30",
  "med-mng": "group-hover:border-platform-medical/30",
  "swift-care-hub": "group-hover:border-platform-emergency/30",
  "track-triumph-tavern": "group-hover:border-platform-triumph/30",
};

// Labels de statut
export const STATUS_LABELS = {
  production: { label: "Production", couleur: "text-success", bg: "bg-success", indicateur: "bg-status-green" },
  prototype: { label: "Prototype", couleur: "text-warning", bg: "bg-warning", indicateur: "bg-status-amber" },
  development: { label: "Développement", couleur: "text-muted-foreground", bg: "bg-muted-foreground", indicateur: "bg-muted-foreground" },
} as const;
