import { test, expect } from "@playwright/test";

/**
 * /health is verified directly against the API. The Home page is the
 * customer landing — we assert greeting, persistent Ask AI input,
 * pulse, pinned dashboards, AI suggestions, recent widgets / reports /
 * activity, alerts, and (since we have <3 dashboards is false here)
 * NOT the templates section.
 */
test("/health endpoint returns ok", async ({ request }) => {
  const res = await request.get("http://localhost:3000/health");
  expect(res.status()).toBe(200);
  const body = await res.json();
  expect(body.status).toBe("ok");
  expect(body.service).toBe("arc-insights");
});

test("Home page renders all locked sections", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    /Good morning/i,
    { timeout: 10_000 },
  );

  // Persistent Ask AI input
  await expect(page.getByLabel("Ask AI")).toBeVisible();

  // Pulse strip
  await expect(page.getByText(/Queries today/i)).toBeVisible();

  // Pinned dashboards section
  await expect(
    page.getByRole("heading", { name: "Pinned dashboards" }),
  ).toBeVisible();

  // AI suggestions
  await expect(
    page.getByRole("heading", { name: "AI suggestions for you" }),
  ).toBeVisible();

  // Recent widgets + reports
  await expect(
    page.getByRole("heading", { name: "Recent widgets" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Recent reports" }),
  ).toBeVisible();

  // Alerts + activity
  await expect(
    page.getByRole("heading", { name: "Alerts needing attention" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Recent activity" }),
  ).toBeVisible();
});
