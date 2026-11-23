# Bug Reports: Lotus Spa Bangkok

Bugs found while writing the automated test suite (see [TEST_PLAN.md](TEST_PLAN.md)).
Each bug has a regression test, so it can't come back without a test failing.

| ID | Title | Severity | Status | Regression test |
|---|---|---|---|---|
| BUG-001 | Bookings can be made for dates in the past | High | Fixed | TC-24 |
| BUG-002 | Bookings can be made more than 60 days ahead | Medium | Fixed | TC-25 |
| BUG-003 | Customer name is inserted as HTML in the confirmation (HTML injection) | High | Fixed | TC-26 |
| BUG-004 | "Fully booked" message shown when the day is simply over | Low | Fixed | TC-27 |
| BUG-005 | Booking codes can repeat, so cancelling one booking cancels another | Medium | Fixed | TC-31 |

**Severity scale:** **High** means wrong data is saved or there is a security risk. **Medium** means a feature works incorrectly in some cases. **Low** means a confusing message or small usability problem.

**Test environment:** Chromium (desktop 1280×720 and Pixel 7 emulation), Playwright, clock fixed at Wednesday 2 December 2026, 10:05 Bangkok time.

---

## BUG-001: Bookings can be made for dates in the past

| | |
|---|---|
| **Severity** | High |
| **Page** | `booking.html` |
| **Found by** | Exploratory testing while writing TC-10 |

**Steps to reproduce**
1. Open `booking.html` on 2 December 2026.
2. Choose **Traditional Thai Massage (60 min)**.
3. Click into the date field and **type** `20/11/2026`. The calendar pop-up blocks past dates, but typing doesn't.
4. Choose any time, enter a name and phone number, and click **Confirm booking**.

**Expected result:** No times are offered, and the form shows "Please choose a date from today up to 60 days ahead."

**Actual result:** 13 free time slots are shown for 20 November, and the booking is confirmed and saved.

**Cause:** The date input's `min` attribute only limits the calendar pop-up. The JavaScript never checked the date itself, and the "time has passed" check only looked at *today*.

**Fix:** Added `isBookableDate()` in `js/booking.js`. Time slots are hidden for dates outside the window, and `check()` rejects them with a clear error.

---

## BUG-002: Bookings can be made more than 60 days ahead

| | |
|---|---|
| **Severity** | Medium |
| **Page** | `booking.html` |

**Steps to reproduce**
1. Open `booking.html` on 2 December 2026.
2. Choose a treatment and **type** the date `15/03/2027`.
3. Choose a time, fill in the details and confirm.

**Expected result:** The date is refused, because the salon only takes bookings up to 31 January 2027.

**Actual result:** Times are shown and the booking is saved.

**Cause:** Same as BUG-001, but for the `max` attribute.

**Fix:** The same `isBookableDate()` check covers both ends of the window.

---

## BUG-003: Customer name is inserted as HTML in the confirmation (HTML injection)

| | |
|---|---|
| **Severity** | High (security) |
| **Page** | `booking.html`, confirmation pop-up |

**Steps to reproduce**
1. Make a booking with this full name: `<img src=x onerror=alert('hacked')>`
2. Click **Confirm booking**.

**Expected result:** The confirmation shows the name exactly as typed, as plain text.

**Actual result:** The browser treats the name as HTML: a broken image is added to the page, and the `onerror` JavaScript runs.

**Cause:** The confirmation message was built with `innerHTML` and included `booking.name` without escaping it.

**Impact:** Today only the person typing is affected (self-XSS). It would become a serious *stored* XSS vulnerability as soon as bookings are shown to staff on an admin page, which is on the roadmap.

**Fix:** Added `escapeHtml()` and used it for every value that comes from the customer or from storage (name, service name and booking code) before it is put into HTML.

---

## BUG-004: "Fully booked" message shown when the day is simply over

| | |
|---|---|
| **Severity** | Low |
| **Page** | `booking.html` |

**Steps to reproduce**
1. Open `booking.html` at 19:50.
2. Choose **Hot Stone Massage (90 min)** for today.

**Expected result:** "No more times today. Please choose another date."

**Actual result:** "Sorry, this day is fully booked. Please try another date." This is untrue, because the slots are only unavailable since they have already passed.

**Fix:** Each slot now records whether it is in the past, and the message is chosen based on why there are no free times.

---

## BUG-005: Booking codes can repeat, so cancelling one booking cancels another

| | |
|---|---|
| **Severity** | Medium |
| **Page** | `booking.html` |
| **Found by** | Automated test with a frozen clock (TC-31) |

**Steps to reproduce**
1. Make two bookings at the same moment. The test does this by freezing the clock. In real use it happens to two bookings made **25 days apart**, explained below.
2. Compare the booking codes, then cancel the first booking.

**Expected result:** Each booking has its own code, and cancelling one leaves the other.

**Actual result:** Both bookings get the same code, for example `LS5JM25C`, and cancelling one **removes both**.

**Cause:** The code was the last 6 characters of the current time in base 36 (`Date.now().toString(36).slice(-6)`). Those 6 characters repeat every 36⁶ milliseconds, which is about **25 days**, and they are identical for bookings made in the same millisecond.

**Fix:** `newBookingCode()` now creates a random 6-character code from `crypto.getRandomValues()`. It leaves out look-alike characters such as 0/O and 1/I, and it checks that no existing booking already uses the code.
