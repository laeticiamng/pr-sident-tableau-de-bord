/**
 * Source de vérité — pattern d'architecture HQ répliqué pour chaque plateforme.
 *
 * Chaque plateforme suit la même logique systémique :
 *   1. Schéma SQL isolé + RLS stricte (`is_owner()` / `has_org_access()`)
 *   2. Accès données exclusivement via RPC SECURITY DEFINER (jamais en direct)
 *   3. Edge Functions Deno.serve() avec JWT + RBAC + sanitisation d'erreurs
 *   4. Run Engine (29 templates) + DLQ + retry exponentiel + structured_logs
 *   5. Autopilot pg_cron + anti-duplication 10 min + override 15 min
 *   6. Observabilité : /healthz public, p95, SLO, audit immuable
 *   7. Frontend résilient : circuit-breaker, fallback "Connection Required"
 */

import type { PlatformKey } from "@/lib/constants";

export interface ArchitectureLayer {
  key: string;
  title: string;
  description: string;
  patternHQ: string;
  references: string[];
}

export interface PlatformArchitectureProfile {
  key: PlatformKey | string;
  name: string;
  status: "applied" | "partial" | "todo";
  notes: string;
  layers: Partial<Record<ArchitectureLayer["key"], "applied" | "partial" | "todo">>;
}

/** Les 7 couches du pattern HQ (source de vérité). */
export const ARCHITECTURE_LAYERS: ArchitectureLayer[] = [
  {
    key: "schema",
    title: "1. Schéma SQL isolé",
    description:
      "Schéma dédié (ex: hq) jamais exposé via PostgREST direct. Tables tenant-scoped via organization_id + organization_members.",
    patternHQ:
      "Schéma `hq.*` strictement isolé. Vues read-only pour cross-platform. RLS PERMISSIVE filtrant par is_owner() ou has_org_access().",
    references: ["mem://technical/database-isolation", "mem://security/rls-hardening-v3"],
  },
  {
    key: "rls",
    title: "2. RLS stricte sans USING true",
    description:
      "Aucune policy permissive globale. Toute lecture/écriture passe par is_owner() ou un check d'appartenance organisationnelle.",
    patternHQ:
      "Functions SECURITY DEFINER `is_owner()`, `has_role()`, `has_org_access()`, `has_permission()`. Anon explicitement DENY.",
    references: ["mem://security/rls-hardening-v3", "mem://architecture/granular-rbac"],
  },
  {
    key: "rpc",
    title: "3. RPC SECURITY DEFINER",
    description:
      "Accès aux données métier uniquement via RPC nommées `get_*`, `insert_*`, `update_*`. Jamais de SELECT direct côté client.",
    patternHQ:
      "40+ RPC `get_hq_*` / `insert_hq_*` avec check `is_owner()` en première instruction. search_path figé à 'public, hq'.",
    references: ["mem://technical/backend-access-layer"],
  },
  {
    key: "edge",
    title: "4. Edge Functions sécurisées",
    description:
      "Deno.serve(), validation JWT + RBAC, validation d'entrée Zod, erreurs sanitizées (jamais de stack ni d'env exposés).",
    patternHQ:
      "16 Edge Functions HQ : auth.ts shared, circuit-breaker AI Gateway, rate-limit DB, CORS strict.",
    references: [
      "mem://technical/hq-edge-functions",
      "mem://technical/edge-function-runtime-standard",
      "mem://security/edge-function-hardening-sanitization",
    ],
  },
  {
    key: "runs",
    title: "5. Run Engine + DLQ",
    description:
      "Tous les jobs IA passent par un registre typé (run_type), persistés dans `runs`, échecs routés vers DLQ avec retry 1→5→30 min.",
    patternHQ:
      "29 templates dans `run-types-registry.ts`, `executive-run` orchestrateur, `hq.runs_dlq` + worker `retry-dlq-runs`.",
    references: [
      "mem://architecture/executive-runs-v2",
      "mem://architecture/horizon-2-reliability",
    ],
  },
  {
    key: "autopilot",
    title: "6. Autopilot anti-duplication",
    description:
      "Scheduler pg_cron déclenchant des cycles autonomes avec verrou anti-double exécution (10 min) et override stuck-run (15 min).",
    patternHQ:
      "`ai-scheduler` + `scheduled-runs` avec X-Cron-Secret, garde 10 min via `get_hq_recent_runs`, log `autopilot.decision`.",
    references: [
      "mem://architecture/autonomous-ai-scheduler",
      "mem://governance/autopilot-concurrency-control",
    ],
  },
  {
    key: "observability",
    title: "7. Observabilité & gouvernance",
    description:
      "Logs structurés 30j, audit immuable, /healthz public, métriques p95/SLO, fallback UI explicite.",
    patternHQ:
      "`hq.structured_logs` + `hq.audit_logs` + `get_hq_slo_status` + `/healthz` + `MethodologyDisclosure` côté UI.",
    references: [
      "mem://observability/production-monitoring",
      "mem://observability/system-status-visibility",
    ],
  },
];

