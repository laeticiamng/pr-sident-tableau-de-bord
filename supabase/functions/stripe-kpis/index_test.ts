import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assertEquals, assertExists } from "https://deno.land/std@0.224.0/assert/mod.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;

const FUNCTION_URL = `${SUPABASE_URL}/functions/v1/stripe-kpis`;

Deno.test("stripe-kpis: should handle CORS preflight", async () => {
  const response = await fetch(FUNCTION_URL, {
    method: "OPTIONS",
    headers: {
      "Origin": "http://localhost:5173",
      "Access-Control-Request-Method": "GET",
    },
  });

  // Consume response body
  await response.text();

  assertEquals(response.status, 200);
  assertExists(response.headers.get("access-control-allow-origin"));
});

const appeler = async () => {
  const response = await fetch(FUNCTION_URL, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
      "apikey": SUPABASE_ANON_KEY,
    },
  });
  return { response, data: await response.json() };
};

// Contrat : soit des KPIs réels (available:true, mock:false), soit « indisponible »
// (available:false, kpis:null). Jamais de données factices ni de zéros de remplacement.
Deno.test("stripe-kpis: never returns mock data (real KPIs or explicit unavailable)", async () => {
  const { response, data } = await appeler();
  // 401/403 si l'appelant n'est pas owner : le corps n'a alors aucun KPI.
  if (response.status === 401 || response.status === 403) {
    assertEquals(data.kpis, undefined);
    return;
  }
  assertEquals(response.status, 200);
  assertEquals(data.mock === true, false);
  if (data.available === true) {
    assertEquals(data.success, true);
    assertEquals(data.mock, false);
    assertExists(data.kpis);
  } else {
    assertEquals(data.available, false);
    assertEquals(data.success, false);
    assertEquals(data.kpis, null);
    assertExists(data.reason);
  }
});

Deno.test("stripe-kpis: when available, KPI structure and ranges are valid", async () => {
  const { data } = await appeler();
  if (data.available !== true) return;
  const kpis = data.kpis;

  assertEquals(typeof kpis.mrr, "number");
  // null = non mesuré (jamais inventé).
  assertEquals(kpis.mrrChange === null || typeof kpis.mrrChange === "number", true);
  assertEquals(typeof kpis.activeSubscriptions, "number");
  // churn et variation nette : non mesurés (statuts Stripe sans historique), toujours null
  assertEquals(kpis.churnRate, null);
  assertEquals(kpis.activeSubscriptionsChange, null);
  assertEquals(kpis.churnRateChange, null);
  assertEquals(typeof kpis.totalCustomers, "number");
  assertEquals(typeof kpis.newCustomersThisMonth, "number");
  assertEquals(typeof kpis.revenueThisMonth, "number");
  assertEquals(typeof kpis.revenueLastMonth, "number");
  assertEquals(typeof kpis.revenueLastMonthToDate, "number");
  assertEquals(kpis.revenueChangeToDate === null || typeof kpis.revenueChangeToDate === "number", true);
  // devise lue dans Stripe : tout code ISO 4217 en minuscules
  assertEquals(/^[a-z]{3}$/.test(kpis.currency), true);
  assertEquals(isNaN(new Date(kpis.lastUpdated).getTime()), false);

  assertEquals(kpis.mrr >= 0, true);
  assertEquals(kpis.activeSubscriptions >= 0, true);
  assertEquals(kpis.totalCustomers >= 0, true);
  // revue Codex : l'encaissement net est signé (remboursements, paiements annulés) et peut être négatif
  for (const v of [kpis.revenueThisMonth, kpis.revenueLastMonth, kpis.revenueLastMonthToDate]) {
    assertEquals(Number.isFinite(v), true);
  }
});

Deno.test("stripe-kpis: should have CORS headers and JSON content type", async () => {
  const { response } = await appeler();
  assertEquals(response.headers.get("access-control-allow-origin"), "*");
  const contentType = response.headers.get("content-type");
  assertExists(contentType);
  assertEquals(contentType.includes("application/json"), true);
});
