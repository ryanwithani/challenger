import { test, expect } from '@playwright/test'
import { test as authenticatedTest, expect as authExpect } from '../fixtures/auth.fixture'
import { LoginPage } from '../pages/login.page'
import { DashboardPage } from '../pages/dashboard.page'

const TEST_EMAIL = process.env.E2E_TEST_EMAIL!
const TEST_PASSWORD = process.env.E2E_TEST_PASSWORD!

test.describe('Login Flow', () => {
  let loginPage: LoginPage

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page)
    await loginPage.goto()
  })

  test('successful login redirects to dashboard', async ({ page }) => {
    await loginPage.login(TEST_EMAIL, TEST_PASSWORD)

    const dashboardPage = new DashboardPage(page)
    await dashboardPage.waitForLoad()

    expect(page.url()).toContain('/dashboard')
  })

  test('invalid credentials show error message', async ({ page }) => {
    await loginPage.login('wrong@example.com', 'wrongpassword123')

    await expect(loginPage.errorMessage).toBeVisible({ timeout: 10_000 })
    await expect(loginPage.errorMessage).toContainText(/invalid|failed/i)

    // Should stay on the landing page
    expect(page.url()).not.toContain('/dashboard')
  })

  test('empty email prevents form submission', async ({ page }) => {
    // Fill only password, leave email empty
    await loginPage.passwordInput.fill('somepassword')
    await loginPage.signInButton.click()

    // Browser validation prevents submission — no navigation occurs
    expect(page.url()).not.toContain('/dashboard')

    // The email input should report a validation error
    const validationMessage = await loginPage.emailInput.evaluate(
      (el: HTMLInputElement) => el.validationMessage
    )
    expect(validationMessage).not.toBe('')
  })

  test('empty password prevents form submission', async ({ page }) => {
    // Fill only email, leave password empty
    await loginPage.emailInput.fill('test@example.com')
    await loginPage.signInButton.click()

    // Browser validation prevents submission — no navigation occurs
    expect(page.url()).not.toContain('/dashboard')

    // The password input should report a validation error
    const validationMessage = await loginPage.passwordInput.evaluate(
      (el: HTMLInputElement) => el.validationMessage
    )
    expect(validationMessage).not.toBe('')
  })

  test('shows loading state during sign in', async ({ page }) => {
    // Slow down the signin API response so we can observe the loading state
    await page.route('**/api/auth/signin', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 2_000))
      await route.continue()
    })

    await loginPage.emailInput.fill(TEST_EMAIL)
    await loginPage.passwordInput.fill(TEST_PASSWORD)
    await loginPage.signInButton.click()

    // Once loading activates, the button text changes from "Sign In" to "Signing in..."
    // so the original locator won't match. Use the submit button locator instead.
    const submitButton = page.locator('button[type="submit"]')
    await expect(submitButton).toBeDisabled()
    await expect(submitButton).toContainText('Signing in...')

    // Wait for navigation to complete
    await page.waitForURL('/dashboard', { timeout: 15_000 })
  })

  test('CSRF protection rejects tampered tokens', async ({ page }) => {
    // Intercept CSRF token endpoint and return garbage
    await page.route('**/api/csrf-token', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ token: 'invalid-not-hex-and-wrong-length' }),
      })
    })

    await loginPage.login(TEST_EMAIL, TEST_PASSWORD)

    // The signin request should fail due to CSRF validation
    await expect(loginPage.errorMessage).toBeVisible({ timeout: 10_000 })

    // Should not redirect to dashboard
    expect(page.url()).not.toContain('/dashboard')
  })

  authenticatedTest('already authenticated user can still visit landing page', async ({
    authenticatedPage,
  }) => {
    // The landing page "/" is NOT in the middleware's AUTH_PAGES list,
    // so authenticated users can still access it.
    // Only /login and /register redirect authenticated users to /dashboard.
    await authenticatedPage.goto('/')

    // Should load the landing page, not redirect
    const heading = authenticatedPage.getByRole('heading', { name: 'Sign In' })
    await expect(heading).toBeVisible()
  })
})
