# Challenge Sim Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the sim management flow on the challenge detail page so users can create a new sim (via the full wizard) or link an existing sim (via a dropdown), and rename "Add Sim" to "Create Sim" on the `/sims` page.

**Architecture:** New `AddSimModal` component presents a choice modal (create new vs link existing). A new `linkExistingSim` store action handles the DB update. The sim wizard gains `?challenge=ID` support for post-creation redirect. All changes are wired through the existing challenge detail page, replacing the current `SimForm` modal.

**Tech Stack:** Next.js 15 App Router, Zustand, Supabase, Tailwind CSS, Jest

---

### Task 1: Rename "Add Sim" to "Create Sim" on `/sims` page

Trivial text change. Two button labels need updating.

**Files:**
- Modify: `src/app/(protected)/sims/SimsClient.tsx:110` and `:344`

- [ ] **Step 1: Change the empty state button label**

In `src/app/(protected)/sims/SimsClient.tsx`, line 110, change:

```tsx
<Button size="sm">Add Sim</Button>
```

to:

```tsx
<Button size="sm">Create Sim</Button>
```

- [ ] **Step 2: Change the toolbar button label**

Same file, line 344, change:

```tsx
<Button size="sm">Add Sim</Button>
```

to:

```tsx
<Button size="sm">Create Sim</Button>
```

- [ ] **Step 3: Verify visually**

```bash
npm run dev
```

Navigate to `/sims` — both buttons should say "Create Sim". Navigate to a challenge page — "Add Sim" button should still say "Add Sim" (unchanged).

- [ ] **Step 4: Commit**

```bash
git add src/app/\(protected\)/sims/SimsClient.tsx
git commit -m "feat: rename 'Add Sim' to 'Create Sim' on /sims page"
```

---

### Task 2: Add `linkExistingSim` store action + tests

Add the store action first so `AddSimModal` (Task 3) can call it. Follow TDD — write tests first.

**Files:**
- Modify: `src/lib/store/challengeStore.ts:98` (type), `:415` (implementation)
- Modify: `src/__tests__/unit/challengeStore.test.ts:481` (tests)

- [ ] **Step 1: Write the failing tests**

In `src/__tests__/unit/challengeStore.test.ts`, add a new describe block **before** the final closing `})` at line 481 (inside the top-level `describe('challengeStore', ...)`):

```typescript
    describe('linkExistingSim', () => {
        beforeEach(() => {
            useChallengeStore.setState({
                ...initialState,
                currentChallenge: { id: 'challenge-1' } as any,
                sims: [],
                goals: [],
            })
            ;(createSupabaseBrowserClient as jest.Mock).mockReturnValue(mockSupabase)
        })

        test('updates sim challenge_id and adds to local state', async () => {
            const linkedSim = {
                id: 'sim-99',
                name: 'Bella Goth',
                challenge_id: 'challenge-1',
                age_stage: 'young_adult',
            }

            // Mock the update().eq().select().single() chain
            const mockLinkSingle = jest.fn().mockResolvedValue({ data: linkedSim, error: null })
            const mockLinkSelect = jest.fn().mockReturnValue({ single: mockLinkSingle })
            const mockLinkEq = jest.fn().mockReturnValue({ select: mockLinkSelect })
            const mockLinkUpdate = jest.fn().mockReturnValue({ eq: mockLinkEq })
            mockSupabase.from.mockReturnValueOnce({ update: mockLinkUpdate })

            await useChallengeStore.getState().linkExistingSim('sim-99', 'challenge-1')

            expect(mockLinkUpdate).toHaveBeenCalledWith({ challenge_id: 'challenge-1' })
            expect(mockLinkEq).toHaveBeenCalledWith('id', 'sim-99')
            expect(useChallengeStore.getState().sims).toHaveLength(1)
            expect(useChallengeStore.getState().sims[0].id).toBe('sim-99')
        })

        test('throws on supabase error', async () => {
            const mockLinkSingle = jest.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } })
            const mockLinkSelect = jest.fn().mockReturnValue({ single: mockLinkSingle })
            const mockLinkEq = jest.fn().mockReturnValue({ select: mockLinkSelect })
            const mockLinkUpdate = jest.fn().mockReturnValue({ eq: mockLinkEq })
            mockSupabase.from.mockReturnValueOnce({ update: mockLinkUpdate })

            await expect(
                useChallengeStore.getState().linkExistingSim('sim-99', 'challenge-1')
            ).rejects.toThrow('DB error')

            expect(useChallengeStore.getState().sims).toHaveLength(0)
        })
    })
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx jest src/__tests__/unit/challengeStore.test.ts --verbose --testNamePattern="linkExistingSim"
```

