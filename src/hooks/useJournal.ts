import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface JournalEntry {
  id: string;
  entry_type: "decision" | "note" | "milestone" | "reflection";
  title: string;
  content: string;
  tags: string[];
  linked_kpis: { label: string; value: string; trend?: "up" | "down" | "stable" }[];
  impact_measured: { summary: string; date: string; kpi_deltas?: Record<string, number> } | null;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
}

export function useJournalEntries() {
  return useQuery({
    queryKey: ["hq", "journal"],
    queryFn: async (): Promise<JournalEntry[]> => {
      const { data, error } = await supabase.rpc("get_hq_journal_entries" as any, { limit_count: 100 });
      if (error) throw new Error(error.message);
      return (data as any[])?.map(d => ({
        ...d,
        tags: d.tags || [],
        linked_kpis: d.linked_kpis || [],
      })) || [];
    },
    staleTime: 1000 * 60 * 2,
  });
}

export function useCreateJournalEntry() {
  const { toast } = useToast();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (entry: {
      title: string;
      content?: string;
      entry_type?: string;
      tags?: string[];
      linked_kpis?: any[];
    }) => {
      const { data, error } = await supabase.rpc("create_hq_journal_entry" as any, {
        p_title: entry.title,
        p_content: entry.content || "",
        p_entry_type: entry.entry_type || "decision",
        p_tags: entry.tags || [],
        p_linked_kpis: entry.linked_kpis || [],
      });
      if (error) throw new Error(error.message);
      return data as string;
    },
    onSuccess: () => {
      toast({ title: "Entrée créée", description: "Ajoutée au journal." });
      qc.invalidateQueries({ queryKey: ["hq", "journal"] });
    },
    onError: (e: Error) => toast({ title: "Erreur", description: e.message, variant: "destructive" }),
  });
}

export function useUpdateJournalEntry() {
  const { toast } = useToast();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      id: string;
      title?: string;
      content?: string;
      tags?: string[];
      impact_measured?: any;
      is_pinned?: boolean;
    }) => {
      const { data, error } = await supabase.rpc("update_hq_journal_entry" as any, {
        p_id: params.id,
        p_title: params.title ?? null,
        p_content: params.content ?? null,
        p_tags: params.tags ?? null,
        p_impact_measured: params.impact_measured ?? null,
        p_is_pinned: params.is_pinned ?? null,
      });
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      toast({ title: "Mis à jour" });
      qc.invalidateQueries({ queryKey: ["hq", "journal"] });
    },
    onError: (e: Error) => toast({ title: "Erreur", description: e.message, variant: "destructive" }),
  });
}

export function useDeleteJournalEntry() {
  const { toast } = useToast();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.rpc("delete_hq_journal_entry" as any, { p_id: id });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast({ title: "Supprimée" });
      qc.invalidateQueries({ queryKey: ["hq", "journal"] });
    },
    onError: (e: Error) => toast({ title: "Erreur", description: e.message, variant: "destructive" }),
  });
}
