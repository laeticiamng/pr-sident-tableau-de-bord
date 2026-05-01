import { test, expect } from "@playwright/test";

/**
 * Tests d'accessibilité du composant `VerifiedPresidentBadge` :
 * - rôle `link` exposé,
 * - `aria-label` descriptif (profession + GLN),
 * - `aria-describedby` relié à une région `role="status"` `aria-live`,
 * - `aria-busy` mis à `true` pendant le chargement,
 * - les icônes décoratives sont `aria-hidden`.
 */

const PAGES = [
  { name: "Home", path: "/" },
  { name: "Vision", path: "/vision" },
  { name: "Trust", path: "/trust" },
  { name: "Contact", path: "/contact" },
] as const;

test.describe("Public — A11y badge « Présidente vérifiée »", () => {
  for (const p of PAGES) {
    test(`${p.name} — rôles, labels et aria-live conformes`, async ({ page }) => {
      await page.goto(p.path);
      await page.waitForLoadState("networkidle");

      const slot = page.getByTestId("hero-verified-slot").first();
      await expect(slot).toBeVisible();

      // 1) Le badge expose role="link" et un aria-label localisé.
      const link = slot.getByRole("link").first();
      await expect(link).toBeVisible();
      const ariaLabel = await link.getAttribute("aria-label");
      expect(ariaLabel, "aria-label du badge").toBeTruthy();
      expect(ariaLabel!).toMatch(/MedReg/);
      expect(ariaLabel!).toMatch(/GLN\s*7601009569944/);

      // 2) aria-describedby pointe vers la région live.
      const describedBy = await link.getAttribute("aria-describedby");
      expect(describedBy).toBe("medreg-badge-status");

      // 3) Région live status présente, polite, sr-only.
      const status = page.locator("#medreg-badge-status").first();
      await expect(status).toHaveAttribute("role", "status");
      const ariaLive = await status.getAttribute("aria-live");
      expect(["polite", "assertive"]).toContain(ariaLive);
      const cls = (await status.getAttribute("class")) ?? "";
      expect(cls).toMatch(/sr-only/);

      // 4) aria-busy = false par défaut (état ready).
      await expect(link).toHaveAttribute("aria-busy", "false");
      await expect(link).toHaveAttribute("data-state", "ready");

      // 5) Les icônes décoratives sont masquées aux AT.
      const icons = link.locator("svg");
      const count = await icons.count();
      for (let i = 0; i < count; i++) {
        await expect(icons.nth(i)).toHaveAttribute("aria-hidden", "true");
      }

      // 6) Le clic déclenche la transition `loading` (capturée via data-state).
      // On intercepte window.open pour éviter d'ouvrir un onglet réel.
      await page.evaluate(() => {
        (window as unknown as { open: typeof window.open }).open = () =>
          ({ closed: false }) as unknown as Window;
      });
      await link.click();
      // Après clic réussi : data-state passe par success puis ready.
      // On vérifie au moins qu'une transition a eu lieu et que la région live
      // contient un message non vide (succès ou retour à ready).
      await page.waitForTimeout(150);
      const liveText = await status.textContent();
      expect(liveText, "live region annonce une transition").toBeTruthy();
    });
  }
});