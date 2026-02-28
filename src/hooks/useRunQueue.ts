/**
 * Run Queue Hook - Système de queue avec progression
 * Évite les blocages UI et gère les runs en séquence ou parallèle
 */

import { useState, useCallback, useRef, useEffect } from "react";
import { useExecuteRun } from "@/hooks/useHQData";
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";

export type QueuedRunStatus = "queued" | "running" | "completed" | "failed" | "cancelled";

export interface QueuedRun {
  id: string;
  runType: string;
  platformKey?: string;
  contextData?: Record<string, unknown>;
  status: QueuedRunStatus;
  progress: number; // 0-100
  currentStep?: string;
  result?: {
    success: boolean;
    executiveSummary?: string;
    error?: string;
  };
  queuedAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

interface UseRunQueueOptions {
  maxConcurrent?: number;
  onRunComplete?: (run: QueuedRun) => void;
  onRunError?: (run: QueuedRun, error: Error) => void;
  autoStart?: boolean;
}

export function useRunQueue(options: UseRunQueueOptions = {}) {
  const { maxConcurrent = 1, onRunComplete, onRunError, autoStart = true } = options;
  
  const [queue, setQueue] = useState<QueuedRun[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const processingRef = useRef<Set<string>>(new Set());
  
  const executeRun = useExecuteRun();
  const { addNotification, broadcast } = useRealtimeNotifications();

  // Get queue stats
  const stats = {
    total: queue.length,
    queued: queue.filter(r => r.status === "queued").length,
    running: queue.filter(r => r.status === "running").length,
    completed: queue.filter(r => r.status === "completed").length,
    failed: queue.filter(r => r.status === "failed").length,
  };

  // Add a run to the queue
  const enqueue = useCallback((
    runType: string,
    platformKey?: string,
    contextData?: Record<string, unknown>
  ): string => {
    const id = crypto.randomUUID();
    
    const newRun: QueuedRun = {
      id,
      runType,
      platformKey,
      contextData,
      status: "queued",
      progress: 0,
      queuedAt: new Date(),
    };
    
    setQueue(prev => [...prev, newRun]);
    
    return id;
  }, []);

  // Enqueue multiple runs
  const enqueueMany = useCallback((
    runs: Array<{ runType: string; platformKey?: string; contextData?: Record<string, unknown> }>
  ): string[] => {
    return runs.map(run => enqueue(run.runType, run.platformKey, run.contextData));
  }, [enqueue]);

  // Update a run in the queue
  const updateRun = useCallback((id: string, updates: Partial<QueuedRun>) => {
    setQueue(prev => prev.map(run => 
      run.id === id ? { ...run, ...updates } : run
    ));
  }, []);

  // Process a single run
  const processRun = useCallback(async (run: QueuedRun) => {
    if (processingRef.current.has(run.id)) return;
    processingRef.current.add(run.id);
    
    try {
      updateRun(run.id, { 
        status: "running", 
        startedAt: new Date(),
        progress: 10,
        currentStep: "Initialisation..."
      });

      // Simulate step progression
      const progressSteps = [
        { progress: 20, step: "Collecte des données..." },
        { progress: 40, step: "Analyse en cours..." },
        { progress: 60, step: "Génération du rapport..." },
        { progress: 80, step: "Finalisation..." },
      ];

      let stepIndex = 0;
      const progressInterval = setInterval(() => {
        if (stepIndex < progressSteps.length) {
          updateRun(run.id, {
            progress: progressSteps[stepIndex].progress,
            currentStep: progressSteps[stepIndex].step,
          });
          stepIndex++;
        }
      }, 2000);

      // Execute the actual run
      const result = await executeRun.mutateAsync({
        run_type: run.runType as import("@/lib/run-types-registry").RunType,
        platform_key: run.platformKey,
        context_data: run.contextData,
      });

      clearInterval(progressInterval);

      updateRun(run.id, {
        status: "completed",
        progress: 100,
        currentStep: "Terminé",
        completedAt: new Date(),
        result: {
          success: result.success,
          executiveSummary: result.executive_summary,
        },
      });

      // Broadcast notification
      broadcast("run_completed", {
        run_type: run.runType,
        platform_key: run.platformKey,
        summary: result.executive_summary?.substring(0, 100),
      });

      addNotification({
        type: "run_completed",
        title: "✅ Run Terminé",
        message: `${run.runType.replace(/_/g, " ")} complété avec succès`,
        urgency: "low",
        data: { runId: run.id },
      });

      onRunComplete?.(queue.find(r => r.id === run.id) || run);

    } catch (error) {
      const err = error as Error;
      
      updateRun(run.id, {
        status: "failed",
        progress: 0,
        currentStep: "Échec",
        completedAt: new Date(),
        result: {
          success: false,
          error: err.message,
        },
      });

      addNotification({
        type: "alert",
        title: "❌ Échec du Run",
        message: `${run.runType.replace(/_/g, " ")}: ${err.message}`,
        urgency: "high",
        data: { runId: run.id, error: err.message },
      });

      onRunError?.(queue.find(r => r.id === run.id) || run, err);
    } finally {
      processingRef.current.delete(run.id);
    }
  }, [executeRun, updateRun, addNotification, broadcast, onRunComplete, onRunError, queue]);

  // Process the queue
  const processQueue = useCallback(async () => {
    if (isPaused) return;
    
    const queuedRuns = queue.filter(r => r.status === "queued");
    const runningCount = processingRef.current.size;
    
    if (queuedRuns.length === 0 || runningCount >= maxConcurrent) return;
    
    setIsProcessing(true);
    
    const toProcess = queuedRuns.slice(0, maxConcurrent - runningCount);
    
    await Promise.all(toProcess.map(run => processRun(run)));
    
    // Check if more runs to process
    const remaining = queue.filter(r => r.status === "queued").length;
    if (remaining === 0) {
      setIsProcessing(false);
    }
  }, [queue, isPaused, maxConcurrent, processRun]);

  // Auto-process queue when items are added
  useEffect(() => {
    if (autoStart && !isPaused) {
      const queuedRuns = queue.filter(r => r.status === "queued");
      const runningCount = processingRef.current.size;
      
      if (queuedRuns.length > 0 && runningCount < maxConcurrent) {
        processQueue();
      }
    }
  }, [queue, autoStart, isPaused, maxConcurrent, processQueue]);

  // Cancel a run
  const cancelRun = useCallback((id: string) => {
    updateRun(id, { 
      status: "cancelled",
      completedAt: new Date(),
    });
    processingRef.current.delete(id);
  }, [updateRun]);

  // Clear completed/failed runs
  const clearCompleted = useCallback(() => {
    setQueue(prev => prev.filter(r => r.status === "queued" || r.status === "running"));
  }, []);

  // Clear all runs
  const clearAll = useCallback(() => {
    processingRef.current.clear();
    setQueue([]);
    setIsProcessing(false);
  }, []);

  // Pause/resume processing
  const pause = useCallback(() => setIsPaused(true), []);
  const resume = useCallback(() => {
    setIsPaused(false);
    processQueue();
  }, [processQueue]);

  // Retry a failed run
  const retryRun = useCallback((id: string) => {
    const run = queue.find(r => r.id === id);
    if (run && run.status === "failed") {
      updateRun(id, {
        status: "queued",
        progress: 0,
        currentStep: undefined,
        startedAt: undefined,
        completedAt: undefined,
        result: undefined,
      });
    }
  }, [queue, updateRun]);

  // Get the current running run(s)
  const currentRuns = queue.filter(r => r.status === "running");

  return {
    queue,
    stats,
    isProcessing,
    isPaused,
    currentRuns,
    enqueue,
    enqueueMany,
    cancelRun,
    retryRun,
    clearCompleted,
    clearAll,
    pause,
    resume,
    processQueue,
  };
}
