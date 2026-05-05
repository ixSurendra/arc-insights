import { test, expect } from "@playwright/test";

/**
 * P0-20 — first end-to-end test.
 *
 * Loads `/`, lets the React app call `client.health.get()` through the
 * Eden Treaty SDK, and verifies the rendered JSON. This is the canary
 * that would have caught the "TypeError: Failed to fetch" SDK bug we
 * shipped before — keep it lean, keep it green.
 */
test("home renders backend health JSON via SDK", async ({ page }) => {
  await page.goto("/");

  // The JSON is rendered inside a <pre> with JSON.stringify(..., null, 2).
  await expect(page.getByText(/"status":\s*"ok"/)).toBeVisible({
    timeout: 10_000,
  });
  await expect(page.getByText(/"service":\s*"arc-insights"/)).toBeVisible();

  // No "Failed to fetch" or other error message should be visible.
  await expect(page.getByText(/Error:/)).toBeHidden();
});
