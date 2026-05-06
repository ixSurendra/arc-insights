import { test, expect } from "@playwright/test";

/**
 * Reports list + composer end-to-end:
 *   /reports                 → seed reports rendered
 *   /reports/:id             → composer with blocks, AI summary, schedule status
 *   /reports/new?template=…  → starter blocks generated for the template
 */
test("Reports list shows seed reports + templates", async ({ page }) => {
  await page.goto("/reports");

  await expect(
    page.getByRole("heading", { level: 1, name: "Reports" }),
  ).toBeVisible({ timeout: 10_000 });

  // Templates row
  await expect(
    page.getByTestId("template-monthly-business-review"),
  ).toBeVisible();
  await expect(page.getByTestId("template-weekly-digest")).toBeVisible();

  // Seed report rows
  await expect(page.getByTestId("report-rpt-mbr-may")).toBeVisible();
  await expect(page.getByTestId("report-rpt-weekly-19")).toBeVisible();
});

test("Open a seed report and inspect the composer", async ({ page }) => {
  await page.goto("/reports/rpt-mbr-may");

  await expect(page.getByTestId("report-name")).toHaveValue(
    "Monthly business review · May 2026",
  );

  // Composer + auto-summary visible
  await expect(page.getByTestId("report-composer")).toBeVisible();
  await expect(page.getByTestId("auto-summary")).toBeVisible();

  // At least one heading and one widget block from seed
  await expect(page.getByTestId("block-blk-h1")).toBeVisible();
  await expect(page.getByTestId("block-blk-w1")).toBeVisible();

  // Schedule, Export, Save actions present
  await expect(page.getByTestId("schedule")).toBeVisible();
  await expect(page.getByTestId("export")).toBeVisible();
  await expect(page.getByTestId("save-report")).toBeVisible();
});

test("New from template seeds the composer with starter blocks", async ({
  page,
}) => {
  await page.goto("/reports/new?template=monthly-business-review");

  await expect(page.getByTestId("report-name")).toHaveValue(
    "Monthly Business Review",
  );
  await expect(page.getByTestId("report-composer")).toBeVisible();

  // Heading 1 input present
  await expect(page.getByTestId("heading-input").first()).toBeVisible();

  // Insert row available
  await expect(page.getByTestId("insert-block-trigger").first()).toBeVisible();
});
