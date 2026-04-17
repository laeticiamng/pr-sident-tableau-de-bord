import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright configuration — Horizon 2 (excellence ops)
 * 
 * Couvre les parcours critiques HQ + pages publiques.
 * Lancement local : `npx playwright test`
 * Lancement CI    : `npx playwright test --reporter=github`
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  timeout: 30_000,
  expect: { timeout: 10_000 },

  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:8080",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "mobile-safari",
      use: { ...devices["iPhone 13"] },
      // Mobile : on ne lance que les smoke tests publics
      testMatch: /public-.+\.spec\.ts/,
    },
  ],

  webServer: process.env.CI
    ? undefined
    : {
        command: "npm run dev",
        url: "http://localhost:8080",
        reuseExistingServer: true,
        timeout: 120_000,
      },
});
