import { defineConfig, devices } from '@playwright/test'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, 'e2e/.env.e2e') })

const IS_CI = !!process.env.CI

export default defineConfig({
  testDir: './e2e/tests',
  timeout: 30_000,
  retries: IS_CI ? 2 : 0,
  workers: 1,
  reporter: IS_CI ? 'html' : [['html', { open: 'never' }], ['list']],
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
  ],
  webServer: {
    command: IS_CI ? 'npm start' : 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !IS_CI,
    timeout: 120_000,
  },
})
