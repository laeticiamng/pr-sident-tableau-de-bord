import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type {
  StudioOpportunity,
  StudioCall,
  StudioBlueprint,
  StudioDeal,
  StudioAdvisory,
  StudioDocument,
  StudioOverview,
  StudioCallType,
} from "@/lib/studio-types";

const STUDIO_KEY = "studio";

// ──────────────────────────────────────────────────────────────────
// Reads
// ──────────────────────────────────────────────────────────────────

export function useStudioOverview() {
  return useQuery({
    queryKey: [STUDIO_KEY, "overview"],
    queryFn: async (): Promise<StudioOverview | null> => {
      const { data, error } = await supabase.rpc("get_studio_overview" as never);
      if (error) throw new Error(error.message);
      return (data as StudioOverview) ?? null;
    },
    staleTime: 1000 * 60,
  });
}

export function useStudioOpportunities() {
  return useQuery({
    queryKey: [STUDIO_KEY, "opportunities"],
    queryFn: async (): Promise<StudioOpportunity[]> => {
      const { data, error } = await supabase.rpc("list_studio_opportunities" as never);
      if (error) throw new Error(error.message);
      return (data as StudioOpportunity[]) ?? [];
    },
    staleTime: 1000 * 30,
  });
}

export function useStudioCalls() {
  return useQuery({
    queryKey: [STUDIO_KEY, "calls"],
    queryFn: async (): Promise<StudioCall[]> => {
      const { data, error } = await supabase.rpc("list_studio_calls" as never);
      if (error) throw new Error(error.message);
      return (data as StudioCall[]) ?? [];
    },
    staleTime: 1000 * 30,
  });
}

export function useStudioBlueprints() {
  return useQuery({
    queryKey: [STUDIO_KEY, "blueprints"],
    queryFn: async (): Promise<StudioBlueprint[]> => {
      const { data, error } = await supabase.rpc("list_studio_blueprints" as never);
      if (error) throw new Error(error.message);
      return (data as StudioBlueprint[]) ?? [];
    },
    staleTime: 1000 * 30,
  });
}

export function useStudioDeals() {
  return useQuery({
    queryKey: [STUDIO_KEY, "deals"],
    queryFn: async (): Promise<StudioDeal[]> => {
      const { data, error } = await supabase.rpc("list_studio_deals" as never);
      if (error) throw new Error(error.message);
      return (data as StudioDeal[]) ?? [];
    },
    staleTime: 1000 * 30,
  });
}

export function useStudioAdvisory() {
  return useQuery({
    queryKey: [STUDIO_KEY, "advisory"],
    queryFn: async (): Promise<StudioAdvisory[]> => {
      const { data, error } = await supabase.rpc("list_studio_advisory" as never);
      if (error) throw new Error(error.message);
      return (data as StudioAdvisory[]) ?? [];
    },
    staleTime: 1000 * 30,
  });
}

export function useStudioDocuments() {
  return useQuery({
    queryKey: [STUDIO_KEY, "documents"],
    queryFn: async (): Promise<StudioDocument[]> => {
      const { data, error } = await supabase.rpc("list_studio_documents" as never);
      if (error) throw new Error(error.message);
      return (data as StudioDocument[]) ?? [];
    },
    staleTime: 1000 * 30,
  });
}

// ──────────────────────────────────────────────────────────────────
// Writes
// ──────────────────────────────────────────────────────────────────

export interface CreateOpportunityInput {
  title: string;
  domain?: string | null;
  source_type?: string | null;
  source_url?: string | null;
  description?: string | null;
  problem_statement?: string | null;
}

export function useCreateStudioOpportunity() {
  const { toast } = useToast();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateOpportunityInput) => {
      const { data, error } = await supabase.rpc("create_studio_opportunity" as never, {
        p_title: input.title,
        p_domain: input.domain ?? null,
        p_source_type: input.source_type ?? null,
        p_source_url: input.source_url ?? null,
        p_description: input.description ?? null,
        p_problem_statement: input.problem_statement ?? null,
      } as never);
      if (error) throw new Error(error.message);
      return data as string;
    },
    onSuccess: () => {
      toast({ title: "Opportunité créée", description: "Ajoutée au radar Studio." });
      qc.invalidateQueries({ queryKey: [STUDIO_KEY, "opportunities"] });
      qc.invalidateQueries({ queryKey: [STUDIO_KEY, "overview"] });
    },
    onError: (e: Error) => toast({ title: "Erreur", description: e.message, variant: "destructive" }),
  });
}

export interface CreateCallInput {
  title: string;
  call_type: StudioCallType;
  issuer?: string | null;
  source_url?: string | null;
  deadline?: string | null;
  domain?: string | null;
  eligibility?: string | null;
  estimated_budget?: string | null;
}

export function useCreateStudioCall() {
  const { toast } = useToast();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateCallInput) => {
      const { data, error } = await supabase.rpc("create_studio_call" as never, {
        p_title: input.title,
        p_call_type: input.call_type,
        p_issuer: input.issuer ?? null,
        p_source_url: input.source_url ?? null,
        p_deadline: input.deadline ?? null,
        p_domain: input.domain ?? null,
        p_eligibility: input.eligibility ?? null,
        p_estimated_budget: input.estimated_budget ?? null,
      } as never);
      if (error) throw new Error(error.message);
      return data as string;
    },
    onSuccess: () => {
      toast({ title: "Appel ajouté", description: "Visible dans le radar des appels." });
      qc.invalidateQueries({ queryKey: [STUDIO_KEY, "calls"] });
      qc.invalidateQueries({ queryKey: [STUDIO_KEY, "overview"] });
    },
    onError: (e: Error) => toast({ title: "Erreur", description: e.message, variant: "destructive" }),
  });
}
