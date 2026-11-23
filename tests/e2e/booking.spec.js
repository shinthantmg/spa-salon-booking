// TC-10 to TC-27: the booking form, time slots, validation, saving and cancelling.
import {
  test, expect, openBooking, chooseServiceAndDate, pickFirstFreeSlot,
  fillDetails, confirmBooking, makeBooking, TODAY, TOMORROW
} from "./helpers.js";

const slots = page => page.locator("#slots button.slot");
const freeSlots = page => page.locator("#slots button.slot:not([disabled])");

test.describe("Booking: date and time slots", () => {
  test.beforeEach(async ({ page }) => openBooking(page));

  test("TC-10 the date starts on today and only allows the next 60 days", async ({ page }) => {
    const date = page.locator("#date");
    await expect(date).toHaveValue(TODAY);
    await expect(date).toHaveAttribute("min", TODAY);
    await expect(date).toHaveAttribute("max", "2027-01-31");
  });

  test("TC-11 no times are shown until a treatment is chosen", async ({ page }) => {
    await expect(slots(page)).toHaveCount(0);
    await expect(page.locator("#slot-hint")).toHaveText("Choose a treatment and date to see free times.");
  });

  test("TC-12 times run every 30 minutes and the treatment must end by closing time", async ({ page }) => {
    await chooseServiceAndDate(page, "thai-60", TOMORROW);
    const times = await slots(page).evaluateAll(els => els.map(e => e.dataset.time));
    expect(times[0]).toBe("10:00");
    expect(times.at(-1)).toBe("20:00");     // 60 minutes, ends 21:00
    expect(times).toHaveLength(21);

    await chooseServiceAndDate(page, "hotstone-90", TOMORROW);
    expect(await slots(page).last().getAttribute("data-time")).toBe("19:30"); // 90 minutes, ends 21:00
  });

  test("TC-13 times that have already passed today can't be chosen", async ({ page }) => {
    await chooseServiceAndDate(page, "thai-60", TODAY);
    await expect(page.locator('#slots button[data-time="10:00"]')).toBeDisabled(); // it's 10:05 now
    const firstFree = await freeSlots(page).first().getAttribute("data-time");
    expect(firstFree >= "10:30").toBe(true);
  });

  test("TC-14 choosing a time updates the booking summary", async ({ page }) => {
    await chooseServiceAndDate(page, "oil-60", TOMORROW);
    const time = await pickFirstFreeSlot(page);
    const [h, m] = time.split(":").map(Number);
    const end = `${String(h + 1).padStart(2, "0")}:${String(m).padStart(2, "0")}`;

    await expect(page.locator(`#slots button[data-time="${time}"]`)).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("#sum-service")).toHaveText("Aromatherapy Oil Massage");
    await expect(page.locator("#sum-length")).toHaveText("60 minutes");
    await expect(page.locator("#sum-date")).toHaveText("Thu, 3 Dec 2026");
    await expect(page.locator("#sum-time")).toHaveText(`${time} to ${end}`);
    await expect(page.locator("#sum-total")).toHaveText("฿900");
  });

  test("TC-15 a chosen time is cleared if the new treatment no longer fits", async ({ page }) => {
    await chooseServiceAndDate(page, "thai-60", TOMORROW);
    const last = freeSlots(page).last();
    const time = await last.getAttribute("data-time");
    test.skip(time !== "20:00", "Needs 20:00 to be free on this date");
    await last.click();
    await expect(page.locator("#sum-time")).toHaveText("20:00 to 21:00");

    await page.locator("#service").selectOption("hotstone-90"); // 90 min would end 21:30
    await expect(page.locator("#sum-time")).toHaveText("-");
  });
});

