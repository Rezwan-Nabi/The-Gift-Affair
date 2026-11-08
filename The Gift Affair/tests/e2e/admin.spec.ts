import path from "node:path";
import { expect, test } from "@playwright/test";

const email = process.env.E2E_ADMIN_EMAIL;
const password = process.env.E2E_ADMIN_PASSWORD;

test("signed-out visitors cannot open admin pages", async ({ page }) => {
  for (const path of ["/admin", "/admin/gifts", "/admin/gifts/new", "/admin/categories"]) {
    await page.goto(path);
    await expect(page).toHaveURL(/\/admin\/login/);
  }
});

test.describe("administrator", () => {
  // Needs a Supabase project, a seeded database and an editor account (see README → Testing).
  test.skip(!email || !password, "Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD to run admin tests.");
  test.describe.configure({ mode: "serial" });

  const title = `E2E test gift ${Date.now()}`;
  const slug = title.toLowerCase().replace(/\s+/g, "-");

  test.beforeEach(async ({ page }) => {
    await page.goto("/admin/login");
    await page.getByLabel("Email").fill(email!);
    await page.getByLabel("Password").fill(password!);
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/admin$/);
  });

  test("creates a draft gift idea", async ({ page }) => {
    await page.goto("/admin/gifts/new");
    await page.getByLabel("Title").fill(title);
    await page.getByLabel("Summary").fill("A gift idea created by the end-to-end tests.");
    await page.getByLabel("Full description").fill("This idea exists only to test the admin workflow and can be deleted.");
    await page.getByRole("button", { name: "Create gift idea" }).click();
    await expect(page.getByText("Gift idea created.")).toBeVisible();

    // Drafts are not public.
    const res = await page.request.get(`/gift-ideas/${slug}`);
    expect(res.status()).toBe(404);
  });

  test("edits and publishes the idea, which then appears publicly", async ({ page }) => {
    await page.goto(`/admin/gifts?q=${encodeURIComponent(title)}`);
    await page.getByRole("link", { name: title }).click();

    // Publishing without a main image is refused.
    await page.getByRole("radio", { name: /Published/ }).check();
    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(page.getByText("Add a main image before publishing.")).toBeVisible();

    // Upload an image (goes to Supabase Storage), describe it, then publish.
    await page.locator('input[type="file"]').first().setInputFiles(path.join(__dirname, "fixtures/sample-gift.jpg"));
    await expect(page.getByRole("button", { name: "Replace image" }).first()).toBeVisible({ timeout: 20_000 });
    await page.getByLabel("Main image description (alt text)").fill("Two ceramic mugs, sample image");
    await page.getByLabel("Summary").fill("An updated summary from the end-to-end tests.");
    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(page.getByText("Changes saved.")).toBeVisible();

    await page.goto(`/gift-ideas/${slug}`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(title);
    await expect(page.getByText("An updated summary from the end-to-end tests.")).toBeVisible();
  });

  test("deletes the test idea after confirmation", async ({ page }) => {
    await page.goto(`/admin/gifts?q=${encodeURIComponent(title)}`);
    await page.getByRole("button", { name: `Delete ${title}` }).click();
    await page.getByRole("alertdialog").getByRole("button", { name: "Delete gift idea" }).click();
    await expect(page.getByRole("link", { name: title })).toHaveCount(0);
  });
});
