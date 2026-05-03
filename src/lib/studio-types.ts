/**
 * EmotionSphere Studio — domain types.
 *
 * Mirrors the shape of the hq.studio_* tables defined in
 * supabase/migrations/20260503090000_emotionsphere_studio.sql.
 */

export type StudioOpportunityStatus =
  | "idea"
  | "qualified"
  | "blueprint_in_progress"
  | "ready"
  | "deal_proposed"
  | "deal_signed"
  | "advisory"
  | "archived"
  | "rejected";

export type StudioCallStatus =
  | "to_analyze"
  | "relevant"
  | "not_relevant"
  | "blueprint_in_progress"
  | "response_in_preparation"
  | "submitted"
  | "won"
  | "lost"
  | "recycle";

export type StudioCallType =
  | "appel_a_projets"
  | "appel_offres"
  | "ami"
  | "subvention"
  | "concours"
  | "marche_public"
  | "marche_prive";

export type StudioBlueprintStatus =
  | "draft"
  | "in_review"
  | "finalized"
  | "sent"
  | "archived";

export type StudioDealType =
  | "equity_only"
  | "flat_plus_equity"
  | "success_fee_plus_equity"
  | "advisory_monthly"
  | "bsa_advisor"
  | "direct_participation"
  | "industry_contribution"
  | "hybrid";

export type StudioDealStatus =
  | "draft"
  | "proposed"
  | "in_negotiation"
  | "accepted"
  | "signed"
  | "rejected"
  | "archived";

export type StudioRiskLevel = "low" | "medium" | "high" | "critical";

export type StudioAdvisoryStatus = "active" | "paused" | "ended";

export type StudioDocumentType =
  | "note_opportunity"
  | "blueprint_360"
  | "pitch_short"
  | "pitch_long"
  | "institutional_pitch"
  | "advisory_proposal"
  | "deal_proposal"
  | "legal_checklist"
  | "nda"
  | "term_sheet"
  | "mission_letter"
  | "shareholder_pact"
  | "advisory_contract"
  | "other";

