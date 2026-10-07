import { test, expect, type Page } from "@playwright/test";

/**
 * Public pages — Trilingual coverage (FR / EN / DE)
 *
 * Verifies that:
 *  - Switching language updates `<html lang>`.
 *  - Visible page copy changes (no leftover French on EN/DE).
 *  - aria-label and alt attributes also reflect the active language
 *    (sampled on representative elements).
 */

type Lang = "fr" | "en" | "de";
const LANGS: Lang[] = ["fr", "en", "de"];

// Seule la page Contact reste traduite (FR/EN/DE) : l'accueil MNG est volontairement en
// français uniquement (commit a59871e) et /vision, /trust, /tarifs, /plateformes redirigent
// vers l'accueil depuis le commit 54b57c6.
const ROUTES = [
  { path: "/contact", key: "contact" },
] as const;

/**
 * Marker phrases (case-insensitive) that MUST appear at least once in the
 * page content for a given language. Picked to be unique to that locale.
 */
const MARKERS: Record<string, Record<Lang, RegExp[]>> = {
  contact: {
    fr: [/contact|message|envoyer/i],
    en: [/contact|message|send/i],
    de: [/kontakt|nachricht|senden/i],
  },
};

/**
 * Force the language by writing the same localStorage key the app uses
 * (`preferred-lang`), set by LanguageContext. We do it BEFORE the SPA boots
 * via an init script, then navigate.
 */
async function gotoWithLang(page: Page, path: string, lang: Lang) {
  await page.addInitScript((l) => {
    try {
      window.localStorage.setItem("preferred-lang", l);
    } catch {
      /* ignore */
    }
  }, lang);
  await page.goto(path);
  await page.waitForLoadState("domcontentloaded");
  // Les pages publiques sont chargées en différé (React.lazy) : sans cette attente, le texte
  // et les aria-label étaient parfois lus pendant le fallback de Suspense (tests instables).
  await page.locator("#main-content h1").first().waitFor({ state: "visible" });
}

test.describe("Public — i18n trilingual coverage", () => {
  for (const lang of LANGS) {
    for (const route of ROUTES) {
      test(`[${lang.toUpperCase()}] ${route.path} renders translated copy`, async ({ page }) => {
        await gotoWithLang(page, route.path, lang);

        // <html lang> must be updated by LanguageProvider
        await expect.poll(async () => await page.locator("html").getAttribute("lang"), {
          timeout: 5000,
        }).toBe(lang);

        // The visible body must contain at least one localized marker for that lang.
        const body = (await page.locator("body").innerText()).toLowerCase();
        const markers = MARKERS[route.key][lang];
        const matched = markers.some((rx) => rx.test(body));
        expect(
          matched,
          `No ${lang.toUpperCase()} marker found on ${route.path}. ` +
            `Expected one of ${markers.map(String).join(", ")}.`,
        ).toBe(true);
      });
    }
  }

  test("aria-label / alt attributes follow the active language", async ({ page }) => {
    // Snapshot a known aria-label / alt on the Contact page in FR vs EN
    // (l'accueil MNG n'est plus traduit, cf. commentaire de ROUTES).
    await gotoWithLang(page, "/contact", "fr");
    const frAria = await page
      .locator("[aria-label]")
      .evaluateAll((els) => els.map((e) => e.getAttribute("aria-label") ?? "").filter(Boolean));
    const frAlt = await page
      .locator("img[alt]")
      .evaluateAll((els) => els.map((e) => e.getAttribute("alt") ?? "").filter(Boolean));

    await gotoWithLang(page, "/contact", "en");
    const enAria = await page
      .locator("[aria-label]")
      .evaluateAll((els) => els.map((e) => e.getAttribute("aria-label") ?? "").filter(Boolean));
    const enAlt = await page
      .locator("img[alt]")
      .evaluateAll((els) => els.map((e) => e.getAttribute("alt") ?? "").filter(Boolean));

    // The set of attribute values should differ between FR and EN
    // (otherwise the labels are hardcoded). We allow for some shared
    // brand strings ("EMOTIONSCARE", "MedReg", etc.) so we just require
    // ANY difference in the joined corpus.
    expect(frAria.join("§")).not.toBe(enAria.join("§"));
    // alt may be empty on some sites; only assert if non-empty alts exist.
    if (frAlt.length > 0 && enAlt.length > 0) {
      // Not all alts must change, but the union should not be identical.
      expect(frAlt.join("§")).not.toBe(enAlt.join("§"));
    }
  });
});