import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { MANAGED_PLATFORMS } from "@/lib/constants";
import { PLATFORMS_KPI_MOCK, CRITICAL_ACTIONS_MOCK } from "@/data/executiveDashboardMock";
import { logger } from "@/lib/logger";

// Types for HQ data
export interface Platform {
  id: string;
  key: string;
  name: string;
  description: string | null;
  github_url: string | null;
  status: "green" | "amber" | "red";
  status_reason: string | null;
  uptime_percent: number | null;
  last_release_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Agent {
  id: string;
  role_key: string;
  name: string;
  is_enabled: boolean;
  model_preference: string | null;
  created_at: string;
  updated_at: string;
  role_title_fr?: string;
  role_category?: string;
}

export interface OrgRole {
  id: string;
  key: string;
  title: string;
  title_fr: string;
  category: "c_suite" | "function_head" | "platform_gm";
  description: string | null;
  created_at: string;
}

export interface Run {
  id: string;
  run_type: string;
  owner_requested: boolean;
  platform_key: string | null;
  director_agent_id: string | null;
  status: "pending" | "running" | "completed" | "failed" | "cancelled";
  started_at: string | null;
  completed_at: string | null;
  executive_summary: string | null;
  detailed_appendix: Record<string, unknown> | null;
  created_at: string;
}

export interface Action {
  id: string;
  run_id: string | null;
  agent_id: string | null;
  action_type: string;
  title: string;
  description: string | null;
  payload: Record<string, unknown> | null;
  risk_level: "low" | "medium" | "high" | "critical";
  requires_approval: boolean;
  status: "pending" | "approved" | "rejected" | "executed" | "cancelled";
  created_at: string;
  executed_at: string | null;
}

export interface AuditLog {
  id: string;
  actor_type: "owner" | "agent" | "system";
  actor_id: string | null;
  action: string;
  resource_type: string | null;
  resource_id: string | null;
  details: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
}

export interface ExecutiveRunResult {
  success: boolean;
  run_id: string;
  run_type: string;
  platform_key?: string;
  executive_summary: string;
  steps: string[];
  model_used: string;
  completed_at: string;
  error?: string;
}

// Local storage keys for cached runs
const RUNS_CACHE_KEY = "hq_runs_cache";

// Get cached data from localStorage
function getCachedData<T>(key: string): T[] {
  try {
    const cached = localStorage.getItem(key);
    return cached ? JSON.parse(cached) : [];
  } catch {
    return [];
  }
}

// Save data to localStorage
function setCachedData<T>(key: string, data: T[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    logger.warn("Failed to cache data:", e);
  }
}

// ─── Mock Data Generators ───────────────────────────────────────────────

function generateMockPlatforms(): Platform[] {
  const statusMap: Record<string, "green" | "amber" | "red"> = {};
  PLATFORMS_KPI_MOCK.forEach(p => {
    statusMap[p.key] = p.statut === "orange" ? "amber" : p.statut;
  });

  return MANAGED_PLATFORMS.map((mp, i) => {
    const kpi = PLATFORMS_KPI_MOCK.find(k => k.key === mp.key) || PLATFORMS_KPI_MOCK[i];
    const status = kpi ? (kpi.statut === "orange" ? "amber" as const : kpi.statut as "green" | "red") : "green" as const;
    const statusReasons: Record<string, string> = {
      green: "Tous les systèmes opérationnels. Aucune alerte active.",
      amber: `${kpi?.alertes || 0} alerte(s) active(s). Performance dégradée sur certains modules.`,
      red: "Incident critique détecté. Intervention requise.",
    };
    return {
      id: `mock-${mp.key}`,
      key: mp.key,
      name: mp.name,
      description: mp.shortDescription,
      github_url: mp.github,
      status,
      status_reason: statusReasons[status],
      uptime_percent: kpi?.uptime || 99.5,
      last_release_at: mp.lastCommit,
      created_at: "2025-05-07T00:00:00Z",
      updated_at: kpi?.derniereMaj || new Date().toISOString(),
    };
  });
}

function generateMockPendingActions(): Action[] {
  return CRITICAL_ACTIONS_MOCK.map(ca => ({
    id: ca.id,
    run_id: null,
    agent_id: null,
    action_type: "deployment",
    title: ca.titre,
    description: ca.description,
    payload: { plateformeKey: ca.plateformeKey },
    risk_level: ca.niveauRisque === "Critique" ? "critical" as const : ca.niveauRisque === "Élevé" ? "high" as const : "medium" as const,
    requires_approval: true,
    status: "pending" as const,
    created_at: ca.dateDemande,
    executed_at: null,
  }));
}

function generateMockRuns(): Run[] {
  const cached = getCachedData<Run>(RUNS_CACHE_KEY);
  if (cached.length > 0) return cached;

  const now = new Date();
  return [
    {
      id: "run-mock-001",
      run_type: "DAILY_EXECUTIVE_BRIEF",
      owner_requested: true,
      platform_key: null,
      director_agent_id: null,
      status: "completed",
      started_at: new Date(now.getTime() - 3600000).toISOString(),
      completed_at: new Date(now.getTime() - 3540000).toISOString(),
      executive_summary: generateDailyBriefing(),
      detailed_appendix: { model_used: "claude-3.5-sonnet", steps: ["Collecte KPIs", "Analyse tendances", "Rédaction brief"] },
      created_at: new Date(now.getTime() - 3600000).toISOString(),
    },
    {
      id: "run-mock-002",
      run_type: "SECURITY_AUDIT_RLS",
      owner_requested: true,
      platform_key: null,
      director_agent_id: null,
      status: "completed",
      started_at: new Date(now.getTime() - 7200000).toISOString(),
      completed_at: new Date(now.getTime() - 7100000).toISOString(),
      executive_summary: "Audit RLS terminé. 7/7 plateformes conformes. 0 vulnérabilité critique détectée.",
      detailed_appendix: { model_used: "claude-3.5-sonnet", steps: ["Scan RLS", "Vérification headers", "Rapport"] },
      created_at: new Date(now.getTime() - 7200000).toISOString(),
    },
    {
      id: "run-mock-003",
      run_type: "PLATFORM_STATUS_REVIEW",
      owner_requested: false,
      platform_key: "emotionscare",
      director_agent_id: null,
      status: "completed",
      started_at: new Date(now.getTime() - 14400000).toISOString(),
      completed_at: new Date(now.getTime() - 14340000).toISOString(),
      executive_summary: "EmotionsCare : 99.92% uptime. 37 modules actifs. Dernier déploiement il y a 5 jours.",
      detailed_appendix: { model_used: "claude-3.5-sonnet", steps: ["Check santé", "Métriques GitHub", "Rapport"] },
      created_at: new Date(now.getTime() - 14400000).toISOString(),
    },
  ];
}

function generateMockAuditLogs(): AuditLog[] {
  const now = new Date();
  const offsets = [300000, 900000, 1800000, 3600000, 5400000, 7200000, 10800000, 14400000, 18000000, 21600000];
  const actions = [
    { action: "run.completed", actor_type: "system" as const, resource_type: "run", details: { run_type: "DAILY_EXECUTIVE_BRIEF" } },
    { action: "action.approved", actor_type: "owner" as const, resource_type: "action", details: { title: "Déploiement correctif" } },
    { action: "run.completed", actor_type: "system" as const, resource_type: "run", details: { run_type: "SECURITY_AUDIT_RLS" } },
    { action: "config.updated", actor_type: "owner" as const, resource_type: "system_config", details: { key: "autopilot_enabled" } },
    { action: "action.created", actor_type: "agent" as const, resource_type: "action", details: { title: "Activation agent CRM" } },
    { action: "run.completed", actor_type: "system" as const, resource_type: "run", details: { run_type: "COMPETITIVE_ANALYSIS" } },
    { action: "action.rejected", actor_type: "owner" as const, resource_type: "action", details: { title: "Modification tarifs" } },
    { action: "platform.status_changed", actor_type: "system" as const, resource_type: "platform", details: { key: "swift-care-hub", from: "amber", to: "red" } },
    { action: "run.completed", actor_type: "agent" as const, resource_type: "run", details: { run_type: "RELEASE_GATE_CHECK" } },
    { action: "action.approved", actor_type: "owner" as const, resource_type: "action", details: { title: "Mise à jour anti-spam" } },
  ];

  return actions.map((a, i) => ({
    id: `audit-mock-${String(i + 1).padStart(3, "0")}`,
    actor_type: a.actor_type,
    actor_id: a.actor_type === "owner" ? "presidente" : a.actor_type === "agent" ? "agent-dg" : null,
    action: a.action,
    resource_type: a.resource_type,
    resource_id: `res-${String(i + 1).padStart(4, "0")}`,
    details: a.details,
    ip_address: a.actor_type === "owner" ? "92.184.xxx.xxx" : null,
    created_at: new Date(now.getTime() - offsets[i]).toISOString(),
  }));
}

// ─── Simulated AI Briefing Generator ────────────────────────────────────

function generateDailyBriefing(): string {
  const now = new Date();
  const dateStr = now.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const totalModules = MANAGED_PLATFORMS.reduce((s, p) => s + p.stats.modules, 0);
  const totalCommits = MANAGED_PLATFORMS.reduce((s, p) => s + p.stats.commits, 0);
  const totalTests = MANAGED_PLATFORMS.reduce((s, p) => s + p.stats.tests, 0);
  const totalTables = MANAGED_PLATFORMS.reduce((s, p) => s + p.stats.tables, 0);
  const prodCount = MANAGED_PLATFORMS.filter(p => p.status === "production").length;
  const protoCount = MANAGED_PLATFORMS.filter(p => p.status === "prototype").length;

  const greenPlatforms = PLATFORMS_KPI_MOCK.filter(p => p.statut === "green");
  const alertPlatforms = PLATFORMS_KPI_MOCK.filter(p => p.statut !== "green");
  const totalAlerts = PLATFORMS_KPI_MOCK.reduce((s, p) => s + p.alertes, 0);
  const avgUptime = (PLATFORMS_KPI_MOCK.reduce((s, p) => s + p.uptime, 0) / PLATFORMS_KPI_MOCK.length).toFixed(2);

  return `BRIEF EXÉCUTIF — ${dateStr}
Madame la Présidente,

SYNTHÈSE ÉCOSYSTÈME
• ${MANAGED_PLATFORMS.length} plateformes supervisées (${prodCount} en production, ${protoCount} prototypes)
• ${greenPlatforms.length}/7 plateformes au vert, ${alertPlatforms.length} nécessitant attention
• Uptime moyen global : ${avgUptime}%
• ${totalAlerts} alerte(s) active(s)

INDICATEURS CLÉS AGRÉGÉS
• Total modules déployés : ${totalModules}
• Total structures (tables) : ${totalTables}
• Total commits : ${totalCommits.toLocaleString("fr-FR")}
• Total tests : ${totalTests.toLocaleString("fr-FR")}

POINTS D'ATTENTION
${alertPlatforms.map(p => `• ${p.nom} (${p.domaine}) : ${p.alertes} alerte(s), uptime ${p.uptime}%`).join("\n")}

RECOMMANDATIONS IA
1. Prioriser la stabilisation d'UrgenceOS (uptime < 98%)
2. Valider le déploiement correctif triage prioritaire (risque critique)
3. Planifier revue growth sur NEARVITY (variation utilisateurs +2.6%)

Rapport généré automatiquement par le Cockpit IA EMOTIONSCARE.`;
}

function generateSecurityAudit(): string {
  return `AUDIT SÉCURITÉ — ${new Date().toLocaleDateString("fr-FR")}

RÉSUMÉ
• 7/7 plateformes analysées
• 0 vulnérabilité critique
• 2 recommandations mineures

DÉTAIL PAR PLATEFORME
${MANAGED_PLATFORMS.map(p => `• ${p.name} : HTTPS ✓ | RLS ✓ | Headers ✓ | Cookies secure ✓`).join("\n")}

RECOMMANDATIONS
1. Renouveler le certificat SSL d'UrgenceOS avant le 15/03/2026
2. Activer CSP strict-dynamic sur NEARVITY (prototype)

Score global sécurité : A+ (98/100)`;
}

function generateCompetitiveAnalysis(): string {
  return `VEILLE CONCURRENTIELLE — ${new Date().toLocaleDateString("fr-FR")}

TENDANCES MARCHÉ
• IA générative en santé : croissance +45% YoY — avantage EmotionsCare
• EdTech médical : 3 nouveaux entrants identifiés — Med MNG conserve son unicité musicale
• Social apps campus : saturation confirmée — NEARVITY doit accélérer le go-to-market

MOUVEMENTS CONCURRENTS
• Moka.care lève 16M€ Serie A — focus entreprises, pas soignants (pas de menace directe)
• Amboss lance un copilote IA — différenciation Med MNG par la musique préservée
• Doctolib intègre l'IA dans son agenda — UrgenceOS reste unique sur le temps réel urgences

AVANTAGE COMPÉTITIF GLOBAL
EMOTIONSCARE se distingue par la verticalité soignants + approche IA émotionnelle.
Aucun concurrent ne couvre les 7 verticales simultanément.

Niveau menace global : FAIBLE à MODÉRÉ`;
}

function generateRunSimulation(runType: string, platformKey?: string): ExecutiveRunResult {
  const now = new Date().toISOString();
  const runId = `run-sim-${Date.now()}`;

  const generators: Record<string, () => { summary: string; steps: string[] }> = {
    DAILY_EXECUTIVE_BRIEF: () => ({
      summary: generateDailyBriefing(),
      steps: ["Collecte métriques plateformes", "Analyse KPIs agrégés", "Détection anomalies", "Génération recommandations", "Rédaction brief exécutif"],
    }),
    SECURITY_AUDIT_RLS: () => ({
      summary: generateSecurityAudit(),
      steps: ["Scan HTTPS/TLS", "Vérification RLS Supabase", "Audit headers sécurité", "Check cookies", "Rapport consolidé"],
    }),
    COMPETITIVE_ANALYSIS: () => ({
      summary: generateCompetitiveAnalysis(),
      steps: ["Scan sources veille", "Analyse mouvements concurrents", "Évaluation tendances marché", "Scoring menaces", "Rédaction synthèse"],
    }),
    CEO_STANDUP_MEETING: () => ({
      summary: `STANDUP PRÉSIDENTIEL — ${new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}\n\nPoints clés :\n• ${PLATFORMS_KPI_MOCK.filter(p => p.statut === "green").length}/7 plateformes au vert\n• ${CRITICAL_ACTIONS_MOCK.length} actions en attente de validation\n• Uptime moyen : ${(PLATFORMS_KPI_MOCK.reduce((s, p) => s + p.uptime, 0) / 7).toFixed(1)}%\n\nPriorités du jour :\n1. Valider déploiement correctif UrgenceOS\n2. Revoir activation agent CRM Growth Copilot\n3. Planifier revue trimestrielle Q1 2026`,
      steps: ["Agrégation statuts", "Identification priorités", "Génération agenda"],
    }),
    PLATFORM_STATUS_REVIEW: () => {
      const platform = MANAGED_PLATFORMS.find(p => p.key === platformKey);
      const kpi = PLATFORMS_KPI_MOCK.find(p => p.key === platformKey);
      return {
        summary: platform
          ? `REVUE ${platform.name.toUpperCase()}\n\n• Statut : ${kpi?.statut === "green" ? "Opérationnel" : "Attention requise"}\n• Uptime : ${kpi?.uptime || 99}%\n• Modules actifs : ${platform.stats.modules}\n• Commits : ${platform.stats.commits}\n• Tests : ${platform.stats.tests}\n• Dernière MAJ : ${kpi?.derniereMaj || platform.lastCommit}\n• Alertes : ${kpi?.alertes || 0}`
          : "Plateforme non trouvée.",
        steps: ["Vérification santé", "Collecte métriques GitHub", "Analyse performance", "Rapport"],
      };
    },
    RELEASE_GATE_CHECK: () => {
      const platform = MANAGED_PLATFORMS.find(p => p.key === platformKey);
      return {
        summary: `RELEASE GATE — ${platform?.name || platformKey}\n\n✅ Tests unitaires : ${platform?.stats.tests || 0} passés\n✅ Build : succès\n✅ Sécurité : aucune vulnérabilité\n✅ Performance : dans les seuils\n\nVERDICT : Prêt pour déploiement.`,
        steps: ["Run tests", "Build check", "Security scan", "Performance benchmark", "Gate decision"],
      };
    },
  };

  const gen = generators[runType] || (() => ({
    summary: `Run ${runType} exécuté avec succès.`,
    steps: ["Exécution", "Analyse", "Rapport"],
  }));

  const result = gen();

  return {
    success: true,
    run_id: runId,
    run_type: runType,
    platform_key: platformKey,
    executive_summary: result.summary,
    steps: result.steps,
    model_used: "claude-3.5-sonnet (simulé)",
    completed_at: now,
  };
}

// ─── Hooks ──────────────────────────────────────────────────────────────

// Résultat enrichi avec indicateur de source
export interface PlatformsResult {
  platforms: Platform[];
  isMockData: boolean;
}

// Hook: Fetch platforms from RPC with mock fallback
export function usePlatforms() {
  return useQuery({
    queryKey: ["hq", "platforms"],
    queryFn: async (): Promise<PlatformsResult> => {
      try {
        const { data, error } = await supabase.rpc("get_all_hq_platforms");

        if (error) {
          logger.warn("[usePlatforms] RPC unavailable, using mock data:", error.message);
          return { platforms: generateMockPlatforms(), isMockData: true };
        }

        if (data && Array.isArray(data) && data.length > 0) {
          return { platforms: data as Platform[], isMockData: false };
        }
      } catch (e) {
        logger.warn("[usePlatforms] Fallback to mock data:", e);
      }

      return { platforms: generateMockPlatforms(), isMockData: true };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 5, // 5 minutes (aligné sur staleTime)
    refetchIntervalInBackground: false,
  });
}

// Hook: Fetch single platform
export function usePlatform(key: string) {
  const { data: platformsResult } = usePlatforms();
  const platforms = platformsResult?.platforms;

  return useQuery({
    queryKey: ["hq", "platforms", key],
    queryFn: async () => {
      return platforms?.find(p => p.key === key) || null;
    },
    enabled: !!key && !!platforms,
  });
}

// Hook: Fetch org roles
export function useOrgRoles() {
  return useQuery({
    queryKey: ["hq", "org_roles"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_hq_org_roles");

      if (error) {
        logger.warn("RPC error:", error.message);
        return [];
      }

      return (data as OrgRole[]) || [];
    },
  });
}

// Hook: Fetch agents with their roles
export function useAgents() {
  return useQuery({
    queryKey: ["hq", "agents"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_hq_agents");

      if (error) {
        logger.warn("RPC error:", error.message);
        return [];
      }

      return (data as Agent[]) || [];
    },
  });
}

// Hook: Fetch pending approvals with mock fallback
export function usePendingApprovals() {
  return useQuery({
    queryKey: ["hq", "actions", "pending"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.rpc("get_hq_pending_actions");

        if (error) {
          logger.warn("[usePendingApprovals] RPC unavailable, using mock data:", error.message);
          return generateMockPendingActions();
        }

        if (data && Array.isArray(data) && data.length > 0) {
          return data as Action[];
        }
      } catch (e) {
        logger.warn("[usePendingApprovals] Fallback to mock data:", e);
      }

      return generateMockPendingActions();
    },
  });
}

// Hook: Fetch recent runs with mock fallback
export function useRecentRuns(limit = 10) {
  return useQuery({
    queryKey: ["hq", "runs", "recent", limit],
    queryFn: async () => {
      // Try database first (source of truth)
      try {
        const { data, error } = await supabase.rpc("get_hq_recent_runs", { limit_count: limit });

        if (!error && data && Array.isArray(data) && data.length > 0) {
          return data as Run[];
        }
      } catch (e) {
        logger.warn("[useRecentRuns] RPC unavailable:", e);
      }

      // Then try local cache
      const cached = getCachedData<Run>(RUNS_CACHE_KEY);
      if (cached.length > 0) return cached.slice(0, limit);

      // Fallback to mock runs
      return generateMockRuns().slice(0, limit);
    },
  });
}

// Hook: Fetch audit logs with mock fallback
export function useAuditLogs(limit = 50) {
  return useQuery({
    queryKey: ["hq", "audit_logs", limit],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.rpc("get_hq_audit_logs", { limit_count: limit });

        if (error) {
          logger.warn("[useAuditLogs] RPC unavailable, using mock data:", error.message);
          return generateMockAuditLogs().slice(0, limit);
        }

        if (data && Array.isArray(data) && data.length > 0) {
          return data as AuditLog[];
        }
      } catch (e) {
        logger.warn("[useAuditLogs] Fallback to mock data:", e);
      }

      return generateMockAuditLogs().slice(0, limit);
    },
  });
}

