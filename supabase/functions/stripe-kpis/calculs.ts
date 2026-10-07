/**
 * Calculs purs de la fonction Edge stripe-kpis.
 *
 * Aucun accès réseau, aucune dépendance Deno : ce module est importé par index.ts (Deno)
 * et testé par Vitest (src/test/stripe-kpis-calculs.test.ts).
 */

/** Sous-ensemble des champs d'un objet Charge Stripe utilisés ici. */
export interface ChargeStripe {
  id?: string;
  /** "succeeded" | "pending" | "failed" */
  status?: string;
  paid?: boolean;
  /** false pour une autorisation non encore capturée. */
  captured?: boolean;
  refunded?: boolean;
  /** Montant demandé, en centimes. */
  amount?: number;
  /** Montant réellement capturé, en centimes. */
  amount_captured?: number;
  /** Montant déjà remboursé (partiellement ou totalement), en centimes. */
  amount_refunded?: number;
  /** Horodatage Unix (secondes) de création. */
  created?: number;
}

/** Sous-ensemble des champs d'un objet Subscription Stripe utilisés ici. */
export interface AbonnementStripe {
  id?: string;
  items?: {
    data?: Array<{
      price?: {
        unit_amount?: number | null;
        recurring?: { interval?: string } | null;
      } | null;
    }>;
  };
}

/** Page d'une liste Stripe (GET /v1/<ressource>). */
export interface PageStripe<T> {
  data?: T[];
  has_more?: boolean;
}

export type RequeteStripe = (endpoint: string, params?: Record<string, string>) => Promise<PageStripe<unknown>>;

/** Garde-fou : au-delà, on échoue plutôt que de renvoyer un total tronqué. */
export const PAGES_STRIPE_MAX = 500;

/**
 * Lit une liste Stripe en entier : pages de 100 (maximum de l'API), en suivant
 * `has_more` / `starting_after` (id du dernier objet de la page précédente).
 * Les filtres passés dans `params` sont conservés sur chaque page.
 */
export async function listerStripe<T extends { id?: string }>(
  requete: RequeteStripe,
  endpoint: string,
  params: Record<string, string> = {},
): Promise<T[]> {
  const objets: T[] = [];
  let curseur: string | undefined;
  for (let numeroPage = 1; numeroPage <= PAGES_STRIPE_MAX; numeroPage++) {
    const page = (await requete(endpoint, {
      ...params,
      limit: "100",
      ...(curseur ? { starting_after: curseur } : {}),
    })) as PageStripe<T>;
    const data = page.data || [];
    objets.push(...data);
    if (!page.has_more) return objets;
    const dernierId = data[data.length - 1]?.id;
    if (!dernierId || dernierId === curseur) {
      throw new Error(`Pagination Stripe bloquée sur ${endpoint} (has_more sans nouvel objet)`);
    }
    curseur = dernierId;
  }
  throw new Error(`Pagination Stripe interrompue sur ${endpoint} : plus de ${PAGES_STRIPE_MAX} pages`);
}

/** MRR (en unités monétaires) des abonnements actifs. */
export function calculerMrr(abonnements: AbonnementStripe[]): number {
  let mrr = 0;
  for (const sub of abonnements) {
    const amount = sub.items?.data?.[0]?.price?.unit_amount || 0;
    const interval = sub.items?.data?.[0]?.price?.recurring?.interval;

    if (interval === "month") {
      mrr += amount / 100;
    } else if (interval === "year") {
      mrr += (amount / 100) / 12;
    }
  }
  return mrr;
}

/**
 * Montant net encaissé d'un paiement, en centimes : montant capturé moins les
 * remboursements (partiels ou totaux). 0 pour un paiement non réussi
 * (échoué, en attente) ou une autorisation non capturée.
 */
export function montantNetEncaisse(charge: ChargeStripe): number {
  if (charge.status !== "succeeded" || charge.paid !== true || charge.captured === false) return 0;
  const capture = charge.amount_captured ?? charge.amount ?? 0;
  return Math.max(0, capture - (charge.amount_refunded ?? 0));
}

/** Chiffre encaissé net (en unités monétaires) d'une liste de charges Stripe. */
export function sommeEncaissee(charges: ChargeStripe[]): number {
  const centimes = charges.reduce((sum, c) => sum + montantNetEncaisse(c), 0);
  return centimes / 100;
}

/** Bornes (horodatages Unix, secondes) des périodes de calcul. */
export function bornesDePeriode(maintenant: Date) {
  const startOfMonth = new Date(maintenant.getFullYear(), maintenant.getMonth(), 1);
  const startOfLastMonth = new Date(maintenant.getFullYear(), maintenant.getMonth() - 1, 1);
  return {
    debutMois: Math.floor(startOfMonth.getTime() / 1000),
    debutMoisPrecedent: Math.floor(startOfLastMonth.getTime() / 1000),
  };
}

/** Indicateurs d'encaissement et variation mensuelle. */
export function calculerEncaissements(
  chargesMoisCourant: ChargeStripe[],
  chargesMoisPrecedent: ChargeStripe[],
) {
  const revenueThisMonth = sommeEncaissee(chargesMoisCourant);
  const revenueLastMonth = sommeEncaissee(chargesMoisPrecedent);
  const mrrChange = revenueLastMonth > 0
    ? ((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100
    : 0;
  return { revenueThisMonth, revenueLastMonth, mrrChange };
}
