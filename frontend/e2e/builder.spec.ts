import { test, expect } from "@playwright/test";

/**
 * P1-05 — visual builder smoke test. Loads /builder, verifies the
 * default spec produces the expected SQL, then mutates the spec via
 * the form controls and asserts the SQL preview reflects the change.
 */
test("builder: changes to the spec update the live SQL preview", async ({
  page,
}) => {
  await page.goto("/builder");

  await expect(page.getByRole("heading", { name: "New query" })).toBeVisible({
    timeout: 10_000,
  });

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
