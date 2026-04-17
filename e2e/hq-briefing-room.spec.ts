import { test, expect } from "@playwright/test";
import { loginAsOwner, skipIfNoOwnerCreds } from "./_helpers/auth";

test.describe("HQ — Briefing Room", () => {
  test.beforeAll(skipIfNoOwnerCreds);

  test("charge et affiche le contenu sans erreur", async ({ page }) => {
    await loginAsOwner(page);
    await page.goto("/hq/briefing-room");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible({ timeout: 15_000 });
  });
});
