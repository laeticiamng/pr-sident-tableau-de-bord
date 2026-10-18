import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

const invoke = vi.hoisted(() => vi.fn());
vi.mock("@/integrations/supabase/client", () => ({
  supabase: { functions: { invoke } },
}));

import { useStripeKPIs } from "@/hooks/useStripeKPIs";

const wrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(
    QueryClientProvider,
    { client: new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } }) },
    children,
  );

const kpisReels = {
  mrr: 1000,
  mrrChange: null,
  activeSubscriptions: 20,
  activeSubscriptionsChange: 1,
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
};

async function lire(reponse: { data: unknown; error: unknown }) {
  invoke.mockResolvedValue(reponse);
  const { result } = renderHook(() => useStripeKPIs(), { wrapper });
  await waitFor(() => expect(result.current.isSuccess || result.current.isError).toBe(true));
  return result.current;
}

describe("useStripeKPIs — tout ce qui n'est pas réel devient « indisponible », jamais un nombre", () => {
  beforeEach(() => invoke.mockReset());

  it("données réelles : kpis renseignés", async () => {
    const r = await lire({ data: { success: true, available: true, mock: false, kpis: kpisReels }, error: null });
    expect(r.data?.available).toBe(true);
    expect(r.data?.kpis?.mrr).toBe(1000);
  });

  it("mock (ancien comportement sans clé Stripe) : kpis null, pas de MRR 12450", async () => {
    const r = await lire({
      data: { success: true, mock: true, kpis: { ...kpisReels, mrr: 12450, activeSubscriptions: 247, totalCustomers: 1247 } },
      error: null,
    });
    expect(r.data?.available).toBe(false);
    expect(r.data?.success).toBe(false);
    expect(r.data?.kpis).toBeNull();
  });

  it("success:true sans mock:false (ancienne fonction déployée) : kpis null", async () => {
    const r = await lire({ data: { success: true, kpis: kpisReels }, error: null });
    expect(r.data?.kpis).toBeNull();
  });

  it("réponse « indisponible » du serveur : kpis null et raison conservée", async () => {
    const r = await lire({
      data: { success: false, available: false, reason: "stripe_not_configured", kpis: null },
      error: null,
    });
    expect(r.data).toEqual({ success: false, available: false, kpis: null, reason: "stripe_not_configured" });
  });

  it("erreur réseau / 401 / 403 : kpis null (pas d'exception, pas de zéros)", async () => {
    const r = await lire({ data: null, error: { message: "Edge Function returned a non-2xx status code" } });
    expect(r.isError).toBe(false);
    expect(r.data?.available).toBe(false);
    expect(r.data?.kpis).toBeNull();
    expect(r.data?.reason).toBe("request_failed");
  });

  it("erreur ET corps réel simultanés : l'erreur l'emporte", async () => {
    const r = await lire({
      data: { success: true, available: true, mock: false, kpis: kpisReels },
      error: { message: "boom" },
    });
    expect(r.data?.kpis).toBeNull();
  });
});
