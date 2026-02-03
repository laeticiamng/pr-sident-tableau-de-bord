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

Deno.test("stripe-kpis: should return mock data when no Stripe key configured", async () => {
  const response = await fetch(FUNCTION_URL, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
      "apikey": SUPABASE_ANON_KEY,
    },
  });

  const data = await response.json();

  assertEquals(response.status, 200);
  assertEquals(data.success, true);
  
  // Should indicate mock data or have valid KPIs structure
  assertExists(data.kpis);
  assertExists(data.kpis.mrr);
  assertExists(data.kpis.activeSubscriptions);
  assertExists(data.kpis.churnRate);
  assertExists(data.kpis.totalCustomers);
  assertExists(data.kpis.currency);
  assertExists(data.kpis.lastUpdated);
});

Deno.test("stripe-kpis: response should have correct KPI structure", async () => {
  const response = await fetch(FUNCTION_URL, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
      "apikey": SUPABASE_ANON_KEY,
    },
  });

  const data = await response.json();

  // Verify all expected fields exist
  const kpis = data.kpis;
  
  assertEquals(typeof kpis.mrr, "number");
  assertEquals(typeof kpis.mrrChange, "number");
  assertEquals(typeof kpis.activeSubscriptions, "number");
  assertEquals(typeof kpis.activeSubscriptionsChange, "number");
  assertEquals(typeof kpis.churnRate, "number");
  assertEquals(typeof kpis.churnRateChange, "number");
  assertEquals(typeof kpis.totalCustomers, "number");
  assertEquals(typeof kpis.newCustomersThisMonth, "number");
  assertEquals(typeof kpis.revenueThisMonth, "number");
  assertEquals(typeof kpis.revenueLastMonth, "number");
  assertEquals(typeof kpis.currency, "string");
  assertEquals(typeof kpis.lastUpdated, "string");
});

Deno.test("stripe-kpis: currency should be valid ISO code", async () => {
  const response = await fetch(FUNCTION_URL, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
      "apikey": SUPABASE_ANON_KEY,
    },
  });

  const data = await response.json();

  const validCurrencies = ["eur", "usd", "gbp", "chf"];
  assertEquals(
    validCurrencies.includes(data.kpis.currency.toLowerCase()),
    true,
    `Currency ${data.kpis.currency} should be valid`
  );
});

Deno.test("stripe-kpis: lastUpdated should be valid ISO date", async () => {
  const response = await fetch(FUNCTION_URL, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
      "apikey": SUPABASE_ANON_KEY,
    },
  });

  const data = await response.json();

  const date = new Date(data.kpis.lastUpdated);
  assertEquals(date instanceof Date, true);
  assertEquals(isNaN(date.getTime()), false, "lastUpdated should be a valid date");
});

Deno.test("stripe-kpis: numeric values should be non-negative", async () => {
  const response = await fetch(FUNCTION_URL, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
      "apikey": SUPABASE_ANON_KEY,
    },
  });

  const data = await response.json();
  const kpis = data.kpis;

  // Core metrics should be non-negative
  assertEquals(kpis.mrr >= 0, true, "MRR should be non-negative");
  assertEquals(kpis.activeSubscriptions >= 0, true, "activeSubscriptions should be non-negative");
  assertEquals(kpis.churnRate >= 0, true, "churnRate should be non-negative");
  assertEquals(kpis.totalCustomers >= 0, true, "totalCustomers should be non-negative");
  assertEquals(kpis.newCustomersThisMonth >= 0, true, "newCustomersThisMonth should be non-negative");
  assertEquals(kpis.revenueThisMonth >= 0, true, "revenueThisMonth should be non-negative");
  assertEquals(kpis.revenueLastMonth >= 0, true, "revenueLastMonth should be non-negative");
});

Deno.test("stripe-kpis: churn rate should be percentage (0-100)", async () => {
  const response = await fetch(FUNCTION_URL, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
      "apikey": SUPABASE_ANON_KEY,
    },
  });

  const data = await response.json();

  assertEquals(data.kpis.churnRate >= 0, true, "churnRate should be >= 0");
  assertEquals(data.kpis.churnRate <= 100, true, "churnRate should be <= 100");
});

Deno.test("stripe-kpis: should have CORS headers in response", async () => {
  const response = await fetch(FUNCTION_URL, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
      "apikey": SUPABASE_ANON_KEY,
    },
  });

  await response.json();

  assertEquals(response.headers.get("access-control-allow-origin"), "*");
});

Deno.test("stripe-kpis: should return JSON content type", async () => {
  const response = await fetch(FUNCTION_URL, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
      "apikey": SUPABASE_ANON_KEY,
    },
  });

  await response.json();

  const contentType = response.headers.get("content-type");
  assertExists(contentType);
  assertEquals(contentType.includes("application/json"), true);
});

// Mock data validation test
Deno.test("stripe-kpis: mock data should have realistic values", async () => {
  const response = await fetch(FUNCTION_URL, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
      "apikey": SUPABASE_ANON_KEY,
    },
  });

  const data = await response.json();

  if (data.mock === true) {
    const kpis = data.kpis;
    
    // Mock data should have realistic placeholder values
    // MRR should be in reasonable range for a SaaS
    assertEquals(kpis.mrr >= 0, true);
    assertEquals(kpis.mrr <= 1000000, true, "Mock MRR should be reasonable");
    
    // Subscriptions should be reasonable
    assertEquals(kpis.activeSubscriptions >= 0, true);
    assertEquals(kpis.activeSubscriptions <= 100000, true);
    
    // Churn rate should be reasonable
    assertEquals(kpis.churnRate <= 50, true, "Churn rate should be < 50%");
  }
});
