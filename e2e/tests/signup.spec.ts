import { test, expect } from '@playwright/test'
import { SignupPage } from '../pages/signup.page'
import { deleteTestUser } from '../fixtures/cleanup'

// Generate unique email per test run to avoid collisions
const TEST_RUN_ID = Date.now()
const SIGNUP_EMAIL = `e2e-signup-${TEST_RUN_ID}@test.com`
const VALID_PASSWORD = 'TestPass123!@#'
const VALID_USERNAME = `e2euser${TEST_RUN_ID % 100000}`

test.describe('Signup Flow', () => {
  let signupPage: SignupPage

  test.beforeEach(async ({ page }) => {
    signupPage = new SignupPage(page)
    await signupPage.goto()
  })

  test.describe('Field Validation', () => {
    test('username too short shows error', async () => {
      await signupPage.usernameInput.fill('ab')
      await signupPage.usernameInput.blur()

      await expect(signupPage.usernameError).toBeVisible()
      await expect(signupPage.usernameError).toContainText('at least 3 characters')
    })

    test('username with invalid characters shows error', async () => {
      await signupPage.usernameInput.fill('user name!')
      await signupPage.usernameInput.blur()

      await expect(signupPage.usernameError).toBeVisible()
      await expect(signupPage.usernameError).toContainText('lowercase letters, numbers')
    })

    test('reserved username shows error', async () => {
      await signupPage.usernameInput.fill('admin')
      await signupPage.usernameInput.blur()

      await expect(signupPage.usernameError).toBeVisible()
      await expect(signupPage.usernameError).toContainText('reserved')
    })

    test('invalid email shows error', async () => {
      await signupPage.emailInput.fill('not-an-email')
      await signupPage.emailInput.blur()

      await expect(signupPage.emailError).toBeVisible()
    })

    test('email with common domain typo shows error', async () => {
      await signupPage.emailInput.fill('user@gmial.com')
      await signupPage.emailInput.blur()

      await expect(signupPage.emailError).toBeVisible()
      await expect(signupPage.emailError).toContainText('typos')
    })

    test('password too short shows error', async () => {
      await signupPage.passwordInput.fill('Short1!')
      await signupPage.passwordInput.blur()

      await expect(signupPage.passwordError).toBeVisible()
      await expect(signupPage.passwordError).toContainText('at least 12 characters')
    })

    test('password missing uppercase shows error', async () => {
      await signupPage.passwordInput.fill('testpassword1!')
      await signupPage.passwordInput.blur()

      await expect(signupPage.passwordError).toBeVisible()
      await expect(signupPage.passwordError).toContainText('uppercase')
    })

    test('submit with all empty fields shows validation errors', async ({ page }) => {
      await signupPage.submit()

      // At least username and email errors should appear
      const errorCount = await page.locator('p.text-red-600').count()
      expect(errorCount).toBeGreaterThanOrEqual(2)
    })
  })

  test.describe('Password Strength Checklist', () => {
    test('shows checklist when password field is focused with text', async () => {
      await signupPage.passwordInput.focus()
      await signupPage.passwordInput.fill('a')

      await expect(signupPage.passwordChecklist).toBeVisible()
      // Should show all 5 rules
      await expect(signupPage.passwordChecklist).toContainText('characters')
      await expect(signupPage.passwordChecklist).toContainText('Uppercase')
      await expect(signupPage.passwordChecklist).toContainText('Lowercase')
      await expect(signupPage.passwordChecklist).toContainText('Number')
      await expect(signupPage.passwordChecklist).toContainText('Symbol')
    })

    test('checklist updates as password meets requirements', async ({ page }) => {
      await signupPage.passwordInput.focus()
      await signupPage.passwordInput.fill('abcdefghijklA1!')

      // All rules should be satisfied (green) — check for green text color class
      const greenRules = page.locator('.space-y-1.text-sm .text-green-600')
      await expect(greenRules).toHaveCount(5)
    })
  })

  test.describe('CSRF Protection', () => {
    test('tampered CSRF token prevents signup', async ({ page }) => {
      await page.route('**/api/csrf-token', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ token: 'invalid-garbage-token' }),
        })
      })

      const [signupResponse] = await Promise.all([
        page.waitForResponse('**/api/auth/signup'),
        signupPage.fillAndSubmit('testuser', 'test@example.com', VALID_PASSWORD),
      ])

      expect(signupResponse.status()).toBe(403)
      await expect(signupPage.globalError).toBeVisible({ timeout: 5_000 })
    })
  })

  test.describe('Loading State', () => {
    test('shows loading state during signup submission', async ({ page }) => {
      // Slow down the signup API to observe loading state
      await page.route('**/api/auth/signup', async (route) => {
        await new Promise((resolve) => setTimeout(resolve, 2_000))
        await route.continue()
      })

      await signupPage.fillForm(VALID_USERNAME, SIGNUP_EMAIL, VALID_PASSWORD)

      const [signupRequest] = await Promise.all([
        page.waitForRequest('**/api/auth/signup'),
        signupPage.submit(),
      ])

      // Request is in-flight → loading state must be active
      const submitButton = page.locator('button[type="submit"]')
      await expect(submitButton).toBeDisabled()
      await expect(submitButton).toContainText('Validating...')

      // Wait for the delayed request to finish to avoid test leakage
      await signupRequest.response()
    })
  })

  test.describe('Successful Signup', () => {
    test.afterEach(async () => {
      // Clean up the test user created during signup
      await deleteTestUser(SIGNUP_EMAIL)
    })

    test('valid signup advances to pack selection step', async ({ page }) => {
      await signupPage.fillAndSubmit(VALID_USERNAME, SIGNUP_EMAIL, VALID_PASSWORD)

      // After successful account creation, the wizard advances to Step 2 (Choose Packs)
      // The step indicator or content should reflect the next step
      await expect(page.getByText('Choose Packs')).toBeVisible({ timeout: 15_000 })
    })
  })
})
