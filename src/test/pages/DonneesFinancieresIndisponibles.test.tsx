import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LanguageProvider } from "@/contexts/LanguageContext";

const useStripeKPIsMock = vi.hoisted(() => vi.fn());
vi.mock("@/hooks/useStripeKPIs", async () => {
  const reel = await vi.importActual<typeof import("@/hooks/useStripeKPIs")>("@/hooks/useStripeKPIs");
  return { ...reel, useStripeKPIs: () => useStripeKPIsMock() };
});

import FinancePage from "@/pages/hq/FinancePage";
import DataAnalyticsPage from "@/pages/hq/DataAnalyticsPage";
import { GrowthSummaryWidget } from "@/components/hq/growth/GrowthSummaryWidget";

function rendre(ui: React.ReactElement) {
  return render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <LanguageProvider>
        <BrowserRouter>{ui}</BrowserRouter>
      </LanguageProvider>
    </QueryClientProvider>,
  );
}

const indisponible = {
  data: { success: false, available: false, kpis: null, reason: "stripe_not_configured" },
  isLoading: false,
  isFetching: false,
  error: null,
  refetch: vi.fn(),
};

const reel = {
  data: {
    success: true,
    available: true,
    kpis: {
      mrr: 777,
      mrrChange: null,
      activeSubscriptions: 11,
      activeSubscriptionsChange: 1,
      churnRate: null,
      churnRateChange: null,
      totalCustomers: 23,
      newCustomersThisMonth: 4,
      revenueThisMonth: 321,
      revenueLastMonth: 654,
      revenueLastMonthToDate: 300,
      revenueChangeToDate: 7,
      currency: "eur",
      lastUpdated: "2026-10-03T12:00:00.000Z",
    },
  },
  isLoading: false,
  isFetching: false,
  error: null,
  refetch: vi.fn(),
};

/** Chiffres fictifs historiquement codés en dur : ils ne doivent apparaître nulle part. */
const CHIFFRES_FICTIFS = [
  /€\s?487/, /€\s?52\b/, /\b9[.,]4\s?x/, /342\s?%/, /12[\s,.]?400/, /54[\s,.]?800/,
  /10[\s,.]?000/, /12[\s,.]?450/, /\b1[\s,.]?247\b/, /15[\s,.]?400/, /2[.,]1\s?%/,
];

describe("FinancePage — Stripe indisponible", () => {
  beforeEach(() => useStripeKPIsMock.mockReset());

  it("affiche « Données indisponibles » et aucun chiffre financier ni badge « Stripe connecté »", () => {
    useStripeKPIsMock.mockReturnValue(indisponible);
    const { container } = rendre(<FinancePage />);

    expect(screen.getAllByText("Données indisponibles").length).toBeGreaterThanOrEqual(4);
    expect(screen.getAllByText(/Stripe n'est pas configuré/).length).toBeGreaterThan(0);
    expect(screen.queryByText(/Stripe connecté/)).not.toBeInTheDocument();
    expect(container.textContent).not.toMatch(/€|EUR/);
    for (const motif of CHIFFRES_FICTIFS) expect(container.textContent).not.toMatch(motif);
  });

  it("pas de zéro de remplacement dans la base clients", () => {
    useStripeKPIsMock.mockReturnValue(indisponible);
    rendre(<FinancePage />);
    expect(screen.queryByText("Clients totaux")).not.toBeInTheDocument();
    expect(screen.queryByText("Nouveaux ce mois")).not.toBeInTheDocument();
  });

  it("données réelles : affiche les valeurs Stripe, et « Données indisponibles » pour le churn non mesuré", () => {
    useStripeKPIsMock.mockReturnValue(reel);
    const { container } = rendre(<FinancePage />);

    expect(screen.getByText(/Stripe connecté/)).toBeInTheDocument();
    expect(container.textContent).toMatch(/777/);
    expect(screen.getByText("Clients totaux")).toBeInTheDocument();
    // Churn null : jamais « 0% » ni « 2.1% »
    expect(screen.getAllByText("Données indisponibles").length).toBeGreaterThanOrEqual(1);
    expect(container.textContent).not.toMatch(/2[.,]1\s?%/);
  });
});

describe("DataAnalyticsPage — aucune donnée fictive", () => {
  beforeEach(() => useStripeKPIsMock.mockReset());

  it("Stripe indisponible : KPI, funnel, LTV/CAC et ROI en « Données indisponibles »", () => {
    useStripeKPIsMock.mockReturnValue(indisponible);
    const { container } = rendre(<DataAnalyticsPage />);

    expect(screen.getAllByText("Données indisponibles").length).toBeGreaterThanOrEqual(7);
    expect(screen.getByText("Funnel de Conversion")).toBeInTheDocument();
    expect(screen.getByText("Customer Lifetime Value")).toBeInTheDocument();
    expect(screen.getByText("ROI Marketing")).toBeInTheDocument();
    expect(container.textContent).not.toMatch(/€|EUR/);
    for (const motif of CHIFFRES_FICTIFS) expect(container.textContent).not.toMatch(motif);
    // Ni « Stripe, fiabilité haute » ni source simulée présentée comme vérifiée
    expect(container.textContent).not.toMatch(/Fiabilité haute/);
  });

  it("données réelles : le funnel, la LTV et le ROI restent indisponibles (aucune source)", () => {
    useStripeKPIsMock.mockReturnValue(reel);
    const { container } = rendre(<DataAnalyticsPage />);

    expect(container.textContent).toMatch(/777/);
    expect(screen.getByText("Funnel de Conversion")).toBeInTheDocument();
    for (const motif of CHIFFRES_FICTIFS) expect(container.textContent).not.toMatch(motif);
    expect(screen.getAllByText("Données indisponibles").length).toBeGreaterThanOrEqual(3);
  });
});

describe("GrowthSummaryWidget — plus de LTV:CAC ni de prédiction inventée", () => {
  beforeEach(() => useStripeKPIsMock.mockReset());

  it("données réelles : MRR et ARPU réels, churn indisponible, pas de LTV:CAC ni de prédiction", () => {
    useStripeKPIsMock.mockReturnValue(reel);
    const { container } = rendre(<GrowthSummaryWidget />);

    expect(container.textContent).toMatch(/777/);
    expect(container.textContent).not.toMatch(/LTV|CAC|Prédiction|confiance/i);
    expect(screen.getByText("Données indisponibles")).toBeInTheDocument();
  });

  it("Stripe indisponible : état vide, aucun chiffre", () => {
    useStripeKPIsMock.mockReturnValue(indisponible);
    const { container } = rendre(<GrowthSummaryWidget />);
    expect(container.textContent).not.toMatch(/€|\d/);
  });
});
