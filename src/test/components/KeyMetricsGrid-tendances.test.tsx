import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

const useStripeKPIsMock = vi.hoisted(() => vi.fn());
vi.mock("@/hooks/useStripeKPIs", async () => {
  const reel = await vi.importActual<typeof import("@/hooks/useStripeKPIs")>("@/hooks/useStripeKPIs");
  return { ...reel, useStripeKPIs: () => useStripeKPIsMock() };
});
vi.mock("@/hooks/useHQData", () => ({
  usePlatforms: () => ({ data: [{ status: "green" }], isLoading: false }),
}));

import { KeyMetricsGrid } from "@/components/hq/cockpit/KeyMetricsGrid";

const kpis = (surcharges: Record<string, unknown> = {}) => ({
  data: {
    success: true,
    available: true,
    kpis: {
      mrr: 500, mrrChange: null, activeSubscriptions: 12, activeSubscriptionsChange: null,
      churnRate: null, churnRateChange: null, totalCustomers: 20, newCustomersThisMonth: 1,
      revenueThisMonth: 100, revenueLastMonth: 900, revenueLastMonthToDate: 100, revenueChangeToDate: null,
      currency: "chf", lastUpdated: "2026-10-18T12:00:00.000Z", ...surcharges,
    },
  },
  isLoading: false,
});

/** Revue Codex (#17) : une variation non mesurée n'affiche aucune flèche (ni hausse verte, ni baisse rouge). */
describe("KeyMetricsGrid — tendances neutres quand la variation n'est pas mesurée", () => {
  it("MRR et abonnements sans variation mesurée : aucune flèche ; seule la carte plateformes en a une", () => {
    useStripeKPIsMock.mockReturnValue(kpis());
    render(<KeyMetricsGrid />);
    expect(screen.queryAllByLabelText("en hausse")).toHaveLength(1); // plateformes 1/1
    expect(screen.queryAllByLabelText("en baisse")).toHaveLength(0);
  });

  it("une variation réellement mesurée garde sa flèche", () => {
    useStripeKPIsMock.mockReturnValue(kpis({ revenueChangeToDate: -12.5 }));
    render(<KeyMetricsGrid />);
    expect(screen.queryAllByLabelText("en baisse")).toHaveLength(1);
  });
});
