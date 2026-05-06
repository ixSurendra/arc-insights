import { test, expect } from "@playwright/test";

/**
 * /health is verified directly against the API. The Overview page is
 * the customer landing now — we assert the welcome row, pulse strip,
 * pinned dashboards, alerts, activity, and data-sources sections all
 * render so a regression on any single block is caught.
 */
test("/health endpoint returns ok", async ({ request }) => {
  const res = await request.get("http://localhost:3000/health");
  expect(res.status()).toBe(200);
  const body = await res.json();
  expect(body.status).toBe("ok");
  expect(body.service).toBe("arc-insights");
});

test("Overview customer landing renders all major sections", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    /Good morning/i,
    { timeout: 10_000 },
  );
  // Pulse strip — at least one numeric KPI
  await expect(page.getByText(/Queries today/i)).toBeVisible();
  // Pinned dashboards section
  await expect(
    page.getByRole("heading", { name: "Pinned dashboards" }),
  ).toBeVisible();
  // Alerts + activity (two-column row)
  await expect(
    page.getByRole("heading", { name: "Alerts needing attention" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Recent activity" }),
  ).toBeVisible();
  // Data sources table header
  await expect(
    page.getByRole("heading", { name: "Data sources" }),
  ).toBeVisible();
});
