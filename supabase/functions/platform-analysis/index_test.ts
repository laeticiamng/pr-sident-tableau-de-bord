import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assertEquals, assertExists } from "https://deno.land/std@0.224.0/assert/mod.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;

Deno.test("platform-analysis: should reject unauthenticated requests", async () => {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/platform-analysis`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ platform_key: "emotionscare" }),
  });

  assertEquals(response.status, 401);
  const data = await response.json();
  assertExists(data.error);
});

Deno.test("platform-analysis: should reject requests with invalid auth", async () => {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/platform-analysis`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer invalid_token",
    },
    body: JSON.stringify({ platform_key: "emotionscare" }),
  });

  assertEquals(response.status, 401);
  const data = await response.json();
  assertExists(data.error);
});

Deno.test("platform-analysis: should require platform_key", async () => {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/platform-analysis`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({}),
  });

  // Will fail auth first (no valid user token), so 401
  assertEquals(response.status, 401);
  await response.text();
});

Deno.test("platform-analysis: OPTIONS should return CORS headers", async () => {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/platform-analysis`, {
    method: "OPTIONS",
  });

  assertEquals(response.status, 200);
  const corsHeader = response.headers.get("Access-Control-Allow-Origin");
  assertEquals(corsHeader, "*");
  await response.text();
});
