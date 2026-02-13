import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

export interface StripeKPIs {
  mrr: number;
  mrrChange: number;
  activeSubscriptions: number;
  activeSubscriptionsChange: number;
  churnRate: number;
  churnRateChange: number;
  totalCustomers: number;
  newCustomersThisMonth: number;
  revenueThisMonth: number;
  revenueLastMonth: number;
  currency: string;
  lastUpdated: string;
}

interface StripeKPIsResponse {
  success: boolean;
  mock: boolean;
  kpis: StripeKPIs;
  error?: string;
}

function generateMockStripeKPIs(): StripeKPIsResponse {
  return {
    success: true,
    mock: true,
    kpis: {
      mrr: 2847,
      mrrChange: 12.3,
      activeSubscriptions: 89,
      activeSubscriptionsChange: 7,
      churnRate: 2.1,
      churnRateChange: -0.4,
      totalCustomers: 234,
      newCustomersThisMonth: 18,
      revenueThisMonth: 2847,
      revenueLastMonth: 2534,
      currency: "eur",
      lastUpdated: new Date().toISOString(),
    },
  };
}

export function useStripeKPIs() {
  return useQuery({
    queryKey: ["stripe-kpis"],
    queryFn: async (): Promise<StripeKPIsResponse> => {
      try {
        const { data, error } = await supabase.functions.invoke<StripeKPIsResponse>("stripe-kpis");

        if (!error && data && data.success) {
          return data;
        }

        logger.warn("[useStripeKPIs] Edge function unavailable, using mock data:", error?.message);
      } catch (e) {
        logger.warn("[useStripeKPIs] Fallback to mock data:", e);
      }

      return generateMockStripeKPIs();
    },
    staleTime: 1000 * 60 * 5,
    refetchInterval: 1000 * 60 * 10,
  });
}

export function formatCurrency(amount: number, currency = "eur"): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatPercentage(value: number, showSign = true): string {
  const sign = showSign && value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}
