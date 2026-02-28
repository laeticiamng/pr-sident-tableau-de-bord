import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./use-toast";

export interface AISchedulerJob {
  key: string;
  name: string;
  runType: string;
  description: string;
  cronExpression: string;
  priority: "high" | "medium" | "low";
  enabled: boolean;
  isDueNow?: boolean;
  lastRun?: {
    id: string;
    status: string;
    completedAt: string;
  } | null;
}

interface SchedulerStatusResponse {
  success: boolean;
  jobs: AISchedulerJob[];
  timezone: string;
}

interface AIDecideResponse {
  success: boolean;
  ai_decision: {
    jobs_to_run: string[];
    reasoning: string;
    next_check_in_minutes: number;
  };
  executed: Array<{ job: string; success: boolean; summary?: string; error?: string }>;
  checked_at: string;
}

// Polling interval en millisecondes (toutes les 5 minutes en autopilote)
const AUTOPILOT_POLL_INTERVAL = 5 * 60 * 1000;

export function useAISchedulerStatus() {
  return useQuery({
    queryKey: ["ai-scheduler-status"],
    queryFn: async (): Promise<SchedulerStatusResponse> => {
      const { data, error } = await supabase.functions.invoke<SchedulerStatusResponse>("ai-scheduler", {
        body: { action: "status" },
      });
      if (error) throw new Error(error.message);
      return data!;
    },
    staleTime: 1000 * 60 * 2,
    refetchInterval: 1000 * 60 * 5, // Refresh toutes les 5 min
  });
}

export function useAISchedulerExecute() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (jobKey: string) => {
      const { data, error } = await supabase.functions.invoke("ai-scheduler", {
        body: { action: "execute", job_key: jobKey },
      });
      if (error) throw new Error(error.message);
      if ((data as any)?.error) throw new Error((data as any).error);
      return data;
    },
    onSuccess: () => {
      toast({ title: "Job exécuté", description: "Le run IA s'est terminé avec succès" });
      queryClient.invalidateQueries({ queryKey: ["ai-scheduler-status"] });
      queryClient.invalidateQueries({ queryKey: ["hq-runs"] });
    },
    onError: (error: Error) => {
      const msg = error.message;
      if (msg.includes("429")) {
        toast({ title: "Limite atteinte", description: "Réessayez dans quelques instants", variant: "destructive" });
      } else if (msg.includes("402")) {
        toast({ title: "Crédits insuffisants", description: "Contactez l'administrateur", variant: "destructive" });
      } else {
        toast({ title: "Erreur", description: msg, variant: "destructive" });
      }
    },
  });
}

/**
 * Hook principal pour le scheduler IA autonome.
 * Quand `autopilotEnabled` est true, il poll toutes les 5 minutes
 * et demande à l'IA de décider quels jobs lancer.
 */
export function useAIAutopilot(autopilotEnabled: boolean) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const isDecidingRef = useRef(false);
  const [lastDecision, setLastDecision] = useState<AIDecideResponse | null>(null);
  const [isDeciding, setIsDeciding] = useState(false);
  const [nextCheckIn, setNextCheckIn] = useState<number>(5); // minutes

  const runAIDecision = useCallback(async () => {
    // Use ref to avoid race condition with stale closure
    if (isDecidingRef.current) return;
    isDecidingRef.current = true;
    setIsDeciding(true);

    // Abort any in-flight request
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    try {
      const { data, error } = await supabase.functions.invoke<AIDecideResponse>("ai-scheduler", {
        body: { action: "ai_decide" },
      });

      // Check if aborted
      if (abortRef.current?.signal.aborted) return;

      if (error) throw new Error(error.message);

      if (data?.success) {
        setLastDecision(data);
        const jobsRun = data.executed?.filter(e => e.success) || [];
        
        if (jobsRun.length > 0) {
          toast({
            title: `🤖 Autopilot: ${jobsRun.length} job(s) exécuté(s)`,
            description: data.ai_decision.reasoning,
          });
          queryClient.invalidateQueries({ queryKey: ["hq-runs"] });
          queryClient.invalidateQueries({ queryKey: ["ai-scheduler-status"] });
        }

        const nextMin = data.ai_decision?.next_check_in_minutes || 60;
        setNextCheckIn(nextMin);
      }
    } catch (e: any) {
      if (abortRef.current?.signal.aborted) return;
      const msg = (e as Error).message;
      if (msg.includes("429")) {
        toast({ title: "Limite IA atteinte", description: "L'autopilot va réessayer plus tard", variant: "destructive" });
      } else if (msg.includes("402")) {
        toast({ title: "Crédits IA insuffisants", description: "Rechargez vos crédits Lovable AI", variant: "destructive" });
      }
      // Silent fail pour les autres erreurs en autopilote
    } finally {
      isDecidingRef.current = false;
      setIsDeciding(false);
    }
  }, [toast, queryClient]);

  useEffect(() => {
    if (!autopilotEnabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      abortRef.current?.abort();
      return;
    }

    // Première décision immédiate
    runAIDecision();

    // Polling toutes les 5 minutes
    intervalRef.current = setInterval(() => {
      runAIDecision();
    }, AUTOPILOT_POLL_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      abortRef.current?.abort();
    };
  }, [autopilotEnabled, runAIDecision]);

  return { lastDecision, isDeciding, nextCheckIn };
}
