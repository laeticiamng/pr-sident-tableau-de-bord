import { useState, useCallback, useEffect } from "react";
import { useSystemConfig, useUpdateConfig, useExecuteRun } from "./useHQData";
import { canAutoExecute, shouldRequireApproval, RUN_TYPE_CONFIG } from "@/lib/run-engine";
import { useToast } from "./use-toast";
import { isValidRunType, type RunType } from "@/lib/run-types-registry";

export interface AutopilotConfig {
  enabled: boolean;
  allowedRunTypes: string[];
  maxDailyAutonomousRuns: number;
  requireApprovalForHighRisk: boolean;
  notifyOnAutoExecution: boolean;
  pauseOnError: boolean;
}

const DEFAULT_AUTOPILOT_CONFIG: AutopilotConfig = {
  enabled: false,
  allowedRunTypes: [
    "DAILY_EXECUTIVE_BRIEF",
    "CEO_STANDUP_MEETING",
    "PLATFORM_STATUS_REVIEW",
    "COMPETITIVE_ANALYSIS",
    "MARKETING_WEEK_PLAN",
  ],
  maxDailyAutonomousRuns: 20,
  requireApprovalForHighRisk: true,
  notifyOnAutoExecution: true,
  pauseOnError: true,
};

export function useAutopilot() {
  const { toast } = useToast();
  const { data: configData, isLoading } = useSystemConfig("autopilot");
  const updateConfig = useUpdateConfig();
  const executeRun = useExecuteRun();
  
  const [dailyRunCount, setDailyRunCount] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  // Parse config from DB or use defaults
  const config: AutopilotConfig = {
    ...DEFAULT_AUTOPILOT_CONFIG,
    ...(configData as Partial<AutopilotConfig> || {}),
  };

  // Reset daily count at midnight
  useEffect(() => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const msUntilMidnight = tomorrow.getTime() - now.getTime();
    
    const timeout = setTimeout(() => {
      setDailyRunCount(0);
    }, msUntilMidnight);
    
    return () => clearTimeout(timeout);
  }, [dailyRunCount]);

  // Toggle autopilot on/off
  const toggleAutopilot = useCallback(async (enabled: boolean) => {
    await updateConfig.mutateAsync({
      key: "autopilot",
      value: { ...config, enabled },
    });
    
    toast({
      title: enabled ? "Autopilote activé" : "Autopilote désactivé",
      description: enabled 
        ? "Les tâches à faible risque seront exécutées automatiquement"
        : "Toutes les actions nécessiteront une approbation manuelle",
    });
  }, [config, updateConfig, toast]);

  // Panic switch - immediately stop all autonomous operations
  const panicStop = useCallback(async () => {
    setIsPaused(true);
    await updateConfig.mutateAsync({
      key: "autopilot",
      value: { ...config, enabled: false },
    });
    
    toast({
      title: "🚨 ARRÊT D'URGENCE",
      description: "Autopilote désactivé. Toutes les opérations autonomes sont stoppées.",
      variant: "destructive",
    });
  }, [config, updateConfig, toast]);

  // Resume after panic stop
  const resume = useCallback(() => {
    setIsPaused(false);
    setLastError(null);
  }, []);

  // Check if a run can be auto-executed
  const canAutoRun = useCallback((runType: string): { allowed: boolean; reason?: string } => {
    if (isPaused) {
      return { allowed: false, reason: "Autopilote en pause" };
    }
    
    if (!config.enabled) {
      return { allowed: false, reason: "Autopilote désactivé" };
    }
    
    if (!config.allowedRunTypes.includes(runType)) {
      return { allowed: false, reason: "Type de run non autorisé en autopilote" };
    }
    
    if (dailyRunCount >= config.maxDailyAutonomousRuns) {
      return { allowed: false, reason: "Limite quotidienne atteinte" };
    }
    
    const runConfig = RUN_TYPE_CONFIG[runType];
    if (runConfig && config.requireApprovalForHighRisk) {
      if (runConfig.riskLevel === "high" || runConfig.riskLevel === "critical") {
        return { allowed: false, reason: "Risque élevé - approbation requise" };
      }
    }
    
    if (!canAutoExecute(runType, config.enabled)) {
      return { allowed: false, reason: "Ce type de run ne peut pas être exécuté automatiquement" };
    }
    
    return { allowed: true };
  }, [config, dailyRunCount, isPaused]);

  // Execute a run (with autopilot logic)
  const autoExecuteRun = useCallback(async (runType: string, platformKey?: string) => {
    if (!isValidRunType(runType)) {
      return {
        executed: false,
        requiresApproval: false,
        reason: `Type de run invalide : "${runType}"`,
      };
    }

    const check = canAutoRun(runType);
    
    if (!check.allowed) {
      return {
        executed: false,
        requiresApproval: true,
        reason: check.reason,
      };
    }
    
    try {
      setDailyRunCount(prev => prev + 1);
      
      const result = await executeRun.mutateAsync({
        run_type: runType,
        platform_key: platformKey,
      });
      
      if (config.notifyOnAutoExecution) {
        toast({
          title: "Exécution automatique",
          description: `${runType.replace(/_/g, " ")} exécuté avec succès`,
        });
      }
      
      return {
        executed: true,
        requiresApproval: false,
        result,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
      setLastError(errorMessage);
      
      if (config.pauseOnError) {
        setIsPaused(true);
        toast({
          title: "Autopilote en pause",
          description: `Erreur détectée: ${errorMessage}`,
          variant: "destructive",
        });
      }
      
      return {
        executed: false,
        requiresApproval: false,
        error: errorMessage,
      };
    }
  }, [canAutoRun, executeRun, config, toast]);

  // Update autopilot configuration
  const updateAutopilotConfig = useCallback(async (updates: Partial<AutopilotConfig>) => {
    await updateConfig.mutateAsync({
      key: "autopilot",
      value: { ...config, ...updates },
    });
  }, [config, updateConfig]);

  // Get available run types with their autopilot status
  const getRunTypesWithStatus = useCallback(() => {
    return Object.entries(RUN_TYPE_CONFIG).map(([key, runConfig]) => ({
      key,
      ...runConfig,
      autopilotAllowed: config.allowedRunTypes.includes(key),
      canAutoExecute: canAutoExecute(key, config.enabled),
    }));
  }, [config]);

  return {
    config,
    isLoading,
    isPaused,
    lastError,
    dailyRunCount,
    toggleAutopilot,
    panicStop,
    resume,
    canAutoRun,
    autoExecuteRun,
    updateAutopilotConfig,
    getRunTypesWithStatus,
  };
}
