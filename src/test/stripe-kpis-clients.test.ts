import { describe, expect, it } from "vitest";
import {
  classerClients,
  lireIdentifiantsInternes,
  preuveCompteTest,
  repartirClients,
  type ClientStripe,
  type PaiementStripe,
} from "../../supabase/functions/stripe-kpis/clients.ts";
import { parseStripeKpisResponse } from "@/lib/stripe-kpis-adapter";

const client = (id: string, over: Partial<ClientStripe> = {}): ClientStripe => ({ id, livemode: true, metadata: {}, ...over });
const paiement = (customer: string, amount: number, amount_refunded = 0, over: Partial<PaiementStripe> = {}): PaiementStripe => ({
  customer, amount, amount_refunded, status: "succeeded", paid: true, livemode: true, ...over,
});

describe("classification des clients Stripe : jamais sur une supposition", () => {
  it("chaque preuve explicite de test est reconnue et nommée", () => {
    expect(preuveCompteTest(client("a", { metadata: { qa: "true" } }))).toMatch(/qa: true/);
    expect(preuveCompteTest(client("b", { name: "TEST interne MedCopilote Individuel (0 CHF)" }))).toMatch(/TEST/);
    expect(preuveCompteTest(client("c", { email: "mng.e2e.medmng.20261010@example.com" }))).toMatch(/domaine réservé/);
    expect(preuveCompteTest(client("d", { email: "x@app.test" }))).toMatch(/domaine réservé/);
    expect(preuveCompteTest(client("e", { livemode: false }))).toMatch(/mode test/);
    expect(preuveCompteTest(client("f", { email: "Fondatrice@Exemple.ch" }), { emailCompteStripe: "fondatrice@exemple.ch" })).toMatch(/titulaire/);
  });

  it("aucune supposition : domaine jetable, adresse « qa… » ou nom vide ne suffisent pas", () => {
    expect(preuveCompteTest(client("g", { email: "qa25761110@maxxspace.com" }))).toBeNull();
    expect(preuveCompteTest(client("h", { email: "audit.prefixe.memo+free1@gmail.com" }))).toBeNull();
    expect(preuveCompteTest(client("i", { name: "Testard Dupont" }))).toBeNull(); // « Test » doit être un mot entier
    expect(preuveCompteTest(client("j", { email: "contact@notexample.com" }))).toBeNull();
    expect(preuveCompteTest(client("k", { metadata: { qa: "false" } }))).toBeNull();
  });

  it("identifiants internes déclarés en configuration privée : id Stripe, adresse exacte ou préfixe en « * »", () => {
    const ids = lireIdentifiantsInternes(" cus_ABC ; interne@exemple.ch,\naudit.prefixe.* ");
    expect(ids).toEqual(["cus_abc", "interne@exemple.ch", "audit.prefixe.*"]);
    expect(preuveCompteTest(client("cus_ABC"), { identifiantsInternes: ids })).toMatch(/configuration/);
    expect(preuveCompteTest(client("x", { email: "Interne@exemple.ch" }), { identifiantsInternes: ids })).toMatch(/configuration/);
    expect(preuveCompteTest(client("y", { email: "audit.prefixe.memo+free1@gmail.com" }), { identifiantsInternes: ids })).toMatch(/configuration/);
    expect(preuveCompteTest(client("z", { email: "audit.autre@gmail.com" }), { identifiantsInternes: ids })).toBeNull();
    expect(lireIdentifiantsInternes(undefined)).toEqual([]);
  });

  it("réel = paiement conservé ou abonnement actif ; un achat intégralement remboursé n'en fait pas un client réel", () => {
    const clients = [
      client("rembourse"),
      client("payeur"),
      client("partiel"),
      client("abonne"),
      client("echec"),
      client("inscrit"),
      client("test-payeur", { metadata: { qa: "true" } }),
    ];
    const paiements = [
      paiement("rembourse", 990, 990),
      paiement("payeur", 3500),
      paiement("partiel", 3500, 1000),
      paiement("echec", 3500, 0, { status: "failed", paid: false }),
      paiement("test-payeur", 3500),
      paiement("inscrit", 3500, 0, { livemode: false }),
    ];
    const classement = classerClients(clients, paiements, [{ customer: "abonne", status: "active" }]);
    const cat = Object.fromEntries(classement.map((c) => [c.id, c.categorie]));
    expect(cat).toEqual({
      rembourse: "indetermine",
      payeur: "reel",
      partiel: "reel",
      abonne: "reel",
      echec: "indetermine",
      inscrit: "indetermine",
      "test-payeur": "test",
    });
    for (const c of classement) expect(c.preuve.length).toBeGreaterThan(5);
  });

  it("revue Codex : seul le montant capturé compte (autorisation non capturée, capture partielle remboursée)", () => {
    const clients = [client("autorise"), client("partiel-rembourse"), client("partiel-garde")];
    const paiements = [
      paiement("autorise", 3500, 0, { captured: false, amount_captured: 0 }),
      paiement("partiel-rembourse", 3500, 1000, { captured: true, amount_captured: 1000 }),
      paiement("partiel-garde", 3500, 0, { captured: true, amount_captured: 1000 }),
    ];
    const cat = Object.fromEntries(classerClients(clients, paiements, []).map((c) => [c.id, c.categorie]));
    expect(cat).toEqual({ autorise: "indetermine", "partiel-rembourse": "indetermine", "partiel-garde": "reel" });
  });

  it("répartition : les trois catégories couvrent exactement le total ; nouveaux réels comptés depuis le 1er du mois", () => {
    const debutMois = 1_790_812_800; // 01.10.2026 00:00 UTC
    const clients = [
      client("ancien", { created: debutMois - 10 }),
      client("nouveau", { created: debutMois + 10 }),
      client("test", { created: debutMois + 10, name: "TEST interne" }),
      client("inconnu", { created: debutMois + 10 }),
    ];
    const classement = classerClients(clients, [paiement("ancien", 3500), paiement("nouveau", 3500)], []);
    expect(repartirClients(clients, classement, debutMois)).toEqual({ total: 4, reels: 2, test: 1, indetermines: 1, nouveauxReelsCeMois: 1 });
  });

  it("cas réel observé le 18.10.2026 (identifiants anonymisés) : aucun client réel tant qu'aucun achat n'est conservé", () => {
    const clients = [
      client("qa", { email: "qp@maxxspace.com", metadata: { app: "medmng", qa: "true" }, name: "QA Premium (test)" }),
      client("e2e", { email: "mng.e2e.medmng.20261010225256@example.com" }),
      client("interne", { email: "audit.x.medcopilote+free1003@gmail.com", name: "TEST interne MedCopilote Individuel (0 CHF)" }),
      client("fondatrice", { email: "titulaire@exemple.ch" }),
      client("jetable", { email: "qa25761110@maxxspace.com", metadata: { app: "memomng" } }),
    ];
    const classement = classerClients(clients, [paiement("fondatrice", 990, 990)], [], { emailCompteStripe: "titulaire@exemple.ch" });
    expect(repartirClients(clients, classement, 0)).toEqual({ total: 5, reels: 0, test: 4, indetermines: 1, nouveauxReelsCeMois: 0 });
  });
});

