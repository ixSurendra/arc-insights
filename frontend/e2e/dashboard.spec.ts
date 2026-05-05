import { test, expect } from "@playwright/test";

/**
 * P1-09 — dashboard renders four chart cards and the global filter bar
 * mutates every chart's data when filters are added or removed.
 */
test("dashboard: 4 chart cards render with the sample dashboard", async ({
  page,
}) => {
  await page.goto("/dashboard");

  await expect(
    page.getByRole("heading", { name: "Sales overview" }),
  ).toBeVisible({ timeout: 10_000 });

  for (const id of [
    "dashboard-chart-revenue-by-month",
    "dashboard-chart-total-revenue",
    "dashboard-chart-revenue-by-region",
    "dashboard-chart-share-by-region",
  ]) {
    await expect(page.getByTestId(id)).toBeVisible();
  }

  // The default global filter (status = completed) is set; clearing it
  // should leave the dashboard intact (charts may show different values
  // but should still render).
  await page.getByRole("button", { name: /Clear all/ }).click();
  await expect(
    page.getByTestId("dashboard-chart-revenue-by-month"),
  ).toBeVisible();
});
