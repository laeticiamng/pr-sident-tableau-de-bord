import { test, expect, type Page } from "@playwright/test";

/**
 * Garantit que le badge « Présidente vérifiée » :
 *  - est rendu via le slot canonique `data-testid="hero-verified-slot"`,
 *  - est centré horizontalement sous le subtitle,
 *  - respecte un espacement haut de ~24px (`mt-6`),
 *  - ne chevauche aucun élément voisin (subtitle ni élément suivant),
 *  - reste visible et non-tronqué sur toutes les largeurs d'écran courantes.
 */

const VIEWPORTS = [
  { name: "mobile-320", width: 320, height: 640 },
  { name: "mobile-375", width: 375, height: 812 },
  { name: "tablet-768", width: 768, height: 1024 },
  { name: "desktop-1280", width: 1280, height: 800 },
  { name: "desktop-1920", width: 1920, height: 1080 },
] as const;

const PAGES = [
  { name: "Home", path: "/" },
  { name: "Vision", path: "/vision" },
  { name: "Trust", path: "/trust" },
  { name: "Contact", path: "/contact" },
] as const;

async function getRect(page: Page, selector: string) {
  const handle = await page.locator(selector).first().elementHandle();
  if (!handle) return null;
  return handle.boundingBox();
}

test.describe("Public — Badge « Présidente vérifiée » (alignement & spacing)", () => {
  for (const vp of VIEWPORTS) {
    for (const p of PAGES) {
      test(`${p.name} @ ${vp.name} — slot rendu, centré, sans chevauchement`, async ({
        page,
      }) => {
        await page.setViewportSize({ width: vp.width, height: vp.height });
        await page.goto(p.path);
        await page.waitForLoadState("networkidle");

        const slot = page.getByTestId("hero-verified-slot").first();
        await expect(slot, "le slot doit être présent").toBeVisible();

        // 1) Le slot contient bien un seul badge interactif.
        const badge = slot.locator('a[aria-label*="MedReg"], a[aria-label*="GLN"]');
        await expect(badge).toHaveCount(1);
        await expect(badge).toBeVisible();

        // 2) Le badge tient dans le viewport (pas de débordement horizontal).
        const badgeBox = await badge.boundingBox();
        expect(badgeBox, "boundingBox du badge doit exister").not.toBeNull();
        if (badgeBox) {
          expect(badgeBox.x).toBeGreaterThanOrEqual(0);
          expect(badgeBox.x + badgeBox.width).toBeLessThanOrEqual(vp.width + 1);
          // Largeur minimale raisonnable pour rester lisible.
          expect(badgeBox.width).toBeGreaterThan(80);
        }

        // 3) Le slot est centré horizontalement par rapport à son parent.
        const slotBox = await slot.boundingBox();
        const parentBox = await getRect(page, '[data-testid="hero-verified-slot"] >> xpath=..');
        if (slotBox && parentBox) {
          const slotCenter = slotBox.x + slotBox.width / 2;
          const parentCenter = parentBox.x + parentBox.width / 2;
          // Tolérance : 8px pour absorber la sub-pixellisation et les paddings.
          expect(Math.abs(slotCenter - parentCenter)).toBeLessThanOrEqual(8);
        }

        // 4) Spacing haut conforme à `mt-6` (~24px). Toutes les pages utilisent
        //    le même slot — la marge calculée doit donc valoir 24px exactement.
        const marginTop = await slot.evaluate(
          (el) => parseFloat(window.getComputedStyle(el).marginTop || "0"),
        );
        expect(marginTop).toBeGreaterThanOrEqual(20);
        expect(marginTop).toBeLessThanOrEqual(28);

        // 5) Pas de chevauchement avec l'élément précédent (subtitle / paragraphe).
        const prevBox = await slot.evaluate((el) => {
          const prev = el.previousElementSibling as HTMLElement | null;
          if (!prev) return null;
          const r = prev.getBoundingClientRect();
          return { x: r.x, y: r.y, width: r.width, height: r.height };
        });
        if (prevBox && slotBox) {
          expect(
            slotBox.y,
            "le slot doit être strictement en-dessous du subtitle",
          ).toBeGreaterThanOrEqual(prevBox.y + prevBox.height - 1);
        }

        // 6) Pas de chevauchement avec l'élément suivant.
        const nextBox = await slot.evaluate((el) => {
          const next = el.nextElementSibling as HTMLElement | null;
          if (!next) return null;
          const r = next.getBoundingClientRect();
          return { x: r.x, y: r.y, width: r.width, height: r.height };
        });
        if (nextBox && slotBox) {
          expect(
            nextBox.y,
            "l'élément suivant doit être strictement en-dessous du slot",
          ).toBeGreaterThanOrEqual(slotBox.y + slotBox.height - 1);
        }

        // 7) État initial = `ready` (URL constante valide).
        await expect(slot).toHaveAttribute("data-badge-state", "ready");
      });
    }
  }
});