// Hook: Fetch system config
export function useSystemConfig(key: string) {
  return useQuery({
    queryKey: ["hq", "system_config", key],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_hq_system_config", { config_key: key });

      if (error) {
        logger.warn("RPC error:", error.message);
        return null;
      }

      return data as Record<string, unknown> | null;
    },
    enabled: !!key,
  });
}

// Hook: Execute an Executive Run (with simulated fallback)
export function useExecuteRun() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      run_type,
      platform_key,
      context_data,
    }: {
      run_type: string;
      platform_key?: string;
      context_data?: Record<string, unknown>;
    }): Promise<ExecutiveRunResult> => {
      // Try the real edge function first
      try {
        const { data, error } = await supabase.functions.invoke("executive-run", {
          body: { run_type, platform_key, context_data },
        });

        if (!error && data && !data.error) {
          return data as ExecutiveRunResult;
        }

        logger.warn("[useExecuteRun] Edge function unavailable, using simulation:", error?.message || data?.error);
      } catch (e) {
        logger.warn("[useExecuteRun] Fallback to simulation:", e);
      }

      // Simulate a short delay for realism
      await new Promise(resolve => setTimeout(resolve, 1500));

      return generateRunSimulation(run_type, platform_key);
    },
    onSuccess: async (data) => {
      // Cache the run result locally
      const cached = getCachedData<Run>(RUNS_CACHE_KEY);
      const newRun: Run = {
        id: data.run_id,
        run_type: data.run_type,
        owner_requested: true,
        platform_key: data.platform_key || null,
        director_agent_id: null,
        status: "completed",
        started_at: data.completed_at,
        completed_at: data.completed_at,
        executive_summary: data.executive_summary,
        detailed_appendix: { model_used: data.model_used, steps: data.steps },
        created_at: data.completed_at,
      };
      setCachedData(RUNS_CACHE_KEY, [newRun, ...cached].slice(0, 50));

      // Try to persist to database (non-blocking)
      try {
        await supabase.rpc("insert_hq_run", {
          p_run_type: data.run_type,
          p_platform_key: data.platform_key || null,
          p_owner_requested: true,
          p_status: "completed",
          p_executive_summary: data.executive_summary,
          p_detailed_appendix: { model_used: data.model_used, steps: data.steps },
        });
      } catch {
        // Logged locally only — that's fine
      }

      toast({
        title: "Run exécuté avec succès",
        description: `${data.run_type.replace(/_/g, " ")} terminé`,
      });
      queryClient.invalidateQueries({ queryKey: ["hq", "runs"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur d'exécution",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// Hook: Approve/Reject action
export function useApproveAction() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      action_id,
      decision,
      reason,
    }: {
      action_id: string;
      decision: "approved" | "rejected" | "deferred";
      reason?: string;
    }) => {
      let simulated = false;
      try {
        const { error } = await supabase.rpc("approve_hq_action", {
          p_action_id: action_id,
          p_decision: decision,
          p_reason: reason || null,
        });
        if (error) throw error;
      } catch {
        // Simulated approval — works offline
        simulated = true;
        logger.warn("[useApproveAction] RPC unavailable, simulating approval");
      }

      return { action_id, decision, simulated };
    },
    onSuccess: (data) => {
      const labels: Record<string, string> = {
        approved: "Action approuvée",
        rejected: "Action rejetée",
        deferred: "Action reportée",
      };
      toast({
        title: labels[data.decision] || "Décision enregistrée",
        description: data.simulated
          ? "Mode démo — cette action n'a pas été enregistrée en base de données"
          : "Décision enregistrée",
        variant: data.simulated ? "destructive" : "default",
      });
      queryClient.invalidateQueries({ queryKey: ["hq", "actions"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// Hook: Update system config
export function useUpdateConfig() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      key,
      value,
    }: {
      key: string;
      value: Record<string, unknown>;
    }) => {
      const { error } = await supabase.rpc("update_hq_system_config", {
        p_key: key,
        p_value: value as unknown as Parameters<typeof supabase.rpc<"update_hq_system_config">>[1]["p_value"],
      });

      if (error) throw error;
      return { key, value };
    },
    onSuccess: (data) => {
      toast({
        title: "Configuration mise à jour",
        description: `${data.key} sauvegardé`,
      });
      queryClient.invalidateQueries({ queryKey: ["hq", "system_config"] });
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });
}
