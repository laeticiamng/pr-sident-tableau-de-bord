import { test, expect } from "@playwright/test";

/**
 * Smoke E2E sur l'URL publiée.
 *
 * Objectif : prévenir la régression « écran noir » due à une mauvaise
 * initialisation Supabase en production. Vérifie que :
 *   1. La page se charge sans erreur JS bloquante
 *   2. Le boot Supabase n'a pas remonté de problème (`[supabase-boot]`)
 *   3. Le DOM contient bien du contenu visible (≠ écran noir)
 *   4. Un appel minimal Supabase (auth health) répond 200
 *
 * Lancement :
 *   PLAYWRIGHT_BASE_URL=https://president-cockpit-hq.lovable.app \
 *     npx playwright test e2e/published-supabase-boot.spec.ts
 */
const PUBLISHED_URL =
  process.env.PUBLISHED_URL || "https://president-cockpit-hq.lovable.app";

test.describe("Published — Supabase boot", () => {
  test.use({ baseURL: PUBLISHED_URL });

  test("homepage boots without Supabase init errors", async ({ page }) => {
    const errors: string[] = [];
    const bootIssues: string[] = [];

    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (msg) => {
      const text = msg.text();
      if (msg.type() === "error") errors.push(text);
      if (text.includes("[supabase-boot]")) bootIssues.push(text);
    });

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // 1. Pas d'erreurs JS bloquantes
    const blocking = errors.filter(
      (e) =>
        !e.includes("Download the React DevTools") &&
        !e.includes("net::ERR_BLOCKED_BY_CLIENT") &&
        !e.includes("Failed to load resource"),
    );
    expect(blocking, "Erreurs JS bloquantes au boot").toEqual([]);

    // 2. Boot Supabase silencieux (pas d'`issues`)
    expect(bootIssues, "Boot Supabase a remonté des problèmes").toEqual([]);

    // 3. Le DOM n'est pas vide (≠ écran noir)
    const bodyText = (await page.locator("body").innerText()).trim();
    expect(bodyText.length).toBeGreaterThan(50);

    // 4. Le diagnostic guard ne s'est pas affiché
    await expect(
      page.getByText(/Configuration backend incomplète/i),
    ).toHaveCount(0);
  });

  test("supabase auth health endpoint reachable", async ({ request }) => {
    // URL/clé publique (anon) — safe pour un check de santé
    const supabaseUrl = "https://hjoylhxakijxpihwrqny.supabase.co";
    const anonKey =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhqb3lsaHhha2lqeHBpaHdycW55Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxMDczNDcsImV4cCI6MjA4NTY4MzM0N30.cwEcWxi3zsFX9182t_2oufUYxNsVA-Z1OEFJbt5VHYM";

    const res = await request.get(`${supabaseUrl}/auth/v1/health`, {
      headers: { apikey: anonKey },
    });
    expect(res.status()).toBe(200);
  });

  test("auth page renders without crash", async ({ page }) => {
    await page.goto("/auth");
    await page.waitForLoadState("networkidle");
    // Soit le formulaire d'auth, soit une redirection — dans tous les cas
    // pas d'écran noir ni de diagnostic guard.
    await expect(
      page.getByText(/Configuration backend incomplète/i),
    ).toHaveCount(0);
    const bodyText = (await page.locator("body").innerText()).trim();
    expect(bodyText.length).toBeGreaterThan(20);
  });
});