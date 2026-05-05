import { test, expect } from "@playwright/test";

/**
 * P1-08 — verify all six chart types render in the demo section of `/`.
 *
 * Each <Chart> instance carries a stable `data-testid` we can target.
 * ECharts renders a <canvas>, AG Grid renders a grid container — both
 * are good enough signals that the component mounted without throwing.
 */
test("chart demo: all six chart types render", async ({ page }) => {
  await page.goto("/");

  // The cards container is below the health JSON, so wait for the demo
  // heading to be sure App.tsx mounted with the new section.
  await expect(page.getByRole("heading", { name: /Chart demo/ })).toBeVisible({
    timeout: 10_000,
  });

  // ECharts containers each contain a <canvas> once the chart paints.
  for (const id of ["chart-line", "chart-bar", "chart-pie", "chart-scatter"]) {
    const chart = page.getByTestId(id);
    await expect(chart).toBeVisible();
    await expect(chart.locator("canvas")).toBeVisible({ timeout: 5_000 });
  }

  // Big number renders the formatted currency value.
  const big = page.getByTestId("chart-big-number");
  await expect(big).toBeVisible();
  await expect(big.getByText(/\$30,000/)).toBeVisible();

  // AG Grid mounts a header row with the column names from the first row.
  const table = page.getByTestId("chart-table");
  await expect(table).toBeVisible();
  await expect(table.getByText("region", { exact: true })).toBeVisible();
  await expect(table.getByText("revenue", { exact: true })).toBeVisible();
});
