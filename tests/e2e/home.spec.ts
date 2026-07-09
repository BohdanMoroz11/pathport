import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("home shows the map hero and destinations for the default citizenship", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: /Where can you live next/i })).toBeVisible();
  // The hero is scoped to the active citizenship.
  await expect(page.getByText(/For United States passport holders/i)).toBeVisible();
  // The global citizenship selector is docked in the header.
  await expect(page.getByRole("button", { name: /change citizenship/i })).toBeVisible();
  // Destinations are shown directly (no citizenship-picker step).
  await expect(page.getByRole("heading", { name: "Germany", level: 3 })).toBeVisible();
});

test("primary journey: home to destination shell to route detail", async ({ page }) => {
  await page.goto("/");

  // The map panel's CTA opens the destination shell on the Overview.
  await page.getByRole("link", { name: /Explore Germany/i }).click();
  await expect(page.getByRole("heading", { name: "Germany", level: 1 })).toBeVisible();

  // Rail -> the Routes section (the comparison list).
  await page
    .getByRole("navigation", { name: /destination sections/i })
    .getByRole("link", { name: "Routes", exact: true })
    .click();
  await expect(page.getByRole("heading", { name: /Routes into Germany/i })).toBeVisible();

  // Route card -> the peek drawer with the detail body.
  await page.getByRole("link", { name: /Skilled Worker Visa/ }).click();
  const drawer = page.getByRole("dialog", { name: "Skilled Worker Visa" });
  await expect(drawer).toBeVisible();
  await expect(drawer.getByText("Requirements", { exact: true })).toBeVisible();
  await drawer.getByRole("button", { name: "Close", exact: true }).click();
  await expect(drawer).toBeHidden();
});

test("the header selector switches the active citizenship", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: /change citizenship/i }).click();
  await page.getByRole("menuitemradio", { name: /Ukraine/ }).click();

  await expect(page.getByText(/For Ukraine passport holders/i)).toBeVisible();
});

test("explore browser filters destinations and compares side by side", async ({ page }) => {
  await page.goto("/explore");

  await expect(page.getByRole("heading", { name: /Explore destinations/i })).toBeVisible();
  await expect(page.getByText(/^3 destinations$/)).toBeVisible();

  // Region filter narrows the set.
  await page.getByLabel("Filter by region").selectOption("Southern Europe");
  await expect(page.getByText(/^2 destinations$/)).toBeVisible();
  await expect(page.getByRole("link", { name: "Germany" })).toHaveCount(0);

  // Pick two into the compare tray, then open the side-by-side dialog.
  const compareToggles = page.locator("label", { hasText: "Compare" });
  await compareToggles.nth(0).click();
  await compareToggles.nth(1).click();
  await expect(page.getByText(/Comparing 2 of 3/)).toBeVisible();

  await page.getByRole("button", { name: /Compare →/ }).click();
  const dialog = page.getByRole("dialog", { name: /Compare destinations/i });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText("Visa-free", { exact: true })).toBeVisible();
});

test("unknown citizenship resolves to the not-found page", async ({ page }) => {
  const response = await page.goto("/explore/ZZZ");

  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: /couldn't find that page/i })).toBeVisible();
});

test("home and explore have no detectable accessibility violations", async ({ page }) => {
  await page.goto("/");
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);

  await page.goto("/explore");
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});
