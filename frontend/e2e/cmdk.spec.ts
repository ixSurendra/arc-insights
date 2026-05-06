import { test, expect } from "@playwright/test";

/**
 * The ⌘K / Ctrl+K command palette is now the primary navigator. This
 * spec locks in three contracts: the keystroke opens the palette,
 * fuzzy search filters items, and selecting a Navigate item routes.
 */
test("⌘K opens the palette and selecting an item routes", async ({ page }) => {
  await page.goto("/");

  // Open via keyboard.
  await page.keyboard.press("Meta+k");
  await expect(page.getByPlaceholder("Type a command or search…")).toBeVisible({
    timeout: 5_000,
  });

  // The Navigate group lists every primary route.
  await expect(page.getByRole("option", { name: "Builder" })).toBeVisible();

  // Filter and pick the Builder.
  await page.keyboard.type("Build");
  await expect(page.getByRole("option", { name: "Builder" })).toBeVisible();
  await page.keyboard.press("Enter");

  await expect(page).toHaveURL(/\/builder/);
  await expect(page.getByRole("heading", { name: "New query" })).toBeVisible();
});
