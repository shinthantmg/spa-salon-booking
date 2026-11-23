// TC-01 to TC-05: every page opens, shares the same header and footer, and the menu works.
import { test, expect, freezeTime } from "./helpers.js";

const PAGES = [
  { path: "/index.html", title: "Lotus Spa Bangkok", heading: "Slow down. Breathe. Feel at home." },
  { path: "/services.html", title: "Services and Prices · Lotus Spa Bangkok", heading: "Services and prices" },
  { path: "/booking.html", title: "Book an Appointment · Lotus Spa Bangkok", heading: "Book an appointment" },
  { path: "/contact.html", title: "Contact · Lotus Spa Bangkok", heading: "Visit or contact us" }
];

test.describe("Navigation and layout", () => {
  for (const p of PAGES) {
    test(`TC-01 ${p.path} opens without errors and shows its heading`, async ({ page }) => {
      const errors = [];
      page.on("pageerror", e => errors.push(e.message));
      await freezeTime(page);
      await page.goto(p.path);

      await expect(page).toHaveTitle(p.title);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(p.heading);
      expect(errors, "JavaScript errors on the page").toEqual([]);
    });

    test(`TC-02 ${p.path} has the shared header and footer`, async ({ page }) => {
      await freezeTime(page);
      await page.goto(p.path);
      await expect(page.locator("#site-header .logo")).toContainText("Lotus Spa Bangkok");
      await expect(page.locator("#site-footer")).toContainText("Open daily 10:00 to 21:00");
      await expect(page.locator("#site-footer")).toContainText("Salon details are sample content");
    });
  }

  test("TC-03 the current page is highlighted in the menu", async ({ page, isMobile }) => {
    await freezeTime(page);
    await page.goto("/services.html");
    if (isMobile) await page.getByRole("button", { name: "Open menu" }).click();
    await expect(page.locator("#nav a.active")).toHaveText("Services");
  });

  test("TC-04 menu links move between pages", async ({ page, isMobile }) => {
    await freezeTime(page);
    await page.goto("/index.html");
    const openMenu = async () => { if (isMobile) await page.getByRole("button", { name: "Open menu" }).click(); };

    await openMenu();
    await page.locator("#nav").getByRole("link", { name: "Services" }).click();
    await expect(page).toHaveURL(/services\.html$/);

    await openMenu();
    await page.locator("#nav").getByRole("link", { name: "Contact" }).click();
    await expect(page).toHaveURL(/contact\.html$/);

    await openMenu();
    await page.locator("#nav").getByRole("link", { name: "Book now" }).click();
    await expect(page).toHaveURL(/booking\.html$/);
  });

  test("TC-05 the mobile menu opens and closes", async ({ page, isMobile }) => {
    test.skip(!isMobile, "The menu button only exists on small screens");
    await freezeTime(page);
    await page.goto("/index.html");
    const button = page.getByRole("button", { name: "Open menu" });
    const nav = page.locator("#nav");

    await expect(nav).toBeHidden();
    await button.click();
    await expect(nav).toBeVisible();
    await expect(button).toHaveAttribute("aria-expanded", "true");
    await button.click();
    await expect(nav).toBeHidden();
    await expect(button).toHaveAttribute("aria-expanded", "false");
  });
});
