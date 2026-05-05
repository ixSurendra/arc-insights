import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright config for the frontend E2E suite.
 *
 * `webServer` boots both the backend (Elysia) and the frontend (Vite) before
 * the tests run, so a fresh checkout can do `bunx playwright test` with no
 * other setup — same in CI. The dev backend doesn't touch Postgres, so no
 * DB is required for the suite.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://localhost:5173",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: [
    {
      command: "cd ../backend && bun --hot src/index.ts",
      port: 3000,
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
    },
    {
      command: "bunx vite",
      port: 5173,
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
    },
  ],
});
