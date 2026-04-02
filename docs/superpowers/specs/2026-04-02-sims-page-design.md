# /sims Page Design Spec

**Date:** 2026-04-02  
**Status:** Approved — ready for implementation planning  
**Branch:** `desktop-version`

---

## Overview

A top-level `/sims` route that replaces the nested `/dashboard/sims` sub-page. Serves as both a sim management hub (search, sort, filter, bulk actions) and an exploration tool (grouped by challenge, family lineage table). A slide-out detail panel allows browsing sim details without leaving the collection.

---

## Prerequisites (must land before this page is built)

1. **SimCard interactive model refactor** — The current `SimCard` is an `<article>` with a full-card `onClick`. Before any work on this page, move "open panel" to a dedicated button inside the card body so the selection checkbox and the panel trigger are sibling controls (not nested interactives). This is its own task.

2. **SimOverview migration** — Task 6 of the active `challenge_sims` migration. `SimOverview` still references the old join-table mental model. Since the detail panel links to `/sim/[id]` (which renders `SimOverview`), this must land before or alongside the `/sims` page to avoid inconsistency.

---

## Route

`/sims` under `src/app/(protected)/sims/`

Replaces `/dashboard/sims`. The sidebar "Sims" nav item `href` changes to `/sims`.

---

## Page Architecture

### Files

| File | Type | Purpose |
|------|------|---------|
| `src/app/(protected)/sims/page.tsx` | Server component | Metadata, initial SSR data fetch, seeds store via `setSims` |
| `src/app/(protected)/sims/SimsClient.tsx` | Client component | Tab + state orchestration |
| `src/components/sim/SimsToolbar.tsx` | Client component | Search, sort, filter, Select button |
| `src/components/sim/BulkActionBar.tsx` | Client component | Floating bar for bulk operations |
| `src/components/sim/SimDetailPanel.tsx` | Client component | Slide-out drawer / bottom sheet |
| `src/components/sim/ByChallengeView.tsx` | Client component | Grouped collapsible sections |
| `src/components/sim/FamilyTreeView.tsx` | Client component | Challenge selector + generation table |

### Modified Files

| File | Change |
|------|--------|
| `src/app/(protected)/dashboard/DashboardClient.tsx` | Sims tab becomes read-only preview (max 8 sims, "View all" link) |
| `src/components/layout/Sidebar.tsx` | `href` for Sims nav item → `/sims` |
| `src/app/(protected)/dashboard/new/sim/NewSimClient.tsx` | Cancel handler redirect → `/sims` |
| `src/lib/constants.ts` | Add `SIMS_TABS` constant; update dashboard overview section |

### Deleted Files

| File | Reason |
|------|--------|
| `src/app/(protected)/dashboard/sims/page.tsx` | Replaced by top-level `/sims` route |

---

## Data Flow

### Initial Load (SSR)
`sims/page.tsx` (server component) fetches all sims for the authenticated user via `createSupabaseServerClient()`, then passes them as props to `SimsClient`. `SimsClient` calls `useSimStore.getState().setSims(initialSims)` in its first render to seed the store. This eliminates the loading flash on initial page load — matching the pattern in `DashboardClient`.

### Client-Side Data
- `useSimStore.fetchAllSims()` is called on mount to ensure the store is fresh (no-op if just seeded; adds a `lastFetched` timestamp to the store to gate re-fetches, same pattern as `challengeStore`).
- `useChallengeStore.fetchChallenges()` called on mount — used by By Challenge tab and Family Tree tab. Uses the store's existing 5-minute cache.
- All mutations call `useSimStore` methods only (`assignToChallenge`, `unassignFromChallenge`, `updateSim`, `deleteSim`). No direct Supabase calls in page components.

### Store Note
`simStore` stores all user sims in a field currently named `familyMembers`. This is aliased as `allSims` at usage sites (`const { familyMembers: allSims } = useSimStore()`). This naming inconsistency is pre-existing and not in scope to fix here — document the alias in component comments.

---

## State Management (`SimsClient`)

