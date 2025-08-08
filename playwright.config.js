// Playwright configuration for this project
// Base URL must be http://localhost per project rules
// Note: Ensure Apache/XAMPP is running so pages are available at http://localhost

/** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
  testDir: 'test',
  use: {
    baseURL: 'http://localhost',
    viewport: { width: 1280, height: 800 },
    trace: 'retain-on-failure',
  },
};

module.exports = config;

