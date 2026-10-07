/**
 * Calculs purs de la fonction Edge stripe-kpis.
 *
 * Aucun accès réseau, aucune dépendance Deno : ce module est importé par index.ts (Deno)
 * et testé par Vitest (src/test/stripe-kpis-calculs.test.ts).
 */

/** Sous-ensemble des champs d'un objet Charge Stripe utilisés ici. */
export interface ChargeStripe {
  id?: string;
  paid?: boolean;
  refunded?: boolean;
  amount?: number;
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

/** Somme des paiements encaissés (payés, non remboursés) d'une liste de charges Stripe. */
export function sommeEncaissee(charges: ChargeStripe[]): number {
  return charges
    .filter((c) => c.paid && !c.refunded)
    .reduce((sum, c) => sum + (c.amount || 0) / 100, 0);
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
