/**
 * @deprecated Importez désormais depuis "@/hooks/hq/*" pour de nouveaux fichiers.
 *
 * Ce module reste un barrel re-export pour la rétro-compatibilité des 31 fichiers
 * qui importent encore "@/hooks/useHQData". Les hooks ont été éclatés (Horizon 1) :
 *  - usePlatforms, usePlatform                → @/hooks/hq/usePlatforms
 *  - useRecentRuns, useExecuteRun             → @/hooks/hq/useRuns
 *  - usePendingApprovals, useApproveAction    → @/hooks/hq/useApprovals
 *  - useAgents, useOrgRoles, useAuditLogs,
 *    useSystemConfig, useUpdateConfig         → @/hooks/hq/useGovernance
 */
export { usePlatforms, usePlatform } from "@/hooks/hq/usePlatforms";
export type { Platform } from "@/hooks/hq/usePlatforms";

export { useRecentRuns, useExecuteRun } from "@/hooks/hq/useRuns";
export type { Run, ExecutiveRunResult } from "@/hooks/hq/useRuns";

export { usePendingApprovals, useApproveAction } from "@/hooks/hq/useApprovals";
export type { Action } from "@/hooks/hq/useApprovals";

export {
  useAgents,
  useOrgRoles,
  useAuditLogs,
  useSystemConfig,
  useUpdateConfig,
} from "@/hooks/hq/useGovernance";
export type { Agent, OrgRole, AuditLog } from "@/hooks/hq/useGovernance";
