import { expect, test, type Page } from "@playwright/test";

import { buildWebinarListResponse, detailFixtures, metaFixture } from "../../src/test/fixtures";

async function mockCatalogApi(page: Page) {
  await page.route("**/v1/meta", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(metaFixture)
    });
  });

  await page.route("**/v1/webinars/*", async (route) => {
    const id = route.request().url().split("/").pop() ?? "";
    const detail = detailFixtures.get(decodeURIComponent(id));

    if (!detail) {
      await route.fulfill({
        status: 404,
        contentType: "application/json",
        body: JSON.stringify({
          code: "WEBINAR_NOT_FOUND",
          message: `Webinar ${id} was not found.`
        })
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(detail)
    });
  });

  await page.route("**/v1/webinars*", async (route) => {
    const url = new URL(route.request().url());
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(buildWebinarListResponse(url.searchParams))
    });
  });
}

test.beforeEach(async ({ page }) => {
  await mockCatalogApi(page);
});

test("supports homepage load, search, filters, pagination, detail navigation, 404 detail, and mobile filters", async ({
  page
}) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /find the next webinar worth your attention/i })).toBeVisible();
  await expect(page.getByText("AI Operations Briefing")).toBeVisible();

  await page.getByLabel("Search webinars").fill("revenue");
  await page.waitForTimeout(350);
  await expect(page.getByText("Revenue Forum 1")).toBeVisible();

  await page.getByLabel("Status").selectOption("past");
  await expect(page.getByText("Revenue Forum 2")).toBeVisible();

  await page.goto("/");
  await expect(page.getByText("AI Operations Briefing")).toBeVisible();
  await page.getByRole("button", { name: "2" }).click();
  await expect(page).toHaveURL(/page=2/);

  await page.getByRole("link", { name: "Technology Briefing 25" }).click();
  await expect(page.getByRole("heading", { name: "Technology Briefing 25" })).toBeVisible();
  await expect(page.getByRole("link", { name: /register now/i })).toBeVisible();
  await page.getByRole("link", { name: /back to search/i }).click();
  await expect(page).toHaveURL(/page=2/);

  await page.goto("/webinars/not-real");
  await expect(page.getByText(/that webinar is no longer in the catalog/i)).toBeVisible();

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: /filters/i }).click();
  await page.getByLabel("Category").selectOption("technology");
  await expect(page.getByText("AI Operations Briefing")).toBeVisible();
});
