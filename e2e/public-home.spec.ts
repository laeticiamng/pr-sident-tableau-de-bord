import { test, expect } from "@playwright/test";

/**
 * Page d'accueil publique MNG (refonte du commit a59871e) : quatre produits, une signature.
 * Les anciens contrôles (titre « EmotionsCare | Éditeur », CTA « consultation/démarrer »)
 * visaient l'ancienne page, remplacée par celle-ci.
 */
const PRODUITS = [
  { nom: "Emotions Care", url: "https://emotionscare.com" },
  { nom: "Med MNG", url: "https://medmng.com" },
  { nom: "Memo MNG", url: "https://memomng.com" },
  { nom: "MedCopilote Suisse", url: "https://medcopilote-suisse.vercel.app" },
] as const;

test.describe("Public — Home", () => {
  test("affiche la page MNG avec un titre sans marque dupliquée", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle("MNG — des outils pour rendre les choses complexes plus simples");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      /Des outils conçus pour rendre les choses complexes plus simples/,
    );
  });

  test("présente les quatre produits avec un lien externe sécurisé vers chacun", async ({ page }) => {
    await page.goto("/");
    const produits = page.getByRole("region", { name: "Produits" });
    for (const p of PRODUITS) {
      const lien = produits.getByRole("link", { name: new RegExp(p.nom) });
      await expect(lien).toBeVisible();
      await expect(lien).toHaveAttribute("href", p.url);
      await expect(lien).toHaveAttribute("target", "_blank");
      await expect(lien).toHaveAttribute("rel", /noopener/);
    }
    await expect(produits.getByRole("listitem")).toHaveCount(PRODUITS.length);
  });

  test("le lien Contact de la signature mène au formulaire de contact", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("main").getByRole("link", { name: "Contact", exact: true }).click();
    await expect(page).toHaveURL(/\/contact$/);
    await expect(page.getByLabel(/email/i).first()).toBeVisible();
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
