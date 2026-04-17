import { test, expect } from "@playwright/test";
import { loginAsOwner, skipIfNoOwnerCreds } from "./_helpers/auth";

test.describe("HQ — Cockpit", () => {
  test.beforeAll(skipIfNoOwnerCreds);

  test("Cockpit Dirigeant charge", async ({ page }) => {
    await loginAsOwner(page);
    await page.goto("/hq/cockpit");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible({ timeout: 15_000 });
  });
});
