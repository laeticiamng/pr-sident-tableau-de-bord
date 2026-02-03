import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./use-toast";

export interface ScheduledJob {
  key: string;
  name: string;
  cronExpression: string;
  runType: string;
  description: string;
  enabled: boolean;
  lastRun?: {
    id: string;
    status: string;
    completedAt: string;
  } | null;
}

interface SchedulerResponse {
  success: boolean;
  jobs: ScheduledJob[];
  timezone?: string;
  error?: string;
}

interface ExecuteJobResponse {
  success: boolean;
  job: ScheduledJob;
  run_id: string;
  executive_summary: string;
  error?: string;
}

export function useSchedulerJobs() {
  return useQuery({
    queryKey: ["scheduler-jobs"],
    queryFn: async (): Promise<SchedulerResponse> => {
      const { data, error } = await supabase.functions.invoke<SchedulerResponse>("scheduled-runs", {
        body: { action: "status" },
      });
      
      if (error) throw new Error(error.message);
      return data!;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

export function useExecuteScheduledJob() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (jobKey: string): Promise<ExecuteJobResponse> => {
      const { data, error } = await supabase.functions.invoke<ExecuteJobResponse>("scheduled-runs", {
        body: { action: "execute", job_key: jobKey },
      });
      
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);
      return data!;
    },
    onSuccess: (data) => {
      toast({
        title: "Job exécuté",
        description: `${data.job.name} terminé avec succès`,
      });
      queryClient.invalidateQueries({ queryKey: ["scheduler-jobs"] });
      queryClient.invalidateQueries({ queryKey: ["hq-runs"] });
    },
    onError: (error) => {
      toast({
        title: "Erreur d'exécution",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// Helper pour formater l'expression CRON en texte lisible
export function formatCronExpression(cron: string): string {
  const [minute, hour, , , dayOfWeek] = cron.split(" ");
  
  const days: Record<string, string> = {
    "1-5": "Lun-Ven",
    "1": "Lundi",
    "2": "Mardi",
    "3": "Mercredi",
    "4": "Jeudi",
    "5": "Vendredi",
    "*": "Tous les jours",
  };
  
  const dayText = days[dayOfWeek] || dayOfWeek;
  return `${dayText} à ${hour}h${minute !== "0" ? minute : ""}`;
}
