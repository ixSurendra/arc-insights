import { test, expect } from "@playwright/test";

/**
 * The ⌘K / Ctrl+K command palette is the primary navigator. Verify
 * the keystroke opens it and selecting a Navigate item routes.
 */
test("Ctrl+K opens the palette and selecting an item routes", async ({
  page,
}) => {
  await page.goto("/");
  // Click into the page so keystrokes reach the document handler.
  await page.locator("body").click();
  await page.keyboard.press("Control+k");

  await expect(page.getByPlaceholder("Type a command or search…")).toBeVisible({
    timeout: 5_000,
  });

  await page.keyboard.type("Build");
  await expect(page.getByRole("option", { name: "Builder" })).toBeVisible();
  await page.keyboard.press("Enter");

  await expect(page).toHaveURL(/\/builder/);
  await expect(page.getByRole("heading", { name: "New widget" })).toBeVisible();
});
