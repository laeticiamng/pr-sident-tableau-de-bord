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
      quantity?: number;
      price?: {
        unit_amount?: number | null;
        recurring?: {
          /** "day" | "week" | "month" | "year" */
          interval?: string;
          interval_count?: number;
          /** "licensed" | "metered" */
          usage_type?: string;
        } | null;
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

/** Nombre moyen de périodes de facturation par mois, selon l'intervalle Stripe. */
const PERIODES_PAR_MOIS: Record<string, number> = {
  day: 365 / 12,
  week: 52 / 12,
  month: 1,
  year: 1 / 12,
};

/**
 * MRR (en unités monétaires) des abonnements actifs : pour chaque élément
 * d'abonnement, prix unitaire × quantité, ramené au mois selon l'intervalle et
 * interval_count (annuel / 12, trimestriel / 3, hebdomadaire × 52 / 12…).
 * Exclus faute de montant connu d'avance : prix à l'usage (metered) et prix sans
 * unit_amount (paliers). Les remises (coupons) ne sont pas déduites.
 */
export function calculerMrr(abonnements: AbonnementStripe[]): number {
  let centimesParMois = 0;
  for (const sub of abonnements) {
    for (const item of sub.items?.data || []) {
      const prix = item.price;
      const recurrence = prix?.recurring;
      if (!prix || prix.unit_amount == null || !recurrence?.interval) continue;
      const parMois = PERIODES_PAR_MOIS[recurrence.interval];
      if (!parMois || recurrence.usage_type === "metered") continue;
      const intervalCount = recurrence.interval_count && recurrence.interval_count > 0 ? recurrence.interval_count : 1;
      centimesParMois += (prix.unit_amount * (item.quantity ?? 1) * parMois) / intervalCount;
    }
  }
  return centimesParMois / 100;
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

/**
 * Bornes (horodatages Unix, secondes, UTC) des périodes de calcul :
 * - mois en cours : [debutMois, maintenant] ;
 * - mois précédent complet : [debutMoisPrecedent, debutMois[ ;
 * - même période du mois précédent : [debutMoisPrecedent, finPeriodeComparable[, soit la
 *   même durée écoulée que depuis debutMois, plafonnée à la fin du mois précédent
 *   (le 31 mars se compare à tout février).
 */
export function bornesDePeriode(maintenant: Date) {
  const annee = maintenant.getUTCFullYear();
  const mois = maintenant.getUTCMonth();
  const debutMoisMs = Date.UTC(annee, mois, 1);
  const debutMoisPrecedentMs = Date.UTC(annee, mois - 1, 1);
  const ecouleMs = maintenant.getTime() - debutMoisMs;
  const finPeriodeComparableMs = Math.min(debutMoisPrecedentMs + ecouleMs, debutMoisMs);
  return {
    debutMois: Math.floor(debutMoisMs / 1000),
    debutMoisPrecedent: Math.floor(debutMoisPrecedentMs / 1000),
    finPeriodeComparable: Math.floor(finPeriodeComparableMs / 1000),
  };
}

/** Variation en %, ou null si la référence est nulle (variation non mesurable). */
export function variationPourcentage(actuel: number, reference: number): number | null {
  return reference > 0 ? ((actuel - reference) / reference) * 100 : null;
}

/**
 * Chiffre encaissé (net des remboursements) et sa croissance sur des périodes
 * équivalentes : mois en cours à date contre la même durée du mois précédent.
 * Il s'agit d'encaissements (paiements ponctuels et annuels compris), pas de MRR.
 */
export function calculerEncaissements(
  chargesMoisCourant: ChargeStripe[],
  chargesMoisPrecedent: ChargeStripe[],
  maintenant: Date,
) {
  const { finPeriodeComparable } = bornesDePeriode(maintenant);
  const revenueThisMonth = sommeEncaissee(chargesMoisCourant);
  const revenueLastMonth = sommeEncaissee(chargesMoisPrecedent);
  const revenueLastMonthToDate = sommeEncaissee(
    chargesMoisPrecedent.filter((c) => (c.created ?? Infinity) < finPeriodeComparable),
  );
  return {
    revenueThisMonth,
    revenueLastMonth,
    revenueLastMonthToDate,
    revenueChangeToDate: variationPourcentage(revenueThisMonth, revenueLastMonthToDate),
  };
}

/** Indicateurs renvoyés au front par la fonction Edge. */
export interface StripeKPIs {
  mrr: number;
  /**
   * Variation du MRR en %. Toujours null : l'API Stripe ne donne pas le MRR passé, et
   * le chiffre encaissé (ponctuel, annuel…) n'en est pas un substitut.
   */
  mrrChange: number | null;
  activeSubscriptions: number;
  activeSubscriptionsChange: number;
  churnRate: number;
  churnRateChange: number;
  totalCustomers: number;
  newCustomersThisMonth: number;
  /** Encaissé net depuis le 1er du mois (UTC) jusqu'à maintenant. */
  revenueThisMonth: number;
  /** Encaissé net sur tout le mois précédent. */
  revenueLastMonth: number;
  /** Encaissé net du mois précédent sur la même durée écoulée que le mois en cours. */
  revenueLastMonthToDate: number;
  /** Croissance en % de revenueThisMonth vs revenueLastMonthToDate ; null si non mesurable. */
  revenueChangeToDate: number | null;
  currency: string;
  lastUpdated: string;
}

const arrondi = (valeur: number, decimales: number) => {
  const facteur = 10 ** decimales;
  return Math.round(valeur * facteur) / facteur;
};

export function assemblerKpis(entrees: {
  abonnementsActifs: AbonnementStripe[];
  totalCustomers: number;
  newCustomersThisMonth: number;
  chargesMoisCourant: ChargeStripe[];
  chargesMoisPrecedent: ChargeStripe[];
  maintenant: Date;
  churnRate?: number;
}): StripeKPIs {
  const encaissements = calculerEncaissements(
    entrees.chargesMoisCourant,
    entrees.chargesMoisPrecedent,
    entrees.maintenant,
  );
  return {
    mrr: arrondi(calculerMrr(entrees.abonnementsActifs), 2),
    mrrChange: null,
    activeSubscriptions: entrees.abonnementsActifs.length,
    activeSubscriptionsChange: entrees.newCustomersThisMonth,
    churnRate: arrondi(entrees.churnRate ?? 0, 1),
    churnRateChange: 0, // Nécessiterait un calcul historique
    totalCustomers: entrees.totalCustomers,
    newCustomersThisMonth: entrees.newCustomersThisMonth,
    revenueThisMonth: arrondi(encaissements.revenueThisMonth, 2),
    revenueLastMonth: arrondi(encaissements.revenueLastMonth, 2),
    revenueLastMonthToDate: arrondi(encaissements.revenueLastMonthToDate, 2),
    revenueChangeToDate: encaissements.revenueChangeToDate === null
      ? null
      : arrondi(encaissements.revenueChangeToDate, 1),
    currency: "eur",
    lastUpdated: entrees.maintenant.toISOString(),
  };
}
