# Challenge Wizard Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add fade transitions between wizard steps, an inline cancel confirmation when progress exists, and a loading state on the Summary step.

**Architecture:** Two new generic UI components (`FadeTransition`, `InlineConfirm`) wired into the existing challenge wizard. `ChallengeWizard` gains `showCancelConfirm` state. `BasicInfoStep` receives three new optional props to render the confirm UI. `SummaryStep` gets two small loading-state fixes.

**Tech Stack:** React 18, TypeScript, Tailwind CSS, Jest + @testing-library/react

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `src/components/ui/FadeTransition.tsx` | Create | Fades content out/in on stepKey change |
| `src/components/ui/InlineConfirm.tsx` | Create | Compact inline confirm UI (no overlay) |
| `src/components/challenge/forms/challenge-wizard/BasicInfoStep.tsx` | Modify | Accept cancel-confirm props, render InlineConfirm when active |
| `src/components/challenge/forms/challenge-wizard/ChallengeWizard.tsx` | Modify | Add showCancelConfirm state, wire FadeTransition and InlineConfirm |
| `src/components/challenge/forms/challenge-wizard/SummaryStep.tsx` | Modify | Disable Back when loading, show status text |
| `src/__tests__/components/ui/FadeTransition.test.tsx` | Create | Unit tests for FadeTransition |
| `src/__tests__/components/ui/InlineConfirm.test.tsx` | Create | Unit tests for InlineConfirm |
| `src/__tests__/components/challenge/BasicInfoStep.test.tsx` | Create | Unit tests for cancel-confirm props |
| `src/__tests__/components/challenge/SummaryStep.test.tsx` | Create | Unit tests for loading state |

---

## Task 1: FadeTransition component

**Files:**
- Create: `src/components/ui/FadeTransition.tsx`
- Create: `src/__tests__/components/ui/FadeTransition.test.tsx`

- [ ] **Step 1: Write the failing tests**

Create `src/__tests__/components/ui/FadeTransition.test.tsx`:

```tsx
import React from 'react'
import { render, screen, act } from '@testing-library/react'
import { FadeTransition } from '@/src/components/ui/FadeTransition'

describe('FadeTransition', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  test('renders children on initial mount', () => {
    render(<FadeTransition stepKey={1}><div>Step 1 content</div></FadeTransition>)
    expect(screen.getByText('Step 1 content')).toBeDefined()
  })

  test('is visible on initial mount', () => {
    const { container } = render(
      <FadeTransition stepKey={1}><div>Content</div></FadeTransition>
    )
    expect(container.firstChild).toHaveClass('opacity-100')
  })

  test('becomes invisible immediately when stepKey changes', () => {
    const { container, rerender } = render(
      <FadeTransition stepKey={1}><div>Step 1</div></FadeTransition>
    )
    rerender(<FadeTransition stepKey={2}><div>Step 2</div></FadeTransition>)
    expect(container.firstChild).toHaveClass('opacity-0')
  })

  test('swaps children and becomes visible after 120ms', () => {
    const { container, rerender } = render(
      <FadeTransition stepKey={1}><div>Step 1</div></FadeTransition>
    )
    rerender(<FadeTransition stepKey={2}><div>Step 2</div></FadeTransition>)

    act(() => { jest.advanceTimersByTime(120) })

    expect(screen.getByText('Step 2')).toBeDefined()
    expect(container.firstChild).toHaveClass('opacity-100')
  })

  test('clears pending timer on unmount', () => {
    const { rerender, unmount } = render(
      <FadeTransition stepKey={1}><div>Step 1</div></FadeTransition>
    )
    rerender(<FadeTransition stepKey={2}><div>Step 2</div></FadeTransition>)
    // Should not throw when unmounted mid-transition
    expect(() => unmount()).not.toThrow()
  })
})
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npx jest src/__tests__/components/ui/FadeTransition.test.tsx --no-coverage
```

Expected: FAIL — "Cannot find module '@/src/components/ui/FadeTransition'"

- [ ] **Step 3: Implement FadeTransition**

Create `src/components/ui/FadeTransition.tsx`:

