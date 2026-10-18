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
    available: true,
    kpis: {
      mrr: 1000,
      mrrChange: null,
      activeSubscriptions: 20,
      activeSubscriptionsChange: 2,
      churnRate: 5,
      churnRateChange: null,
      totalCustomers: 40,
      newCustomersThisMonth: 2,
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

const indisponible = () => ({
  data: { success: false, available: false, kpis: null, reason: "stripe_not_configured" },
  isLoading: false,
  error: null,
});

describe("useGrowthMetrics — données réelles uniquement", () => {
  beforeEach(() => useStripeKPIsMock.mockReset());

  it("revue Codex : la devise Stripe est transmise (jamais d'EUR supposé) ; null sans données", () => {
    useStripeKPIsMock.mockReturnValue(kpisReels({ currency: "chf" }));
    expect(renderHook(() => useGrowthMetrics()).result.current.metrics.currency).toBe("chf");
    useStripeKPIsMock.mockReturnValue(indisponible());
    expect(renderHook(() => useGrowthMetrics()).result.current.metrics.currency).toBeNull();
  });

  it("Stripe indisponible : toutes les métriques sont null (jamais 0, jamais une estimation)", () => {
    useStripeKPIsMock.mockReturnValue(indisponible());
    const { result } = renderHook(() => useGrowthMetrics());
    const { metrics } = result.current;

    expect(metrics.isRealData).toBe(false);
    expect(result.current.hasRealData).toBe(false);
    for (const m of Object.values(metrics)) {
      if (typeof m === "object" && m !== null) {
        expect(m.value).toBeNull();
        expect(m.trend).toBeNull();
        expect(m.benchmark).toBeNull();
      }
    }
    expect(result.current.predictions).toBeNull();
  });

  it("pendant le chargement ou sans données : même état indisponible", () => {
    useStripeKPIsMock.mockReturnValue({ data: undefined, isLoading: true, error: null });
    const { result } = renderHook(() => useGrowthMetrics());
    expect(result.current.metrics.mrr.value).toBeNull();
    expect(result.current.metrics.isRealData).toBe(false);
  });

  it("données réelles : MRR, ARPU (MRR ÷ abonnements actifs) et churn Stripe uniquement", () => {
    useStripeKPIsMock.mockReturnValue(kpisReels());
    const { result } = renderHook(() => useGrowthMetrics());
    const { metrics } = result.current;

    expect(metrics.isRealData).toBe(true);
    expect(metrics.mrr.value).toBe(1000);
    expect(metrics.arpu.value).toBe(50);
    expect(metrics.churn.value).toBe(5);
    // Variation du MRR non mesurée : null, pas 0 % ni dérivée des encaissements
    expect(metrics.mrr.trend).toBeNull();
  });

  it("LTV = ARPU×24 et CAC = ARPU×1,8 (estimations inventées) ont disparu", () => {
    useStripeKPIsMock.mockReturnValue(kpisReels());
    const { result } = renderHook(() => useGrowthMetrics());
    const { metrics } = result.current;

    expect(metrics.ltv.value).toBeNull();
    expect(metrics.cac.value).toBeNull();
    expect(metrics.ltvCacRatio.value).toBeNull();
    expect(metrics.paybackPeriod.value).toBeNull();
    // Les clients Stripe ne sont pas des utilisateurs actifs mensuels
    expect(metrics.mau.value).toBeNull();
    expect(metrics.dau.value).toBeNull();
    // Plus aucune projection ni benchmark inventés
    expect(result.current.predictions).toBeNull();
    expect(metrics.mrr.benchmark).toBeNull();
    expect(metrics.churn.benchmark).toBeNull();
  });

  it("churn non mesurable : reste null même avec un MRR réel", () => {
    useStripeKPIsMock.mockReturnValue(kpisReels({ churnRate: null }));
    const { result } = renderHook(() => useGrowthMetrics());
    expect(result.current.metrics.mrr.value).toBe(1000);
    expect(result.current.metrics.churn.value).toBeNull();
  });

  it("aucun abonnement actif : ARPU null (pas de division par zéro ni de 0 affiché)", () => {
    useStripeKPIsMock.mockReturnValue(kpisReels({ activeSubscriptions: 0, mrr: 0 }));
    const { result } = renderHook(() => useGrowthMetrics());
    expect(result.current.metrics.arpu.value).toBeNull();
    expect(result.current.metrics.mrr.value).toBe(0);
  });
});
