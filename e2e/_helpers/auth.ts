import { test, expect, type Page } from "@playwright/test";

const HQ_EMAIL = process.env.PLAYWRIGHT_HQ_EMAIL;
const HQ_PASSWORD = process.env.PLAYWRIGHT_HQ_PASSWORD;

export const skipIfNoOwnerCreds = () => {
  if (!HQ_EMAIL || !HQ_PASSWORD) {
    test.skip(true, "PLAYWRIGHT_HQ_EMAIL / PLAYWRIGHT_HQ_PASSWORD non définis — parcours HQ ignorés");
  }
};

/** Connecte un compte Owner et redirige vers /hq. */
export async function loginAsOwner(page: Page) {
  if (!HQ_EMAIL || !HQ_PASSWORD) throw new Error("Credentials HQ manquants");

  await page.goto("/auth");
  await page.getByLabel(/email/i).first().fill(HQ_EMAIL);
  await page.getByLabel(/mot de passe|password/i).first().fill(HQ_PASSWORD);
  await page.getByRole("button", { name: /se connecter|sign in|login/i }).first().click();

  // Attente redirection vers HQ
  await page.waitForURL(/\/hq/, { timeout: 15_000 });
}
