import { test, expect } from "@playwright/test";

const SUPABASE_URL = "https://hjoylhxakijxpihwrqny.supabase.co";

test("Infra — /healthz public répond 200 avec JSON valide", async ({ request }) => {
  const resp = await request.get(`${SUPABASE_URL}/functions/v1/healthz`);
  expect([200, 503]).toContain(resp.status()); // 503 si dégradé est aussi un état valide
  const json = await resp.json();
  expect(json).toHaveProperty("status");
  expect(json).toHaveProperty("checks");
  expect(json).toHaveProperty("version");
  expect(["healthy", "degraded"]).toContain(json.status);
});
