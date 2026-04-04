import { type Page, type Locator } from '@playwright/test'

export class DashboardPage {
  readonly page: Page
  readonly heading: Locator

  constructor(page: Page) {
    this.page = page
    this.heading = page.getByRole('heading', { name: /Welcome back/i })
  }

  async waitForLoad(): Promise<void> {
    await this.page.waitForURL('/dashboard')
    await this.heading.waitFor({ state: 'visible' })
  }

  async goToNewChallenge(): Promise<void> {
    await this.page.goto('/dashboard/new/challenge')
  }
}
