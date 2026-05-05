import { defineConfig } from "vitest/config";

/**
 * Vitest config for the frontend unit-test runner.
 *
 * Important: exclude `e2e/` so vitest does not try to collect Playwright
 * specs (which match `*.spec.ts`). Playwright's testDir is `./e2e` and is
 * driven by `bunx playwright test`, not vitest.
 */
export default defineConfig({
  test: {
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/playwright-report/**",
      "**/e2e/**",
    ],
  },
});