describe("adaptateur : répartition et compte Stripe", () => {
  const base = {
    success: true, available: true, mock: false,
    kpis: {
      mrr: 0, mrrChange: null, activeSubscriptions: 0, activeSubscriptionsChange: null, churnRate: null, churnRateChange: null,
      totalCustomers: 21, newCustomersThisMonth: 20, revenueThisMonth: 0, revenueLastMonth: 0, revenueLastMonthToDate: 0,
      revenueChangeToDate: null, currency: "eur", lastUpdated: "2026-10-18T20:00:00Z",
      clients: { total: 21, reels: 0, test: 17, indetermines: 4, nouveauxReelsCeMois: 0 },
      compteStripe: { id: "acct_1Exemple", livemode: true },
    },
  };

  it("répartition cohérente et identifiant de compte conservés", () => {
    const r = parseStripeKpisResponse(base);
    expect(r.available).toBe(true);
    if (r.available) {
      expect(r.kpis.clients).toEqual({ total: 21, reels: 0, test: 17, indetermines: 4, nouveauxReelsCeMois: 0 });
      expect(r.kpis.compteStripeId).toBe("acct_1Exemple");
    }
  });

  it("répartition incohérente ou absente : null (jamais de zéro de repli), le reste reste disponible", () => {
    for (const clients of [undefined, null, { total: 21, reels: 0, test: 17, indetermines: 3, nouveauxReelsCeMois: 0 }, { total: 21, reels: -1, test: 18, indetermines: 4, nouveauxReelsCeMois: 0 }]) {
      const r = parseStripeKpisResponse({ ...base, kpis: { ...base.kpis, clients, compteStripe: { id: "pas-un-compte" } } });
      expect(r.available).toBe(true);
      if (r.available) {
        expect(r.kpis.clients).toBeNull();
        expect(r.kpis.compteStripeId).toBeNull();
      }
    }
  });

  it("clé du mode test : indisponible, avec la raison dite", () => {
    expect(parseStripeKpisResponse({ success: false, available: false, reason: "stripe_test_mode", kpis: null })).toEqual({
      available: false,
      reason: "stripe_test_mode",
    });
  });
});