```tsx
'use client'

import { useState, useEffect, useRef } from 'react'

interface FadeTransitionProps {
  stepKey: number
  children: React.ReactNode
}

export function FadeTransition({ stepKey, children }: FadeTransitionProps) {
  const [visible, setVisible] = useState(true)
  const [displayedChildren, setDisplayedChildren] = useState(children)
  const pendingChildren = useRef(children)

  useEffect(() => {
    pendingChildren.current = children
    setVisible(false)
    const timer = setTimeout(() => {
      setDisplayedChildren(pendingChildren.current)
      setVisible(true)
    }, 120)
    return () => clearTimeout(timer)
  // stepKey intentionally omitted from deps — we only want to trigger on stepKey change,
  // and children is captured via ref to avoid stale closure issues
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepKey])

  return (
    <div className={`transition-opacity duration-[120ms] ease-in-out ${visible ? 'opacity-100' : 'opacity-0'}`}>
      {displayedChildren}
    </div>
  )
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npx jest src/__tests__/components/ui/FadeTransition.test.tsx --no-coverage
```

Expected: PASS — 5 tests

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/FadeTransition.tsx src/__tests__/components/ui/FadeTransition.test.tsx
git commit -m "feat(ui): add FadeTransition component for wizard step animations"
```

---

## Task 2: InlineConfirm component

**Files:**
- Create: `src/components/ui/InlineConfirm.tsx`
- Create: `src/__tests__/components/ui/InlineConfirm.test.tsx`

- [ ] **Step 1: Write the failing tests**

Create `src/__tests__/components/ui/InlineConfirm.test.tsx`:

```tsx
import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { InlineConfirm } from '@/src/components/ui/InlineConfirm'

