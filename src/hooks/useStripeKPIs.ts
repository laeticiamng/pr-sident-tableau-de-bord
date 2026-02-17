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
  kpis: StripeKPIs;
  error?: string;
}

export function useStripeKPIs() {
  return useQuery({
    queryKey: ["stripe-kpis"],
    queryFn: async (): Promise<StripeKPIsResponse> => {
      const { data, error } = await supabase.functions.invoke<StripeKPIsResponse>("stripe-kpis");

      if (error) {
        logger.error("[useStripeKPIs] Edge function error:", error.message);
        throw new Error(error.message || "Erreur de connexion à Stripe");
      }

      if (!data || !data.success) {
        throw new Error(data?.error || "Réponse invalide de l'API Stripe");
      }

      return data;
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
