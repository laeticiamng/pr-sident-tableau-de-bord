import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";

const useStripeKPIsMock = vi.fn();
vi.mock("@/hooks/useStripeKPIs", () => ({
  useStripeKPIs: () => useStripeKPIsMock(),
}));

import { useGrowthMetrics } from "@/hooks/useGrowthMetrics";

const kpisReels = (surcharges: Record<string, unknown> = {}) => ({
  data: {
    success: true,
    kpis: {
      mrr: 1000,
      mrrChange: null,
      activeSubscriptions: 20,
      activeSubscriptionsChange: 2,
      churnRate: 2.1,
      churnRateChange: 0,
      totalCustomers: 40,
      newCustomersThisMonth: 2,
      // Début de mois : 300 € encaissés contre 3000 € sur tout le mois précédent.
      revenueThisMonth: 300,
      revenueLastMonth: 3000,
      revenueLastMonthToDate: 300,
      revenueChangeToDate: 0,
      currency: "eur",
      lastUpdated: "2026-10-03T12:00:00.000Z",
      ...surcharges,
    },
  },
  isLoading: false,
  error: null,
});

describe("useGrowthMetrics — croissance du MRR", () => {
  beforeEach(() => useStripeKPIsMock.mockReset());

  it("n'affiche pas de tendance MRR et ne projette pas le MRR quand sa variation n'est pas mesurée", () => {
    useStripeKPIsMock.mockReturnValue(kpisReels({ mrrChange: null, revenueChangeToDate: -90 }));
    const { result } = renderHook(() => useGrowthMetrics());

    expect(result.current.metrics.mrr.value).toBe(1000);
    // null = non mesuré (affiché « — »), et non une tendance de 0 % ou dérivée des encaissements.
    expect(result.current.metrics.mrr.trend).toBeNull();
    expect(result.current.metrics.arpu.trend).toBeNull();
    expect(result.current.metrics.ltv.trend).toBeNull();
    // Pas de projection du MRR sans croissance mesurée du MRR.
    expect(result.current.predictions?.mrr).toBeNull();
  });

  it("utilise la variation du MRR quand elle est réellement mesurée", () => {
    useStripeKPIsMock.mockReturnValue(kpisReels({ mrrChange: 10 }));
    const { result } = renderHook(() => useGrowthMetrics());

    expect(result.current.metrics.mrr.trend).toBe(10);
    expect(result.current.predictions?.mrr?.predicted30d).toBe(1100);
    expect(result.current.predictions?.mrr?.predicted90d).toBe(1331);
  });
});
