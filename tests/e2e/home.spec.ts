import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("home page introduces Pathport", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: /compare realistic migration paths/i }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Explore" })).toBeVisible();
});

test("home page has no detectable accessibility violations", async ({ page }) => {
  await page.goto("/");

  const results = await new AxeBuilder({ page }).analyze();

  expect(results.violations).toEqual([]);
});
