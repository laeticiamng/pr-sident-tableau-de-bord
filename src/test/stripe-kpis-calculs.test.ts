import { describe, it, expect } from "vitest";
import {
  assemblerKpis,
  bornesDePeriode,
  calculerEncaissements,
  calculerMrr,
  listerStripe,
  sommeEncaissee,
  type AbonnementStripe,
  type ChargeStripe,
  type RequeteStripe,
} from "../../supabase/functions/stripe-kpis/calculs.ts";

/** Faux client Stripe paginé : `total` objets servis par pages de `limit` (max 100). */
function fausseApiPaginee(total: number) {
  const objets = Array.from({ length: total }, (_, i) => ({ id: `ch_${i}` }));
  const appels: Array<Record<string, string> | undefined> = [];
  const requete: RequeteStripe = async (_endpoint, params) => {
    appels.push(params);
    const limite = Math.min(Number(params?.limit ?? 10), 100);
    const debut = params?.starting_after
      ? objets.findIndex((o) => o.id === params.starting_after) + 1
      : 0;
    const data = objets.slice(debut, debut + limite);
    return { data, has_more: debut + limite < objets.length };
  };
  return { requete, appels };
}

describe("stripe-kpis — pagination des listes Stripe", () => {
  it("consomme toutes les pages (has_more / starting_after), pas seulement les 100 premiers éléments", async () => {
    const { requete, appels } = fausseApiPaginee(250);

    const charges = await listerStripe<{ id: string }>(requete, "charges", {
      "created[gte]": "1756684800",
      "created[lt]": "1759276800",
    });

    expect(charges).toHaveLength(250);
    expect(new Set(charges.map((c) => c.id)).size).toBe(250);
    expect(appels).toHaveLength(3);
    // Les filtres de période sont conservés sur chaque page.
    for (const params of appels) {
      expect(params?.["created[gte]"]).toBe("1756684800");
      expect(params?.["created[lt]"]).toBe("1759276800");
    }
    expect(appels[1]?.starting_after).toBe("ch_99");
    expect(appels[2]?.starting_after).toBe("ch_199");
  });

  it("s'arrête après une seule requête quand has_more est faux", async () => {
    const { requete, appels } = fausseApiPaginee(42);
    const charges = await listerStripe(requete, "charges");
    expect(charges).toHaveLength(42);
    expect(appels).toHaveLength(1);
  });

  it("échoue explicitement plutôt que de renvoyer une liste tronquée si la pagination ne progresse pas", async () => {
    const requete: RequeteStripe = async () => ({ data: [], has_more: true });
    await expect(listerStripe(requete, "charges")).rejects.toThrow(/pagination/i);
  });
});

describe("stripe-kpis — chiffre encaissé net", () => {
  const reussi = (montant: number, rembourse = 0): ChargeStripe => ({
    status: "succeeded",
    paid: true,
    captured: true,
    amount: montant,
    amount_captured: montant,
    amount_refunded: rembourse,
    refunded: rembourse >= montant && montant > 0,
  });

  it("soustrait les remboursements partiels (amount_refunded)", () => {
    // 100 € encaissés dont 30 € remboursés + 50 € encaissés sans remboursement = 120 € nets.
    expect(sommeEncaissee([reussi(10_000, 3_000), reussi(5_000)])).toBe(120);
  });

  it("ne compte rien pour un paiement intégralement remboursé", () => {
    expect(sommeEncaissee([reussi(10_000, 10_000)])).toBe(0);
  });

  it("ignore les paiements non réussis (échoués, en attente, autorisés non capturés)", () => {
    const echoue: ChargeStripe = { status: "failed", paid: false, captured: false, amount: 4_000, amount_captured: 0, amount_refunded: 0 };
    const enAttente: ChargeStripe = { status: "pending", paid: false, captured: false, amount: 6_000, amount_captured: 0, amount_refunded: 0 };
    const nonCapture: ChargeStripe = { status: "succeeded", paid: true, captured: false, amount: 8_000, amount_captured: 0, amount_refunded: 0 };
    expect(sommeEncaissee([echoue, enAttente, nonCapture, reussi(2_000)])).toBe(20);
  });

  it("utilise le montant réellement capturé en cas de capture partielle", () => {
    const capturePartielle: ChargeStripe = { ...reussi(10_000), amount_captured: 7_000 };
    expect(sommeEncaissee([capturePartielle])).toBe(70);
  });
});

const unix = (iso: string) => Math.floor(Date.parse(iso) / 1000);
const paiement = (iso: string, euros: number): ChargeStripe => ({
  id: `ch_${iso}`,
  status: "succeeded",
  paid: true,
  captured: true,
  amount: euros * 100,
  amount_captured: euros * 100,
  amount_refunded: 0,
  created: unix(iso),
});
/** Un paiement de `euros` chaque jour à 09:00 UTC, du jour `de` au jour `a` inclus. */
const paiementsQuotidiens = (mois: string, de: number, a: number, euros = 100) =>
  Array.from({ length: a - de + 1 }, (_, i) =>
    paiement(`${mois}-${String(de + i).padStart(2, "0")}T09:00:00Z`, euros),
  );

