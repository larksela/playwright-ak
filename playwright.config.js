// playwright.config.js
// @ts-check
const { devices } = require('@playwright/test');

/** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 2,
  //retries: 2,
  use: {
    //trace: 'on-first-retry',
    baseURL: 'https://www.stream.cz',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    
    /*
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    */

    /*
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    */
  ],
};


module.exports = config;