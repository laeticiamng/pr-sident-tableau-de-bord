import { test, expect } from "@playwright/test";

test("Public — Contact form is reachable", async ({ page }) => {
  await page.goto("/contact");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  // Champs obligatoires du formulaire
  await expect(page.getByLabel(/nom|name/i).first()).toBeVisible();
  await expect(page.getByLabel(/email/i).first()).toBeVisible();
});
