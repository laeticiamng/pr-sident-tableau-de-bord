import { test, expect } from "@playwright/test";
import { loginAsOwner, skipIfNoOwnerCreds } from "./_helpers/auth";

test.describe("HQ — Finance", () => {
  test.beforeAll(skipIfNoOwnerCreds);

  test("page Finance + widget AI Cost visible", async ({ page }) => {
    await loginAsOwner(page);
    await page.goto("/hq/finance");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible({ timeout: 15_000 });
    // Widget consommation IA présent
    await expect(page.getByText(/Consommation IA|Crédits IA/i).first()).toBeVisible();
  });
});
