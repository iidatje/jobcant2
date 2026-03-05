import { devices } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

export default {
  testDir: "./src/tests",
  testMatch: /.*.js/,
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  //reporter: "html",
  reporter: "line",
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    // baseURL: 'http://127.0.0.1:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",
    permissions: ["geolocation"],
    // 放送センター
    geolocation: { latitude: 35.6659, longitude: 139.69634 },
    // 横浜局
    //geolocation: { latitude: 35.445253, longitude: 139.646238 },
    locale: "ja_JP",
    timezoneId: "Asia/Tokyo",
    bypassCSP: true,
    launchOptions: {
      args: ["--disable-web-security"],
    },
    ignoreHTTPSErrors: true,
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: "chromium",
      use: {
        //...devices["iPhone 15"],
        ...devices["Desktop Chrome"],
        // iPhone 16e (iOS 26.3) を想定したUser Agentと画面サイズに上書き
        userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 26_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.3 Mobile/15E148 Safari/604.1",
        viewport: { width: 393, height: 852 },
      },
    },
  ],
};
