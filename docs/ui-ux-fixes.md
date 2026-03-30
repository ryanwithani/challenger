# UI/UX Audit — Challenger

Audit conducted 2026-03-30. Covers all components, pages, and styles in `src/`.

---

## The Good

- **Brand color system** — Warm coral palette (`brand-500: #ff6b35`) is distinctive. CSS custom properties with proper dark-mode variants show real design token thinking. Dark mode uses warm dark browns, not cold grays.
- **`Button` component** — CVA-based with correct loading state, `disabled` handling, and `focus-visible:ring` for keyboard users.
- **`PasswordInput`** — Progressive validation rules shown only when focused with content (not on page load). `aria-pressed` on the toggle is correct.
- **Onboarding wizard localStorage scoping** — Clears saved state when a different `userId` is detected, preventing state leakage across accounts on shared machines.
- **`SimCard` accessibility** — Uses `<article>`, `aria-label`, `tabIndex={0}`, and `aria-pressed` on the favorite button.
- **Wizard progress indicators** — Both wizards use `<nav aria-label="Progress"><ol>` with proper step states, recognized by screen readers.
- **Sims page filter toolbar** — Search, tab switching, and chip filters are the best list UI in the codebase.

---

## The Bad

### P1 — Critical

| Issue | Location | Detail |
|-------|----------|--------|
| Broken `/sims/` vs `/sim/` routing | `SimCard.tsx:169`, `SimsPage.tsx` | Cards and list links go to `/sims/${id}` but the route is `/sim/[id]` — every "view sim" click 404s |
| `console.log` with user emails | `src/app/page.tsx`, `LoginModal.tsx`, `Navbar.tsx` | Logs user email addresses, auth events, and navigation clicks to browser console in production — PII exposure |
| `Modal` has no focus trap or Escape handler | `src/components/sim/SimModal.tsx` | Sets `role="dialog" aria-modal="true"` but has no focus trap, no Escape key handler, no initial focus management — WCAG 2.1 SC 2.1.1 failure affecting every modal in the app |

### P2 — Significant

| Issue | Location | Detail |
|-------|----------|--------|
| Duplicate sign-in implementation | `src/app/page.tsx` + `LoginModal.tsx` | Identical auth form duplicated in two places — security fixes applied to one won't reach the other |
| `PacksStep` silently drops `onSkip` | `src/components/onboarding/steps/PacksStep.tsx` | Prop declared in interface but never destructured — the skip path in onboarding has no UI |
| Sidebar shows hardcoded identity | `src/components/layout/Sidebar.tsx:108-119` | Shows "Sims Challenger" / letter "S" for all users while the Navbar correctly shows real `display_name` |
| `Toast` has no live region | `src/components/ui/Toast.tsx` | No `role="status"` or `aria-live` — screen readers never announce feedback messages |
| `LoginModal` missing `aria-labelledby` | `src/components/auth/LoginModal.tsx` | Dialog has no label pointing to its heading |
| Challenges page breaks brand palette | `src/app/(protected)/dashboard/challenges/page.tsx:100` | Uses purple-to-pink gradient and five different gradient colors on one page; every other page uses coral |
| `SimProfile` fights its parent layout | `src/components/sim/SimProfile.tsx:32` | Applies `min-h-screen bg-gradient-to-br from-slate-50 to-blue-50` inside a layout that already provides background |
| Footer is all placeholder | `src/components/layout/Footer.tsx` | Copyright says 2024, all three links are `href="#"`, logo is a green circle (only green element in a coral app) |
| Duplicate `useEffect` | `src/app/(protected)/profile/page.tsx:41-52` | Two identical effects watching the same dependency; second one is dead code |

---

## The Concerning

- **Double-spinner on dashboard load** — Protected layout shows a full-screen spinner while auth initializes; once resolved, `DashboardClient` shows another spinner for its `isHydrated` state. Two sequential full-screen loading states before any content.
- **`ChallengesPage` and `SimsPage` design divergence** — Challenges uses large rounded-3xl cards, gradient stat blocks, colored backgrounds. Sims uses a minimal toolbar and plain sections. They feel like different products. This compounds as more pages are added.
- **`ErrorDisplay` defined inside `SimWizard` render** — `src/components/sim/form/SimWizard.tsx:336-393` defines a function component inside another component's body. React treats it as a new component type on every render, unmounting and remounting it.
- **`font-display` (Nunito Sans) defined in Tailwind config but never used** — `globals.css` overrides everything with `Inter !important`. Dead config; the app has a distinct personality but uses the most generic SaaS font.
- **Text-only loading states** — `ChallengePage` shows `<p>Loading challenge...</p>` while dashboard has a spinner and onboarding has another style. Three different loading patterns across the app.

---

## Recommendations

### P1 — Fix immediately

- [ ] Fix `/sims/` → `/sim/` routing in `SimCard.tsx` and `SimsPage.tsx`
- [ ] Remove all `console.log` calls from `src/app/page.tsx`, `LoginModal.tsx`, `Navbar.tsx`
- [ ] Add focus trap + Escape handler to `src/components/sim/SimModal.tsx` (move focus to first interactive element on open, return to trigger on close)

### P2 — Fix soon (most are low effort)

- [ ] Extract shared `SignInForm` component consumed by both `page.tsx` and `LoginModal.tsx`
- [ ] Destructure and wire `onSkip` in `src/components/onboarding/steps/PacksStep.tsx`
- [ ] Move `ErrorDisplay` out of `SimWizard`'s render body to module scope (`src/components/sim/form/SimWizard.tsx`)
- [ ] Pull `userProfile` from `useAuthStore` in `src/components/layout/Sidebar.tsx`
- [ ] Add `role="status" aria-live="polite"` to `src/components/ui/Toast.tsx`
- [ ] Add `aria-labelledby` to `src/components/auth/LoginModal.tsx`
- [ ] Standardize gradient palette across pages — remove the purple-to-pink outlier in `challenges/page.tsx`
- [ ] Remove `min-h-screen` and the blue gradient from `src/components/sim/SimProfile.tsx`
- [ ] Fix Footer: update copyright year, remove dead `href="#"` links, align logo color with brand (`src/components/layout/Footer.tsx`)
- [ ] Remove the duplicate `useEffect` in `src/app/(protected)/profile/page.tsx:47-52`

### P3 — Polish

- [ ] Replace text `Loading...` with skeleton layouts across `ChallengePage`, `SimProfilePage`, `DashboardClient`
- [ ] Address the double-spinner: initialize stores from server-passed props rather than a second `useEffect` in `DashboardClient`
- [ ] Either use `font-display` (Nunito Sans) on headings as the Tailwind config intends, or remove the dead config
