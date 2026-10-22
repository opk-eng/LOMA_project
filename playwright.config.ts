import { defineConfig, devices } from '@playwright/test'
import { resolve } from 'node:path'

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
    // Pass DATABASE_URL directly in the command to ensure Next.js uses the test database
    command: `DATABASE_URL=file:${resolve(process.cwd(), 'test.db')} LOGIN_RATE_LIMIT_MAX_ATTEMPTS=100 LOGIN_RATE_LIMIT_WINDOW_MS=60000 npm run dev`,
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 180000,
  },
  timeout: 60000,
  expect: {
    timeout: 10000,
  },
})
