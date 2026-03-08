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
  ShieldCheck,
  BookHeadphones,
  Stethoscope,
  Box,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

// ============================================
// Unified platform visual config — single source of truth
// ============================================
export interface PlatformVisualConfig {
  icon: LucideIcon;
  accent: string;       // text color class
  bgAccent: string;     // bg color class
  gradient: string;     // card hover gradient
  border: string;       // hover border class
  groupBorder: string;  // group-hover border class
  /** Style for feature cards on home page */
  featureColor: string;
  featureBg: string;
}

const DEFAULT_CONFIG: PlatformVisualConfig = {
  icon: Box,
  accent: "text-muted-foreground",
  bgAccent: "bg-muted-foreground",
  gradient: "from-muted/20 via-muted/5 to-transparent",
  border: "hover:border-muted-foreground/40",
  groupBorder: "group-hover:border-muted-foreground/30",
  featureColor: "text-muted-foreground",
  featureBg: "bg-muted/10",
};

/**
 * All platform visual configs keyed by platform slug.
 * Adding a new platform here is the ONLY place you need to touch for visuals.
 */
const PLATFORM_CONFIGS: Record<string, PlatformVisualConfig> = {
  emotionscare: {
    icon: Heart,
    accent: "text-platform-health",
    bgAccent: "bg-platform-health",
    gradient: "from-platform-health/20 via-platform-health/5 to-transparent",
    border: "hover:border-platform-health/40",
    groupBorder: "group-hover:border-platform-health/30",
    featureColor: "text-accent",
    featureBg: "bg-accent/10",
  },
  nearvity: {
    icon: Users,
    accent: "text-platform-social",
    bgAccent: "bg-platform-social",
    gradient: "from-platform-social/20 via-platform-social/5 to-transparent",
    border: "hover:border-platform-social/40",
    groupBorder: "group-hover:border-platform-social/30",
    featureColor: "text-success",
    featureBg: "bg-success/10",
  },
  "system-compass": {
    icon: Compass,
    accent: "text-platform-compass",
    bgAccent: "bg-platform-compass",
    gradient: "from-platform-compass/20 via-platform-compass/5 to-transparent",
    border: "hover:border-platform-compass/40",
    groupBorder: "group-hover:border-platform-compass/30",
    featureColor: "text-primary",
    featureBg: "bg-primary/10",
  },
  "growth-copilot": {
    icon: Rocket,
    accent: "text-platform-growth",
    bgAccent: "bg-platform-growth",
    gradient: "from-platform-growth/20 via-platform-growth/5 to-transparent",
    border: "hover:border-platform-growth/40",
    groupBorder: "group-hover:border-platform-growth/30",
    featureColor: "text-warning",
    featureBg: "bg-warning/10",
  },
  "med-mng": {
    icon: Music,
    accent: "text-platform-medical",
    bgAccent: "bg-platform-medical",
    gradient: "from-platform-medical/20 via-platform-medical/5 to-transparent",
    border: "hover:border-platform-medical/40",
    groupBorder: "group-hover:border-platform-medical/30",
    featureColor: "text-info",
    featureBg: "bg-info/10",
  },
  "swift-care-hub": {
    icon: HeartPulse,
    accent: "text-platform-emergency",
    bgAccent: "bg-platform-emergency",
    gradient: "from-platform-emergency/20 via-platform-emergency/5 to-transparent",
    border: "hover:border-platform-emergency/40",
    groupBorder: "group-hover:border-platform-emergency/30",
    featureColor: "text-destructive",
    featureBg: "bg-destructive/10",
  },
  "track-triumph-tavern": {
    icon: Trophy,
    accent: "text-platform-triumph",
    bgAccent: "bg-platform-triumph",
    gradient: "from-platform-triumph/20 via-platform-triumph/5 to-transparent",
    border: "hover:border-platform-triumph/40",
    groupBorder: "group-hover:border-platform-triumph/30",
    featureColor: "text-accent",
    featureBg: "bg-accent/10",
  },
  "trust-seal-chain": {
    icon: ShieldCheck,
    accent: "text-platform-governance",
    bgAccent: "bg-platform-governance",
    gradient: "from-platform-governance/20 via-platform-governance/5 to-transparent",
    border: "hover:border-platform-governance/40",
    groupBorder: "group-hover:border-platform-governance/30",
    featureColor: "text-success",
    featureBg: "bg-success/10",
  },
  studybeats: {
    icon: BookHeadphones,
    accent: "text-primary",
    bgAccent: "bg-primary",
    gradient: "from-primary/20 via-primary/5 to-transparent",
    border: "hover:border-primary/40",
    groupBorder: "group-hover:border-primary/30",
    featureColor: "text-primary",
    featureBg: "bg-primary/10",
  },
  "vascular-atlas": {
    icon: Stethoscope,
    accent: "text-destructive",
    bgAccent: "bg-destructive",
    gradient: "from-destructive/20 via-destructive/5 to-transparent",
    border: "hover:border-destructive/40",
    groupBorder: "group-hover:border-destructive/30",
    featureColor: "text-destructive",
    featureBg: "bg-destructive/10",
  },
};

/**
 * Safe accessor — always returns a valid config, never undefined.
 * Future platforms without a config will get a visible but non-crashing default.
 */
export function getPlatformConfig(key: string): PlatformVisualConfig {
  return PLATFORM_CONFIGS[key] ?? DEFAULT_CONFIG;
}

// ============================================
// Legacy flat maps — derived from unified config for backward compat
// These are consumed by PlateformesPage, StatusPage, etc.
// ============================================
function buildMap<K extends keyof PlatformVisualConfig>(field: K): Record<string, PlatformVisualConfig[K]> {
  const map: Record<string, PlatformVisualConfig[K]> = {};
  for (const [key, cfg] of Object.entries(PLATFORM_CONFIGS)) {
    map[key] = cfg[field];
  }
  return map;
}

export const PLATFORM_ICONS: Record<string, LucideIcon> = buildMap("icon");
export const PLATFORM_ACCENTS: Record<string, string> = buildMap("accent");
export const PLATFORM_BG_ACCENTS: Record<string, string> = buildMap("bgAccent");
export const PLATFORM_GRADIENTS: Record<string, string> = buildMap("gradient");
export const PLATFORM_BORDERS: Record<string, string> = buildMap("border");
export const PLATFORM_GROUP_BORDERS: Record<string, string> = buildMap("groupBorder");

// Labels de statut
export const STATUS_LABELS = {
  production: { label: "Production", couleur: "text-success", bg: "bg-success", indicateur: "bg-status-green" },
  prototype: { label: "Prototype", couleur: "text-warning", bg: "bg-warning", indicateur: "bg-status-amber" },
  development: { label: "Développement", couleur: "text-muted-foreground", bg: "bg-muted-foreground", indicateur: "bg-muted-foreground" },
} as const;
