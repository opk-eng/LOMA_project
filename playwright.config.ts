import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  // Always re-create the isolated E2E database before tests run, so the suite
  // is deterministic no matter how Playwright is invoked.
  globalSetup: './tests/e2e/global-setup.ts',
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
  webServer: {
    command: 'npm run start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 180000,
    // Isolated test database — never touch the dev database.
    // Relax the login rate limiter so the E2E suite (which logs in many
    // times against one process) doesn't get permanently locked out.
    env: {
      NODE_ENV: 'production',
      DATABASE_URL: 'file:./test.db',
      LOGIN_RATE_LIMIT_MAX_ATTEMPTS: '100',
      LOGIN_RATE_LIMIT_WINDOW_MS: '60000',
    },
  },
  timeout: 60000,
  expect: {
    timeout: 10000,
  },
})
