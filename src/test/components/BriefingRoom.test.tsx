import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";

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
      <LanguageProvider>
        <BrowserRouter>{ui}</BrowserRouter>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

describe("BriefingRoom", () => {
  it("renders greeting", () => {
    renderWithProviders(<BriefingRoom />);
    expect(screen.getByText(/Madame la Présidente/)).toBeInTheDocument();
  });

  it("renders executive brief button", () => {
    renderWithProviders(<BriefingRoom />);
    expect(screen.getByText(/Lancer le brief exécutif/)).toBeInTheDocument();
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

  // L'ancienne section « Santé de l'écosystème » (Opérationnelles / À surveiller / Critiques)
  // a été retirée de BriefingRoom par le commit 2a06792 (simplification du tableau de bord) ;
  // l'état de santé est désormais résumé sous le message d'accueil.
  it("renders platform health summary", async () => {
    renderWithProviders(<BriefingRoom />);
    expect(
      await screen.findByText(/plateformes opérationnelles|fonctionnent parfaitement/),
    ).toBeInTheDocument();
  });

  it("contains no NaN values", () => {
    renderWithProviders(<BriefingRoom />);
    expect(document.body.textContent).not.toContain("NaN");
  });
});
