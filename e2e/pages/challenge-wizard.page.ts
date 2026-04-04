import { type Page, type Locator } from '@playwright/test'

type LegacyConfigOptions = {
  start_type?: 'regular' | 'extreme' | 'ultra_extreme'
  gender_law?: string
  bloodline_law?: string
  heir_selection?: string
  species_rule?: string
  lifespan?: string
}

export class ChallengeWizardPage {
  readonly page: Page
  // Step 1 — BasicInfo
  readonly nameInput: Locator
  readonly descriptionInput: Locator
  readonly nextButton: Locator
  readonly cancelButton: Locator
  readonly nameError: Locator
  // Step 2/3 — Navigation
  readonly backButton: Locator
  // Step 3 — Summary
  readonly createButton: Locator
  // Cancel inline confirm
  readonly discardButton: Locator
  readonly keepEditingButton: Locator
  // Post-creation
  readonly challengeNameHeading: Locator
  readonly welcomeModal: Locator

  constructor(page: Page) {
    this.page = page
    this.nameInput = page.locator('input[name="name"]')
    this.descriptionInput = page.locator('textarea[name="description"]')
    this.nextButton = page.getByRole('button', { name: /^Next:/ })
    this.cancelButton = page.getByRole('button', { name: 'Cancel' })
    this.nameError = page.locator('p.text-red-600')
    this.backButton = page.getByRole('button', { name: 'Back' })
    this.createButton = page.getByRole('button', { name: 'Create Challenge' })
    this.discardButton = page.getByRole('button', { name: 'Discard' })
    this.keepEditingButton = page.getByRole('button', { name: 'Keep editing' })
    this.challengeNameHeading = page.locator('main h1')
    this.welcomeModal = page.getByRole('dialog')
  }

  async goto(): Promise<void> {
    await this.page.goto('/dashboard/new/challenge')
    await this.page.waitForURL('/dashboard/new/challenge')
  }

  async clearWizardLocalStorage(): Promise<void> {
    await this.page.evaluate(() => {
      localStorage.removeItem('challenge_wizard_progress')
      localStorage.removeItem('challenge_wizard_basic_info')
      localStorage.removeItem('challenge_wizard_config')
    })
  }

  async fillBasicInfo(name: string, description?: string): Promise<void> {
    await this.nameInput.fill(name)
    if (description !== undefined) {
      await this.descriptionInput.fill(description)
    }
  }

  private async selectRadioByValue(fieldName: string, value: string): Promise<void> {
    await this.page
      .locator(`label:has(input[name="${fieldName}"][value="${value}"])`)
      .click()
  }

  private async expandCollapsibleSection(sectionTitle: string): Promise<void> {
    const trigger = this.page.getByRole('button', { name: sectionTitle })
    const state = await trigger.getAttribute('data-state')
    if (state !== 'open') {
      await trigger.click()
    }
  }

  async selectLegacyConfig(options: LegacyConfigOptions): Promise<void> {
    if (options.start_type) {
      await this.selectRadioByValue('start_type', options.start_type)
    }
    if (options.gender_law) {
      // Gender Law collapsible is open by default
      await this.selectRadioByValue('gender_law', options.gender_law)
    }
    if (options.bloodline_law) {
      await this.expandCollapsibleSection('Bloodline Law')
      await this.selectRadioByValue('bloodline_law', options.bloodline_law)
    }
    if (options.heir_selection) {
      await this.expandCollapsibleSection('Heir Selection Method')
      await this.selectRadioByValue('heir_selection', options.heir_selection)
    }
    if (options.species_rule) {
      await this.expandCollapsibleSection('Species Rule')
      await this.selectRadioByValue('species_rule', options.species_rule)
    }
    if (options.lifespan) {
      await this.expandCollapsibleSection('Lifespan Setting')
      await this.selectRadioByValue('lifespan', options.lifespan)
    }
  }

  async clickNext(): Promise<void> {
    await this.nextButton.click()
  }

  async clickBack(): Promise<void> {
    await this.backButton.click()
  }

  async clickCancel(): Promise<void> {
    await this.cancelButton.click()
  }

  async clickCreate(): Promise<void> {
    await this.createButton.click()
  }

  async waitForChallengeCreated(): Promise<void> {
    await this.page.waitForURL(/\/challenge\/[^/]+/, { timeout: 30_000 })
    await this.welcomeModal.waitFor({ state: 'visible', timeout: 10_000 })
  }
}
