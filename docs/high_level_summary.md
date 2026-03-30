## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15.5 (App Router) + React 18 + TypeScript 5.3 strict |
| Database | Supabase (hosted PostgreSQL) |
| Auth | Supabase GoTrue (email/password) + Google One-Tap |
| State | Zustand 4 stores |
| Styling | Tailwind CSS 3 + CVA (Class Variance Authority) |
| Forms | React Hook Form + Zod |
| Security | Upstash Redis rate limiting, CSRF tokens, DOMPurify |
| Testing | Jest + Testing Library + Playwright (e2e) |
| Deploy | Vercel (inferred from @vercel/functions dep) |

---

## Top-Level Files

- `middleware.ts` — Edge middleware: rate limiting (Upstash Redis, sliding window), Supabase session refresh, CSRF token generation, auth redirects
- `next.config.js` — Supabase image optimization, CSP/security headers
- `tailwind.config.ts` — Custom warm coral/orange brand palette, dark mode
- `jest.config.js` — Jest with jsdom; 70% coverage threshold; `@/` path alias
- `tsconfig.json` — Strict mode; `@/` resolves to repo root

---

## src/ Structure

### `src/app/` — Routes
- `(auth)/signup` — Public registration page
- `(protected)/` — Dashboard, challenges, sims, profile (all require auth + email verification)
  - `dashboard/` — Main hub (challenges list, sims list)
  - `challenge/[id]/` — Individual challenge detail
  - `sim/[id]/` — Individual sim profile
  - `profile/` — User profile and expansion pack preferences
- `api/auth/` — `signin`, `signup`, `reset-password`, `check-username`, `validate-credentials`
- `api/csrf-token/` — CSRF token endpoint
- `page.tsx` — Public landing page with sign-in modal

### `src/lib/` — Core Logic
- `api/auth.ts` — Client-side fetch wrappers for API routes (includes CSRF headers)
- `supabase/client.ts` — Browser client (anon key, no cookies)
- `supabase/server.ts` — Server client (anon key + cookie management for SSR)
- `supabase/admin.ts` — Service role client (bypasses RLS, server-only)
- `middleware/csrf.ts` — `withCSRFProtection()` wrapper for API routes
- `store/authStore.ts` — Auth + user profile; listens to `onAuthStateChange`
- `store/challengeStore.ts` — Challenges, goals, progress, points (largest store, ~800 lines)
- `store/simStore.ts` — Sims, achievements, family/heir relationships
- `store/userPreferencesStore.ts` — Expansion pack tracking (32 Sims 4 packs)
- `utils/validators.ts` — Zod schemas (email, password, username, signup/signin)
- `utils/csrf.ts` / `csrf-client.ts` — CSRF generation/validation (server + client)
- `utils/rateLimit.ts` — In-memory LRU rate limiter (secondary layer, per-route)
- `utils/ip-utils.ts` — IP extraction (handles CF/proxy headers)
- `validations/env.ts` — Environment variable validation

### `src/components/`
- `auth/` — LoginModal, PasswordResetModal, OneTapComponent, AuthInitializer
- `challenge/` — ChallengeWizard (multi-step creation), GoalCard, PointTracker, LegacyTracker
- `sim/` — SimWizard (multi-step creation), SimProfile, TraitPickerModal, packAssets, traitsCatalog
- `onboarding/` — OnboardingWizard with WelcomeStep, AccountStep, PacksStep
- `layout/` — Navbar, Sidebar, Footer, GridPageShell, ThemeToggle
- `ui/` — Full component library (Button, Card, Input, Badge, Modal, Progress, etc.) using CVA variants
- `icons/` — Custom SVG icon components

### `src/types/`
- `database.types.ts` — Auto-generated Supabase schema types (full Database interface)
- `challenge.ts`, `legacy.ts` — App-level types

### `src/data/`
- `challenge-templates.ts` — Predefined Sims 4 challenge types
- `legacy-rules.ts` — Legacy challenge ruleset definitions

---

## Database Schema (public)

| Table | Purpose |
|-------|---------|
| `users` | App profile; mirrors `auth.users.id`; created lazily on first login |
| `challenges` | User's challenges; `configuration: JSON` stores rules/settings |
| `sims` | Characters; `traits: JSON`; tied to a challenge |
| `challenge_sims` | Junction: sims ↔ challenges with `generation`, `is_heir`, `relationship_to_heir` |
| `challenge_members` | Multi-user challenge participation |
| `goals` | Objectives per challenge; point-based with `goal_type`, thresholds |
| `progress` | Goal completion records per user/sim |
| `sim_achievements` | Achievement records attached to a sim |
| `user_preferences` | `expansion_packs: JSON` (32 Sims 4 DLC packs) |
| `audit_log` | Security event log |
| `failed_login_attempts` | Brute force tracking |

**Enum:** `relationship_to_heir` = spouse | child | parent | sibling | partner | roommate | other

**RPC functions:** `can_manage_challenge`, `is_account_locked`, `link_sim_to_challenge`, `update_challenge_sim`, `log_audit`

---

## How Pieces Connect

```
Browser
  └─ LoginModal
       └─ authStore.signIn()
            └─ fetch /api/auth/signin   (CSRF token in X-CSRF-Token header)
                 ├─ Middleware: rate limit (Upstash Redis, 10req/10s)
                 ├─ withCSRFProtection: validates CSRF token format
                 ├─ In-route rate limit: 5 req / 15 min per IP
                 └─ supabase.auth.signInWithPassword()  [server client, sets session cookie]
                      └─ authStore: supabase.auth.getSession()  [picks up cookie]
                           └─ onAuthStateChange fires → fetchUserProfile()
                                └─ SELECT from public.users (INSERT if missing)

Protected Page Load:
  middleware.ts
    ├─ Upstash rate limit check
    ├─ supabase.auth.getUser() [server]
    ├─ If unauthed → redirect /login
    ├─ If unverified email → redirect /auth/verify-email
    └─ If authed → CSRF cookie set (if missing)
         └─ (protected)/layout.tsx
              └─ authStore.initialize() [once]
                   └─ onAuthStateChange listener registered
                        └─ Dashboard/Challenge pages fetch data via
                             ├─ challengeStore (Zustand)
                             └─ simStore (Zustand)
                                  └─ Supabase browser client → PostgreSQL
```

---

## Notable Patterns

- **CSRF**: Token in HTTP-only cookie; sent as `X-CSRF-Token` header on all mutating requests; validated server-side by checking hex format (not a DB lookup — presence + format only)
- **Dual rate limiting**: Upstash Redis in middleware (request-level) + in-memory LRU in each API route (per-endpoint backup)
- **Three Supabase clients**: browser (client comps), server (SSR/API), admin (privileged ops — service role key)
- **Auth store duality**: Two `onAuthStateChange` listeners registered in `initialize()` (likely a bug — both do nearly the same thing)
- **Lazy profile creation**: `fetchUserProfile` inserts a new row in `public.users` if none exists (handles OAuth/SSO users with no profile)
- **CVA components**: All UI components define `variants` with CVA for type-safe class switching (size, intent, state)
