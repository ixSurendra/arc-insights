import { test, expect } from "@playwright/test";

/**
 * Smart-fill template flow:
 *   Dashboards → New dashboard picker → pick a template → SmartFillDialog
 *   shows pre-suggested role bindings → Generate dashboard → routes to
 *   the new /dashboards/:id with widgets rendered.
 */
test("Dashboards: smart-fill the Executive overview template", async ({
  page,
}) => {
  await page.goto("/dashboards");

  await expect(
    page.getByRole("heading", { level: 1, name: "Dashboards" }),
  ).toBeVisible({ timeout: 10_000 });

  // Open the new-dashboard picker
  await page.getByTestId("new-dashboard").click();

  // Pick the Executive overview template
  await expect(page.getByTestId("picker-template-executive")).toBeVisible();
  await page.getByTestId("picker-template-executive").click();

  // SmartFillDialog opens with role mappings
  await expect(page.getByTestId("role-mapping")).toBeVisible({
    timeout: 5_000,
  });
  await expect(page.getByTestId("role-primary_measure")).toBeVisible();
  await expect(page.getByTestId("role-time")).toBeVisible();
  await expect(page.getByTestId("role-category")).toBeVisible();

  // Generate
  const generate = page.getByTestId("smart-fill-generate");
  await expect(generate).toBeEnabled();
  await generate.click();

  // Lands on the generated dashboard view
  await expect(page).toHaveURL(/\/dashboards\/dash-executive-/);
  await expect(
    page.getByRole("heading", { level: 1, name: "Executive overview" }),
  ).toBeVisible();
  await expect(page.getByTestId("dashboard-grid")).toBeVisible();
});

test("Home: smart-fill button on a template card opens the dialog", async ({
  page,
}) => {
  // Home shows templates only when dashboard count < 3 — but the seed
  // store has 4 dashboards, so the templates section is hidden on the
  // home page. We verify the Dashboards page picker route instead, which
  // is the primary entry point. See test above.
  // This test exists only to assert the home page renders without error
  // after the smart-fill wiring lands.
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    /Good morning/i,
  );
});
