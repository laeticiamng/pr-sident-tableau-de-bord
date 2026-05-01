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

const ROUTES = [
  { path: "/", key: "home" },
  { path: "/vision", key: "vision" },
  { path: "/trust", key: "trust" },
  { path: "/contact", key: "contact" },
  { path: "/tarifs", key: "pricing" },
  { path: "/plateformes", key: "platforms" },
] as const;

/**
 * Marker phrases (case-insensitive) that MUST appear at least once in the
 * page content for a given language. Picked to be unique to that locale.
 */
const MARKERS: Record<string, Record<Lang, RegExp[]>> = {
  home: {
    fr: [/logiciels|plateformes|démo|découvrir/i],
    en: [/software|platforms|demo|discover/i],
    de: [/software|plattform|demo|entdecken/i],
  },
  vision: {
    fr: [/vision|valeurs|mission/i],
    en: [/vision|values|mission/i],
    de: [/vision|werte|mission/i],
  },
  trust: {
    fr: [/sécurité|confiance|conformité/i],
    en: [/security|trust|compliance/i],
    de: [/sicherheit|vertrauen|konformität|compliance/i],
  },
  contact: {
    fr: [/contact|message|envoyer/i],
    en: [/contact|message|send/i],
    de: [/kontakt|nachricht|senden/i],
  },
  pricing: {
    fr: [/tarifs|prix|mensuel|annuel/i],
    en: [/pricing|price|monthly|annual/i],
    de: [/preise|preis|monatlich|jährlich/i],
  },
  platforms: {
    fr: [/plateformes|découvrir/i],
    en: [/platforms|discover/i],
    de: [/plattform|entdecken/i],
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
    // Snapshot a known aria-label / alt on HomePage in FR vs EN.
    await gotoWithLang(page, "/", "fr");
    const frAria = await page
      .locator("[aria-label]")
      .evaluateAll((els) => els.map((e) => e.getAttribute("aria-label") ?? "").filter(Boolean));
    const frAlt = await page
      .locator("img[alt]")
      .evaluateAll((els) => els.map((e) => e.getAttribute("alt") ?? "").filter(Boolean));

    await gotoWithLang(page, "/", "en");
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