# Challenge Wizard Polish — Design Spec

**Date:** 2026-04-03
**Scope:** Three UX improvements to the challenge creation wizard

---

## Overview

Three medium-priority improvements to `src/components/challenge/forms/challenge-wizard/`:

1. **Fade transition** between wizard steps
2. **Inline cancel confirmation** when the user has unsaved progress
3. **Loading state** on the Summary step during submit

---

## 1. FadeTransition Component

**File:** `src/components/ui/FadeTransition.tsx`

A generic wrapper that fades content out and back in when its `stepKey` changes. Used to smooth step-to-step navigation in the wizard.

### Props

| Prop | Type | Description |
|------|------|-------------|
| `stepKey` | `number` | Changes when the step changes — triggers the fade cycle |
| `children` | `React.ReactNode` | The step content to display |

### Behaviour

- On `stepKey` change: set `visible = false` → after 120ms swap children → set `visible = true`
- CSS: `transition-opacity duration-[120ms] ease-in-out`
- No external dependency — pure React state + CSS

### Usage in ChallengeWizard

Wrap the step content block:

```tsx
<FadeTransition stepKey={currentStep}>
  {currentStep === 1 && <BasicInfoStep ... />}
  {currentStep === 2 && <ConfigurationStep ... />}
  {/* etc. */}
</FadeTransition>
```

---

## 2. InlineConfirm Component

**File:** `src/components/ui/InlineConfirm.tsx`

A compact inline confirm UI — no modal, no overlay. Renders in place of the Cancel button when the user attempts to cancel with unsaved progress.

### Props

| Prop | Type | Default |
|------|------|---------|
| `message` | `string` | required |
| `onConfirm` | `() => void` | required |
| `onCancel` | `() => void` | required |
| `confirmLabel` | `string` | `"Discard"` |
| `cancelLabel` | `string` | `"Keep editing"` |

### Appearance

- Small rounded box, muted background (`bg-gray-50 dark:bg-warmGray-800`)
- Message text + two buttons side by side
- Confirm: `destructive` button variant
- Dismiss: `ghost` button variant

### ChallengeWizard changes

- Add `showCancelConfirm: boolean` state (default `false`)
- In the Cancel button's `onClick`:
  - If `wizardData.basicInfo` exists (step 1 has been completed): set `showCancelConfirm = true` instead of calling `handleCancel`
  - Otherwise (no data yet): call `handleCancel` directly
- When `showCancelConfirm` is true: render `<InlineConfirm>` in place of the Cancel button
- `onConfirm`: clear localStorage keys + call `onCancel()`
- `onCancel` (dismiss): set `showCancelConfirm = false`

---

## 3. SummaryStep Loading State

**File:** `src/components/challenge/forms/challenge-wizard/SummaryStep.tsx`

No new component. Two targeted changes when `loading` is true:

1. **Back button**: add `disabled={loading}` — currently missing, allows double-navigation
2. **Status text**: below the button row, when `loading` is true, render:
   ```
   "Creating your challenge..."
   ```
   in `text-sm text-brand-500` — subtle, matches brand color

The summary content remains fully visible throughout so the user can see what they submitted.

---

## Files Changed

| File | Change |
|------|--------|
| `src/components/ui/FadeTransition.tsx` | New component |
| `src/components/ui/InlineConfirm.tsx` | New component |
| `src/components/challenge/forms/challenge-wizard/ChallengeWizard.tsx` | Add `showCancelConfirm` state, wrap steps in `FadeTransition`, swap Cancel button for `InlineConfirm` when active |
| `src/components/challenge/forms/challenge-wizard/SummaryStep.tsx` | `disabled={loading}` on Back button, status text when loading |

---

## Out of Scope

- Slide animation (fade was chosen)
- Full-screen overlay confirm modal
- Skeleton placeholder replacing summary content
- Any changes to `BasicInfoStep` or `ConfigurationStep`