describe('InlineConfirm', () => {
  const onConfirm = jest.fn()
  const onCancel = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('renders the message', () => {
    render(
      <InlineConfirm
        message="Discard your progress?"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    )
    expect(screen.getByText('Discard your progress?')).toBeDefined()
  })

  test('renders default button labels', () => {
    render(
      <InlineConfirm
        message="Discard?"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    )
    expect(screen.getByRole('button', { name: 'Discard' })).toBeDefined()
    expect(screen.getByRole('button', { name: 'Keep editing' })).toBeDefined()
  })

  test('renders custom button labels', () => {
    render(
      <InlineConfirm
        message="Delete this?"
        onConfirm={onConfirm}
        onCancel={onCancel}
        confirmLabel="Delete"
        cancelLabel="Cancel"
      />
    )
    expect(screen.getByRole('button', { name: 'Delete' })).toBeDefined()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDefined()
  })

  test('calls onConfirm when confirm button is clicked', async () => {
    const user = userEvent.setup()
    render(
      <InlineConfirm
        message="Discard?"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    )
    await user.click(screen.getByRole('button', { name: 'Discard' }))
    expect(onConfirm).toHaveBeenCalledTimes(1)
    expect(onCancel).not.toHaveBeenCalled()
  })

  test('calls onCancel when keep-editing button is clicked', async () => {
    const user = userEvent.setup()
    render(
      <InlineConfirm
        message="Discard?"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    )
    await user.click(screen.getByRole('button', { name: 'Keep editing' }))
    expect(onCancel).toHaveBeenCalledTimes(1)
    expect(onConfirm).not.toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npx jest src/__tests__/components/ui/InlineConfirm.test.tsx --no-coverage
```

Expected: FAIL — "Cannot find module '@/src/components/ui/InlineConfirm'"

- [ ] **Step 3: Implement InlineConfirm**

Create `src/components/ui/InlineConfirm.tsx`:

```tsx
'use client'

import { Button } from '@/src/components/ui/Button'

interface InlineConfirmProps {
  message: string
  onConfirm: () => void
  onCancel: () => void
  confirmLabel?: string
  cancelLabel?: string
}

export function InlineConfirm({
  message,
  onConfirm,
  onCancel,
  confirmLabel = 'Discard',
  cancelLabel = 'Keep editing',
}: InlineConfirmProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg bg-gray-50 dark:bg-warmGray-800 border border-gray-200 dark:border-warmGray-700 px-4 py-2">
      <span className="text-sm text-gray-700 dark:text-warmGray-300 flex-1">{message}</span>
      <Button variant="ghost" size="sm" type="button" onClick={onCancel}>
        {cancelLabel}
      </Button>
      <Button variant="destructive" size="sm" type="button" onClick={onConfirm}>
        {confirmLabel}
      </Button>
    </div>
  )
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npx jest src/__tests__/components/ui/InlineConfirm.test.tsx --no-coverage
```

Expected: PASS — 5 tests

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/InlineConfirm.tsx src/__tests__/components/ui/InlineConfirm.test.tsx
git commit -m "feat(ui): add InlineConfirm component for inline cancel confirmation"
```

---

## Task 3: Update BasicInfoStep — cancel confirm props

**Files:**
- Modify: `src/components/challenge/forms/challenge-wizard/BasicInfoStep.tsx`
- Create: `src/__tests__/components/challenge/BasicInfoStep.test.tsx`

- [ ] **Step 1: Write the failing tests**

Create `src/__tests__/components/challenge/BasicInfoStep.test.tsx`:

```tsx
import React from 'react'
import { render, screen } from '@testing-library/react'
import { BasicInfoStep } from '@/src/components/challenge/forms/challenge-wizard/BasicInfoStep'

// CHALLENGE_TEMPLATES drives rendered options; mock to keep tests isolated
jest.mock('@/src/data/challenge-templates', () => ({
  CHALLENGE_TEMPLATES: [
    { value: 'legacy', label: 'Legacy Challenge', description: 'The classic legacy challenge', needsConfiguration: true },
    { value: 'custom', label: 'Custom', description: 'Build your own', needsConfiguration: false },
  ],
}))

const onNext = jest.fn()
const onCancel = jest.fn()
const onConfirmCancel = jest.fn()
const onDismissCancelConfirm = jest.fn()

beforeEach(() => jest.clearAllMocks())

describe('BasicInfoStep — cancel confirm', () => {
  test('renders Cancel button when showCancelConfirm is false', () => {
    render(
      <BasicInfoStep
        data={undefined}
        onNext={onNext}
        onCancel={onCancel}
        showCancelConfirm={false}
        onConfirmCancel={onConfirmCancel}
        onDismissCancelConfirm={onDismissCancelConfirm}
      />
    )
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDefined()
    expect(screen.queryByText('Discard your progress?')).toBeNull()
  })

  test('renders InlineConfirm when showCancelConfirm is true', () => {
    render(
      <BasicInfoStep
        data={undefined}
        onNext={onNext}
        onCancel={onCancel}
        showCancelConfirm={true}
        onConfirmCancel={onConfirmCancel}
        onDismissCancelConfirm={onDismissCancelConfirm}
      />
    )
    expect(screen.queryByRole('button', { name: 'Cancel' })).toBeNull()
    expect(screen.getByText('Discard your progress?')).toBeDefined()
    expect(screen.getByRole('button', { name: 'Discard' })).toBeDefined()
    expect(screen.getByRole('button', { name: 'Keep editing' })).toBeDefined()
  })

  test('InlineConfirm Discard button calls onConfirmCancel', async () => {
    const { default: userEvent } = await import('@testing-library/user-event')
    const user = userEvent.setup()
    render(
      <BasicInfoStep
        data={undefined}
        onNext={onNext}
        onCancel={onCancel}
        showCancelConfirm={true}
        onConfirmCancel={onConfirmCancel}
        onDismissCancelConfirm={onDismissCancelConfirm}
      />
    )
    await user.click(screen.getByRole('button', { name: 'Discard' }))
    expect(onConfirmCancel).toHaveBeenCalledTimes(1)
  })

  test('InlineConfirm Keep editing button calls onDismissCancelConfirm', async () => {
    const { default: userEvent } = await import('@testing-library/user-event')
    const user = userEvent.setup()
    render(
      <BasicInfoStep
        data={undefined}
        onNext={onNext}
        onCancel={onCancel}
        showCancelConfirm={true}
        onConfirmCancel={onConfirmCancel}
        onDismissCancelConfirm={onDismissCancelConfirm}
      />
    )
    await user.click(screen.getByRole('button', { name: 'Keep editing' }))
    expect(onDismissCancelConfirm).toHaveBeenCalledTimes(1)
  })
})
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npx jest src/__tests__/components/challenge/BasicInfoStep.test.tsx --no-coverage
```

Expected: FAIL — prop types don't exist yet

- [ ] **Step 3: Update BasicInfoStep**

In `src/components/challenge/forms/challenge-wizard/BasicInfoStep.tsx`:

Add import at the top (after the existing imports):
```tsx
import { InlineConfirm } from '@/src/components/ui/InlineConfirm'
```

Replace the `BasicInfoStepProps` interface:
```tsx
interface BasicInfoStepProps {
    data: BasicInfoData | undefined
    onNext: (data: BasicInfoData) => void
    onCancel: () => void
    showCancelConfirm?: boolean
    onConfirmCancel?: () => void
    onDismissCancelConfirm?: () => void
}
```

Replace the function signature:
```tsx
export function BasicInfoStep({ data, onNext, onCancel, showCancelConfirm = false, onConfirmCancel, onDismissCancelConfirm }: BasicInfoStepProps) {
```

Replace the Cancel button in the navigation section (the `<div className="flex justify-between pt-6">` block):
```tsx
            {/* Navigation */}
            <div className="flex justify-between pt-6">
                {showCancelConfirm ? (
                    <InlineConfirm
                        message="Discard your progress?"
                        onConfirm={onConfirmCancel!}
                        onCancel={onDismissCancelConfirm!}
                    />
                ) : (
                    <Button
                        variant="outline"
                        onClick={onCancel}
                        type="button"
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                )}
                <Button
                    variant="primary"
                    type="submit"
                    disabled={isSubmitting}
                    loading={isSubmitting}
                    loadingText="Validating..."
                >
                    Next: {CHALLENGE_TEMPLATES.find(t => t.value === templateType)?.needsConfiguration ? 'Configuration' : 'Review'}
                </Button>
            </div>
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npx jest src/__tests__/components/challenge/BasicInfoStep.test.tsx --no-coverage
```

Expected: PASS — 4 tests

- [ ] **Step 5: Commit**

```bash
git add src/components/challenge/forms/challenge-wizard/BasicInfoStep.tsx src/__tests__/components/challenge/BasicInfoStep.test.tsx
git commit -m "feat(wizard): add inline cancel confirmation to BasicInfoStep"
```

---

## Task 4: Update ChallengeWizard — state and wiring

**Files:**
- Modify: `src/components/challenge/forms/challenge-wizard/ChallengeWizard.tsx`

- [ ] **Step 1: Add imports and showCancelConfirm state**

In `src/components/challenge/forms/challenge-wizard/ChallengeWizard.tsx`, add these imports after the existing imports:

```tsx
import { FadeTransition } from '@/src/components/ui/FadeTransition'
```

Inside `ChallengeWizard`, add the new state after the existing `useState` declarations:

```tsx
const [showCancelConfirm, setShowCancelConfirm] = useState(false)
```

- [ ] **Step 2: Add cancel handlers**

Add these two callbacks after the existing `goBack` callback:

```tsx
  const handleCancelClick = useCallback(() => {
    if (wizardData.basicInfo) {
      setShowCancelConfirm(true)
    } else {
      handleCancel()
    }
  }, [wizardData.basicInfo, handleCancel])

  const handleConfirmCancel = useCallback(() => {
    setShowCancelConfirm(false)
    handleCancel()
  }, [handleCancel])

  const dismissCancelConfirm = useCallback(() => {
    setShowCancelConfirm(false)
  }, [])
```

- [ ] **Step 3: Wire FadeTransition around step content**

Replace the `{/* Step Content */}` block:

```tsx
      {/* Step Content */}
      <FadeTransition stepKey={currentStep}>
        <div className="mt-8">
          {currentStep === 1 && (
            <BasicInfoStep
              data={wizardData.basicInfo}
              onNext={handleBasicInfoNext}
              onCancel={handleCancelClick}
              showCancelConfirm={showCancelConfirm}
              onConfirmCancel={handleConfirmCancel}
              onDismissCancelConfirm={dismissCancelConfirm}
            />
          )}

          {currentStep === 2 && wizardData.basicInfo?.challenge_type === 'legacy' && (
            <ConfigurationStep
              challengeType={wizardData.basicInfo.challenge_type}
              data={wizardData.configuration}
              onNext={handleConfigurationNext}
              onBack={goBack}
            />
          )}

          {((currentStep === 2 && wizardData.basicInfo?.challenge_type !== 'legacy') ||
            (currentStep === 3 && wizardData.basicInfo?.challenge_type === 'legacy')) && (
            <SummaryStep
              data={wizardData}
              onSubmit={handleFinalSubmit}
              onBack={goBack}
              loading={loading}
            />
          )}
        </div>
      </FadeTransition>
```

- [ ] **Step 4: Run full wizard test suite**

```bash
npx jest src/__tests__/components/challenge/ --no-coverage
```

Expected: PASS — all tests in the challenge directory

- [ ] **Step 5: Commit**

```bash
git add src/components/challenge/forms/challenge-wizard/ChallengeWizard.tsx
git commit -m "feat(wizard): wire FadeTransition and cancel confirmation into ChallengeWizard"
```

---

## Task 5: Update SummaryStep — loading state

**Files:**
- Modify: `src/components/challenge/forms/challenge-wizard/SummaryStep.tsx`
- Create: `src/__tests__/components/challenge/SummaryStep.test.tsx`

- [ ] **Step 1: Write the failing tests**

Create `src/__tests__/components/challenge/SummaryStep.test.tsx`:

```tsx
import React from 'react'
import { render, screen } from '@testing-library/react'
import { SummaryStep } from '@/src/components/challenge/forms/challenge-wizard/SummaryStep'

jest.mock('@/src/components/sim/PackIcon', () => ({
  PackIcon: ({ packId }: { packId: string }) => <span data-testid={`pack-${packId}`} />,
}))

jest.mock('@/src/lib/utils/legacy-scoring', () => ({
  calculateLegacyScoring: jest.fn().mockReturnValue({ totalPoints: 0, breakdown: [] }),
}))

jest.mock('@/src/lib/utils/format', () => ({
  formatConfigValue: (v: string) => v,
  getDifficultyColor: () => 'bg-gray-100 text-gray-700',
}))

jest.mock('@/src/data/challenge-templates', () => ({
  CHALLENGE_TEMPLATES: [
    { value: 'legacy', label: 'Legacy Challenge', needsConfiguration: true },
    { value: 'custom', label: 'Custom', needsConfiguration: false },
  ],
}))

jest.mock('@/src/data/packs', () => ({
  getPackName: (id: string) => id,
}))

const baseData = {
  basicInfo: {
    name: 'The Smith Legacy',
    challenge_type: 'custom' as const,
    description: '',
  },
}

const onSubmit = jest.fn()
const onBack = jest.fn()

beforeEach(() => jest.clearAllMocks())

describe('SummaryStep — loading state', () => {
  test('Back button is enabled when loading is false', () => {
    render(
      <SummaryStep data={baseData} onSubmit={onSubmit} onBack={onBack} loading={false} />
    )
    expect(screen.getByRole('button', { name: 'Back' })).not.toBeDisabled()
  })

  test('Back button is disabled when loading is true', () => {
    render(
      <SummaryStep data={baseData} onSubmit={onSubmit} onBack={onBack} loading={true} />
    )
    expect(screen.getByRole('button', { name: 'Back' })).toBeDisabled()
  })

  test('shows status text when loading is true', () => {
    render(
      <SummaryStep data={baseData} onSubmit={onSubmit} onBack={onBack} loading={true} />
    )
    expect(screen.getByText('Creating your challenge...')).toBeDefined()
  })

  test('does not show status text when loading is false', () => {
    render(
      <SummaryStep data={baseData} onSubmit={onSubmit} onBack={onBack} loading={false} />
    )
    expect(screen.queryByText('Creating your challenge...')).toBeNull()
  })
})
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npx jest src/__tests__/components/challenge/SummaryStep.test.tsx --no-coverage
```

Expected: FAIL — Back button not disabled and status text missing

- [ ] **Step 3: Update SummaryStep**

In `src/components/challenge/forms/challenge-wizard/SummaryStep.tsx`, replace the Navigation section:

```tsx
            {/* Navigation */}
            <div className="flex flex-col gap-2 pt-6">
                <div className="flex justify-between">
                    <Button variant="outline" onClick={onBack} disabled={loading}>
                        Back
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        loading={loading}
                        loadingText="Creating Challenge..."
                        variant="primary"
                    >
                        Create Challenge
                    </Button>
                </div>
                {loading && (
                    <p className="text-sm text-brand-500 text-right">Creating your challenge...</p>
                )}
            </div>
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npx jest src/__tests__/components/challenge/SummaryStep.test.tsx --no-coverage
```

Expected: PASS — 4 tests

- [ ] **Step 5: Run the full test suite**

```bash
npx jest --no-coverage
```

Expected: PASS — all tests

- [ ] **Step 6: Commit**

```bash
git add src/components/challenge/forms/challenge-wizard/SummaryStep.tsx src/__tests__/components/challenge/SummaryStep.test.tsx
git commit -m "feat(wizard): disable Back and show status text during challenge creation"
```
