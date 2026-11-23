# Lotus Spa Bangkok: Spa Salon Booking Website

[![Tests](https://github.com/shinthantmg/spa-salon-booking/actions/workflows/tests.yml/badge.svg)](https://github.com/shinthantmg/spa-salon-booking/actions/workflows/tests.yml)

A spa salon website where customers can browse treatments and book an appointment online, tested with an automated **Playwright** end-to-end test suite.
Built by **Shin Thant Maung** (ICT, Rangsit University) as a portfolio project.

**Live demo:** https://shinthantmg.github.io/spa-salon-booking/

> Lotus Spa Bangkok is a made-up salon. The address, phone number and email are sample content.

## Features

- **4 pages:** Home, Services, Booking and Contact
- **Service menu** with category filters (Massage, Facial, Body, Nails, Packages)
- **Online booking:**
  - choose a treatment, a date (up to 60 days ahead) and a free time slot
  - time slots are calculated from opening hours, treatment length and how many therapists are free
  - fully booked and past times are disabled
  - live booking summary with the total price
  - form checking (name, Thai phone number, email, date range)
  - confirmation pop-up with a unique booking code
  - "My upcoming bookings" list with cancel
- **Responsive design** that works on phones, tablets and laptops
- **No frameworks:** plain HTML, CSS and JavaScript

## Testing (QA)

| | |
|---|---|
| **Tool** | Playwright end-to-end tests in Chromium, on desktop and on a Pixel 7 phone |
| **Coverage** | 31 test cases and 79 test runs across navigation, services, booking, validation, cancelling, contact and mobile layout |
| **Bugs found** | 5, all fixed, each with a regression test |
| **CI** | Tests run automatically on GitHub Actions for every push and pull request |

- 📋 [Test plan](docs/TEST_PLAN.md): scope, approach, environments and all 31 test cases
- 🐞 [Bug reports](docs/BUG_REPORTS.md): steps to reproduce, expected vs actual, cause and fix for each bug

Highlights from the bug reports:
- **BUG-001 (High):** past dates could be booked by typing them into the date field
- **BUG-003 (High, security):** the customer's name was inserted into the page as HTML (HTML injection)
- **BUG-005 (Medium):** booking codes repeated every 25 days, so cancelling one booking could cancel another

### Run the tests yourself

Requires [Node.js](https://nodejs.org) 20 or newer.

```bash
npm install
npx playwright install chromium
npm test
```

Other commands:

| Command | What it does |
|---|---|
| `npm start` | Start the site at http://localhost:4173 |
| `npm run test:headed` | Run the tests with the browser visible |
| `npm run test:report` | Open the HTML report after a run |

## Built with

HTML5 · CSS3 (Grid, Flexbox, media queries) · JavaScript (ES6) · localStorage · Playwright · GitHub Actions

## Project structure

```
spa-salon-booking/
├── index.html            Home page
├── services.html         Full service menu with filters
├── booking.html          Booking form
├── contact.html          Address, opening hours and contact form
├── css/style.css         Styles for every page
├── js/
│   ├── data.js           Salon info and the list of services (edit prices here)
│   ├── main.js           Header, footer, mobile menu and service lists
│   └── booking.js        Booking logic: time slots, form checking, saving
├── tests/
│   ├── static-server.js  Small web server used by the tests
│   └── e2e/              Playwright test files (*.spec.js) and shared helpers
├── docs/
│   ├── TEST_PLAN.md
│   └── BUG_REPORTS.md
├── playwright.config.js  Browsers, devices and settings for the tests
└── .github/workflows/tests.yml   Runs the tests on GitHub Actions
```

## How bookings are saved

Bookings are saved in the browser's **localStorage**, so they stay after a refresh but only on the same device.
Some time slots are shown as already booked to make the demo look like a real, busy salon (see `demoBusy()` in `booking.js`).

## Next steps

- [ ] Save bookings in a real database (for example Firebase or Supabase)
- [ ] Admin page for the salon to see all bookings
- [ ] Email or LINE confirmation messages
- [ ] Run the tests in Firefox and Safari (WebKit) too
- [ ] Thai language version
