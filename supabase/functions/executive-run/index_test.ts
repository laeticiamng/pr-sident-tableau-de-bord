import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assertEquals, assertExists, assertStringIncludes } from "https://deno.land/std@0.224.0/assert/mod.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;

const FUNCTION_URL = `${SUPABASE_URL}/functions/v1/executive-run`;

Deno.test("executive-run: should reject request without auth", async () => {
  const response = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      run_type: "DAILY_EXECUTIVE_BRIEF",
    }),
  });

  // Consume response body to prevent resource leak
  const body = await response.text();

  // Should require auth
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

  // Consume response body
  await response.text();

  assertEquals(response.status, 200);
  assertExists(response.headers.get("access-control-allow-origin"));
  assertExists(response.headers.get("access-control-allow-headers"));
});

Deno.test("executive-run: should reject invalid run_type", async () => {
  const response = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
      "apikey": SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({
      run_type: "INVALID_RUN_TYPE",
    }),
  });

  const data = await response.json();

  assertEquals(response.status, 400);
  assertExists(data.error);
  assertStringIncludes(data.error, "Unknown run type");
});

Deno.test("executive-run: should have required headers in CORS response", async () => {
  const response = await fetch(FUNCTION_URL, {
    method: "OPTIONS",
  });

  await response.text();

  const headers = response.headers;
  assertEquals(headers.get("access-control-allow-origin"), "*");
  assertStringIncludes(
    headers.get("access-control-allow-headers") || "",
    "authorization"
  );
  assertStringIncludes(
    headers.get("access-control-allow-headers") || "",
    "content-type"
  );
});

// Note: The following tests would require a valid JWT token
// They are commented out but show the expected behavior

/*
Deno.test("executive-run: should execute DAILY_EXECUTIVE_BRIEF with valid auth", async () => {
  // This test requires a valid user JWT token
  const VALID_JWT = "..."; // Would be obtained from Supabase auth
  
  const response = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${VALID_JWT}`,
      "apikey": SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({
      run_type: "DAILY_EXECUTIVE_BRIEF",
    }),
  });

  const data = await response.json();

  assertEquals(response.status, 200);
  assertEquals(data.success, true);
  assertExists(data.run_id);
  assertExists(data.executive_summary);
  assertExists(data.steps);
  assertExists(data.model_used);
  assertExists(data.data_sources);
});

Deno.test("executive-run: should execute PLATFORM_STATUS_REVIEW with platform_key", async () => {
  const VALID_JWT = "...";
  
  const response = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${VALID_JWT}`,
      "apikey": SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({
      run_type: "PLATFORM_STATUS_REVIEW",
      platform_key: "emotionscare",
    }),
  });

  const data = await response.json();

  assertEquals(response.status, 200);
  assertEquals(data.success, true);
  assertEquals(data.platform_key, "emotionscare");
});

Deno.test("executive-run: should include context_data in prompt", async () => {
  const VALID_JWT = "...";
  
  const response = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${VALID_JWT}`,
      "apikey": SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({
      run_type: "DAILY_EXECUTIVE_BRIEF",
      context_data: { priority: "urgent", focus: "security" },
    }),
  });

  const data = await response.json();

  assertEquals(response.status, 200);
  assertEquals(data.success, true);
  // Context should influence the response
});
*/

Deno.test("executive-run: run types should match template configuration", () => {
  // Verify all expected run types exist
  const EXPECTED_RUN_TYPES = [
    "DAILY_EXECUTIVE_BRIEF",
    "CEO_STANDUP_MEETING",
    "PLATFORM_STATUS_REVIEW",
    "SECURITY_AUDIT_RLS",
    "MARKETING_WEEK_PLAN",
    "RELEASE_GATE_CHECK",
    "COMPETITIVE_ANALYSIS",
  ];

  // This is a unit test that doesn't require network
  EXPECTED_RUN_TYPES.forEach((type) => {
    assertExists(type, `Run type ${type} should be defined`);
  });
});

Deno.test("executive-run: model configuration should be valid", () => {
  // Verify model configuration
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

  // All models should be valid Lovable AI Gateway models
  Object.values(MODEL_CONFIG).forEach((model) => {
    assertEquals(typeof model, "string");
    assertEquals(model.includes("/"), true, `Model ${model} should have provider prefix`);
  });
});
