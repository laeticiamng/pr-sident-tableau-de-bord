import { test, expect } from "@playwright/test";

/**
 * Diff visuel par snapshot sur les 4 pages publiques x 4 viewports.
 * Détecte automatiquement tout chevauchement, décalage de spacing ou
 * régression de mise en page. Les baselines sont stockées sous
 * `e2e/public-visual-snapshots.spec.ts-snapshots/`.
 *
 * Mise à jour des baselines : `npx playwright test public-visual-snapshots --update-snapshots`.
 *
 * Tag @visuel : aucune baseline n'a jamais été commitée, ces tests ne peuvent donc pas
 * passer en CI tant que les baselines n'ont pas été générées sur le runner Linux de la CI
 * (workflow e2e.yml, déclenchement manuel avec mise_a_jour_baselines). Ils sont exclus
 * du passage automatique par `--grep-invert @visuel`.
 */

const VIEWPORTS = [
  { name: "320", width: 320, height: 1200 },
  { name: "768", width: 768, height: 1400 },
  { name: "1280", width: 1280, height: 1600 },
  { name: "1920", width: 1920, height: 1800 },
] as const;

// /vision et /trust redirigent vers l'accueil depuis le commit 54b57c6.
const PAGES = [
  { name: "home", path: "/" },
  { name: "contact", path: "/contact" },
] as const;

test.describe("Public — Diff visuel pages publiques", () => {
  test.describe.configure({ mode: "parallel" });

  for (const vp of VIEWPORTS) {
    for (const p of PAGES) {
      test(`${p.name} @ ${vp.width}px — snapshot fullpage @visuel`, async ({ page }) => {
        await page.setViewportSize({ width: vp.width, height: vp.height });
        await page.goto(p.path);
        await page.waitForLoadState("networkidle");

        // Désactive animations CSS pour stabiliser le snapshot.
        await page.addStyleTag({
          content: `
            *, *::before, *::after {
              animation-duration: 0s !important;
              animation-delay: 0s !important;
              transition-duration: 0s !important;
              transition-delay: 0s !important;
            }
            video { display: none !important; }
          `,
        });

        // Cache le bandeau cookie consent s'il est ouvert (sinon snapshot instable).
        await page
          .locator('[data-testid="cookie-consent-banner"]')
          .evaluateAll((els) => els.forEach((el) => ((el as HTMLElement).style.display = "none")))
          .catch(() => {});

        // Attend la fin du layout shift potentiel.
        await page.waitForTimeout(300);

        await expect(page).toHaveScreenshot(`${p.name}-${vp.name}.png`, {
          fullPage: true,
          // Tolérance pour antialiasing inter-OS (CI Linux vs local macOS).
          maxDiffPixelRatio: 0.02,
          animations: "disabled",
        });
      });
    }
  }
});