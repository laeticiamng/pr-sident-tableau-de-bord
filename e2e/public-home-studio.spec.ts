import { test, expect } from "@playwright/test";

test.describe("Public — Home — EmotionSphere Studio", () => {
  test("CTA scrolls to anchor and in-view badge appears", async ({ page }) => {
    await page.goto("/");

    const section = page.locator("#emotionsphere-studio");
    await expect(section).toHaveCount(1);

    const cta = page.getByTestId("discover-studio-cta");
    await expect(cta).toBeVisible();
    await cta.click();

    // Section devient visible dans le viewport
    await expect(section).toBeInViewport({ ratio: 0.25 });

    // L'URL contient bien l'ancre
    await expect.poll(() => page.url()).toContain("#emotionsphere-studio");

    // Le badge flottant "Vous êtes sur EmotionSphere Studio" devient visible
    const badge = page.getByTestId("studio-in-view-badge");
    await expect(badge).toBeVisible();
    await expect(badge).toContainText(/EmotionSphere Studio/i);
  });

  test("section exposes accessible name for screen readers", async ({ page }) => {
    await page.goto("/");
    const section = page.locator("#emotionsphere-studio");
    await expect(section).toHaveAttribute("aria-label", /EmotionSphere Studio/i);
    await expect(section).toHaveAttribute("aria-labelledby", "emotionsphere-studio-heading");
  });
});