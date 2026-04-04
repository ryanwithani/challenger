import { expect } from '@playwright/test'
import { test as authenticatedTest } from '../fixtures/auth.fixture'
import { ChallengeWizardPage } from '../pages/challenge-wizard.page'

authenticatedTest.describe('Create Challenge', () => {
  let wizard: ChallengeWizardPage

  authenticatedTest.beforeEach(async ({ authenticatedPage }) => {
    wizard = new ChallengeWizardPage(authenticatedPage)
    // Clear any auto-saved wizard state from previous tests
    await wizard.goto()
    await wizard.clearWizardLocalStorage()
    await wizard.goto()
  })

  authenticatedTest(
    'legacy challenge with default config creates successfully',
    async ({ authenticatedPage }) => {
      authenticatedTest.setTimeout(60_000)

      const challengeName = `E2E Legacy Default ${Date.now()}`

      await wizard.fillBasicInfo(challengeName)
      await wizard.clickNext()

      // Step 2: config — wait for transition then accept all defaults
      await expect(
        authenticatedPage.getByRole('heading', { name: 'Legacy Challenge Configuration' })
      ).toBeVisible()
      await wizard.clickNext()

      // Step 3: summary — submit
      await expect(
        authenticatedPage.getByRole('heading', { name: 'Review Your Challenge' })
      ).toBeVisible()
      await wizard.clickCreate()

      await wizard.waitForChallengeCreated()

      // Assert welcome modal is visible
      await expect(wizard.welcomeModal).toBeVisible()
      await expect(wizard.welcomeModal.getByText(/is ready!/)).toBeVisible()

      // Assert challenge name appears in the page heading
      await expect(wizard.challengeNameHeading).toContainText(challengeName)
    }
  )

  authenticatedTest(
    'legacy challenge with non-default config creates successfully',
    async ({ authenticatedPage }) => {
      authenticatedTest.setTimeout(60_000)

      const challengeName = `E2E Legacy Custom ${Date.now()}`

      await wizard.fillBasicInfo(challengeName, 'A challenge with custom rules.')
      await wizard.clickNext()

      // Step 2: select non-default options across all sections
      await wizard.selectLegacyConfig({
        start_type: 'extreme',
        gender_law: 'equality',
        bloodline_law: 'modern',
        heir_selection: 'random',
        species_rule: 'occult_allowed',
        lifespan: 'long',
      })
      await wizard.clickNext()

      // Step 3: summary — verify key non-default values are shown
      await expect(
        authenticatedPage.getByRole('heading', { name: 'Review Your Challenge' })
      ).toBeVisible()
      await expect(authenticatedPage.getByText('Extreme')).toBeVisible()
      await expect(authenticatedPage.getByText('Equality')).toBeVisible()

      await wizard.clickCreate()
      await wizard.waitForChallengeCreated()

      await expect(wizard.welcomeModal).toBeVisible()
      await expect(wizard.challengeNameHeading).toContainText(challengeName)
    }
  )

  authenticatedTest(
    'back navigation preserves entered data',
    async ({ authenticatedPage }) => {
      const challengeName = `E2E Legacy Back ${Date.now()}`

      await wizard.fillBasicInfo(challengeName)
      await wizard.clickNext()

      // Step 2: config — proceed to summary without changes
      await wizard.clickNext()

      // Step 3: summary — go back to config
      await wizard.clickBack()
      await expect(
        authenticatedPage.getByRole('heading', { name: 'Legacy Challenge Configuration' })
      ).toBeVisible()

      // Config step — go back to basic info
      await wizard.clickBack()
      await expect(
        authenticatedPage.getByRole('heading', { name: 'Choose Your Challenge' })
      ).toBeVisible()

      // Name should still be populated from wizard state
      await expect(wizard.nameInput).toHaveValue(challengeName)
    }
  )

  authenticatedTest('empty name blocks progression and shows error', async () => {
    // Click Next without filling name
    await wizard.clickNext()

    await expect(wizard.nameError).toBeVisible()
    await expect(wizard.nameError).toContainText('Challenge name is required')

    // Still on step 1
    await expect(
      wizard.page.getByRole('heading', { name: 'Choose Your Challenge' })
    ).toBeVisible()
  })

  authenticatedTest('name input enforces 100 character maximum', async () => {
    const overLimit = 'A'.repeat(101)
    await wizard.nameInput.fill(overLimit)

    const actualValue = await wizard.nameInput.inputValue()
    expect(actualValue.length).toBe(100)
  })

  authenticatedTest('cancel without data navigates immediately to dashboard', async ({ authenticatedPage }) => {
    // Do not fill anything before cancelling
    await wizard.clickCancel()

    await authenticatedPage.waitForURL('/dashboard')
    expect(authenticatedPage.url()).toContain('/dashboard')

    // Inline confirm should never have appeared
    await expect(wizard.discardButton).not.toBeVisible()
  })

  authenticatedTest('cancel with data shows inline confirm then discards', async ({ authenticatedPage }) => {
    await wizard.fillBasicInfo('E2E Cancel Test')
    await wizard.clickCancel()

    // Inline confirm replaces the Cancel button
    await expect(wizard.discardButton).toBeVisible()
    await expect(wizard.keepEditingButton).toBeVisible()

    await wizard.discardButton.click()

    await authenticatedPage.waitForURL('/dashboard')
    expect(authenticatedPage.url()).toContain('/dashboard')
  })

  authenticatedTest('cancel with data — dismiss keeps wizard open with data intact', async () => {
    const challengeName = 'E2E Cancel Dismiss'

    await wizard.fillBasicInfo(challengeName)
    await wizard.clickCancel()

    await expect(wizard.discardButton).toBeVisible()

    await wizard.keepEditingButton.click()

    // Inline confirm dismissed — should still be on wizard
    expect(wizard.page.url()).toContain('/dashboard/new/challenge')
    await expect(wizard.nameInput).toHaveValue(challengeName)
  })
})