/**
 * Application du pattern par plateforme.
 * `applied` = pattern complet en place, `partial` = base présente mais incomplète, `todo` = à industrialiser.
 */
export const PLATFORM_ARCHITECTURE: PlatformArchitectureProfile[] = [
  {
    key: "emotionscare",
    name: "EmotionsCare",
    status: "applied",
    notes: "Référence du pattern. RLS, RPC, Edge Functions, runs et observabilité industrialisés.",
    layers: {
      schema: "applied",
      rls: "applied",
      rpc: "applied",
      edge: "applied",
      runs: "applied",
      autopilot: "applied",
      observability: "applied",
    },
  },
  {
    key: "med-mng",
    name: "Med MNG",
    status: "partial",
    notes: "Schéma isolé OK. À aligner : RPC `get_*` complètes et DLQ pour les jobs de génération musicale.",
    layers: {
      schema: "applied",
      rls: "applied",
      rpc: "partial",
      edge: "applied",
      runs: "partial",
      autopilot: "todo",
      observability: "partial",
    },
  },
  {
    key: "system-compass",
    name: "System Compass",
    status: "partial",
    notes: "Edge Functions analyse pays sécurisées. Reste : registre run_type dédié + SLO.",
    layers: {
      schema: "applied",
      rls: "applied",
      rpc: "applied",
      edge: "applied",
      runs: "partial",
      autopilot: "todo",
      observability: "partial",
    },
  },
  {
    key: "growth-copilot",
    name: "Growth Copilot",
    status: "applied",
    notes: "Workforce 39 agents IA déjà sur le pattern complet (cf. growth-analytics proxy).",
    layers: {
      schema: "applied",
      rls: "applied",
      rpc: "applied",
      edge: "applied",
      runs: "applied",
      autopilot: "applied",
      observability: "applied",
    },
  },
  {
    key: "nearvity",
    name: "NEARVITY",
    status: "partial",
    notes: "RLS et auth OK. À industrialiser : run engine + DLQ pour modération + observabilité p95.",
    layers: {
      schema: "applied",
      rls: "applied",
      rpc: "partial",
      edge: "partial",
      runs: "todo",
      autopilot: "todo",
      observability: "partial",
    },
  },
  {
    key: "swift-care-hub",
    name: "UrgenceOS",
    status: "partial",
    notes: "Critique métier. Prio P1 : RPC strictes + audit immuable + alerting rouge multi-zones.",
    layers: {
      schema: "applied",
      rls: "applied",
      rpc: "partial",
      edge: "partial",
      runs: "todo",
      autopilot: "todo",
      observability: "partial",
    },
  },
  {
    key: "track-triumph-tavern",
    name: "Track Triumph",
    status: "partial",
    notes: "Validation manuelle des concours sensibles déjà en place. Reste : DLQ + SLO.",
    layers: {
      schema: "applied",
      rls: "applied",
      rpc: "applied",
      edge: "applied",
      runs: "partial",
      autopilot: "todo",
      observability: "partial",
    },
  },
  {
    key: "trust-seal-chain",
    name: "Gouvernance Agents IA",
    status: "partial",
    notes: "Cas d'usage AI Act. RLS + audit OK. Run engine certification à câbler.",
    layers: {
      schema: "applied",
      rls: "applied",
      rpc: "partial",
      edge: "partial",
      runs: "todo",
      autopilot: "todo",
      observability: "partial",
    },
  },
  {
    key: "studybeats",
    name: "StudyBeats",
    status: "todo",
    notes: "Prototype. Pattern à dérouler complètement avant production payante.",
    layers: {
      schema: "applied",
      rls: "partial",
      rpc: "partial",
      edge: "partial",
      runs: "todo",
      autopilot: "todo",
      observability: "todo",
    },
  },
  {
    key: "vascular-atlas",
    name: "Vascular Atlas",
    status: "todo",
    notes: "Prototype clinique. Renforcement RGPD/RLS prioritaire avant tout volume.",
    layers: {
      schema: "applied",
      rls: "partial",
      rpc: "todo",
      edge: "todo",
      runs: "todo",
      autopilot: "todo",
      observability: "todo",
    },
  },
];

