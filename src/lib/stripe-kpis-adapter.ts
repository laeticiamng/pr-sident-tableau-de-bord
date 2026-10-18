/**
 * Adaptateur de la réponse de la fonction Edge `stripe-kpis`.
 *
 * Règle : un chiffre financier n'est affiché que s'il vient d'une réponse explicitement
 * marquée réelle (`success === true`, `available === true`, `mock === false`). Toute autre
 * réponse (mock, indisponible, erreur, forme inattendue, ancienne version de la fonction qui
 * ne porte pas `available`) est « indisponible » : aucune valeur, jamais de zéro de repli.
 */

export const DONNEES_INDISPONIBLES = "Données indisponibles";
/** Classe de taille à appliquer à une valeur de KPI quand elle vaut « Données indisponibles ». */
export const estIndisponible = (valeur: unknown) => valeur === DONNEES_INDISPONIBLES;
export const AUCUNE_SOURCE_VERIFIEE = "Aucune source vérifiée n'est connectée.";

export interface StripeKPIs {
  mrr: number;
  /** null = non mesurée : l'API Stripe ne fournit pas le MRR passé. */
  mrrChange: number | null;
  activeSubscriptions: number;
  /** Variation nette du nombre d'abonnements actifs depuis le 1er du mois ; null = non calculable. */
  activeSubscriptionsChange: number | null;
  /** Churn mensuel en % ; null = non mesurable. */
  churnRate: number | null;
  /** Toujours null pour l'instant (nécessiterait un historique). */
  churnRateChange: number | null;
  totalCustomers: number;
  newCustomersThisMonth: number;
  /** Encaissé net depuis le 1er du mois (UTC). */
  revenueThisMonth: number;
  /** Encaissé net sur tout le mois précédent. */
  revenueLastMonth: number;
  /** Encaissé net du mois précédent sur la même durée écoulée (période comparable). */
  revenueLastMonthToDate: number;
  /** Croissance en % du chiffre encaissé à date vs même période M-1 ; null si non mesurable. */
  revenueChangeToDate: number | null;
  currency: string;
  lastUpdated: string;
}

export type RaisonIndisponible =
  | "stripe_not_configured"
  | "stripe_error"
  | "mock_data"
  | "request_failed"
  | "invalid_response";

export type StripeKpiResult =
  | { available: true; kpis: StripeKPIs }
  | { available: false; reason: RaisonIndisponible };

const MESSAGES: Record<RaisonIndisponible, string> = {
  stripe_not_configured: "Stripe n'est pas configuré : aucune source vérifiée n'est connectée.",
  stripe_error: "Stripe est momentanément injoignable.",
  mock_data: AUCUNE_SOURCE_VERIFIEE,
  request_failed: "La récupération des données Stripe a échoué.",
  invalid_response: "La réponse de Stripe est inexploitable.",
};

/** Phrase française expliquant pourquoi les données sont indisponibles. */
export function messageIndisponibilite(reason?: RaisonIndisponible | null): string {
  return reason ? MESSAGES[reason] : AUCUNE_SOURCE_VERIFIEE;
}

const nombre = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);
const nombreOuNull = (v: unknown): number | null => (nombre(v) ? v : null);

function normaliserKpis(brut: Record<string, unknown>): StripeKPIs | null {
  const requis = [
    "mrr",
    "activeSubscriptions",
    "totalCustomers",
    "newCustomersThisMonth",
    "revenueThisMonth",
    "revenueLastMonth",
    "revenueLastMonthToDate",
  ] as const;
  if (!requis.every((cle) => nombre(brut[cle]))) return null;
  return {
    mrr: brut.mrr as number,
    mrrChange: nombreOuNull(brut.mrrChange),
    activeSubscriptions: brut.activeSubscriptions as number,
    activeSubscriptionsChange: nombreOuNull(brut.activeSubscriptionsChange),
    churnRate: nombreOuNull(brut.churnRate),
    churnRateChange: nombreOuNull(brut.churnRateChange),
    totalCustomers: brut.totalCustomers as number,
    newCustomersThisMonth: brut.newCustomersThisMonth as number,
    revenueThisMonth: brut.revenueThisMonth as number,
    revenueLastMonth: brut.revenueLastMonth as number,
    revenueLastMonthToDate: brut.revenueLastMonthToDate as number,
    revenueChangeToDate: nombreOuNull(brut.revenueChangeToDate),
    currency: typeof brut.currency === "string" && brut.currency ? brut.currency : "eur",
    lastUpdated: typeof brut.lastUpdated === "string" ? brut.lastUpdated : "",
  };
}

/**
 * Transforme la sortie de `supabase.functions.invoke("stripe-kpis")` en résultat typé.
 * `error` non nul, corps absent, `mock`, `success !== true`, `available !== true` ou KPIs
 * incomplets → indisponible.
 */
export function parseStripeKpisResponse(data: unknown, error?: unknown): StripeKpiResult {
  if (error) return { available: false, reason: "request_failed" };
  if (!data || typeof data !== "object") return { available: false, reason: "invalid_response" };

  const reponse = data as Record<string, unknown>;
  if (reponse.mock === true) return { available: false, reason: "mock_data" };

  if (reponse.available === false || reponse.success === false) {
    const reason = reponse.reason;
    return {
      available: false,
      reason: reason === "stripe_not_configured" || reason === "stripe_error" ? reason : "invalid_response",
    };
  }

  // Réel uniquement si explicitement déclaré tel : une réponse `success: true` sans
  // `mock: false` / `available: true` (ancienne version de la fonction) n'est jamais crue.
  if (reponse.success !== true || reponse.mock !== false || reponse.available !== true) {
    return { available: false, reason: "invalid_response" };
  }
  if (!reponse.kpis || typeof reponse.kpis !== "object") {
    return { available: false, reason: "invalid_response" };
  }
  const kpis = normaliserKpis(reponse.kpis as Record<string, unknown>);
  return kpis ? { available: true, kpis } : { available: false, reason: "invalid_response" };
}
