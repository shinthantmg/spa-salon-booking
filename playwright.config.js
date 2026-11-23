// Playwright settings: which browsers to test in and how to start the website.
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,          // stop a forgotten test.only from passing in CI
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : [["list"]],

  use: {
    baseURL: "http://localhost:4173",
    timezoneId: "Asia/Bangkok",          // the spa is in Bangkok
    locale: "en-GB",
    trace: "on-first-retry",
    screenshot: "only-on-failure"
  },

  projects: [
    { name: "desktop-chrome", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile-chrome", use: { ...devices["Pixel 7"] } }
  ],

  // Start the website before the tests run
  webServer: {
    command: "node tests/static-server.js",
    url: "http://localhost:4173",
    reuseExistingServer: !process.env.CI
  }
});
