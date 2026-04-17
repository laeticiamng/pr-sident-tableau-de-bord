import { test, expect } from "@playwright/test";
import { loginAsOwner, skipIfNoOwnerCreds } from "./_helpers/auth";

test.describe("HQ — Auth", () => {
  test.beforeAll(skipIfNoOwnerCreds);

  test("Owner peut se connecter et accéder au HQ", async ({ page }) => {
    await loginAsOwner(page);
    await expect(page).toHaveURL(/\/hq/);
  });
});
