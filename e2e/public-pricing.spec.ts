import { test, expect } from "@playwright/test";

test("Public — Pricing page loads", async ({ page }) => {
  await page.goto("/tarifs");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});
