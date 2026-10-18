import { describe, it, expect } from "vitest";
import {
  DONNEES_INDISPONIBLES,
  messageIndisponibilite,
  parseStripeKpisResponse,
} from "@/lib/stripe-kpis-adapter";

const kpisBruts = (surcharges: Record<string, unknown> = {}) => ({
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
  ...surcharges,
});

const reponseReelle = (kpis = kpisBruts()) => ({ success: true, available: true, mock: false, kpis });

describe("parseStripeKpisResponse — seules des données explicitement réelles sont acceptées", () => {
  it("accepte une réponse réelle (success, available:true, mock:false)", () => {
    const r = parseStripeKpisResponse(reponseReelle());
    expect(r.available).toBe(true);
    if (r.available) {
      expect(r.kpis.mrr).toBe(1000);
      expect(r.kpis.churnRate).toBe(5);
    }
  });

  it("conserve null pour churn / variations non mesurés (jamais converti en 0)", () => {
    const r = parseStripeKpisResponse(
      reponseReelle(kpisBruts({ churnRate: null, churnRateChange: null, activeSubscriptionsChange: null, revenueChangeToDate: null })),
    );
    expect(r.available).toBe(true);
    if (r.available) {
      expect(r.kpis.churnRate).toBeNull();
      expect(r.kpis.churnRateChange).toBeNull();
      expect(r.kpis.activeSubscriptionsChange).toBeNull();
      expect(r.kpis.revenueChangeToDate).toBeNull();
    }
  });

  it("l'ancien mock (success:true, mock:true, MRR 12450…) est indisponible", () => {
    const r = parseStripeKpisResponse({
      success: true,
      mock: true,
      kpis: kpisBruts({ mrr: 12450, activeSubscriptions: 247, totalCustomers: 1247, churnRate: 2.1 }),
    });
    expect(r).toEqual({ available: false, reason: "mock_data" });
  });

  it("success:true SANS mock:false (ancienne version de la fonction) n'est jamais crue", () => {
    expect(parseStripeKpisResponse({ success: true, kpis: kpisBruts() }).available).toBe(false);
    expect(parseStripeKpisResponse({ success: true, mock: false, kpis: kpisBruts() }).available).toBe(false);
  });

  it("l'ancien repli d'erreur (mock:true, tout à zéro) est indisponible", () => {
    const r = parseStripeKpisResponse({
      error: "Service temporarily unavailable. Displaying cached data.",
      mock: true,
      kpis: kpisBruts({ mrr: 0, activeSubscriptions: 0, totalCustomers: 0 }),
    });
    expect(r.available).toBe(false);
  });

  it("réponse indisponible du serveur : conserve la raison, aucun KPI", () => {
    const r = parseStripeKpisResponse({
      success: false,
      available: false,
      reason: "stripe_not_configured",
      kpis: null,
    });
    expect(r).toEqual({ available: false, reason: "stripe_not_configured" });
    expect(parseStripeKpisResponse({ success: false, available: false, reason: "stripe_error", kpis: null })).toEqual({
      available: false,
      reason: "stripe_error",
    });
  });

  it("erreur de transport (error non nul) : indisponible, même si un corps réel est présent", () => {
    expect(parseStripeKpisResponse(reponseReelle(), new Error("boom"))).toEqual({
      available: false,
      reason: "request_failed",
    });
    expect(parseStripeKpisResponse(null, { message: "401" }).available).toBe(false);
  });

  it("corps absent, vide ou de forme inattendue : indisponible", () => {
    for (const corps of [null, undefined, "ok", 42, {}, { success: true, available: true, mock: false }]) {
      expect(parseStripeKpisResponse(corps).available).toBe(false);
    }
  });

  it("KPIs incomplets ou non numériques : indisponible (pas de NaN affiché)", () => {
    expect(parseStripeKpisResponse(reponseReelle(kpisBruts({ mrr: "1000" }))).available).toBe(false);
    expect(parseStripeKpisResponse(reponseReelle(kpisBruts({ mrr: Number.NaN }))).available).toBe(false);
    expect(parseStripeKpisResponse(reponseReelle(kpisBruts({ totalCustomers: undefined }))).available).toBe(false);
  });

  it("ne traduit jamais une réponse non réelle en nombre : aucune clé kpis dans le résultat indisponible", () => {
    const r = parseStripeKpisResponse({ success: true, mock: true, kpis: kpisBruts() });
    expect(r).not.toHaveProperty("kpis");
  });
});

describe("messages d'indisponibilité", () => {
  it("fournit un libellé français pour chaque raison", () => {
    expect(DONNEES_INDISPONIBLES).toBe("Données indisponibles");
    expect(messageIndisponibilite("stripe_not_configured")).toMatch(/Stripe/);
    expect(messageIndisponibilite(undefined)).toBe("Aucune source vérifiée n'est connectée.");
  });
});
