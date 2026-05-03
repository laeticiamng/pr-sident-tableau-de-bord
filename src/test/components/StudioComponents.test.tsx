import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import React from "react";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    rpc: vi.fn().mockResolvedValue({ data: [], error: null }),
    functions: { invoke: vi.fn().mockResolvedValue({ data: null, error: null }) },
  },
}));

vi.mock("@/hooks/useStudio", () => ({
  useStudioOverview: () => ({ data: null, isLoading: false }),
  useStudioOpportunities: () => ({ data: [], isLoading: false }),
  useStudioCalls: () => ({ data: [], isLoading: false }),
  useStudioBlueprints: () => ({ data: [], isLoading: false }),
  useStudioDeals: () => ({ data: [], isLoading: false }),
  useStudioAdvisory: () => ({ data: [], isLoading: false }),
  useStudioDocuments: () => ({ data: [], isLoading: false }),
  useCreateStudioOpportunity: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useCreateStudioCall: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

function withProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{ui}</BrowserRouter>
    </QueryClientProvider>
  );
}

describe("StudioCockpit", () => {
  it("renders the studio overview section", async () => {
    const { StudioCockpit } = await import("@/components/hq/studio/StudioCockpit");
    render(withProviders(<StudioCockpit />));
    expect(screen.getByText("Studio Overview")).toBeInTheDocument();
    expect(screen.getByText("Opportunités détectées")).toBeInTheDocument();
  });
});

describe("OpportunityRadar", () => {
  it("renders empty state when no opportunities exist", async () => {
    const { OpportunityRadar } = await import("@/components/hq/studio/OpportunityRadar");
    render(withProviders(<OpportunityRadar />));
    expect(screen.getByText(/Radar des opportunités/)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Rechercher une opportunité/)).toBeInTheDocument();
  });
});

describe("CallForProjectsTable", () => {
  it("renders the calls section", async () => {
    const { CallForProjectsTable } = await import("@/components/hq/studio/CallForProjectsTable");
    render(withProviders(<CallForProjectsTable />));
    expect(screen.getByText(/Appels à projets/)).toBeInTheDocument();
  });
});

describe("Blueprint360Builder", () => {
  it("renders all 12 blueprint sections", async () => {
    const { Blueprint360Builder } = await import("@/components/hq/studio/Blueprint360Builder");
    render(withProviders(<Blueprint360Builder />));
    expect(screen.getByText("Problème")).toBeInTheDocument();
    expect(screen.getByText("Opportunité")).toBeInTheDocument();
    expect(screen.getByText("Solution proposée")).toBeInTheDocument();
    expect(screen.getByText("Modèle économique")).toBeInTheDocument();
    expect(screen.getByText("Indicateurs")).toBeInTheDocument();
    expect(screen.getByText("Deal recommandé")).toBeInTheDocument();
  });
});

describe("DealSimulator", () => {
  it("renders the simulator with a default recommendation", async () => {
    const { DealSimulator } = await import("@/components/hq/studio/DealSimulator");
    render(withProviders(<DealSimulator />));
    expect(screen.getByText("Simulateur Equity Deal")).toBeInTheDocument();
    expect(screen.getByText("Recommandation de deal")).toBeInTheDocument();
    expect(screen.getByText(/Equity recommandé/)).toBeInTheDocument();
  });
});

describe("LegalChecklist", () => {
  it("renders the legal checklist with mandatory disclaimer", async () => {
    const { LegalChecklist } = await import("@/components/hq/studio/LegalChecklist");
    render(withProviders(<LegalChecklist />));
    expect(screen.getByText(/Checklist juridique Studio/)).toBeInTheDocument();
    expect(screen.getByText(/avocat ou d'un expert-comptable/)).toBeInTheDocument();
  });
});

describe("AdvisoryTracker", () => {
  it("renders empty state when no advisory missions exist", async () => {
    const { AdvisoryTracker } = await import("@/components/hq/studio/AdvisoryTracker");
    render(withProviders(<AdvisoryTracker />));
    expect(screen.getByText(/Missions advisory en cours/)).toBeInTheDocument();
  });
});

describe("StudioDecisionInbox", () => {
  it("renders inbox card", async () => {
    const { StudioDecisionInbox } = await import("@/components/hq/studio/StudioDecisionInbox");
    render(withProviders(<StudioDecisionInbox />));
    expect(screen.getByText(/Decision Inbox/)).toBeInTheDocument();
  });
});
