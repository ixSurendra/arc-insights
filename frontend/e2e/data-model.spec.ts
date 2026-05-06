import { test, expect } from "@playwright/test";

/**
 * Data Model authoring surface — three tabs (Tables · Metrics ·
 * Policies). The store is in-memory so each test is isolated by route
 * navigation in this single Playwright run; we just verify the locked
 * surface renders, tabs switch, and the seed data is editable.
 */
test("Data Model — three tabs render with seed data", async ({ page }) => {
  await page.goto("/data-model");

  await expect(
    page.getByRole("heading", { level: 1, name: "Data Model" }),
  ).toBeVisible({ timeout: 10_000 });

  // Tables tab is active by default
  await expect(page.getByTestId("tables-tab")).toBeVisible();
  await expect(page.getByTestId("table-public.orders")).toBeVisible();
  await expect(page.getByTestId("table-public.customers")).toBeVisible();

  // Friendly name input is editable on the Orders table
  const orderName = page.getByTestId("table-friendly-name");
  await expect(orderName).toHaveValue("Orders");

  // Switch to metrics
  await page.getByTestId("data-model-tab-metrics").click();
  await expect(page.getByTestId("metrics-tab")).toBeVisible();
  await expect(page.getByTestId("metric-metric-revenue")).toBeVisible();

  // Switch to policies
  await page.getByTestId("data-model-tab-policies").click();
  await expect(page.getByTestId("policies-tab")).toBeVisible();
  await expect(
    page.getByTestId("policy-policy-customer-isolation"),
  ).toBeVisible();
});

test("Data Model — confirm review banner clears on click", async ({ page }) => {
  await page.goto("/data-model");

  // Banner visible initially
  await expect(
    page.getByText(/Auto-detected from your last connect/),
  ).toBeVisible();

  await page.getByTestId("confirm-review").click();

  await expect(
    page.getByText(/Auto-detected from your last connect/),
  ).not.toBeVisible();
  await expect(page.getByText(/^Reviewed$/)).toBeVisible();
});
