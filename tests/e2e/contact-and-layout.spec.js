// TC-28 to TC-30: the contact form and layout on small screens.
import { test, expect, freezeTime } from "./helpers.js";

test.describe("Contact page", () => {
  test.beforeEach(async ({ page }) => {
    await freezeTime(page);
    await page.goto("/contact.html");
  });

  test("TC-28 shows the address, phone and email from the salon data", async ({ page }) => {
    const info = page.locator("#info-list");
    await expect(info).toContainText("88 Sukhumvit Soi 24");
    await expect(info).toContainText("02-555-0123");
    await expect(info.getByRole("link", { name: "hello@lotusspa.example" })).toHaveAttribute("href", "mailto:hello@lotusspa.example");
  });

  test("TC-29 the contact form checks the fields before 'sending'", async ({ page }) => {
    const result = page.locator("#c-result");
    await page.getByRole("button", { name: "Send message" }).click();
    await expect(result).toHaveText("Please fill in your name, a valid email and a message.");

    await page.getByLabel("Name").fill("Malee");
    await page.getByLabel("Email").fill("malee@example.com");
    await page.getByLabel("Message").fill("Do you have parking?");
    await page.getByRole("button", { name: "Send message" }).click();
    await expect(result).toContainText("Thank you, Malee.");
    await expect(page.getByLabel("Name")).toHaveValue("");
  });
});

test.describe("Small screens", () => {
  for (const path of ["/index.html", "/services.html", "/booking.html", "/contact.html"]) {
    test(`TC-30 ${path} never scrolls sideways at 360px wide`, async ({ page }) => {
      await page.setViewportSize({ width: 360, height: 740 });
      await freezeTime(page);
      await page.goto(path);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }
});
