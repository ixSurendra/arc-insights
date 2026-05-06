import { test, expect } from "@playwright/test";

/**
 * Connect-data wizard end-to-end:
 *   /data-sources/new → pick DB → fill form → test → connect →
 *   AI narration streams → starter dashboard renders with widget tiles.
 */
test("connect-data DB flow ends in a starter dashboard", async ({ page }) => {
  await page.goto("/data-sources/new");

  await expect(
    page.getByRole("heading", { level: 1, name: /Connect data/i }),
  ).toBeVisible({ timeout: 10_000 });

  // Both tiles visible
  await expect(page.getByTestId("picker-db")).toBeVisible();
  await expect(page.getByTestId("picker-csv")).toBeVisible();

  // Pick DB
  await page.getByTestId("picker-db").click();

  // Driver picker is visible (Postgres is default)
  await expect(
    page.getByRole("heading", { name: "Connect a database" }),
  ).toBeVisible();

  // Fill connection name field — host/port/etc are optional for Phase 1
  // since the test connection is mocked.
  await page.getByLabel("Connection name").fill("warehouse-prod");

  await page.getByRole("button", { name: "Test connection" }).click();
  // Wait for the success state then connect.
  await expect(page.getByText(/Connection looks good/i)).toBeVisible({
    timeout: 4_000,
  });

  await page.getByRole("button", { name: "Connect", exact: true }).click();

  // Schema scan narration appears.
  await expect(page.getByText(/AI · scanning your schema/i)).toBeVisible({
    timeout: 4_000,
  });

  // Starter dashboard renders within ~10 s of scan starting.
  await expect(page.getByTestId("starter-dashboard")).toBeVisible({
    timeout: 30_000,
  });

  // At least one starter widget tile.
  await expect(
    page.locator("[data-testid^='starter-widget-']").first(),
  ).toBeVisible();
});

test("connect-data CSV flow shows the dropzone", async ({ page }) => {
  await page.goto("/data-sources/new?type=csv");

  await expect(
    page.getByRole("heading", { level: 1, name: /Upload a CSV/i }),
  ).toBeVisible({ timeout: 10_000 });

  await expect(page.getByTestId("csv-dropzone")).toBeVisible();
});
