# Test Plan: Lotus Spa Bangkok

| | |
|---|---|
| **Project** | Lotus Spa Bangkok booking website |
| **Version tested** | 1.1.0 |
| **Author** | Shin Thant Maung |
| **Test type** | Automated end-to-end (browser) tests with Playwright |
| **Result** | 31 test cases, 79 test runs, all passing; 5 bugs found and fixed |

## 1. Purpose

Check that a customer can browse treatments and book, view and cancel an appointment correctly on desktop and mobile, and that wrong input is rejected with a clear message.

## 2. Scope

**In scope**
- All four pages: Home, Services, Booking and Contact
- Navigation, the shared header and footer, and the mobile menu
- Service list and category filters
- Booking: date limits, time-slot rules, live summary, validation, saving, therapist capacity and cancelling
- Contact form validation
- Layout on small screens (360 px wide)

**Out of scope**
- Sending real emails or messages, which the site doesn't do yet
- Server and database behaviour, because bookings are stored in the browser
- Visual design review and browser-specific font rendering

## 3. Approach

- **End-to-end tests** run the real website in a real browser and act like a customer: clicking, typing and reading what appears on screen.
- **Fixed clock:** every test runs at Wednesday 2 December 2026, 10:05 Bangkok time, so results never depend on the real date or time.
- **Fresh browser per test:** each test starts with empty storage, so tests can't affect each other and can run in parallel.
- **Accessible locators:** tests find elements by their label or role (for example `getByLabel("Full name")`), the way a person using a screen reader would. A missing label therefore makes a test fail.
- **Regression tests:** every bug found gets a test named after it (for example `TC-24 (BUG-001)`), so it can't silently come back.

## 4. Environments

| Project name | Device | Viewport |
|---|---|---|
| `desktop-chrome` | Desktop Chrome | 1280 × 720 |
| `mobile-chrome` | Pixel 7 (touch, mobile user agent) | 412 × 839 |

Time zone `Asia/Bangkok`, locale `en-GB`. Tests run automatically on every push and pull request through GitHub Actions (`.github/workflows/tests.yml`).

## 5. Entry and exit criteria

- **Entry:** the site loads locally with `npm start`.
- **Exit:**
  - all test cases pass on both projects
  - no JavaScript errors on any page
  - every High or Medium bug is fixed and has a regression test

## 6. Test cases

| ID | Area | Test case | Expected result |
|---|---|---|---|
| TC-01 | Navigation | Each of the 4 pages opens | Correct title and heading, no JavaScript errors |
| TC-02 | Navigation | Shared header and footer on each page | Logo, opening hours and the sample-data notice are shown |
| TC-03 | Navigation | Current page highlighted | "Services" is marked active on the Services page |
| TC-04 | Navigation | Menu links | Services, Contact and Book now open the right pages |
| TC-05 | Navigation | Mobile menu (phone only) | Menu opens and closes; `aria-expanded` updates |
| TC-06 | Services | Full list | 12 treatments, each with a price in baht and a length |
| TC-07 | Services | Category filters | Massage 5, Facial 2, Body 2, Nails 2, Packages 1, only that category shown |
| TC-08 | Services | "All" filter | All 12 treatments return |
| TC-09 | Services | Book a treatment from the list | Booking page opens with that treatment and its price selected |
| TC-10 | Booking | Date limits | Starts on today; min is today, max is today + 60 days |
| TC-11 | Booking | Before choosing a treatment | No times shown; a hint explains what to do |
| TC-12 | Booking | Time-slot rules | Every 30 min from 10:00; the last start lets the treatment end by 21:00 |
| TC-13 | Booking | Past times today | 10:00 is disabled at 10:05; the first free time is 10:30 or later |
| TC-14 | Booking | Live summary | Treatment, length, date, start–end time and price update |
| TC-15 | Booking | Changing treatment | A chosen time that no longer fits is cleared |
| TC-16 | Validation | Empty form | Errors for treatment, time, name and phone; nothing saved |
| TC-17 | Validation | Phone numbers | Non-Thai numbers rejected; 4 Thai formats accepted |
| TC-18 | Validation | Email | Badly formed email rejected; empty email allowed |
| TC-19 | Saving | Successful booking | Confirmation with details and a code like `LS7K2QXM`; form resets |
| TC-20 | Saving | My upcoming bookings | Booking listed with date, time, treatment and price; still there after reload |
| TC-21 | Saving | Therapist capacity | A time stays open with 1 of 2 therapists booked and closes at 2 of 2 |
| TC-22 | Cancelling | Two-click cancel | First click asks to confirm; second removes it from the list and storage |
| TC-23 | Saving | Closing the confirmation | Closes with Done, Escape or a click outside |
| TC-24 | Regression | BUG-001 past date | No times offered; form shows a date error; nothing saved |
| TC-25 | Regression | BUG-002 date > 60 days | No times offered; form shows a date error; nothing saved |
| TC-26 | Regression | BUG-003 HTML in name | Name shown as plain text; no HTML element created |
| TC-27 | Regression | BUG-004 late in the day | Message says "No more times today" instead of "fully booked" |
| TC-28 | Contact | Salon details | Address, phone and email link come from the salon data |
| TC-29 | Contact | Contact form | Empty form shows an error; valid form thanks the customer and clears |
| TC-30 | Layout | 360 px screen, all 4 pages | The page never scrolls sideways |
| TC-31 | Regression | BUG-005 booking codes | Two bookings at the same moment get different codes; cancelling one keeps the other |

TC-01, TC-02 and TC-30 run once per page. Every test runs on both projects, which gives 80 runs: 79 pass, and TC-05 is skipped on desktop because the menu button only exists on phones.

## 7. Results

- **Before fixes:** 69 passed and 10 failed. The failures were the 5 bugs, each on both devices.
- **After fixes:** 79 passed and 1 skipped (TC-05 on desktop, by design).

Details of each bug are in [BUG_REPORTS.md](BUG_REPORTS.md).

## 8. Risks and known limits

- Bookings are stored in each visitor's own browser, so two customers on different devices could book the last place at the same time. This needs a server and database, which is planned.
- Some times are shown as booked by other customers using a fixed demo pattern (`demoBusy()`), which the tests allow for by reading which slots are free instead of assuming.
- Tests run on Chromium only. Firefox and Safari (WebKit) can be added in `playwright.config.js`.