export function getCoverageScore(profile: PlatformArchitectureProfile): number {
  const total = ARCHITECTURE_LAYERS.length;
  let score = 0;
  for (const layer of ARCHITECTURE_LAYERS) {
    const v = profile.layers[layer.key];
    if (v === "applied") score += 1;
    else if (v === "partial") score += 0.5;
  }
  return Math.round((score / total) * 100);
}

/* -------------------------------------------------------------------------- */
/*                       Journal d'audit du pattern                            */
/* -------------------------------------------------------------------------- */

export type AuditActionStatus = "done" | "in_progress" | "blocked" | "planned";
export type AuditActionImpact = "applied" | "partial" | "todo";

export interface ArchitectureAuditAction {
  id: string;
  /** ISO date — horodatage de l'action */
  timestamp: string;
  platformKey: PlatformArchitectureProfile["key"];
  layerKey: ArchitectureLayer["key"];
  action: string;
  status: AuditActionStatus;
  /** Statut de la couche après l'action */
  resultingStatus: AuditActionImpact;
  actor: string;
  notes?: string;
}

/**
 * Journal des actions d'industrialisation du pattern HQ par plateforme.
 * Source de vérité versionnée — à compléter à chaque évolution réelle.
 * Ordre antéchronologique recommandé à l'usage (le tri se fait côté UI).
 */
