import { useState, useCallback, useMemo } from "react";
import {
  type COSState,
  type COSProject,
  type COSDailyEntry,
  type COSBurnoutMetrics,
  type ProjectStatus,
  createInitialCOSState,
  createDeadlinesFromStart,
  COS_RULES,
} from "@/lib/cos-types";
import { MANAGED_PLATFORMS } from "@/lib/constants";
import { logger } from "@/lib/logger";

const STORAGE_KEY = "cos-state";

function loadState(): COSState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as COSState;
      if (parsed.projects && parsed.dailyEntries && parsed.burnout) {
        return parsed;
      }
    }
  } catch (e) {
    logger.warn("[useCOSData] Failed to load state:", e);
  }
  return createInitialCOSState();
}

function saveState(state: COSState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    logger.warn("[useCOSData] Failed to save state:", e);
  }
}

export function useCOSData() {
  const [state, setStateRaw] = useState<COSState>(loadState);

  const setState = useCallback((updater: COSState | ((prev: COSState) => COSState)) => {
    setStateRaw((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      const withTimestamp = { ...next, lastUpdated: new Date().toISOString() };
      saveState(withTimestamp);
      return withTimestamp;
    });
  }, []);

  // ─── Derived data ────────────────────────────────────────────────
  const activeProjects = useMemo(
    () => state.projects.filter((p) => p.status === "actif"),
    [state.projects]
  );

  const cashFirstProject = useMemo(
    () => state.projects.find((p) => p.isCashFirst && p.status === "actif"),
    [state.projects]
  );

  const canActivateProject = activeProjects.length < COS_RULES.MAX_ACTIVE_PROJECTS;

  const hasCashFirst = activeProjects.some((p) => p.isCashFirst);

  const todayStr = new Date().toISOString().split("T")[0];
  const todayMorning = useMemo(
    () => state.dailyEntries.find((e) => e.date === todayStr && e.type === "morning"),
    [state.dailyEntries, todayStr]
  );
  const todayEvening = useMemo(
    () => state.dailyEntries.find((e) => e.date === todayStr && e.type === "evening"),
    [state.dailyEntries, todayStr]
  );

  // Burnout flag computation
  const computeBurnoutFlag = useCallback((metrics: COSBurnoutMetrics): boolean => {
    return (
      metrics.euphorieDetectee &&
      metrics.sommeilHeures < metrics.sommeilObjectif &&
      metrics.pressionInterneHaute &&
      metrics.multiProjet
    );
  }, []);

  // Aggregated money metrics across all active/monetised projects
  const aggregatedMoney = useMemo(() => {
    const projects = state.projects.filter(
      (p) => p.status === "actif" || p.status === "monetise"
    );
    return {
      totalMRR: projects.reduce((s, p) => s + p.moneyMetrics.mrr, 0),
      totalRevenueOneShot: projects.reduce((s, p) => s + p.moneyMetrics.revenueOneShot, 0),
      avgConversion: projects.length
        ? projects.reduce((s, p) => s + p.moneyMetrics.conversionRate, 0) / projects.length
        : 0,
      avgARPU: projects.length
        ? projects.reduce((s, p) => s + p.moneyMetrics.arpu, 0) / projects.length
        : 0,
      avgChurn: projects.length
        ? projects.reduce((s, p) => s + p.moneyMetrics.churn, 0) / projects.length
        : 0,
      totalCAC: projects.reduce((s, p) => s + p.moneyMetrics.cac, 0),
      totalCustomers: projects.reduce((s, p) => s + p.moneyMetrics.totalCustomers, 0),
      totalTrials: projects.reduce((s, p) => s + p.moneyMetrics.activeTrials, 0),
    };
  }, [state.projects]);

  // ─── Actions ─────────────────────────────────────────────────────

  const initializeWithPlatforms = useCallback(() => {
    setState((prev) => {
      if (prev.initialized) return prev;
      const projects: COSProject[] = MANAGED_PLATFORMS.map((p) => ({
        id: p.key,
        platformKey: p.key,
        name: p.name,
        status: "incubation" as ProjectStatus,
        isCashFirst: false,
        startDate: new Date().toISOString().split("T")[0],
        promesse: p.shortDescription,
        cibleUtilisateur: "",
        actionUnique: "",
        mecanismeLivraison: "",
        deadlines: createDeadlinesFromStart(new Date().toISOString().split("T")[0]),
        moneyMetrics: {
          mrr: 0,
          mrrTarget: 0,
          conversionRate: 0,
          arpu: 0,
          churn: 0,
          cac: 0,
          revenueOneShot: 0,
          totalCustomers: 0,
          activeTrials: 0,
        },
      }));
      return { ...prev, projects, initialized: true };
    });
  }, [setState]);

  const updateProjectStatus = useCallback(
    (projectId: string, newStatus: ProjectStatus) => {
      setState((prev) => {
        const currentActive = prev.projects.filter(
          (p) => p.status === "actif" && p.id !== projectId
        );

        // WIP limit: block if trying to activate with 2 already active
        if (newStatus === "actif" && currentActive.length >= COS_RULES.MAX_ACTIVE_PROJECTS) {
          logger.warn("[COS] Cannot activate: 2 projects already active");
          return prev;
        }

        const projects = prev.projects.map((p) => {
          if (p.id !== projectId) return p;
          const updated = { ...p, status: newStatus };
          // Reset deadlines when activating
          if (newStatus === "actif") {
            const today = new Date().toISOString().split("T")[0];
            updated.startDate = today;
            updated.deadlines = createDeadlinesFromStart(today);
          }
          return updated;
        });

        return { ...prev, projects };
      });
    },
    [setState]
  );

  const toggleCashFirst = useCallback(
    (projectId: string) => {
      setState((prev) => ({
        ...prev,
        projects: prev.projects.map((p) =>
          p.id === projectId ? { ...p, isCashFirst: !p.isCashFirst } : p
        ),
      }));
    },
    [setState]
  );

  const updateProject = useCallback(
    (projectId: string, updates: Partial<COSProject>) => {
      setState((prev) => ({
        ...prev,
        projects: prev.projects.map((p) =>
          p.id === projectId ? { ...p, ...updates } : p
        ),
      }));
    },
    [setState]
  );

  const updateDeadlineStatus = useCallback(
    (projectId: string, step: "d3" | "d7" | "d14" | "d30", status: COSProject["deadlines"]["d3"]["status"], scopeCut?: string) => {
      setState((prev) => ({
        ...prev,
        projects: prev.projects.map((p) => {
          if (p.id !== projectId) return p;
          return {
            ...p,
            deadlines: {
              ...p.deadlines,
              [step]: { ...p.deadlines[step], status, scopeCut },
            },
          };
        }),
      }));
    },
    [setState]
  );

  const addDailyEntry = useCallback(
    (entry: COSDailyEntry) => {
      setState((prev) => {
        // Replace if same date + type exists
        const filtered = prev.dailyEntries.filter(
          (e) => !(e.date === entry.date && e.type === entry.type)
        );
        return { ...prev, dailyEntries: [...filtered, entry] };
      });
    },
    [setState]
  );

  const updateBurnout = useCallback(
    (updates: Partial<COSBurnoutMetrics>) => {
      setState((prev) => {
        const merged = { ...prev.burnout, ...updates };
        merged.drapeauRouge = computeBurnoutFlag(merged);
        merged.multiProjet = prev.projects.filter((p) => p.status === "actif").length > COS_RULES.MAX_ACTIVE_PROJECTS;
        merged.jourMaintenanceForce =
          merged.joursConsecutifsSommeilBas >= COS_RULES.LOW_SLEEP_CONSECUTIVE_LIMIT;
        return { ...prev, burnout: merged };
      });
    },
    [setState, computeBurnoutFlag]
  );

  const updateMoneyMetrics = useCallback(
    (projectId: string, metrics: Partial<COSProject["moneyMetrics"]>) => {
      setState((prev) => ({
        ...prev,
        projects: prev.projects.map((p) =>
          p.id === projectId
            ? { ...p, moneyMetrics: { ...p.moneyMetrics, ...metrics } }
            : p
        ),
      }));
    },
    [setState]
  );

  return {
    state,
    // Derived
    activeProjects,
    cashFirstProject,
    canActivateProject,
    hasCashFirst,
    todayMorning,
    todayEvening,
    aggregatedMoney,
    // Actions
    initializeWithPlatforms,
    updateProjectStatus,
    toggleCashFirst,
    updateProject,
    updateDeadlineStatus,
    addDailyEntry,
    updateBurnout,
    updateMoneyMetrics,
  };
}
