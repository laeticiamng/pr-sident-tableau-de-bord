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
  StudioAuditEntry,
  StudioPublicSubmission,
  StudioApproval,
  StudioApprovalStatus,
  StudioApprovalGates,
  StudioRiskLevel,
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

// ──────────────────────────────────────────────────────────────────
// Audit trail
// ──────────────────────────────────────────────────────────────────

export function useStudioAuditTrail(
  resourceType: "studio_opportunity" | "studio_blueprint" | "studio_deal",
  resourceId: string | null | undefined,
) {
  return useQuery({
    queryKey: [STUDIO_KEY, "audit", resourceType, resourceId],
    enabled: !!resourceId,
    queryFn: async (): Promise<StudioAuditEntry[]> => {
      const { data, error } = await supabase.rpc("get_studio_audit_trail" as never, {
        p_resource_type: resourceType,
        p_resource_id: resourceId,
      } as never);
      if (error) throw new Error(error.message);
      return (data as StudioAuditEntry[]) ?? [];
    },
    staleTime: 1000 * 15,
  });
}

// ──────────────────────────────────────────────────────────────────
// Public submissions (HQ side)
// ──────────────────────────────────────────────────────────────────

export function useStudioPublicSubmissions(status?: string | null) {
  return useQuery({
    queryKey: [STUDIO_KEY, "submissions", status ?? "all"],
    queryFn: async (): Promise<StudioPublicSubmission[]> => {
      const { data, error } = await supabase.rpc("list_studio_public_submissions" as never, {
        p_status: status ?? null,
      } as never);
      if (error) throw new Error(error.message);
      return (data as StudioPublicSubmission[]) ?? [];
    },
    staleTime: 1000 * 30,
  });
}

export function useConvertStudioSubmission() {
  const { toast } = useToast();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (submissionId: string) => {
      const { data, error } = await supabase.rpc(
        "convert_studio_submission_to_opportunity" as never,
        { p_submission_id: submissionId } as never,
      );
      if (error) throw new Error(error.message);
      return data as string;
    },
    onSuccess: () => {
      toast({ title: "Soumission convertie", description: "Une opportunité a été créée." });
      qc.invalidateQueries({ queryKey: [STUDIO_KEY] });
    },
    onError: (e: Error) => toast({ title: "Erreur", description: e.message, variant: "destructive" }),
  });
}

export function useUpdateStudioSubmissionStatus() {
  const { toast } = useToast();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.rpc("update_studio_submission_status" as never, {
        p_submission_id: id, p_status: status,
      } as never);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [STUDIO_KEY, "submissions"] });
    },
    onError: (e: Error) => toast({ title: "Erreur", description: e.message, variant: "destructive" }),
  });
}

// ──────────────────────────────────────────────────────────────────
// Approvals queue
// ──────────────────────────────────────────────────────────────────

export function useStudioApprovals(status?: StudioApprovalStatus | null) {
  return useQuery({
    queryKey: [STUDIO_KEY, "approvals", status ?? "all"],
    queryFn: async (): Promise<StudioApproval[]> => {
      const { data, error } = await supabase.rpc("list_studio_approvals" as never, {
        p_status: status ?? null,
      } as never);
      if (error) throw new Error(error.message);
      return (data as StudioApproval[]) ?? [];
    },
    staleTime: 1000 * 15,
  });
}

export interface RequestApprovalInput {
  action_type: string;
  title: string;
  description?: string;
  payload?: Record<string, unknown>;
  resource_type?: string;
  resource_id?: string;
  risk_level?: StudioRiskLevel;
}

export function useRequestStudioApproval() {
  const { toast } = useToast();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: RequestApprovalInput) => {
      const { data, error } = await supabase.rpc("request_studio_approval" as never, {
        p_action_type: input.action_type,
        p_title: input.title,
        p_payload: input.payload ?? {},
        p_resource_type: input.resource_type ?? null,
        p_resource_id: input.resource_id ?? null,
        p_description: input.description ?? null,
        p_risk_level: input.risk_level ?? "medium",
      } as never);
      if (error) throw new Error(error.message);
      return data as string;
    },
    onSuccess: () => {
      toast({ title: "Approbation demandée", description: "Action en attente de validation présidentielle." });
      qc.invalidateQueries({ queryKey: [STUDIO_KEY, "approvals"] });
    },
    onError: (e: Error) => toast({ title: "Erreur", description: e.message, variant: "destructive" }),
  });
}

export function useDecideStudioApproval() {
  const { toast } = useToast();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, decision, reason }: { id: string; decision: string; reason?: string }) => {
      const { error } = await supabase.rpc("decide_studio_approval" as never, {
        p_approval_id: id, p_decision: decision, p_reason: reason ?? null,
      } as never);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [STUDIO_KEY, "approvals"] });
    },
    onError: (e: Error) => toast({ title: "Erreur", description: e.message, variant: "destructive" }),
  });
}

// Approval gates configuration (uses existing system_config RPCs)
const DEFAULT_GATES: StudioApprovalGates = {
  create_deal: true,
  submit_call_response: true,
  send_legal_document: true,
  sign_deal: true,
  create_opportunity: false,
  create_blueprint: false,
};

export function useStudioApprovalGates() {
  return useQuery({
    queryKey: [STUDIO_KEY, "approval-gates"],
    queryFn: async (): Promise<StudioApprovalGates> => {
      const { data, error } = await supabase.rpc("get_hq_system_config" as never, {
        config_key: "studio_approval_gates",
      } as never);
      if (error) throw new Error(error.message);
      const v = data as Partial<StudioApprovalGates> | null;
      return { ...DEFAULT_GATES, ...(v ?? {}) };
    },
    staleTime: 1000 * 60,
  });
}

export function useUpdateStudioApprovalGates() {
  const { toast } = useToast();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (gates: StudioApprovalGates) => {
      const { error } = await supabase.rpc("update_hq_system_config" as never, {
        p_key: "studio_approval_gates",
        p_value: gates as unknown as Record<string, unknown>,
      } as never);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast({ title: "Réglages enregistrés", description: "File d'approbations mise à jour." });
      qc.invalidateQueries({ queryKey: [STUDIO_KEY, "approval-gates"] });
    },
    onError: (e: Error) => toast({ title: "Erreur", description: e.message, variant: "destructive" }),
  });
}