export const ARCHITECTURE_AUDIT_LOG: ArchitectureAuditAction[] = [
  // --- EmotionsCare (référence) ---
  {
    id: "ec-runs-dlq-2026-03-12",
    timestamp: "2026-03-12T09:30:00Z",
    platformKey: "emotionscare",
    layerKey: "runs",
    action: "Activation DLQ + retry exponentiel (1→5→30 min)",
    status: "done",
    resultingStatus: "applied",
    actor: "Présidente",
    notes: "Horizon 2 reliability — 12 specs Playwright en place.",
  },
  {
    id: "ec-obs-2026-03-15",
    timestamp: "2026-03-15T14:00:00Z",
    platformKey: "emotionscare",
    layerKey: "observability",
    action: "Déploiement /healthz public + p95 RPC",
    status: "done",
    resultingStatus: "applied",
    actor: "Présidente",
  },
  // --- Med MNG ---
  {
    id: "med-rpc-2026-03-20",
    timestamp: "2026-03-20T10:15:00Z",
    platformKey: "med-mng",
    layerKey: "rpc",
    action: "Audit RPC `get_*` jobs musique — 6/14 manquantes",
    status: "in_progress",
    resultingStatus: "partial",
    actor: "Présidente",
    notes: "Reste à ajouter get_mng_generation_jobs + get_mng_track_status.",
  },
  {
    id: "med-runs-2026-03-22",
    timestamp: "2026-03-22T11:45:00Z",
    platformKey: "med-mng",
    layerKey: "runs",
    action: "Câblage initial run-engine génération musicale",
    status: "in_progress",
    resultingStatus: "partial",
    actor: "Autopilot",
  },
  {
    id: "med-autopilot-2026-04",
    timestamp: "2026-04-02T08:00:00Z",
    platformKey: "med-mng",
    layerKey: "autopilot",
    action: "Planification activation autopilot pg_cron",
    status: "planned",
    resultingStatus: "todo",
    actor: "Présidente",
  },
  // --- System Compass ---
  {
    id: "sc-edge-2026-03-18",
    timestamp: "2026-03-18T16:20:00Z",
    platformKey: "system-compass",
    layerKey: "edge",
    action: "Sécurisation Edge Functions analyse pays (JWT + Zod)",
    status: "done",
    resultingStatus: "applied",
    actor: "Présidente",
  },
  {
    id: "sc-runs-2026-04-01",
    timestamp: "2026-04-01T09:00:00Z",
    platformKey: "system-compass",
    layerKey: "runs",
    action: "Définition registre run_type dédié (3 templates)",
    status: "in_progress",
    resultingStatus: "partial",
    actor: "Présidente",
  },
  // --- Growth Copilot ---
  {
    id: "gc-full-2026-02-28",
    timestamp: "2026-02-28T18:00:00Z",
    platformKey: "growth-copilot",
    layerKey: "autopilot",
    action: "Mise en service workforce 39 agents IA — pattern complet",
    status: "done",
    resultingStatus: "applied",
    actor: "Présidente",
  },
  {
    id: "gc-obs-2026-03-25",
    timestamp: "2026-03-25T12:00:00Z",
    platformKey: "growth-copilot",
    layerKey: "observability",
    action: "Branchement growth-analytics proxy + alertes seuils",
    status: "done",
    resultingStatus: "applied",
    actor: "Présidente",
  },
  // --- NEARVITY ---
  {
    id: "nv-rls-2026-03-10",
    timestamp: "2026-03-10T10:00:00Z",
    platformKey: "nearvity",
    layerKey: "rls",
    action: "RLS hardening v3 (suppression USING true)",
    status: "done",
    resultingStatus: "applied",
    actor: "Présidente",
  },
  {
    id: "nv-runs-2026-04-05",
    timestamp: "2026-04-05T09:30:00Z",
    platformKey: "nearvity",
    layerKey: "runs",
    action: "Spécification run-engine modération à industrialiser",
    status: "planned",
    resultingStatus: "todo",
    actor: "Présidente",
  },
  // --- UrgenceOS ---
  {
    id: "uo-rpc-2026-03-30",
    timestamp: "2026-03-30T07:45:00Z",
    platformKey: "swift-care-hub",
    layerKey: "rpc",
    action: "Plan P1 : RPC strictes + audit immuable multi-zones",
    status: "in_progress",
    resultingStatus: "partial",
    actor: "Présidente",
    notes: "Critique métier — alerting rouge à câbler.",
  },
  {
    id: "uo-obs-2026-04-08",
    timestamp: "2026-04-08T15:00:00Z",
    platformKey: "swift-care-hub",
    layerKey: "observability",
    action: "Spec alerting rouge multi-zones",
    status: "blocked",
    resultingStatus: "partial",
    actor: "Présidente",
    notes: "Bloqué : attente validation cellule qualité hospitalière.",
  },
  // --- Track Triumph ---
  {
    id: "tt-rpc-2026-03-05",
    timestamp: "2026-03-05T13:00:00Z",
    platformKey: "track-triumph-tavern",
    layerKey: "rpc",
    action: "Validation manuelle des concours sensibles via RPC dédiée",
    status: "done",
    resultingStatus: "applied",
    actor: "Présidente",
  },
  {
    id: "tt-runs-2026-04-10",
    timestamp: "2026-04-10T11:00:00Z",
    platformKey: "track-triumph-tavern",
    layerKey: "runs",
    action: "DLQ + SLO à brancher sur worker votes",
    status: "planned",
    resultingStatus: "partial",
    actor: "Présidente",
  },
  // --- Trust Seal Chain ---
  {
    id: "tsc-edge-2026-04-03",
    timestamp: "2026-04-03T09:15:00Z",
    platformKey: "trust-seal-chain",
    layerKey: "edge",
    action: "Câblage run engine certification AI Act",
    status: "in_progress",
    resultingStatus: "partial",
    actor: "Présidente",
  },
  // --- StudyBeats ---
  {
    id: "sb-rls-2026-04-12",
    timestamp: "2026-04-12T10:30:00Z",
    platformKey: "studybeats",
    layerKey: "rls",
    action: "RLS partielle — durcissement avant ouverture payante",
    status: "in_progress",
    resultingStatus: "partial",
    actor: "Présidente",
  },
  // --- Vascular Atlas ---
  {
    id: "va-rls-2026-04-15",
    timestamp: "2026-04-15T08:00:00Z",
    platformKey: "vascular-atlas",
    layerKey: "rls",
    action: "Renforcement RGPD/RLS prioritaire avant tout volume",
    status: "in_progress",
    resultingStatus: "partial",
    actor: "Présidente",
    notes: "Prototype clinique — gel des écritures externes en attendant.",
  },
  {
    id: "va-rpc-2026-04-20",
    timestamp: "2026-04-20T09:00:00Z",
    platformKey: "vascular-atlas",
    layerKey: "rpc",
    action: "RPC `get_va_*` à concevoir (lectures cliniques)",
    status: "planned",
    resultingStatus: "todo",
    actor: "Présidente",
  },
];

export function getAuditActionsForPlatform(
  platformKey: PlatformArchitectureProfile["key"],
): ArchitectureAuditAction[] {
  return ARCHITECTURE_AUDIT_LOG
    .filter((a) => a.platformKey === platformKey)
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

/** Liste des couches encore à industrialiser pour une plateforme (status partial/todo). */
export function getGaps(profile: PlatformArchitectureProfile): ArchitectureLayer[] {
  return ARCHITECTURE_LAYERS.filter((l) => {
    const v = profile.layers[l.key];
    return v === "partial" || v === "todo" || v === undefined;
  });
}