```ts
// URL search params (persistent, shareable)
tab: 'all' | 'by-challenge' | 'family-tree'  // ?tab=all
sortBy: SortKey                               // ?sort=name-asc
filters: { heirs: boolean, hasTraits: boolean, challengeId: string | null }  // ?filter=heirs&challengeId=...

// Local state (ephemeral)
searchQuery: string
selectedSimIds: Record<string, true>          // NOT Set — plain object for safe React equality
activePanelSimId: string | null
isBulkMode: boolean
```

**Mutual exclusion rule:** `isBulkMode` and `activePanelSimId !== null` cannot both be true. Entering bulk mode closes any open panel. Opening a panel exits bulk mode (clears `selectedSimIds`, sets `isBulkMode: false`).

**Memoization requirements:**
- `filteredSims` — `useMemo` keyed on `[allSims, searchQuery, sortBy, filters.heirs, filters.hasTraits, filters.challengeId]` (use primitive values as deps, not function references — avoids always-recomputing)
- `groupedByChallengeOrUnassigned` — `useMemo` keyed on `[filteredSims, challenges]`
- `familyTreeData` — `useMemo` keyed on `[filteredSims, selectedFamilyTreeChallengeId]`
- `panelNavigation` — `useMemo` returning `{ index, prevId, nextId }` keyed on `[filteredSims, activePanelSimId]`
- All child components that receive handler props: wrap in `memo`. Pass handlers via `useCallback`.

**Sort keys:**
```ts
type SortKey = 'name-asc' | 'name-desc' | 'newest' | 'oldest' | 'generation-asc' | 'generation-desc'
```

---

## Page Shell

`PageShell` (note: the component at `src/components/layout/GridPageShell.tsx` exports as `PageShell`, not `GridPageShell`).

- `title="Sims"`
- `actions`: "Add Sim" button (primary variant) → navigates to `/dashboard/new/sim`

---

## Tabs

Three tabs below the `PageShell` header. Tab strip follows the `DashboardClient` pattern for ARIA semantics — **not** the shared `Tabs` component (which lacks `role="tablist"` / `role="tab"` / `aria-selected`):

```tsx
<div role="tablist" aria-label="Sims views">
  {SIMS_TABS.map(tab => (
    <button
      key={tab.id}
      id={`tab-${tab.id}`}
      role="tab"
      aria-selected={activeTab === tab.id}
      aria-controls={`tabpanel-${tab.id}`}
      onClick={() => setTab(tab.id)}
    >
      {tab.label}
    </button>
  ))}
</div>
<div id={`tabpanel-${activeTab}`} role="tabpanel" aria-labelledby={`tab-${activeTab}`}>
  {/* active tab content */}
</div>
```

Tab labels: `All Sims` | `By Challenge` | `Family Tree`

Constant in `src/lib/constants.ts`:
```ts
export const SIMS_TABS = [
  { id: 'all', label: 'All Sims' },
  { id: 'by-challenge', label: 'By Challenge' },
  { id: 'family-tree', label: 'Family Tree' },
] as const
```

---

## SimsToolbar

Single-row sticky toolbar (below tabs). No second row of filter chips — all controls in one horizontal band.

**Left side:**
- Search input — placeholder "Search by name, career, aspiration…", `w-full max-w-xs`
- Sort dropdown — options: Name (A–Z), Name (Z–A), Newest first, Oldest first, Generation ↑, Generation ↓
- Filter dropdown — contains: "Heirs only" toggle, "Has traits" toggle, challenge filter (dropdown within dropdown, or a segmented group). "Clear filters" at bottom of dropdown when any filter is active.

**Right side:**
- "Select" button (ghost variant) — enters bulk mode, sets `isBulkMode: true`. Changes to "Cancel" when bulk mode is active.

**Shared across all tabs.** Filter and sort state persists when switching tabs (stored in URL params).

---

## Tab 1: All Sims

