import { test, expect } from "@playwright/test";

/**
 * Depuis le commit 54b57c6, les anciennes pages publiques (tarifs, statut, transparence,
 * vision, plateformes, studio) sont redirigées vers l'accueil MNG. Ce test remplace les
 * anciens smoke tests de ces pages (public-pricing / public-status / public-trust),
 * qui testaient des pages qui ne sont plus routées.
 */
const ANCIENNES_PAGES = ["/tarifs", "/status", "/trust", "/vision", "/plateformes", "/studio"] as const;

test.describe("Public — anciennes pages redirigées vers l'accueil", () => {
  for (const chemin of ANCIENNES_PAGES) {
    test(`${chemin} redirige vers /`, async ({ page }) => {
      await page.goto(chemin);
      await expect(page).toHaveURL(/\/$/);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(
        /Des outils conçus pour rendre les choses complexes plus simples/,
      );
    });
  }
});
