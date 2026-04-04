import { type Page, type Locator } from '@playwright/test'

export class LoginPage {
  readonly page: Page
  readonly emailInput: Locator
  readonly passwordInput: Locator
  readonly signInButton: Locator
  readonly errorMessage: Locator
  readonly forgotPasswordLink: Locator
  readonly signUpLink: Locator
  readonly heading: Locator

  constructor(page: Page) {
    this.page = page
    this.emailInput = page.getByPlaceholder('Email')
    this.passwordInput = page.getByPlaceholder('Password')
    this.signInButton = page.getByRole('button', { name: 'Sign In' })
    this.errorMessage = page.locator('p.text-red-500')
    this.forgotPasswordLink = page.getByRole('button', { name: 'Forgot password?' })
    this.signUpLink = page.getByRole('link', { name: 'Sign up' })
    this.heading = page.getByRole('heading', { name: 'Sign In' })
  }

  async goto(): Promise<void> {
    await this.page.goto('/')
    await this.heading.waitFor({ state: 'visible' })
  }

  async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email)
    await this.passwordInput.fill(password)
    await this.signInButton.click()
  }
}