Expected: FAIL — `linkExistingSim` is not a function.

- [ ] **Step 3: Add the type declaration**

In `src/lib/store/challengeStore.ts`, add after line 98 (`getSimAchievements`):

```typescript
  linkExistingSim: (simId: string, challengeId: string) => Promise<void>
```

- [ ] **Step 4: Add the implementation**

In `src/lib/store/challengeStore.ts`, add after the `addSim` action (after line 415):

```typescript
  linkExistingSim: async (simId: string, challengeId: string) => {
    try {
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase
        .from('sims')
        .update({ challenge_id: challengeId })
        .eq('id', simId)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        set({ sims: [...get().sims, data] });
        await get().recalculateAutoGoals();
      }
    } catch (error) {
      throw error;
    }
  },
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
npx jest src/__tests__/unit/challengeStore.test.ts --verbose --testNamePattern="linkExistingSim"
```

Expected: 2 tests PASS.

- [ ] **Step 6: Run full test suite for regressions**

```bash
npx jest src/__tests__/unit/challengeStore.test.ts --verbose
```

Expected: All tests PASS.

- [ ] **Step 7: Commit**

```bash
git add src/lib/store/challengeStore.ts src/__tests__/unit/challengeStore.test.ts
git commit -m "feat: add linkExistingSim store action with tests"
```

---

### Task 3: Create `AddSimModal` component

