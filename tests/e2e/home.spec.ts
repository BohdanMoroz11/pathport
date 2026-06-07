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

test("primary journey: citizenship to destination to route detail", async ({ page }) => {
  await page.goto("/");

  // Citizenship -> destinations.
  await page.getByRole("link", { name: /United States/ }).click();
  await expect(page.getByRole("heading", { name: /destinations/i })).toBeVisible();

  // Destination -> route cards grouped by type.
  await page.getByRole("link", { name: /Germany/ }).click();
  await expect(
    page.getByRole("heading", { name: /Germany routes for United States/i }),
  ).toBeVisible();

  // Route card -> route detail.
  const routeLink = page.getByRole("link", { name: /Skilled Worker Visa/ });
  await expect(routeLink).toBeVisible();
  await routeLink.click();

  await expect(page.getByRole("heading", { name: "Skilled Worker Visa", level: 1 })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Requirements", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Sources", exact: true })).toBeVisible();

  // The back link returns to the destination's routes.
  await page.getByRole("link", { name: /Back to Germany routes/i }).click();
  await expect(
    page.getByRole("heading", { name: /Germany routes for United States/i }),
  ).toBeVisible();
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
