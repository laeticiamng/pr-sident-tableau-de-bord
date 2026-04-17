import { test, expect } from "@playwright/test";
import { loginAsOwner, skipIfNoOwnerCreds } from "./_helpers/auth";

test.describe("HQ — Sécurité", () => {
  test.beforeAll(skipIfNoOwnerCreds);

  test("page Sécurité charge", async ({ page }) => {
    await loginAsOwner(page);
    await page.goto("/hq/securite");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible({ timeout: 15_000 });
  });
});
