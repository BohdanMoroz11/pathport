import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("home page introduces Pathport and lists citizenships", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: /compare realistic migration paths/i }),
  ).toBeVisible();

  // United States is the primary demo citizenship and leads the picker.
  await expect(page.getByRole("link", { name: /United States/ })).toBeVisible();
});

test("primary journey: citizenship to destination shell to route detail", async ({ page }) => {
  await page.goto("/");

  // Citizenship -> destinations.
  await page.getByRole("link", { name: /United States/ }).click();
  await expect(
    page.getByRole("heading", { name: /Destinations for United States/i }),
  ).toBeVisible();

  // Destination -> the destination shell, landing on the Overview.
  await page.getByRole("link", { name: /Germany/ }).click();
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
  await expect(
    drawer.getByRole("heading", { name: "Skilled Worker Visa", level: 2 }),
  ).toBeVisible();
  await expect(drawer.getByText("Requirements", { exact: true })).toBeVisible();
  await expect(drawer.getByText("Sources", { exact: true })).toBeVisible();

  // Closing the drawer returns to the routes list, still mounted underneath.
  await drawer.getByRole("button", { name: "Close", exact: true }).click();
  await expect(drawer).toBeHidden();
  await expect(page.getByRole("heading", { name: /Routes into Germany/i })).toBeVisible();
});

test("unknown citizenship resolves to the not-found page", async ({ page }) => {
  const response = await page.goto("/explore/ZZZ");

  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: /couldn't find that page/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /Back to citizenships/i })).toBeVisible();
});

test("home page has no detectable accessibility violations", async ({ page }) => {
  await page.goto("/");

  const results = await new AxeBuilder({ page }).analyze();

  expect(results.violations).toEqual([]);
});
