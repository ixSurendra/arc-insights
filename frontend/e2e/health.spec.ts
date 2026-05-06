import { test, expect } from "@playwright/test";

/**
 * The Overview page (/) is now a marketing-style landing — it doesn't
 * surface the raw /health JSON. Verify the API directly and that the
 * landing renders its hero.
 */
test("/health endpoint returns ok", async ({ request }) => {
  const res = await request.get("http://localhost:3000/health");
  expect(res.status()).toBe(200);
  const body = await res.json();
  expect(body.status).toBe("ok");
  expect(body.service).toBe("arc-insights");
});

test("Overview landing renders the hero", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    /ships with you/i,
    { timeout: 10_000 },
  );
  await expect(page.getByText(/Get started — make dev/)).toBeVisible();
});