test.describe("Booking: checking the form", () => {
  test.beforeEach(async ({ page }) => openBooking(page));

  test("TC-16 an empty form shows an error for every required field", async ({ page }) => {
    await confirmBooking(page);
    await expect(page.locator("#err-service")).toHaveText("Please choose a treatment.");
    await expect(page.locator("#err-time")).toHaveText("Please choose a time.");
    await expect(page.locator("#err-name")).toHaveText("Please enter your name.");
    await expect(page.locator("#err-phone")).toHaveText(/Thai phone number/);
    await expect(page.locator("#dialog")).not.toHaveClass(/open/);
  });

  test("TC-17 phone numbers must be Thai numbers", async ({ page }) => {
    await chooseServiceAndDate(page, "thai-60", TOMORROW);
    await pickFirstFreeSlot(page);

    for (const bad of ["12345", "081-234", "+1 555 123 4567", "abcdefghij"]) {
      await fillDetails(page, { phone: bad });
      await confirmBooking(page);
      await expect(page.locator("#err-phone"), `"${bad}" should be rejected`).not.toBeEmpty();
    }
    for (const good of ["081-234-5678", "0812345678", "+66 81 234 5678", "02-555-0123"]) {
      await fillDetails(page, { phone: good });
      await page.evaluate(() => document.getElementById("booking-form").requestSubmit());
      await expect(page.locator("#err-phone"), `"${good}" should be accepted`).toBeEmpty();
      await page.getByRole("button", { name: "Done" }).click();
      await chooseServiceAndDate(page, "thai-60", TOMORROW);
      await pickFirstFreeSlot(page);
    }
  });

  test("TC-18 a badly written email is rejected, an empty one is fine", async ({ page }) => {
    await chooseServiceAndDate(page, "thai-60", TOMORROW);
    await pickFirstFreeSlot(page);
    await fillDetails(page, { email: "malee@mail" });
    await confirmBooking(page);
    await expect(page.locator("#err-email")).toHaveText("This email doesn't look right.");

    await fillDetails(page, { email: "" });
    await confirmBooking(page);
    await expect(page.locator("#err-email")).toBeEmpty();
    await expect(page.locator("#dialog")).toHaveClass(/open/);
  });
});

test.describe("Booking: saving and cancelling", () => {
  test.beforeEach(async ({ page }) => openBooking(page));

  test("TC-19 a valid booking shows a confirmation with a booking code", async ({ page }) => {
    const time = await makeBooking(page, { service: "facial-60" });
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText("You're booked!");
    await expect(dialog).toContainText(`Hydrating Facial is booked for Thu, 3 Dec 2026 at ${time}`);
    await expect(dialog.locator(".code")).toHaveText(/^LS[0-9A-Z]{6}$/);

    // The form is ready for the next booking
    await page.getByRole("button", { name: "Done" }).click();
    await expect(page.getByLabel("Full name")).toHaveValue("");
    await expect(page.locator("#sum-time")).toHaveText("-");
  });

  test("TC-20 the booking appears in My upcoming bookings and survives a reload", async ({ page }) => {
    await expect(page.locator("#my-bookings")).toContainText("You have no upcoming bookings yet.");
    const time = await makeBooking(page);
    const code = await page.locator("#dialog .code").textContent();
    await page.getByRole("button", { name: "Done" }).click();

    const item = page.locator("#my-bookings li", { hasText: code });
    await expect(item).toContainText(`Thu, 3 Dec 2026 at ${time}`);
    await expect(item).toContainText("Traditional Thai Massage · 60 min · ฿600");

    await page.reload();
    await expect(page.locator("#my-bookings li", { hasText: code })).toBeVisible();
  });

  test("TC-21 a time is blocked once both therapists are booked", async ({ page }) => {
    const time = await makeBooking(page);
    await page.getByRole("button", { name: "Done" }).click();
    await chooseServiceAndDate(page, "thai-60", TOMORROW);
    await expect(page.locator(`#slots button[data-time="${time}"]`)).toBeEnabled(); // 1 of 2 therapists busy

    await page.locator(`#slots button[data-time="${time}"]`).click();
    await fillDetails(page, { name: "Somsak Phromma", phone: "0823456789" });
    await confirmBooking(page);
    await page.getByRole("button", { name: "Done" }).click();

    await chooseServiceAndDate(page, "thai-60", TOMORROW);
    await expect(page.locator(`#slots button[data-time="${time}"]`)).toBeDisabled(); // 2 of 2 busy
  });

  test("TC-22 cancelling needs two clicks and frees the time again", async ({ page }) => {
    await makeBooking(page);
    const code = await page.locator("#dialog .code").textContent();
    await page.getByRole("button", { name: "Done" }).click();

    const cancel = page.locator(`button[data-cancel="${code}"]`);
    await cancel.click();
    await expect(cancel).toHaveText("Click again to cancel");
    await expect(page.locator("#my-bookings li", { hasText: code })).toBeVisible();

    await cancel.click();
    await expect(page.locator("#my-bookings")).toContainText("You have no upcoming bookings yet.");
    const saved = await page.evaluate(() => localStorage.getItem("lotus-bookings"));
    expect(JSON.parse(saved)).toEqual([]);
  });

  test("TC-23 the confirmation closes with Done, Escape or a click outside", async ({ page }) => {
    const dialog = page.locator("#dialog");
    await makeBooking(page);
    await page.getByRole("button", { name: "Done" }).click();
    await expect(dialog).not.toHaveClass(/open/);

    await makeBooking(page, { name: "Somsak Phromma" });
    await page.keyboard.press("Escape");
    await expect(dialog).not.toHaveClass(/open/);

    await makeBooking(page, { name: "Ananya Chotikul" });
    await dialog.click({ position: { x: 5, y: 5 } });
    await expect(dialog).not.toHaveClass(/open/);
  });
});

