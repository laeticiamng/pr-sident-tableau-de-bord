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