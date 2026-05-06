import { test, expect } from "@playwright/test";

/**
 * Dashboard now renders as a notebook (Hex-style). Verify the title,
 * a few of the cell types render, and Run all flips the status badge.
 */
test("notebook page renders cells with the new design", async ({ page }) => {
  await page.goto("/dashboard");

  await expect(
    page.getByRole("heading", { name: "Sales overview" }),
  ).toBeVisible({
    timeout: 10_000,
  });

  // The headline big-number cell.
  await expect(page.getByText("$405k")).toBeVisible();

  // A SQL cell — keyword highlighting won't matter to the test, but the
  // SQL content should be present.
  await expect(page.getByText(/Monthly revenue by region/)).toBeVisible();

  // A chart cell (line/area). ECharts paints a canvas inside any chart
  // cell — at least one canvas should be visible.
  await expect(page.locator("canvas").first()).toBeVisible({ timeout: 5_000 });

  // Run all flips the status badge to "Running…" briefly.
  await page.getByRole("button", { name: /Run all/ }).click();
  await expect(page.getByText(/Running/)).toBeVisible({ timeout: 2_000 });
});
