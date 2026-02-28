import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    rpc: vi.fn().mockResolvedValue({ data: [], error: null }),
    functions: { invoke: vi.fn().mockResolvedValue({ data: null, error: null }) },
  },
}));

vi.mock("@/hooks/useStripeKPIs", () => ({
  useStripeKPIs: () => ({ data: null, isError: true }),
  formatCurrency: (v: number) => `€${v}`,
}));

import BriefingRoom from "@/pages/hq/BriefingRoom";

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{ui}</BrowserRouter>
    </QueryClientProvider>
  );
}

describe("BriefingRoom", () => {
  it("renders greeting", () => {
    renderWithProviders(<BriefingRoom />);
    expect(screen.getByText(/Madame la Présidente/)).toBeInTheDocument();
  });

  it("renders call DG button", () => {
    renderWithProviders(<BriefingRoom />);
    expect(screen.getByText("Appeler le DG")).toBeInTheDocument();
  });

  it("renders KPI cards", () => {
    renderWithProviders(<BriefingRoom />);
    expect(screen.getByText("MRR")).toBeInTheDocument();
    expect(screen.getByText("Agents actifs 24h")).toBeInTheDocument();
    expect(screen.getByText("Uptime global")).toBeInTheDocument();
  });

  it("shows MRR as dash when Stripe is unavailable", () => {
    renderWithProviders(<BriefingRoom />);
    // With stripeError=true, MRR should show "—"
    const mrrCard = screen.getByText("MRR").closest("div")?.parentElement;
    expect(mrrCard?.textContent).toContain("—");
  });

  it("renders guided actions", () => {
    renderWithProviders(<BriefingRoom />);
    expect(screen.getByText("Voir mes plateformes")).toBeInTheDocument();
    expect(screen.getByText("Mes décisions en attente")).toBeInTheDocument();
    expect(screen.getByText("Demander un brief IA")).toBeInTheDocument();
  });

  it("renders health section", () => {
    renderWithProviders(<BriefingRoom />);
    expect(screen.getByText("Santé de l'écosystème")).toBeInTheDocument();
    expect(screen.getByText("Opérationnelles")).toBeInTheDocument();
    expect(screen.getByText("À surveiller")).toBeInTheDocument();
    expect(screen.getByText("Critiques")).toBeInTheDocument();
  });

  it("contains no NaN values", () => {
    renderWithProviders(<BriefingRoom />);
    expect(document.body.textContent).not.toContain("NaN");
  });
});
