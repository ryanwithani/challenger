import { test as base, type Page } from '@playwright/test'
import { LoginPage } from '../pages/login.page'
import { DashboardPage } from '../pages/dashboard.page'

export const test = base.extend<{ authenticatedPage: Page }>({
  authenticatedPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page)
    await loginPage.goto()
    await loginPage.login(
      process.env.E2E_TEST_EMAIL!,
      process.env.E2E_TEST_PASSWORD!
    )

    const dashboardPage = new DashboardPage(page)
    await dashboardPage.waitForLoad()

    await use(page)
  },
})

export { expect } from '@playwright/test'