export interface StudioOpportunity {
  id: string;
  title: string;
  domain: string | null;
  source_type: string | null;
  source_url: string | null;
  description: string | null;
  problem_statement: string | null;
  opportunity_score: number | null;
  strategic_value_score: number | null;
  execution_risk_score: number | null;
  recommended_action: string | null;
  status: StudioOpportunityStatus;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface StudioCall {
  id: string;
  title: string;
  call_type: StudioCallType;
  issuer: string | null;
  source_url: string | null;
  deadline: string | null;
  domain: string | null;
  eligibility: string | null;
  selection_criteria: unknown;
  required_documents: unknown;
  estimated_budget: string | null;
  ai_analysis: unknown;
  status: StudioCallStatus;
  created_at: string;
  updated_at: string;
}

export interface BlueprintSection {
  summary?: string;
  bullets?: string[];
  notes?: string;
}

export interface StudioBlueprint {
  id: string;
  opportunity_id: string | null;
  call_id: string | null;
  title: string;
  problem: BlueprintSection;
  opportunity: BlueprintSection;
  solution: BlueprintSection;
  targets: BlueprintSection;
  business_model: BlueprintSection;
  partners: BlueprintSection;
  deployment_plan: BlueprintSection;
  kpis: BlueprintSection;
  risks: BlueprintSection;
  pitch: BlueprintSection;
  emotionsphere_role: BlueprintSection;
  deal_recommendation: BlueprintSection;
  status: StudioBlueprintStatus;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface StudioDeal {
  id: string;
  blueprint_id: string | null;
  project_name: string;
  partner_name: string | null;
  deal_type: StudioDealType;
  equity_percentage_min: number | null;
  equity_percentage_max: number | null;
  recommended_percentage: number | null;
  cash_component: number | null;
  success_fee: number | null;
  advisory_terms: string | null;
  legal_status: string | null;
  risk_level: StudioRiskLevel;
  next_action: string | null;
  status: StudioDealStatus;
  created_at: string;
  updated_at: string;
}

export interface StudioAdvisory {
  id: string;
  deal_id: string | null;
  project_name: string;
  role: string | null;
  monthly_commitment: string | null;
  meeting_frequency: string | null;
  strategic_topics: string[];
  next_review_date: string | null;
  status: StudioAdvisoryStatus;
  created_at: string;
  updated_at: string;
}

export interface StudioDocument {
  id: string;
  blueprint_id: string | null;
  deal_id: string | null;
  document_type: StudioDocumentType;
  title: string;
  content: string | null;
  file_url: string | null;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface StudioOverview {
  opportunities_total: number;
  opportunities_active: number;
  calls_active: number;
  calls_with_deadline_30d: number;
  blueprints_in_progress: number;
  blueprints_finalized: number;
  deals_proposed: number;
  deals_accepted: number;
  advisory_active: number;
}

// ──────────────────────────────────────────────────────────────────
// Display helpers
// ──────────────────────────────────────────────────────────────────

export const OPPORTUNITY_STATUS_LABEL: Record<StudioOpportunityStatus, string> = {
  idea: "Idée brute",
  qualified: "Opportunité qualifiée",
  blueprint_in_progress: "Blueprint en cours",
  ready: "Dossier prêt",
  deal_proposed: "Deal proposé",
  deal_signed: "Deal signé",
  advisory: "Projet en advisory",
  archived: "Archivé",
  rejected: "Refusé",
};

export const OPPORTUNITY_STATUS_TONE: Record<StudioOpportunityStatus, string> = {
  idea: "bg-muted text-muted-foreground",
  qualified: "bg-primary/10 text-primary",
  blueprint_in_progress: "bg-accent/10 text-accent",
  ready: "bg-warning/10 text-warning",
  deal_proposed: "bg-warning/15 text-warning",
  deal_signed: "bg-success/10 text-success",
  advisory: "bg-success/10 text-success",
  archived: "bg-muted/50 text-muted-foreground",
  rejected: "bg-destructive/10 text-destructive",
};

export const CALL_STATUS_LABEL: Record<StudioCallStatus, string> = {
  to_analyze: "À analyser",
  relevant: "Pertinent",
  not_relevant: "Non pertinent",
  blueprint_in_progress: "Blueprint en cours",
  response_in_preparation: "Réponse en préparation",
  submitted: "Soumis",
  won: "Gagné",
  lost: "Perdu",
  recycle: "À recycler",
};

export const CALL_TYPE_LABEL: Record<StudioCallType, string> = {
  appel_a_projets: "Appel à projets",
  appel_offres: "Appel d'offres",
  ami: "AMI",
  subvention: "Subvention",
  concours: "Concours",
  marche_public: "Marché public",
  marche_prive: "Marché privé",
};

export const BLUEPRINT_STATUS_LABEL: Record<StudioBlueprintStatus, string> = {
  draft: "Brouillon",
  in_review: "En revue",
  finalized: "Finalisé",
  sent: "Transmis",
  archived: "Archivé",
};

export const DEAL_TYPE_LABEL: Record<StudioDealType, string> = {
  equity_only: "Equity only",
  flat_plus_equity: "Forfait + equity",
  success_fee_plus_equity: "Success fee + equity",
  advisory_monthly: "Advisory mensuel",
  bsa_advisor: "BSA advisor",
  direct_participation: "Prise de participation directe",
  industry_contribution: "Apport en industrie",
  hybrid: "Modèle hybride",
};

export const DEAL_STATUS_LABEL: Record<StudioDealStatus, string> = {
  draft: "Brouillon",
  proposed: "Proposé",
  in_negotiation: "En négociation",
  accepted: "Accepté",
  signed: "Signé",
  rejected: "Refusé",
  archived: "Archivé",
};

export const RISK_LEVEL_LABEL: Record<StudioRiskLevel, string> = {
  low: "Faible",
  medium: "Moyen",
  high: "Élevé",
  critical: "Critique",
};

export const RISK_LEVEL_TONE: Record<StudioRiskLevel, string> = {
  low: "bg-success/10 text-success border-success/30",
  medium: "bg-warning/10 text-warning border-warning/30",
  high: "bg-destructive/10 text-destructive border-destructive/30",
  critical: "bg-destructive/20 text-destructive border-destructive/50",
};

export const ADVISORY_STATUS_LABEL: Record<StudioAdvisoryStatus, string> = {
  active: "Actif",
  paused: "En pause",
  ended: "Terminé",
};

export const DOCUMENT_TYPE_LABEL: Record<StudioDocumentType, string> = {
  note_opportunity: "Note d'opportunité",
  blueprint_360: "Blueprint 360°",
  pitch_short: "Pitch court (30 sec)",
  pitch_long: "Pitch long (2 min)",
  institutional_pitch: "Pitch institutionnel",
  advisory_proposal: "Proposition d'advisory",
  deal_proposal: "Proposition de deal",
  legal_checklist: "Checklist juridique",
  nda: "NDA",
  term_sheet: "Term sheet",
  mission_letter: "Lettre de mission",
  shareholder_pact: "Pacte d'associés",
  advisory_contract: "Contrat advisory",
  other: "Autre document",
};

// ──────────────────────────────────────────────────────────────────
// Equity Deal Engine — pure logic, easily testable
// ──────────────────────────────────────────────────────────────────

export interface DealSimulationInput {
  involvementLevel: 1 | 2 | 3 | 4 | 5;
  projectSize: "small" | "medium" | "large" | "flagship";
  effort: "light" | "moderate" | "heavy";
  duration: "short" | "medium" | "long";
  riskLevel: StudioRiskLevel;
  executionProbability: "low" | "medium" | "high";
  teamQuality: "weak" | "average" | "strong" | "elite";
  futureValuePotential: "low" | "medium" | "high" | "exceptional";
}

export interface DealSimulationOutput {
  recommendedDealType: StudioDealType;
  equityMin: number;
  equityMax: number;
  equityRecommended: number;
  riskLevel: StudioRiskLevel;
  rationale: string[];
  conditions: string[];
  documentsRequired: StudioDocumentType[];
}

const INVOLVEMENT_BANDS: Record<DealSimulationInput["involvementLevel"], { min: number; max: number; label: string }> = {
  1: { min: 0.5, max: 2, label: "Conseil ponctuel / idée rapide" },
  2: { min: 1, max: 3, label: "Diagnostic + angle stratégique" },
  3: { min: 3, max: 5, label: "Blueprint complet" },
  4: { min: 5, max: 10, label: "Blueprint + réponse appel à projet + suivi stratégique" },
  5: { min: 10, max: 15, label: "Concept fondateur + advisory long terme" },
};

const SIZE_MULTIPLIER: Record<DealSimulationInput["projectSize"], number> = {
  small: 0.85,
  medium: 1,
  large: 1.1,
  flagship: 1.2,
};

const VALUE_MULTIPLIER: Record<DealSimulationInput["futureValuePotential"], number> = {
  low: 0.8,
  medium: 1,
  high: 1.1,
  exceptional: 1.25,
};

const RISK_DISCOUNT: Record<StudioRiskLevel, number> = {
  low: 1,
  medium: 0.95,
  high: 0.9,
  critical: 0.8,
};

const PROBABILITY_FACTOR: Record<DealSimulationInput["executionProbability"], number> = {
  low: 0.85,
  medium: 1,
  high: 1.05,
};

export function simulateEquityDeal(input: DealSimulationInput): DealSimulationOutput {
  const band = INVOLVEMENT_BANDS[input.involvementLevel];
  const sizeMul = SIZE_MULTIPLIER[input.projectSize];
  const valueMul = VALUE_MULTIPLIER[input.futureValuePotential];
  const riskMul = RISK_DISCOUNT[input.riskLevel];
  const probMul = PROBABILITY_FACTOR[input.executionProbability];

  const center = (band.min + band.max) / 2;
  const adjusted = center * sizeMul * valueMul * riskMul * probMul;

  const equityMin = Math.max(0, Number((band.min * riskMul).toFixed(2)));
  const equityMax = Math.min(20, Number((band.max * sizeMul * valueMul).toFixed(2)));
  const equityRecommended = Math.min(equityMax, Math.max(equityMin, Number(adjusted.toFixed(2))));

  let recommendedDealType: StudioDealType;
  if (input.involvementLevel === 1) recommendedDealType = "advisory_monthly";
  else if (input.involvementLevel === 2) recommendedDealType = "success_fee_plus_equity";
  else if (input.involvementLevel === 3) recommendedDealType = "flat_plus_equity";
  else if (input.involvementLevel === 4) recommendedDealType = "hybrid";
  else recommendedDealType = "direct_participation";

  const rationale: string[] = [
    `Niveau d'implication : ${band.label}.`,
    `Taille projet (${input.projectSize}) ajuste la fourchette de ${(sizeMul * 100 - 100).toFixed(0)}%.`,
    `Risque ${RISK_LEVEL_LABEL[input.riskLevel].toLowerCase()} appliqué (${(riskMul * 100 - 100).toFixed(0)}%).`,
    `Potentiel de valeur future (${input.futureValuePotential}) modifie la prime de ${(valueMul * 100 - 100).toFixed(0)}%.`,
    `Probabilité d'exécution (${input.executionProbability}) ajuste de ${(probMul * 100 - 100).toFixed(0)}%.`,
  ];

  const conditions: string[] = [
    "Validation juridique préalable (avocat / expert-comptable).",
    "Signature d'un NDA avant transmission du Blueprint 360° complet.",
    "Clause de non-contournement et reconnaissance d'antériorité.",
  ];
  if (equityRecommended >= 5) {
    conditions.push("Pacte d'associés détaillé (gouvernance, sortie, anti-dilution, drag/tag).");
  }
  if (input.riskLevel === "high" || input.riskLevel === "critical") {
    conditions.push("Engagement de jalons et clause de revue trimestrielle.");
  }

  const documentsRequired: StudioDocumentType[] = ["nda", "deal_proposal"];
  if (recommendedDealType === "advisory_monthly" || recommendedDealType === "hybrid") {
    documentsRequired.push("advisory_contract");
  }
  if (equityRecommended > 0) {
    documentsRequired.push("term_sheet");
  }
  if (equityRecommended >= 5) {
    documentsRequired.push("shareholder_pact");
  }
  documentsRequired.push("legal_checklist");

  return {
    recommendedDealType,
    equityMin,
    equityMax,
    equityRecommended,
    riskLevel: input.riskLevel,
    rationale,
    conditions,
    documentsRequired,
  };
}

// Strategic Value Score — computed score (0-100) summarising a project
export interface StrategicValueInput {
  marketPotential: number;       // 0-100
  problemUrgency: number;        // 0-100
  executionCapability: number;   // 0-100
  differentiation: number;       // 0-100
  fundingAccess: number;         // 0-100
  strategicFit: number;          // 0-100
  equityPotential: number;       // 0-100
}

export function computeStrategicValueScore(input: StrategicValueInput): number {
  const weights = {
    marketPotential: 0.18,
    problemUrgency: 0.12,
    executionCapability: 0.16,
    differentiation: 0.14,
    fundingAccess: 0.12,
    strategicFit: 0.16,
    equityPotential: 0.12,
  };
  const total =
    input.marketPotential * weights.marketPotential +
    input.problemUrgency * weights.problemUrgency +
    input.executionCapability * weights.executionCapability +
    input.differentiation * weights.differentiation +
    input.fundingAccess * weights.fundingAccess +
    input.strategicFit * weights.strategicFit +
    input.equityPotential * weights.equityPotential;
  return Math.round(Math.max(0, Math.min(100, total)));
}
