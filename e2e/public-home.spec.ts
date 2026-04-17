import { test, expect } from "@playwright/test";

test.describe("Public — Home", () => {
  test("loads and renders main CTA", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/EmotionsCare|Éditeur/i);
    // CTA principal doit être présent (texte FR par défaut)
    await expect(page.getByRole("link", { name: /contact|consultation|démarrer/i }).first()).toBeVisible();
  });

  test("has no console errors on initial load", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    // On tolère les warnings DevTools mais aucune erreur JS bloquante
    const blocking = errors.filter(
      (e) => !e.includes("Download the React DevTools") && !e.includes("net::ERR_BLOCKED_BY_CLIENT")
    );
    expect(blocking).toEqual([]);
  });
});
