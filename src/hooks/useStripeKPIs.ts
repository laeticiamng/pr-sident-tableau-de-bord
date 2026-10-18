import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";
import {
  parseStripeKpisResponse,
  type RaisonIndisponible,
  type StripeKPIs,
} from "@/lib/stripe-kpis-adapter";

export type { StripeKPIs, RaisonIndisponible } from "@/lib/stripe-kpis-adapter";

/**
 * Résultat du hook. `kpis` n'est renseigné que pour des données Stripe réelles ;
 * sinon `available === false`, `kpis === null` et `reason` dit pourquoi.
 */
export interface StripeKPIsResponse {
  success: boolean;
  available: boolean;
  kpis: StripeKPIs | null;
  reason?: RaisonIndisponible;
}

export function useStripeKPIs() {
  return useQuery({
    queryKey: ["stripe-kpis"],
    queryFn: async (): Promise<StripeKPIsResponse> => {
      const { data, error } = await supabase.functions.invoke<unknown>("stripe-kpis");

      if (error) {
        logger.error("[useStripeKPIs] Edge function error:", error.message);
      }

      // Toute réponse non réelle (mock, indisponible, erreur, forme inattendue) devient
      // « indisponible » : on ne laisse jamais passer de chiffre sans source vérifiée.
      const resultat = parseStripeKpisResponse(data, error);
      if (resultat.available === false) {
        return { success: false, available: false, kpis: null, reason: resultat.reason };
      }
      return { success: true, available: true, kpis: resultat.kpis };
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
