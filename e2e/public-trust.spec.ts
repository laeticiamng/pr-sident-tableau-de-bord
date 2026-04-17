import { test, expect } from "@playwright/test";

test("Public — Trust page (transparence)", async ({ page }) => {
  await page.goto("/trust");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});
