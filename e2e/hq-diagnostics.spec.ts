import { test, expect } from "@playwright/test";
import { loginAsOwner, skipIfNoOwnerCreds } from "./_helpers/auth";

test.describe("HQ — Diagnostics", () => {
  test.beforeAll(skipIfNoOwnerCreds);

  test("Diagnostics + widget Reliability (DLQ + p95) visible", async ({ page }) => {
    await loginAsOwner(page);
    await page.goto("/hq/diagnostics");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible({ timeout: 15_000 });
    // Nouveau widget Horizon 2
    await expect(page.getByText(/Durée des runs|File de retry/i).first()).toBeVisible({ timeout: 15_000 });
  });
});