A modal that presents two options: "Create New Sim" (navigates to wizard) or "Link Existing Sim" (shows dropdown of user's sims). Uses the existing `Modal` component from `src/components/sim/SimModal.tsx`.

**Files:**
- Create: `src/components/challenge/AddSimModal.tsx`

- [ ] **Step 1: Create the component**

Create `src/components/challenge/AddSimModal.tsx`:

```tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Modal } from '@/src/components/sim/SimModal'
import { Button } from '@/src/components/ui/Button'
import { useChallengeStore } from '@/src/lib/store/challengeStore'
import { createSupabaseBrowserClient } from '@/src/lib/supabase/client'
import { useAuthStore } from '@/src/lib/store/authStore'
import { toast } from '@/src/lib/store/toastStore'

interface AddSimModalProps {
  open: boolean
  onClose: () => void
  challengeId: string
}

interface SimOption {
  id: string
  name: string
  challenge_id: string | null
  challengeName?: string
}

type View = 'choice' | 'link'

export function AddSimModal({ open, onClose, challengeId }: AddSimModalProps) {
  const router = useRouter()
  const { user } = useAuthStore()
  const sims = useChallengeStore(state => state.sims)
  const linkExistingSim = useChallengeStore(state => state.linkExistingSim)

  const [view, setView] = useState<View>('choice')
  const [simOptions, setSimOptions] = useState<SimOption[]>([])
  const [selectedSimId, setSelectedSimId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [linking, setLinking] = useState(false)

  const currentSimIds = sims.map(s => s.id)
  const selectedSim = simOptions.find(s => s.id === selectedSimId)

  const fetchSims = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setFetchError(null)

    try {
      const supabase = createSupabaseBrowserClient()

      const { data: allSims, error: simsError } = await supabase
        .from('sims')
        .select('id, name, challenge_id')
        .eq('user_id', user.id)

      if (simsError) throw simsError

      // Fetch challenge names for sims linked to other challenges
      const otherChallengeIds = [
        ...new Set(
          (allSims || [])
            .filter(s => s.challenge_id && s.challenge_id !== challengeId)
            .map(s => s.challenge_id as string)
        ),
      ]

      let challengeNames: Record<string, string> = {}
      if (otherChallengeIds.length > 0) {
        const { data: challenges } = await supabase
          .from('challenges')
          .select('id, name')
          .in('id', otherChallengeIds)

        if (challenges) {
          challengeNames = Object.fromEntries(challenges.map(c => [c.id, c.name]))
        }
      }

      const options: SimOption[] = (allSims || [])
        .filter(s => !currentSimIds.includes(s.id))
        .map(s => ({
          ...s,
          challengeName: s.challenge_id ? challengeNames[s.challenge_id] : undefined,
        }))

      setSimOptions(options)
    } catch {
      setFetchError('Failed to load sims. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [user, challengeId, currentSimIds])

  useEffect(() => {
    if (open && view === 'link') {
      fetchSims()
    }
  }, [open, view, fetchSims])

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setView('choice')
      setSelectedSimId(null)
      setSimOptions([])
      setFetchError(null)
    }
  }, [open])

  function handleCreateNew() {
    onClose()
    router.push(`/dashboard/new/sim?challenge=${challengeId}`)
  }

  async function handleConfirmLink() {
    if (!selectedSimId) return
    setLinking(true)
    try {
      await linkExistingSim(selectedSimId, challengeId)
      onClose()
    } catch {
      toast.error('Failed to link sim. Please try again.')
    } finally {
      setLinking(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Add Sim">
      {view === 'choice' && (
        <div className="space-y-3">
          <p className="text-sm text-warmGray-600 dark:text-warmGray-400 mb-4">
            How would you like to add a sim to this challenge?
          </p>
          <Button variant="outline" className="w-full justify-start" onClick={handleCreateNew}>
            Create New Sim
          </Button>
          <Button variant="outline" className="w-full justify-start" onClick={() => setView('link')}>
            Link Existing Sim
          </Button>
        </div>
      )}

      {view === 'link' && (
        <div className="space-y-4">
          {loading && (
            <p className="text-sm text-warmGray-500 dark:text-warmGray-400">Loading sims...</p>
          )}

          {fetchError && (
            <div className="space-y-2">
              <p className="text-sm text-red-600 dark:text-red-400">{fetchError}</p>
              <Button size="sm" variant="outline" onClick={fetchSims}>
                Retry
              </Button>
            </div>
          )}

          {!loading && !fetchError && simOptions.length === 0 && (
            <div className="text-center py-4 space-y-3">
              <p className="text-sm text-warmGray-500 dark:text-warmGray-400">
                You don't have any sims yet.
              </p>
              <Button size="sm" onClick={handleCreateNew}>
                Create a Sim
              </Button>
            </div>
          )}

          {!loading && !fetchError && simOptions.length > 0 && (
            <>
              <select
                className="w-full rounded-lg border border-gray-300 dark:border-warmGray-600 bg-white dark:bg-warmGray-800 text-warmGray-900 dark:text-warmGray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                value={selectedSimId || ''}
                onChange={(e) => setSelectedSimId(e.target.value || null)}
              >
                <option value="">Select a sim...</option>
                {simOptions.map(sim => (
                  <option key={sim.id} value={sim.id}>
                    {sim.name}{sim.challengeName ? ` (${sim.challengeName})` : ''}
                  </option>
                ))}
              </select>

              {selectedSim?.challengeName && (
                <p className="text-sm text-amber-600 dark:text-amber-400">
                  This sim is currently in {selectedSim.challengeName}. Linking it here will remove it from that challenge.
                </p>
              )}

              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  className="text-sm text-brand-500 hover:text-brand-600 dark:hover:text-brand-400"
                  onClick={() => { setView('choice'); setSelectedSimId(null) }}
                >
                  Back
                </button>
                <Button
                  size="sm"
                  onClick={handleConfirmLink}
                  disabled={!selectedSimId || linking}
                >
                  {linking ? 'Linking...' : 'Confirm'}
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </Modal>
  )
}
```

- [ ] **Step 2: Verify the component compiles**

```bash
npm run type-check
```

Expected: No new type errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/challenge/AddSimModal.tsx
git commit -m "feat: add AddSimModal component for create/link sim choice"
```

---

### Task 4: Wire `AddSimModal` into challenge page

Replace `SimForm` modal with `AddSimModal` in both the legacy and non-legacy branches of the challenge page.

**Files:**
- Modify: `src/app/(protected)/challenge/[id]/page.tsx`

- [ ] **Step 1: Update imports**

In `src/app/(protected)/challenge/[id]/page.tsx`, replace the `SimForm` import (line 10):

```tsx
import { SimForm } from '@/src/components/forms/SimForm'
```

with:

```tsx
import { AddSimModal } from '@/src/components/challenge/AddSimModal'
```

- [ ] **Step 2: Rename state variable**

Replace the state declaration (line 58):

```tsx
const [showSimForm, setShowSimForm] = useState(false)
```

with:

```tsx
const [showAddSimModal, setShowAddSimModal] = useState(false)
```

- [ ] **Step 3: Update `handleAddSim` callback**

Replace line 54:

```tsx
const handleAddSim = useCallback(() => setShowSimForm(true), [])
```

with:

```tsx
const handleAddSim = useCallback(() => setShowAddSimModal(true), [])
```

- [ ] **Step 4: Update URL param handler**

Replace the `?action=add-sim` handler (lines 73-74):

```tsx
    if (action === 'add-sim') {
      setShowSimForm(true)
```

with:

```tsx
    if (action === 'add-sim') {
      setShowAddSimModal(true)
```

- [ ] **Step 5: Replace legacy branch SimForm modal**

Replace the legacy SimForm modal block (lines 224-239):

```tsx
        <Modal
          open={showSimForm}
          onClose={() => setShowSimForm(false)}
          title="Add New Sim"
        >
          <SimForm
            onSubmit={async (data) => {
              await addSim({
                ...data,
                challenge_id: challengeId,
                career: data.career ? String(data.career) : null
              })
              setShowSimForm(false)
            }}
          />
        </Modal>
```

with:

```tsx
        <AddSimModal
          open={showAddSimModal}
          onClose={() => setShowAddSimModal(false)}
          challengeId={challengeId}
        />
```

- [ ] **Step 6: Replace non-legacy branch SimForm modal**

Replace the non-legacy SimForm modal block (lines 338-353):

```tsx
      <Modal
        open={showSimForm}
        onClose={() => setShowSimForm(false)}
        title="Add New Sim"
      >
        <SimForm
          onSubmit={async (data) => {
            await addSim({
              ...data,
              challenge_id: challengeId,
              career: data.career ? String(data.career) : null
            })
            setShowSimForm(false)
          }}
        />
      </Modal>
```

with:

```tsx
      <AddSimModal
        open={showAddSimModal}
        onClose={() => setShowAddSimModal(false)}
        challengeId={challengeId}
      />
```

- [ ] **Step 7: Remove unused `addSim` reference**

The `addSim` callback (line 46) is no longer used in this file since `AddSimModal` calls `linkExistingSim` internally and the create flow navigates to the wizard. Remove:

```tsx
const addSim = useCallback(useChallengeStore.getState().addSim, [])
```

- [ ] **Step 8: Verify types and build**

```bash
npm run type-check
```

Expected: No type errors. If `addSim` is still referenced elsewhere in the file (e.g., LegacyTracker), keep it. Otherwise remove.

- [ ] **Step 9: Verify visually**

```bash
npm run dev
```

Navigate to a challenge page. Click "Add Sim" — should see the choice modal with "Create New Sim" and "Link Existing Sim" options, not the old SimForm.

- [ ] **Step 10: Commit**

```bash
git add src/app/\(protected\)/challenge/\[id\]/page.tsx
git commit -m "feat: replace SimForm modal with AddSimModal on challenge page"
```

---

### Task 5: Wire `?challenge=ID` into sim wizard

When the sim wizard is accessed with `?challenge=ID`, pre-fill the challenge and redirect back to the challenge page after creation.

**Files:**
- Modify: `src/app/(protected)/dashboard/new/sim/NewSimClient.tsx`
- Modify: `src/components/sim/form/SimWizard.tsx:14-18` (props), `:43` (state init)

- [ ] **Step 1: Read `challenge` param in `NewSimClient`**

In `src/app/(protected)/dashboard/new/sim/NewSimClient.tsx`, add `useSearchParams` to the import and read the param. Replace:

```tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
```

with:

```tsx
'use client'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
```

Then inside the component, after line 13 (`const router = useRouter()`), add:

```tsx
  const searchParams = useSearchParams()
  const challengeId = searchParams.get('challenge')
```

- [ ] **Step 2: Update redirect logic**

Replace the success redirect (lines 37-39):

```tsx
      setTimeout(() => {
        router.push(`/sim/${data.id}`);
      }, 1500);
```

with:

```tsx
      setTimeout(() => {
        if (challengeId) {
          router.push(`/challenge/${challengeId}`);
        } else {
          router.push(`/sim/${data.id}`);
        }
      }, 1500);
```

- [ ] **Step 3: Update cancel navigation**

Replace the cancel handler (lines 47-49):

```tsx
  const handleCancel = () => {
    router.push('/sims')
  }
```

with:

```tsx
  const handleCancel = () => {
    if (challengeId) {
      router.push(`/challenge/${challengeId}`)
    } else {
      router.push('/sims')
    }
  }
```

- [ ] **Step 4: Pass `defaultChallengeId` to `SimWizard`**

Replace the `SimWizard` usage (lines 69-73):

```tsx
          <SimWizard
            onSubmit={handleFinalSubmit}
            onCancel={handleCancel}
            loading={isSubmitting}
          />
```

with:

```tsx
          <SimWizard
            onSubmit={handleFinalSubmit}
            onCancel={handleCancel}
            loading={isSubmitting}
            defaultChallengeId={challengeId}
          />
```

- [ ] **Step 5: Wrap component with Suspense**

`useSearchParams` requires a `Suspense` boundary in Next.js App Router. The `NewSimClient` component is already a client component rendered by a server page. Check if the parent page (`src/app/(protected)/dashboard/new/sim/page.tsx`) wraps it in `Suspense`. If not, wrap the `NewSimClient` usage in the parent page:

```tsx
import { Suspense } from 'react'
import NewSimClient from './NewSimClient'

export default function NewSimPage() {
  return (
    <Suspense fallback={<div className="text-center py-12"><p className="text-gray-500 dark:text-warmGray-400">Loading...</p></div>}>
      <NewSimClient />
    </Suspense>
  )
}
```

If it's already wrapped, skip this sub-step.

- [ ] **Step 6: Accept `defaultChallengeId` prop in `SimWizard`**

In `src/components/sim/form/SimWizard.tsx`, update the props interface (lines 14-18):

```typescript
interface SimWizardProps {
  onSubmit: (data: SimInsert) => void | Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}
```

to:

```typescript
interface SimWizardProps {
  onSubmit: (data: SimInsert) => void | Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  defaultChallengeId?: string | null;
}
```

- [ ] **Step 7: Destructure the new prop**

Update the function signature (line 39):

```typescript
export function SimWizard({ onSubmit, onCancel, loading }: SimWizardProps) {
```

to:

```typescript
export function SimWizard({ onSubmit, onCancel, loading, defaultChallengeId }: SimWizardProps) {
```

- [ ] **Step 8: Use `defaultChallengeId` in initial state**

Update the `wizardData` initial state (line 43):

```typescript
    basicInfo: { firstName: '', familyName: '', age_stage: 'young_adult', avatar_url: null, challenge_id: null },
```

to:

```typescript
    basicInfo: { firstName: '', familyName: '', age_stage: 'young_adult', avatar_url: null, challenge_id: defaultChallengeId || null },
```

- [ ] **Step 9: Verify types**

```bash
npm run type-check
```

Expected: No type errors.

- [ ] **Step 10: Verify the full flow**

```bash
npm run dev
```

1. Navigate to a challenge page
2. Click "Add Sim" -> "Create New Sim"
3. Should land on `/dashboard/new/sim?challenge={id}`
4. Complete the wizard
5. Should redirect back to `/challenge/{id}`
6. The new sim should be visible

- [ ] **Step 11: Commit**

```bash
git add src/app/\(protected\)/dashboard/new/sim/NewSimClient.tsx src/components/sim/form/SimWizard.tsx
git commit -m "feat: wire ?challenge=ID into sim wizard for challenge-context creation"
```

If the parent page needed a Suspense wrapper (Step 5), also add that file:

```bash
git add src/app/\(protected\)/dashboard/new/sim/page.tsx
git commit --amend --no-edit
```
