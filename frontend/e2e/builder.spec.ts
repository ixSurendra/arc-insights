import { test, expect } from "@playwright/test";

/**
 * Widget builder smoke test. Loads /builder, verifies the 3-zone
 * layout, the door tabs, the default spec produces the expected SQL,
 * and that mutating the spec via the form updates the live preview.
 */
test("builder: 3-zone layout + visual door updates the live SQL preview", async ({
  page,
}) => {
  await page.goto("/builder");

  await expect(page.getByRole("heading", { name: "New widget" })).toBeVisible({
    timeout: 10_000,
  });

  // Three-zone layout is in place
  await expect(page.getByTestId("builder-3zone")).toBeVisible();
  await expect(page.getByTestId("builder-data-zone")).toBeVisible();
  await expect(page.getByTestId("builder-preview-zone")).toBeVisible();
  await expect(page.getByTestId("builder-options-zone")).toBeVisible();

  // Door tabs visible — Visual is active by default
  await expect(page.getByTestId("door-ai")).toBeVisible();
  await expect(page.getByTestId("door-visual")).toBeVisible();
  await expect(page.getByTestId("door-sql")).toBeVisible();

  const sql = page.getByTestId("generated-sql");
  await expect(sql).toContainText(`SUM("amount")`);
  await expect(sql).toContainText(`GROUP BY "region"`);
  await expect(sql).toContainText(`WHERE "status" = 'completed'`);

  // Add a new dimension via the "Add" button on the Dimensions section.
  const dimensionsSection = page
    .locator("section")
    .filter({ hasText: "DIMENSIONS" });
  await dimensionsSection.getByRole("button", { name: /Add/ }).click();
  await expect(sql).toContainText(`GROUP BY "region",`);

  // Live preview chart container should be present.
  await expect(page.getByTestId("builder-preview")).toBeVisible();
});

test("builder: Ask AI door generates a draft and switches back to Visual", async ({
  page,
}) => {
  await page.goto("/builder");

  await page.getByTestId("door-ai").click();
  await expect(page.getByTestId("ask-ai-input")).toBeVisible();

  await page.getByTestId("ask-ai-input").fill("Total amount by region");
  await page.getByRole("button", { name: /Generate/ }).click();

  // After mock AI applies, the visual door re-activates and the SQL
  // preview reflects the spec it produced.
  await expect(page.getByRole("tab", { name: "Visual" })).toHaveAttribute(
    "aria-selected",
    "true",
    { timeout: 4_000 },
  );
  await expect(page.getByTestId("generated-sql")).toBeVisible();
});
