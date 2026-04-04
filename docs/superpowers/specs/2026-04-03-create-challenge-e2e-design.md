# E2E Tests: Create Challenge — Design Spec

**Date:** 2026-04-03  
**Status:** Approved

---

## Context

The challenge creation flow is a 3-step wizard at `/dashboard/new/challenge`. It is authenticated-only. Currently only the Legacy template is selectable; all others show "Coming Soon". The wizard auto-saves progress to localStorage and clears it on submit or cancel.

---

## Architecture

### New files

| File | Purpose |
|------|---------|
| `e2e/pages/challenge-wizard.page.ts` | Page Object Model for the wizard and post-creation challenge page |
| `e2e/tests/create-challenge.spec.ts` | Test spec |

### Existing files used

- `e2e/fixtures/auth.fixture.ts` — provides `authenticatedPage` fixture (already handles login)
- `e2e/pages/dashboard.page.ts` — extended to add a `goToNewChallenge()` navigation helper

---

## Page Object: `ChallengeWizardPage`

Encapsulates all wizard interactions. Locators use accessible roles and labels wherever possible (consistent with `LoginPage`).

**Locators:**
- `nameInput` — text input for challenge name
- `descriptionInput` — textarea for description
- `nextButton` — "Next: ..." button
- `backButton` — "Back" button
- `cancelButton` — "Cancel" button
- `inlineConfirmDiscard` — "Discard your progress?" confirmation button
- `inlineConfirmKeep` — dismiss button inside inline confirm
- `createButton` — "Create Challenge" button on summary step
- `progressSteps` — nav list items for step indicators
- `challengeNameHeading` — heading on the challenge detail page after redirect
- `welcomeModal` — the welcome modal shown via `?showWelcome=true`

**Methods:**
- `goto()` — navigates to `/dashboard/new/challenge`
- `fillBasicInfo(name, description?)` — fills name, optional description; legacy template is pre-selected
- `selectLegacyConfig(options)` — selects start_type, and optionally gender_law, bloodline_law, heir_selection, species_rule, lifespan via radio inputs
- `clickNext()` — clicks the Next button
- `clickBack()` — clicks the Back button
- `clickCancel()` — clicks Cancel
- `confirmCancel()` — clicks "Discard" in the inline confirm
- `dismissCancel()` — clicks the keep/dismiss button in the inline confirm
- `clickCreate()` — clicks "Create Challenge" on summary
- `waitForChallengeCreated()` — waits for URL to match `/challenge/:id` and the welcome modal to appear

`selectLegacyConfig` expands each Collapsible section before clicking the radio, since Bloodline/Heir/Species/Lifespan are collapsed by default.

---

## Test Cases

### `create-challenge.spec.ts`

All tests use `authenticatedTest` from `auth.fixture.ts`.

**1. Legacy challenge with defaults → redirects and shows welcome modal**
- Navigate to wizard
- Fill name only (use defaults for all configuration)
- Next → Next (config step with defaults) → Next (summary) → Create
- Assert: URL matches `/challenge/:id`
- Assert: Welcome modal visible
- Assert: Challenge name visible on page

**2. Legacy challenge with non-default config → reflected in summary and created**
- Fill name
- Next
- Select `extreme` difficulty, `equal` gender law, `democratic` bloodline law, `democratic` heir selection, `occult_only` species rule, `long` lifespan
- Next → summary shows "Extreme" difficulty and non-default values
- Create → redirect + welcome modal + name on page

**3. Back navigation preserves data**
- Fill name, click Next (reaches config step)
- Click Next (reaches summary)
- Click Back → should be on config step
- Click Back → should be on basic info step with name still populated

**4. Name validation — empty**
- Navigate to wizard
- Do not fill name, click Next
- Assert: name error message visible
- Assert: still on step 1

**5. Name too long (boundary)**
- Fill name with 101 characters (one over the maxLength=100 limit)
- The `maxLength` HTML attribute prevents input beyond 100, so assert field value length is exactly 100

**6. Cancel without any data → immediate redirect**
- Navigate to wizard (do not fill anything)
- Click Cancel
- Assert: URL is `/dashboard`
- Assert: no inline confirm appeared

**7. Cancel with data → inline confirm → confirm discard → redirect**
- Fill name, then click Cancel
- Assert: inline confirm ("Discard your progress?") is visible
- Click "Discard"
- Assert: URL is `/dashboard`

**8. Cancel with data → inline confirm → dismiss → stay on wizard**
- Fill name, then click Cancel
- Assert: inline confirm visible
- Click the dismiss button
- Assert: still on `/dashboard/new/challenge`
- Assert: name input still has the entered value

---

## Data Strategy

Tests use unique challenge names per run via a timestamp suffix (e.g. `E2E Legacy ${Date.now()}`) to avoid collisions. No teardown is required for now — test data accumulates in the Supabase test project.

---

## Cleanup / localStorage

The wizard auto-saves to localStorage. Tests should clear relevant keys in `beforeEach` via `page.evaluate(() => localStorage.clear())` to prevent prior test state from affecting step restoration.

---

## Out of Scope

- Testing the challenge detail page beyond name visibility and welcome modal
- Non-legacy templates (disabled in UI)
- Offline / network error scenarios during creation