Responsive grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`, `gap-4`.

Uses existing `SimCard` (post-refactor). Checkboxes visible when `isBulkMode: true`.

Clicking a card's "open panel" button: sets `activePanelSimId`, opens `SimDetailPanel`.
Clicking a card's checkbox: toggles `selectedSimIds[sim.id]`.

**Empty state:** "No sims yet. Add your first sim to start tracking your legacy." + "Add Sim" CTA.  
**No results state:** "No sims match your filters." + "Clear filters" link.

---

## Tab 2: By Challenge

Collapsible sections, one per challenge that has sims assigned, plus "Unassigned Sims" at the bottom.

**Section header:**
- Challenge name (left, `font-display text-base font-semibold`)
- Sim count badge (`bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300`)
- Challenge type + status badge
- Expand/collapse chevron (right)

Sections expanded by default. Collapse state is local to `ByChallengeView` (resets on tab switch — acceptable).

**Unassigned Sims section:**
- Header: `text-warmGray-500 dark:text-warmGray-400` (muted, signals secondary status)
- Border: solid `border-warmGray-200 dark:border-warmGray-700` — **not** dashed (dashed signals empty state, not organizational state)
- Same grid layout as main section

Same SimCard grid inside each section. Search/filter/sort from toolbar applies within each group.

---

## Tab 3: Family Tree

**Challenge selector dropdown** at the top of the tab:
- Populated from challenges where `allSims.some(s => s.challenge_id === challenge.id)`
- Defaults to first active challenge that has sims, if any
- **Empty state (no challenges with sims):** "Create a challenge and assign sims to see the family tree." + link to `/dashboard/new/challenge`

**Lineage table:**

| Generation | Name | Age Stage | Role | Career | Aspiration |
|---|---|---|---|---|---|

- Rows grouped under generation header rows: "Generation 1", "Generation 2", etc.
- Sims with `generation = null` grouped under "Unknown Generation" with a note: "Set a generation number on these sims to organise them."
- Within each generation: heir row first, then others alphabetically
- Heir row: `bg-brand-50 dark:bg-brand-900/20` highlight. Heir badge on name cell. (Dark mode: verify `brand-900/20` contrast — use `brand-900/30` if needed)
- Rows are clickable (open `SimDetailPanel`). `cursor-pointer hover:bg-warmGray-50 dark:hover:bg-warmGray-800/50`

**Future upgrade path:** The table is the rendering layer only. Data derivation (`familyTreeData` memo) is decoupled from presentation so a visual tree component can replace the table without touching data logic.

---

## SimDetailPanel

### Layout

**Desktop:** Fixed right drawer, `w-[420px]`, full viewport height, `z-30`. Semi-transparent backdrop (`bg-black/40`) covers the rest of the page. Drawer slides in from right (`translate-x-0` → `translate-x-full`).

**Mobile:** Bottom sheet, fixed, `left-0 right-0`, `h-[75vh]`, `bottom-[72px]` (above the fixed `h-[72px]` mobile nav). Rounded top corners. Drag handle: `w-10 h-1 rounded-full bg-warmGray-300 dark:bg-warmGray-600 mx-auto mt-3`. Sheet container: `touch-action: pan-y` to avoid scroll/drag conflict.

### Accessibility
- `role="dialog"` + `aria-modal="true"` + `aria-labelledby="sim-panel-title"` — matches `SimModal` pattern
- `useFocusManagement({ autoFocus: true, trapFocus: true, restoreFocus: true })`
- Escape key closes panel
- Returns focus to the triggering card's "open panel" button on close

### Header
- 56px avatar circle (or placeholder initials on brand-500 bg)
- Sim name: `font-display text-xl font-semibold` — `id="sim-panel-title"` for `aria-labelledby`
- Age stage + challenge badge below name
- X close button (`aria-label="Close sim details"`) top-right

**Panel navigation arrows (top of header):**
- Left / Right arrows navigate through the current `filteredSims` list
- At first sim: left arrow is `disabled` + `aria-disabled="true"` + `opacity-40 cursor-not-allowed`
- At last sim: same treatment on right arrow
- `aria-label` updates dynamically: `"Previous sim (2 of 12)"` / `"Next sim (4 of 12)"`

### Body (scrollable)

1. **Quick stats row** — Generation badge, Heir badge (if `is_heir`), challenge name badge (if assigned)
2. **Traits** — All trait pills (no 4-item cap). Uses existing trait pill style from SimCard.
3. **Details** — Career, Aspiration, Relationship to heir (if set)
4. **Challenge context** — Current challenge name. "Unassign" button if assigned. "Assign to Challenge" inline dropdown if unassigned (calls `simStore.assignToChallenge`).
5. **Achievements** — Count label + "View on full profile →" link to `/sim/[id]?tab=achievements`

### Footer (sticky)
- "View Full Profile" button (primary) → `/sim/[id]`
- "Edit Sim" button (outline) → `/sim/[id]` (inline editing via `InlineEditable` fields is available there)

---

## BulkActionBar

Floating bar. Visible when `Object.keys(selectedSimIds).length > 0` and `isBulkMode: true`.

**Position:** `fixed bottom-[72px] lg:bottom-6 left-1/2 -translate-x-1/2 z-[60]`. The mobile nav sits at `z-50`; the bulk bar uses `z-[60]` to appear above it.

**Content:**
- "{N} selected" count (left)
- "Assign to Challenge" button — opens inline dropdown with challenge list, calls `simStore.assignToChallenge` sequentially for each selected sim
- "Unassign" button — calls `simStore.unassignFromChallenge` sequentially, only shown if any selected sims are assigned
- "Delete" button (destructive variant) — opens confirmation modal before proceeding. Calls `simStore.deleteSim` sequentially. Confirmation copy: "Delete {N} sim{s}? This cannot be undone."
- "Deselect all" button (ghost) — clears `selectedSimIds`, sets `isBulkMode: false`

Bulk operations run sequentially (not `Promise.all`) to avoid rate-limiting. Show a loading spinner on the action button during processing. After completion, clear selection and show a toast/success message.

Use `memo` on `BulkActionBar`. Pass `selectedCount` (number) and `selectedIds` (string[]) as props — not the raw `Record<string, true>` object.

---

## Dashboard Integration

### DashboardClient Sims Tab (preview mode)
- Renders up to 8 most recent sims in `grid-cols-2 lg:grid-cols-4`
- Read-only `SimCard` (no checkbox, no bulk actions, no sort toolbar)
- "View all sims →" link at bottom right → `/sims`
- No toolbar in preview mode

### Dashboard Overview Tab
- Existing "Recent Sims" section: "View all →" link → `/sims`

### Sidebar
```ts
{ label: 'Sims', href: '/sims', icon: TbUsers }
```

### Deleted Route
`src/app/(protected)/dashboard/sims/page.tsx` — deleted. No redirect needed (was not a public-facing URL).

---

## Error & Loading States

Assigned in `SimsClient`:
- **Loading:** Skeleton card grid (same count as last known sim count, or 8 if unknown). Covers all three tabs' content area.
- **Error:** `ErrorMessage` component at the top of the content area. Retry button that calls `fetchAllSims()`.
- **Empty (zero sims total):** Shown in All Sims tab grid area. Other tabs show the same empty state since there's nothing to group or tree.

---

## Out of Scope

- `is_favorite` / heart toggle — removed from `SimCard` and this page entirely. The `is_favorite` column is not in the DB schema; do not add it.
- Visual/graphical family tree — Family Tree tab ships as text/table only. Architecture supports future upgrade.
- Sim-to-sim relationship graph — future feature.
- Bulk export — future feature.

---

## Implementation Order

1. SimCard interactive model refactor (prerequisite — own task)
2. SimOverview migration Task 6 (prerequisite — own task)
3. `src/app/(protected)/sims/page.tsx` + `SimsClient.tsx` (shell + tabs, no content yet)
4. `SimsToolbar` + All Sims tab
5. `SimDetailPanel`
6. `BulkActionBar`
7. `ByChallengeView` (By Challenge tab)
8. `FamilyTreeView` (Family Tree tab)
9. Dashboard preview update + sidebar href + `NewSimClient` cancel redirect
10. Delete `/dashboard/sims/page.tsx`