describe("stripe-kpis — croissance comparable (pas de faux MRR)", () => {
  it("compare le mois en cours à date à la même durée du mois précédent", () => {
    // 3 octobre 12:00 : 3 jours encaissés en octobre, contre 30 jours en septembre.
    const maintenant = new Date("2026-10-03T12:00:00Z");
    const r = calculerEncaissements(
      paiementsQuotidiens("2026-10", 1, 3),
      paiementsQuotidiens("2026-09", 1, 30),
      maintenant,
    );
    expect(r.revenueThisMonth).toBe(300);
    expect(r.revenueLastMonth).toBe(3000);
    // Même période : 1er septembre 00:00 → 3 septembre 12:00.
    expect(r.revenueLastMonthToDate).toBe(300);
    // Rythme identique : 0 %, et non la fausse chute de -90 % (300 vs 3000).
    expect(r.revenueChangeToDate).toBe(0);
  });

  it("plafonne la période de référence à la fin du mois précédent (31 mars vs février)", () => {
    const maintenant = new Date("2026-03-31T18:00:00Z");
    const r = calculerEncaissements(
      paiementsQuotidiens("2026-03", 1, 31),
      paiementsQuotidiens("2026-02", 1, 28),
      maintenant,
    );
    expect(r.revenueLastMonthToDate).toBe(2800);
    expect(r.revenueChangeToDate).toBeCloseTo(((3100 - 2800) / 2800) * 100, 6);
  });

  it("renvoie null (non mesurable), et non 0 %, sans encaissement sur la période de référence", () => {
    const maintenant = new Date("2026-10-03T12:00:00Z");
    const r = calculerEncaissements(paiementsQuotidiens("2026-10", 1, 3), [], maintenant);
    expect(r.revenueChangeToDate).toBeNull();
  });

  it("calcule les bornes de période en UTC, y compris au passage d'année", () => {
    expect(bornesDePeriode(new Date("2026-10-03T12:00:00Z"))).toEqual({
      debutMois: unix("2026-10-01T00:00:00Z"),
      debutMoisPrecedent: unix("2026-09-01T00:00:00Z"),
      finPeriodeComparable: unix("2026-09-03T12:00:00Z"),
    });
    expect(bornesDePeriode(new Date("2026-01-15T00:00:00Z"))).toEqual({
      debutMois: unix("2026-01-01T00:00:00Z"),
      debutMoisPrecedent: unix("2025-12-01T00:00:00Z"),
      finPeriodeComparable: unix("2025-12-15T00:00:00Z"),
    });
  });

  it("n'expose pas de variation de MRR déduite des encaissements (mrrChange = null)", () => {
    const kpis = assemblerKpis({
      abonnementsActifs: [
        { id: "sub_1", items: { data: [{ quantity: 1, price: { unit_amount: 5_000, recurring: { interval: "month" } } }] } },
      ],
      totalCustomers: 1,
      newCustomersThisMonth: 0,
      chargesMoisCourant: paiementsQuotidiens("2026-10", 1, 3),
      chargesMoisPrecedent: paiementsQuotidiens("2026-09", 1, 30),
      maintenant: new Date("2026-10-03T12:00:00Z"),
    });
    expect(kpis.mrr).toBe(50);
    // Stripe ne fournit pas l'historique du MRR : la variation n'est pas mesurée.
    expect(kpis.mrrChange).toBeNull();
    expect(kpis.revenueThisMonth).toBe(300);
    expect(kpis.revenueLastMonth).toBe(3000);
    expect(kpis.revenueLastMonthToDate).toBe(300);
    expect(kpis.revenueChangeToDate).toBe(0);
  });
});

describe("stripe-kpis — MRR normalisé au mois", () => {
  const element = (unit_amount: number, interval: string, quantity = 1, interval_count = 1, usage_type = "licensed") => ({
    quantity,
    price: { unit_amount, recurring: { interval, interval_count, usage_type } },
  });

  it("additionne tous les éléments de chaque abonnement, quantité et périodicité comprises", () => {
    const abonnements: AbonnementStripe[] = [
      // 3 sièges à 20 €/mois + une option à 5 €/mois = 65 €
      { id: "sub_a", items: { data: [element(2_000, "month", 3), element(500, "month")] } },
      // 120 €/an = 10 €/mois
      { id: "sub_b", items: { data: [element(12_000, "year")] } },
      // 30 € tous les 3 mois = 10 €/mois
      { id: "sub_c", items: { data: [element(3_000, "month", 1, 3)] } },
      // 10 €/semaine = 10 × 52 / 12 €/mois
      { id: "sub_d", items: { data: [element(1_000, "week")] } },
      // Facturation à l'usage : montant non connu d'avance, exclu du MRR
      { id: "sub_e", items: { data: [element(10, "month", 1, 1, "metered")] } },
    ];
    expect(calculerMrr(abonnements)).toBeCloseTo(65 + 10 + 10 + (10 * 52) / 12, 6);
  });
});
