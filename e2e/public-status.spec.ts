import { test, expect } from "@playwright/test";

test("Public — Status page", async ({ page }) => {
  await page.goto("/status");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});
