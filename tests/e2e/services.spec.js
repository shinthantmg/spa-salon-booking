// TC-06 to TC-09: the service menu, its filters, and links into the booking form.
import { test, expect, freezeTime } from "./helpers.js";

test.describe("Services page", () => {
  test.beforeEach(async ({ page }) => {
    await freezeTime(page);
    await page.goto("/services.html");
  });

  test("TC-06 shows all 12 treatments with a price and length", async ({ page }) => {
    const items = page.locator("#menu-list li");
    await expect(items).toHaveCount(12);
    for (const item of await items.all()) {
      await expect(item.locator(".price")).toHaveText(/^฿[\d,]+$/);
      await expect(item.locator(".tag")).toHaveText(/\d+ min$/);
    }
  });

  test("TC-07 each category filter shows only that category", async ({ page }) => {
    const expected = { Massage: 5, Facial: 2, Body: 2, Nails: 2, Packages: 1 };
    for (const [category, count] of Object.entries(expected)) {
      const chip = page.getByRole("button", { name: category, exact: true });
      await chip.click();
      await expect(page.getByRole("button", { name: category, exact: true })).toHaveAttribute("aria-pressed", "true");
      const items = page.locator("#menu-list li");
      await expect(items).toHaveCount(count);
      for (const tag of await items.locator(".tag").allTextContents()) {
        expect(tag.startsWith(category)).toBe(true);
      }
    }
  });

  test("TC-08 the All filter shows every treatment again", async ({ page }) => {
    await page.getByRole("button", { name: "Facial", exact: true }).click();
    await expect(page.locator("#menu-list li")).toHaveCount(2);
    await page.getByRole("button", { name: "All", exact: true }).click();
    await expect(page.locator("#menu-list li")).toHaveCount(12);
  });

  test("TC-09 Book on a treatment opens the booking form with it selected", async ({ page }) => {
    const row = page.locator("#menu-list li", { hasText: "Hot Stone Massage" });
    await row.getByRole("link", { name: "Book" }).click();

    await expect(page).toHaveURL(/booking\.html\?service=hotstone-90$/);
    await expect(page.locator("#service")).toHaveValue("hotstone-90");
    await expect(page.locator("#sum-service")).toHaveText("Hot Stone Massage");
    await expect(page.locator("#sum-total")).toHaveText("฿1,400");
  });
});