// Regression tests for the bugs in docs/BUG_REPORTS.md
test.describe("Booking: bug regressions", () => {
  test("TC-24 (BUG-001) a date in the past can't be booked", async ({ page }) => {
    await openBooking(page);
    await chooseServiceAndDate(page, "thai-60", "2026-11-20");
    await expect(freeSlots(page)).toHaveCount(0);
    await expect(page.locator("#slot-hint")).toHaveText(/from today up to/);
    await fillDetails(page);
    await confirmBooking(page);
    await expect(page.locator("#err-date")).not.toBeEmpty();
    await expect(page.locator("#dialog")).not.toHaveClass(/open/);
  });

  test("TC-25 (BUG-002) a date more than 60 days ahead can't be booked", async ({ page }) => {
    await openBooking(page);
    await chooseServiceAndDate(page, "thai-60", "2027-03-15");
    await expect(freeSlots(page)).toHaveCount(0);
    await fillDetails(page);
    await confirmBooking(page);
    await expect(page.locator("#err-date")).not.toBeEmpty();
    await expect(page.locator("#dialog")).not.toHaveClass(/open/);
  });

  test("TC-26 (BUG-003) a name containing HTML is shown as plain text", async ({ page }) => {
    await openBooking(page);
    const name = '<img src=x id="injected">Malee';
    await makeBooking(page, { name });
    await expect(page.locator("#confirm-text")).toContainText(name);
    await expect(page.locator("#injected")).toHaveCount(0);
  });

  test("TC-31 (BUG-005) every booking gets its own booking code", async ({ page }) => {
    await openBooking(page); // the clock is frozen, so both bookings happen at the same moment
    await makeBooking(page);
    const first = await page.locator("#dialog .code").textContent();
    await page.getByRole("button", { name: "Done" }).click();
    await makeBooking(page, { name: "Somsak Phromma" });
    const second = await page.locator("#dialog .code").textContent();
    expect(second).not.toBe(first);

    // Cancelling one booking must leave the other
    await page.getByRole("button", { name: "Done" }).click();
    await page.locator(`button[data-cancel="${first}"]`).click();
    await page.locator(`button[data-cancel="${first}"]`).click();
    await expect(page.locator("#my-bookings li", { hasText: second })).toBeVisible();
  });

  test("TC-27 (BUG-004) late in the day the page says there are no more times today", async ({ page }) => {
    await page.clock.setFixedTime(new Date("2026-12-02T19:50:00+07:00"));
    await page.goto("/booking.html");
    await chooseServiceAndDate(page, "hotstone-90", TODAY);
    await expect(freeSlots(page)).toHaveCount(0);
    await expect(page.locator("#slot-hint")).toHaveText("No more times today. Please choose another date.");
  });
});
