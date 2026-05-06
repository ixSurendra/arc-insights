import { test, expect } from "@playwright/test";

/**
 * Persistence — every Phase 1 store is wired through Zustand `persist`
 * with the `arc-v1:` key prefix. We verify three contracts:
 *   • A smart-fill dashboard survives a hard reload.
 *   • Tenant edits to the Data Model (table friendly name) survive a reload.
 *   • Settings → Reset workspace state clears everything and reloads.
 */
test("smart-filled dashboard survives a reload", async ({ page }) => {
  await page.goto("/dashboards");
  await page.getByTestId("new-dashboard").click();
  await page.getByTestId("picker-template-executive").click();
  await page.getByTestId("smart-fill-generate").click();

  // Now on the synthesized /dashboards/:id
  await expect(page).toHaveURL(/\/dashboards\/dash-executive-/);
  const url = page.url();

  // Hard reload — without persistence the dashboard would 404 since the
  // store rebuilds with seed only.
  await page.reload();
  await expect(
    page.getByRole("heading", { level: 1, name: "Executive overview" }),
  ).toBeVisible({ timeout: 10_000 });
  await expect(page.getByTestId("dashboard-grid")).toBeVisible();
  expect(page.url()).toBe(url);
});

test("data-model edit survives a reload", async ({ page }) => {
  await page.goto("/data-model");
  const input = page.getByTestId("table-friendly-name");
  await expect(input).toHaveValue("Orders");

  await input.fill("Customer Orders");
  await expect(input).toHaveValue("Customer Orders");

  await page.reload();
  await expect(page.getByTestId("table-friendly-name")).toHaveValue(
    "Customer Orders",
  );
});

test("Settings → reset workspace state clears persisted slices", async ({
  page,
}) => {
  // Edit the data model so we have something to reset.
  await page.goto("/data-model");
  await page.getByTestId("table-friendly-name").fill("Edited Orders");
  await page.reload();
  await expect(page.getByTestId("table-friendly-name")).toHaveValue(
    "Edited Orders",
  );

  // Reset.
  await page.goto("/settings");
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByTestId("reset-workspace").click();

  // After the reload the seed data model is back.
  await page.goto("/data-model");
  await expect(page.getByTestId("table-friendly-name")).toHaveValue("Orders");
});
