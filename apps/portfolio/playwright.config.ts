import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e/flows',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  // Own port (the dashboard's e2e uses 4173), so the two never test each other's server.
  use: {
    baseURL: 'http://localhost:4273',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'pnpm build && pnpm start --port 4273',
    url: 'http://localhost:4273',
    reuseExistingServer: !process.env.CI,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
