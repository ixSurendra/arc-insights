import { test, expect } from "@playwright/test";

/**
 * P1-06 — SQL editor renders, default sample SQL is editable, Run
 * populates the result panel with sample data.
 */
test("sql editor: Run populates the result table", async ({ page }) => {
  await page.goto("/sql");

  await expect(page.getByRole("heading", { name: "SQL editor" })).toBeVisible({
    timeout: 15_000,
  });

  // Monaco mounts a textarea internally — wait for it to render.
  await expect(page.locator(".monaco-editor")).toBeVisible({
    timeout: 15_000,
  });

  // Result is empty before Run.
  await expect(page.getByText("No result yet")).toBeVisible();

  // Click Run; the result table should appear.
  await page.getByRole("button", { name: /^Run$/ }).click();
  await expect(page.getByTestId("sql-result-table")).toBeVisible();
});
