# Remaining Layout Issues — Implementation Plan

Follows the critical fixes applied in session 2026-03-30 (layout background, page wrapper removal, heading colors, stat gradients, shadow/border tokens, font-display on headings).

---

## Issue 1 — Sidebar: No app identity at the top

**File:** `src/components/layout/Sidebar.tsx`

**Problem:** The sidebar opens directly into nav items. No logo, no app name. Users cannot orient on first load.

**Fix:**
- Add an app identity block above the `<nav>` as the first child of the scroll container:
  - Crown icon (`ChallengeIcon` or dedicated logo component) + "Challenger" in `font-display text-lg text-brand-600`
  - Wrap in a `div` with `px-4 py-5 border-b border-brand-100 dark:border-brand-900/40`
- This also makes the Navbar logo redundant — see Issue 3.

**Complexity:** Low (30 min)

---

## Issue 2 — Sidebar: Hardcoded user identity at bottom

**File:** `src/components/layout/Sidebar.tsx:109-118`

**Problem:** Avatar shows hardcoded `"S"`, name shows `"Sims Challenger"`, tagline shows `"Challenge your gameplay"`. The Navbar already shows the real `display_name` via `useAuthStore`, making the sidebar contradict it.

**Fix:**
- Import `useAuthStore` (already used in the Navbar — pattern is established)
- Replace hardcoded string with `userProfile?.display_name?.charAt(0).toUpperCase()` for the avatar letter
- Replace `"Sims Challenger"` with `userProfile?.display_name ?? 'Player'`
- Remove the hardcoded tagline or replace with the user's email (truncated) as secondary text

**Complexity:** Low (20 min)

---

## Issue 3 — Navbar: Redundant with a sidebar that has app identity

**File:** `src/components/layout/Navbar.tsx`
**File:** `src/app/(protected)/layout.tsx:70`

**Problem:** The Navbar provides: app logo + name, "Welcome [user]", theme toggle, sign-out. Once the sidebar has an app identity header (Issue 1) and real user data (Issue 2), the Navbar duplicates the logo and user identity. On a sidebar-layout app, a top bar adds height cost to every screen.

**Options (pick one — requires a decision):**

**Option A — Slim the Navbar to utility-only:**
- Remove logo and user greeting from Navbar
- Keep: theme toggle + sign-out button only
- Reduce height: `py-2` instead of current height
- Impact: Navbar stays, but stops competing with sidebar for app identity

**Option B — Eliminate the Navbar and move controls to sidebar footer:**
- Move theme toggle and sign-out into the sidebar user section (next to settings icon already there)
- Remove `<Navbar />` from `layout.tsx`
- Impact: More screen real estate, cleaner layout — the recommended approach per the design review
- Risk: Slightly larger sidebar footer section — verify it still fits at small viewport heights

**Recommendation:** Option B. The sidebar user section already has a settings icon link. Adding a compact theme toggle icon and sign-out icon alongside it requires minimal space.

**Complexity:** Medium (1–2 hours)

---

## Issue 4 — Dual navigation (tabs vs sidebar for same destinations)

**Files:** `src/app/(protected)/dashboard/DashboardClient.tsx:133-150` (tabs), `src/components/layout/Sidebar.tsx:14-22` (nav)

**Problem:** "Challenges" and "Sims" exist as both:
- Sidebar links → `/dashboard/challenges` and `/dashboard/sims` (full pages with filtering)
- Tabs inside DashboardClient → inline grids with no filtering

This creates split-brain navigation. Users don't know which "Challenges" view is canonical.

**Fix — Remove the Challenges and Sims tabs from DashboardClient:**
- Delete the `'challenges'` and `'sims'` tab entries from `DASHBOARD_TABS` constant (in `src/lib/constants`)
- Delete the corresponding `tabpanel` renders from `DashboardClient.tsx` (the `activeTab === 'challenges'` and `activeTab === 'sims'` blocks)
- Delete the `activeTab` state and tab nav bar from `DashboardClient.tsx` — the Overview content (two recent-item panels) becomes the permanent layout, no tabs needed
- Result: `/dashboard` shows an overview (recent challenges + recent sims). The sidebar routes to full pages. No duplication.

**Complexity:** Low (30 min) — mostly deletion

---

## Issue 5 — Dark mode card backgrounds are cold gray

**Files:** `DashboardClient.tsx`, `challenges/page.tsx`, and all pages using `dark:bg-gray-800`

**Problem:** `dark:bg-gray-800` (#1f2937) is a cold blue-gray. It sits on `bg-surface-dark` (#1a1410 warm brown), creating a visible color temperature clash between the page background and card surfaces in dark mode.

**Fix:**
- Add a warm dark card color to `tailwind.config.ts`:
  ```js
  surface: {
    DEFAULT: '#ffffff',
    muted: '#fef6ee',
    dark: '#1a1410',
    card: '#ffffff',        // existing light card
    'card-dark': '#261e19', // warm dark card — slightly lighter than surface-dark
  }
  ```
- Replace all `dark:bg-gray-800` on content cards with `dark:bg-surface-card-dark`
- Replace `dark:bg-gray-900` usages similarly where appropriate

**Complexity:** Low config change, medium find-and-replace across files (45 min)

---

## Issue 6 — Active sidebar state uses accent gradient (brand-500 → accent-500)

**File:** `src/components/layout/Sidebar.tsx:74`

```
bg-gradient-to-r from-brand-500 to-accent-500
```

`accent-500` is amber (`#f59e0b`). The gradient shifts from coral to amber on the active nav item — a warm combination, but `accent-500` only appears here and on some stat numbers. The more cohesive approach is `from-brand-500 to-brand-600` (coral to deeper coral), which matches the Button `primary` variant and keeps the sidebar consistent with the rest of the brand.

**Complexity:** Trivial (5 min) — but low priority, current version is acceptable

---

## Implementation Order

| Priority | Issue | Effort |
|----------|-------|--------|
| 1 | Issue 4 — Remove duplicate tabs | Low (deletion only) |
| 2 | Issue 1 — Sidebar app identity | Low |
| 3 | Issue 2 — Sidebar real user data | Low |
| 4 | Issue 5 — Dark mode card bg | Medium |
| 5 | Issue 3 — Navbar decision + refactor | Medium |
| 6 | Issue 6 — Sidebar active gradient | Trivial |
