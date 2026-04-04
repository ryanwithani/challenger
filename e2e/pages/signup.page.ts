import { type Page, type Locator } from '@playwright/test'

export class SignupPage {
  readonly page: Page
  readonly heading: Locator
  readonly usernameInput: Locator
  readonly emailInput: Locator
  readonly passwordInput: Locator
  readonly submitButton: Locator
  readonly usernameError: Locator
  readonly emailError: Locator
  readonly passwordError: Locator
  readonly globalError: Locator
  readonly signInLink: Locator
  readonly passwordChecklist: Locator

  constructor(page: Page) {
    this.page = page
    this.heading = page.getByRole('heading', { name: 'Welcome to Challenger!' })
    this.usernameInput = page.getByPlaceholder('SimFan_92')
    this.emailInput = page.getByPlaceholder('you@example.com')
    this.passwordInput = page.getByPlaceholder(/at least 12 characters/i)
    this.submitButton = page.getByRole('button', { name: 'Continue' })
    // Field errors: each field is in a <div> containing a <Label> and error <p>
    this.usernameError = page.locator('div:has(> label[for="username"]) > p.text-red-600')
    this.emailError = page.locator('div:has(> label[for="email"]) > p.text-red-600')
    // Password error renders inside PasswordInput as <p class="text-xs text-red-600">
    this.passwordError = page.locator('div:has(> label[for="password"])').locator('p.text-red-600')
    // Global error renders in a red banner div
    this.globalError = page.locator('div.bg-red-50 p.text-red-800')
    this.signInLink = page.getByRole('button', { name: 'Sign In' })
    // Password validation checklist appears when focused with text
    this.passwordChecklist = page.locator('.space-y-1.text-sm')
  }

  async goto(): Promise<void> {
    await this.page.goto('/signup')
    await this.heading.waitFor({ state: 'visible' })
  }

  async fillForm(username: string, email: string, password: string): Promise<void> {
    await this.usernameInput.fill(username)
    await this.emailInput.fill(email)
    await this.passwordInput.fill(password)
  }

  async submit(): Promise<void> {
    await this.submitButton.click()
  }

  async fillAndSubmit(username: string, email: string, password: string): Promise<void> {
    await this.fillForm(username, email, password)
    await this.submit()
  }
}
