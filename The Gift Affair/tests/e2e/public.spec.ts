import { expect, test } from "@playwright/test";

// These run against demo content (no Supabase) or a seeded database: both contain the same sample ideas.

test("homepage loads and primary navigation works", async ({ page, isMobile }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1, name: "Find a gift worth remembering." })).toBeVisible();

  if (isMobile) {
    await page.getByRole("button", { name: "Open menu" }).click();
    await page.getByRole("dialog").getByRole("link", { name: "Gifts" }).click();
  } else {
    await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Gifts" }).click();
  }
  await expect(page).toHaveURL(/\/gift-ideas$/);
  await expect(page.getByRole("heading", { level: 1, name: "All gifts" })).toBeVisible();
});

test("visitor opens the gift ideas listing", async ({ page }) => {
  await page.goto("/gift-ideas");
  await expect(page.getByText(/\d+ gifts?/).first()).toBeVisible();
  await expect(page.getByRole("article").first()).toBeVisible();
});

test("search returns relevant results", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("searchbox", { name: "Search gifts" }).first().fill("kantha");
  await page.getByRole("button", { name: "Search" }).first().click();
  await expect(page).toHaveURL(/q=kantha/);
  await expect(page.getByRole("link", { name: "Hand-stitched nakshi kantha throw" })).toBeVisible();
});

test("search shows a helpful empty state", async ({ page }) => {
  await page.goto("/gift-ideas?q=submarine");
  await expect(page.getByRole("heading", { name: /No gifts match “submarine”/ })).toBeVisible();
  await expect(page.getByRole("link", { name: "Clear all filters" }).first()).toBeVisible();
});

test("visitor filters by occasion and budget, then clears filters", async ({ page, isMobile }) => {
  await page.goto("/gift-ideas");
  if (isMobile) {
    await page.getByRole("button", { name: /Filter and sort/ }).click();
    const dialog = page.getByRole("dialog");
    await dialog.getByLabel("Occasion").selectOption("holud");
    await dialog.getByLabel("Budget").selectOption("mid-range");
    await dialog.getByRole("button", { name: "Show gifts" }).click();
  } else {
    await page.getByLabel("Occasion").first().selectOption("holud");
    await expect(page).toHaveURL(/occasion=holud/);
    await page.getByLabel("Budget").first().selectOption("mid-range");
  }
  await expect(page).toHaveURL(/occasion=holud.*budget=mid-range|budget=mid-range.*occasion=holud/);
  await expect(page.getByText("3 gifts")).toBeVisible();

  await page.getByRole("link", { name: "Clear all filters" }).click();
  await expect(page).toHaveURL(/\/gift-ideas$/);
});

test("filtered views can be shared by URL", async ({ page }) => {
  await page.goto("/gift-ideas?recipient=the-bride");
  await expect(page.getByRole("list", { name: "Active filters" })).toContainText("The Bride");
});

test("visitor opens a gift detail page with its labels and source link", async ({ page }) => {
  await page.goto("/gift-ideas/personalised-home-nameplate");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Personalised nameplate for their first home");
  await expect(page.getByRole("navigation", { name: "Breadcrumb" })).toBeVisible();
  await expect(page.getByText("Why this makes a thoughtful gift")).toBeVisible();
  const source = page.getByRole("link", { name: /View at/ });
  await expect(source).toHaveAttribute("href", /^https:\/\//);
  await expect(source).toHaveAttribute("target", "_blank");
  await expect(source).toHaveAttribute("rel", /noopener/);
  await expect(page.getByRole("heading", { name: "You might also like" })).toBeVisible();
});

test("taxonomy pages list matching ideas", async ({ page }) => {
  await page.goto("/occasions/holud");
  await expect(page.getByRole("heading", { level: 1, name: "Holud gifts" })).toBeVisible();
  await page.goto("/budget/premium");
  await expect(page.getByRole("heading", { level: 1, name: /Premium/ })).toBeVisible();
});

test("unknown pages show the not-found page", async ({ page }) => {
  const res = await page.goto("/gift-ideas/does-not-exist");
  expect(res?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "We couldn't find that page" })).toBeVisible();
});

test("no horizontal overflow", async ({ page }) => {
  for (const path of ["/", "/gift-ideas", "/gift-ideas/nakshi-kantha-throw", "/gift-guides"]) {
    await page.goto(path);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow, path).toBeLessThanOrEqual(0);
  }
});
