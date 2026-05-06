import { test, expect } from "@playwright/test";

/**
 * Dashboard view renders the locked Metabase-style grid: title in the
 * page header, a filter bar, and multiple widget tiles (KPIs, line,
 * bar, donut, table) on a responsive grid.
 */
test("dashboard renders the widget grid", async ({ page }) => {
  await page.goto("/dashboard");

  await expect(
    page.getByRole("heading", { level: 1, name: /Sales overview/i }),
  ).toBeVisible({ timeout: 10_000 });

  // Filter bar present
  await expect(
    page.getByRole("toolbar", { name: "Dashboard filters" }),
  ).toBeVisible();

  // The grid is rendered and at least one widget tile is visible
  await expect(page.getByTestId("dashboard-grid")).toBeVisible();
  await expect(page.getByTestId("widget-kpi-revenue")).toBeVisible();

  // Headline KPI value
  await expect(page.getByText("$405k")).toBeVisible();

  // ECharts paints into a canvas — at least one canvas should be present
  // for the line/bar/donut widgets.
  await expect(page.locator("canvas").first()).toBeVisible({ timeout: 5_000 });
});
