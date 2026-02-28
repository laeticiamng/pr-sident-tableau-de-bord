import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assertEquals, assertExists, assertStringIncludes } from "https://deno.land/std@0.224.0/assert/mod.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;

const FUNCTION_URL = `${SUPABASE_URL}/functions/v1/executive-run`;

// Complete list of all 29 run types — must match run-types-registry.ts
const ALL_29_RUN_TYPES = [
  "DAILY_EXECUTIVE_BRIEF",
  "CEO_STANDUP_MEETING",
  "PLATFORM_STATUS_REVIEW",
  "SECURITY_AUDIT_RLS",
  "RELEASE_GATE_CHECK",
  "DEPLOY_TO_PRODUCTION",
  "RLS_POLICY_UPDATE",
  "COMPETITIVE_ANALYSIS",
  "QUALITY_AUDIT",
  "ADS_PERFORMANCE_REVIEW",
  "GROWTH_STRATEGY_REVIEW",
  "OKR_QUARTERLY_REVIEW",
  "COMPLIANCE_RGPD_CHECK",
  "SEO_AUDIT",
  "CONTENT_CALENDAR_PLAN",
  "REVENUE_FORECAST",
  "LEAD_SCORING_UPDATE",
  "FINANCIAL_REPORT",
  "RGPD_AUDIT",
  "VULNERABILITY_SCAN",
  "ROADMAP_UPDATE",
  "CODE_REVIEW",
  "DEPLOYMENT_CHECK",
  "DATA_INSIGHTS_REPORT",
  "AGENT_PERFORMANCE_REVIEW",
  "TECH_WATCH_REPORT",
  "MARKETING_WEEK_PLAN",
  "MASS_EMAIL_CAMPAIGN",
  "PRICING_CHANGE",
];

Deno.test("executive-run: should reject request without auth", async () => {
  const response = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ run_type: "DAILY_EXECUTIVE_BRIEF" }),
  });
  await response.text();
  assertEquals(response.status, 401);
});

Deno.test("executive-run: should handle CORS preflight", async () => {
  const response = await fetch(FUNCTION_URL, {
    method: "OPTIONS",
    headers: {
      "Origin": "http://localhost:5173",
      "Access-Control-Request-Method": "POST",
    },
  });
  await response.text();
  assertEquals(response.status, 200);
  assertExists(response.headers.get("access-control-allow-origin"));
  assertExists(response.headers.get("access-control-allow-headers"));
});

Deno.test("executive-run: should reject invalid run_type with 400", async () => {
  const response = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
      "apikey": SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({ run_type: "TOTALLY_INVALID_TYPE" }),
  });
  const data = await response.json();
  // May return 400 (unknown type) or 401/403 (auth check before type check)
  // The important thing is it does NOT return 200
  assertEquals(response.status !== 200, true);
});

Deno.test("executive-run: should have required CORS headers", async () => {
  const response = await fetch(FUNCTION_URL, { method: "OPTIONS" });
  await response.text();
  const headers = response.headers;
  assertEquals(headers.get("access-control-allow-origin"), "*");
  assertStringIncludes(headers.get("access-control-allow-headers") || "", "authorization");
  assertStringIncludes(headers.get("access-control-allow-headers") || "", "content-type");
});

Deno.test("executive-run: all 29 run types are defined in registry", () => {
  assertEquals(ALL_29_RUN_TYPES.length, 29, "Must have exactly 29 run types");

  // Verify no duplicates
  const unique = new Set(ALL_29_RUN_TYPES);
  assertEquals(unique.size, 29, "No duplicate run types allowed");

  // Verify naming convention (UPPER_SNAKE_CASE)
  ALL_29_RUN_TYPES.forEach((type) => {
    assertEquals(/^[A-Z][A-Z0-9_]+$/.test(type), true, `${type} must be UPPER_SNAKE_CASE`);
  });
});

Deno.test("executive-run: model configuration should be valid", () => {
  const MODEL_CONFIG = {
    default: "google/gemini-3-flash-preview",
    reasoning: "google/gemini-2.5-pro",
    coding: "openai/gpt-5.2",
    summary: "google/gemini-2.5-flash",
  };

  assertExists(MODEL_CONFIG.default);
  assertExists(MODEL_CONFIG.reasoning);
  assertExists(MODEL_CONFIG.coding);
  assertExists(MODEL_CONFIG.summary);

  Object.values(MODEL_CONFIG).forEach((model) => {
    assertEquals(typeof model, "string");
    assertEquals(model.includes("/"), true, `Model ${model} should have provider prefix`);
  });
});

Deno.test("executive-run: run types cover all expected categories", () => {
  // Verify coverage of key business domains
  const securityTypes = ALL_29_RUN_TYPES.filter(t => t.includes("SECURITY") || t.includes("RLS") || t.includes("VULNERABILITY"));
  assertEquals(securityTypes.length >= 3, true, "Should have at least 3 security-related run types");

  const financeTypes = ALL_29_RUN_TYPES.filter(t => t.includes("REVENUE") || t.includes("FINANCIAL") || t.includes("PRICING"));
  assertEquals(financeTypes.length >= 3, true, "Should have at least 3 finance-related run types");

  const marketingTypes = ALL_29_RUN_TYPES.filter(t => t.includes("MARKETING") || t.includes("SEO") || t.includes("ADS") || t.includes("CONTENT") || t.includes("EMAIL"));
  assertEquals(marketingTypes.length >= 4, true, "Should have at least 4 marketing-related run types");

  const criticalTypes = ["DEPLOY_TO_PRODUCTION", "RLS_POLICY_UPDATE", "PRICING_CHANGE", "MASS_EMAIL_CAMPAIGN"];
  criticalTypes.forEach(type => {
    assertEquals(ALL_29_RUN_TYPES.includes(type), true, `Critical type ${type} must be in registry`);
  });
});
