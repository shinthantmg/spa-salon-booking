// Shared helpers for the tests.
import { test as base, expect } from "@playwright/test";

// Our own `test`: the same as Playwright's, but it blocks Google Fonts, so
// tests are faster and never fail because of a slow font server.
export const test = base.extend({
  page: async ({ page }, use) => {
    await page.route(/^https:\/\/fonts\.(googleapis|gstatic)\.com\//, route => route.abort());
    await use(page);
  }
});
export { expect };

// Every test runs at the same fixed moment, so results never depend on the
// real date or time: Wednesday 2 December 2026, 10:05 in Bangkok.
export const NOW = new Date("2026-12-02T10:05:00+07:00");
export const TODAY = "2026-12-02";
export const TOMORROW = "2026-12-03";

export async function freezeTime(page) {
  await page.clock.setFixedTime(NOW);
}

// Open the booking page at the fixed time, optionally with a service chosen by link
export async function openBooking(page, service) {
  await freezeTime(page);
  await page.goto(service ? `/booking.html?service=${service}` : "/booking.html");
}

// Choose a treatment and a date on the booking form
export async function chooseServiceAndDate(page, serviceId, date) {
  await page.locator("#service").selectOption(serviceId);
  if (date) await page.locator("#date").fill(date);
  await page.locator("#date").dispatchEvent("change");
}

// Click the first time slot that is still free and return its time, e.g. "11:00"
export async function pickFirstFreeSlot(page) {
  const slot = page.locator("#slots button.slot:not([disabled])").first();
  const time = await slot.getAttribute("data-time");
  await slot.click();
  return time;
}

export async function fillDetails(page, { name = "Malee Jaidee", phone = "081-234-5678", email = "" } = {}) {
  await page.getByLabel("Full name").fill(name);
  await page.getByLabel("Phone").fill(phone);
  await page.getByLabel("Email (optional)").fill(email);
}

export async function confirmBooking(page) {
  await page.getByRole("button", { name: "Confirm booking" }).click();
}

// Make one complete booking and return the chosen time
export async function makeBooking(page, { service = "thai-60", date = TOMORROW, ...details } = {}) {
  await chooseServiceAndDate(page, service, date);
  const time = await pickFirstFreeSlot(page);
  await fillDetails(page, details);
  await confirmBooking(page);
  return time;
}
