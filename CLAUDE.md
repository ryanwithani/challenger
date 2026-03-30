# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server at localhost:3000
npm run build        # Production build
npm run lint         # ESLint
npm run type-check   # TypeScript check (tsc --noEmit)
npm test             # Run all Jest tests
npm run test:watch   # Jest in watch mode
npm run test:coverage  # Jest with coverage (70% threshold enforced)
npm run test:ci      # Jest with coverage, CI mode (maxWorkers=2)
```

Run a single test file:
```bash
npx jest src/__tests__/api/signup.test.ts
```

## Environment Variables

Required in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=      # "publishable key" in Supabase's new key system
SUPABASE_SERVICE_ROLE_KEY=          # "secret key" in Supabase's new key system
UPSTASH_REDIS_REST_URL=             # used by Redis.fromEnv() in middleware
UPSTASH_REDIS_REST_TOKEN=           # used by Redis.fromEnv() in middleware
NEXT_PUBLIC_SITE_URL=               # used for password reset redirect URLs
NEXT_PUBLIC_GOOGLE_CLIENT_ID=       # optional, Google OAuth
```

## Architecture

This is a **Next.js 15 App Router** app for tracking Sims 4 legacy challenge progress. Backend is **Supabase** (Postgres + auth). State is **Zustand**. Styling is **Tailwind CSS**.

### Route groups
- `src/app/(auth)/` — public auth pages (signup)
- `src/app/(protected)/` — requires login: dashboard, challenges, sims, profile
- `src/app/api/auth/` — API routes: `signin`, `signup`, `reset-password`, `check-username`, `validate-credentials`
- `src/app/api/csrf-token/` — issues CSRF tokens to authenticated browser clients

### Auth architecture
Authentication has **two layers** that must stay in sync:

1. **`middleware.ts`** — Edge middleware runs on every request. Uses Upstash Redis + `@upstash/ratelimit` for sliding-window rate limiting (10 req/10s on auth/write endpoints). Handles session cookie refresh via `@supabase/ssr`. Redirects unauthenticated users from protected paths to `/login`, and verified users away from `/login` to `/dashboard`. Generates CSRF tokens for authenticated users on first visit to protected routes.

2. **`src/lib/store/authStore.ts`** — Zustand store, the client-side source of truth. `initialize()` must be called once (done in `(protected)/layout.tsx`). It sets up `onAuthStateChange` and fetches the initial session. `signIn()` calls the API route (`src/lib/api/auth.ts`) — **not** Supabase directly — so that rate limiting and CSRF protection apply. After the API route sets session cookies server-side, the browser client calls `getSession()` to pick them up.

### CSRF flow
- CSRF tokens are generated in middleware and stored as `HttpOnly` cookies
- The client-side `csrfTokenManager` (`src/lib/utils/csrf-client.ts`) fetches a token from `/api/csrf-token` and caches it
- All mutating API calls use `csrfTokenManager.getHeaders()` to include `X-CSRF-Token`
- API routes wrap handlers with `withCSRFProtection()` from `src/lib/middleware/csrf.ts`
- `/api/auth/reset-password` is explicitly excluded from CSRF (public endpoint)

### Supabase clients — use the right one
- `createSupabaseBrowserClient()` — browser/client components, uses anon key
- `createSupabaseServerClient()` — server components and API routes, reads/writes session cookies
- `createSupabaseAdminClient()` — server-only, uses `SUPABASE_SERVICE_ROLE_KEY`, bypasses RLS

### Database schema (key tables in `public`)
- `users` — app profile (id mirrors `auth.users`), created lazily in `fetchUserProfile()` if missing
- `challenges` — owned by a user; has `configuration: Json`, `challenge_type`, status, points
- `sims` — belong to a challenge; have traits, career, aspiration, generation, heir flag
- `challenge_sims` — join table linking sims to challenges with generation/heir metadata
- `goals` — belong to a challenge; point-based with `goal_type`, thresholds, current/target values
- `progress` — records goal completions per user/challenge/sim
- `audit_log` — security events

### State stores (`src/lib/store/`)
- `authStore` — user session + profile; is the single place that calls `fetchUserProfile`
- `challengeStore` — challenges, sims, goals, progress for the active session
- `simStore` — current sim detail, family members, achievements
- `userPreferencesStore` — expansion pack preferences

### API route pattern
All API routes in `src/app/api/auth/` follow: validate input with Zod → rate limit (in-memory LRU, `src/lib/utils/rateLimit.ts`) → CSRF check → call Supabase → return JSON. The in-memory rate limiter in individual routes is a secondary defense; the primary rate limiter is the Upstash-backed one in middleware.

### Key dependencies
- **Framework**: Next.js 15.5.6, React 18.3.1
- **Form/Validation**: react-hook-form 7.48, Zod 3.23
- **State**: Zustand 4.4
- **UI**: class-variance-authority (CVA), clsx, tailwind-merge — combined via `cn()` from `src/lib/utils/cn.ts`
- **Icons**: react-icons (Tabler set — `TbHome`, `TbTarget`, etc.)
- **Sanitization**: isomorphic-dompurify
- **Rate Limiting**: @upstash/ratelimit + @upstash/redis (middleware), lru-cache (in-route fallback)

### Theme system
`src/context/ThemeProvider.tsx` — class-based dark mode (`'light' | 'dark' | 'system'`). Adds/removes `dark` class on `<html>`. SSR-safe. localStorage key: `'theme'`. Custom hook: `useTheme()`.

### Styling conventions
- Dark mode: Tailwind `class` strategy (not `media`)
- Brand palette: warm peach/coral (`brand-50`–`brand-900`, primary at `brand-500` = #ff6b35). Accent is golden/amber.
- Font: `font-display` class for headings (serif/display font — intentionally warm and playful). Body uses system sans-serif.
- Utility: `cn()` from `src/lib/utils/cn.ts` merges clsx + twMerge. Always use this instead of raw template literals for conditional classes.

### Component patterns
- All interactive components use `'use client'` directive
- Buttons use CVA variants: `primary`, `secondary`, `accent`, `outline`, `ghost`, `destructive` — sizes: `sm`, `md`, `lg`, `xl`
- `GridPageShell` (`src/components/layout/GridPageShell.tsx`) — standard page wrapper, takes `title`, optional `actions`, and `children`
- Form wizards use multi-step pattern with Zod validation per step
- Zustand store selectors use individual hooks for fine-grained reactivity

### File organization (src/)
```
src/
├── app/                          # Next.js App Router pages
│   ├── (auth)/                   # Public: signup
│   ├── (protected)/              # Requires login
│   │   ├── dashboard/            # Main hub: overview, challenges, sims tabs
│   │   │   ├── DashboardClient   # Client component for dashboard
│   │   │   ├── challenges/       # Challenge list page
│   │   │   ├── sims/             # Sim list page
│   │   │   └── new/              # Create forms (challenge wizard, sim wizard)
│   │   ├── challenge/[id]/       # Challenge detail (goals, sims, points)
│   │   ├── sim/[id]/             # Sim profile (achievements, timeline)
│   │   └── profile/              # User profile + pack preferences
│   ├── api/auth/                 # Auth API routes (see API route pattern above)
│   └── api/csrf-token/           # CSRF token endpoint
├── components/
│   ├── auth/                     # LoginModal, PasswordReset, OneTap, AuthInitializer
│   ├── challenge/                # ChallengeTile, LegacyTracker, GoalCard, PointTracker
│   │   └── forms/challenge-wizard/ # Multi-step challenge creation
│   ├── forms/                    # GoalForm, SimForm, InlineEditable
│   ├── icons/                    # BrandIcon, ChallengeIcon, CrownIcon, SimIcon
│   ├── layout/                   # Sidebar, Navbar, Footer, GridPageShell, ThemeToggle
│   ├── onboarding/               # OnboardingWizard + steps (Welcome, Account, Packs)
│   ├── profile/                  # Packs component
│   ├── sim/                      # SimCard, SimModal, SimProfile, SimTimeline, TraitTile
│   │   └── form/                 # SimWizard + steps (BasicInfo, Traits, Personality, Review)
│   └── ui/                       # Primitives: Button, Card, ModernCard, Input, Toast, etc.
├── context/                      # ThemeProvider
├── data/                         # Static data: challenge-templates, legacy-rules
├── hooks/                        # useFocusManagement, useMaxSelect, useWizardNavigation
├── lib/
│   ├── api/auth.ts               # Client-side auth API calls (used by authStore)
│   ├── constants.ts              # DASHBOARD_TABS, CHALLENGE_STATUS, LOCAL_STORAGE_KEYS, wizard keys, UI_VARIANTS
│   ├── middleware/csrf.ts        # withCSRFProtection() wrapper
│   ├── store/                    # Zustand stores (auth, challenge, sim, userPreferences)
│   ├── supabase/                 # Client factories: client.ts, server.ts, admin.ts, middleware.ts, auth-config.ts
│   ├── utils/                    # cn, format, csrf, csrf-client, validators, rateLimit, legacy-scoring, etc.
│   └── validations/              # Zod schemas: challenge.ts, sim.ts, env.ts
└── types/                        # challenge.ts, legacy.ts, database.types.ts (auto-generated)
```

### Hooks
- `useFocusManagement` — accessibility focus trapping/restoration for modals and wizards
- `useMaxSelect(max)` — multi-select with cap (used for trait selection, max 3)
- `useWizardNavigation(wizardData)` — dynamic step management, skips config step when not needed

### Validation schemas (`src/lib/validations/`)
- `challenge.ts` — `basicInfoSchema`, `legacyConfigSchema`, `expansionPackSchema` (Zod)
- `sim.ts` — `simWizardSchema` with 3 sub-schemas (basicInfo, traits, personality)
- `env.ts` — environment variable validation

### Constants (`src/lib/constants.ts`)
- `DASHBOARD_TABS` — overview, challenges, sims
- `CHALLENGE_STATUS` — active, completed, paused, archived
- `LOCAL_STORAGE_KEYS` — password reset rate limit keys
- Wizard storage keys: `SIM_PROGRESS_STORAGE_KEY`, `CHALLENGE_PROGRESS_STORAGE_KEY`, etc.
- `UI_VARIANTS` — PRIMARY, SECONDARY, ACCENT, OUTLINE, GHOST, DESTRUCTIVE, GRADIENT

### Data files (`src/data/`)
- `challenge-templates.ts` — 4 templates: custom, legacy, not_so_berry, 100_baby
- `legacy-rules.ts` — `STARTING_OPTIONS` (3 difficulty tiers), `LEGACY_RULES` (genderLaw, bloodlineLaw, heirSelection, speciesRule, lifespan)

### Type definitions (`src/types/`)
- `database.types.ts` — **auto-generated from Supabase**, do not edit manually
- `challenge.ts` — `ChallengeTemplate` interface
- `legacy.ts` — type unions for all legacy config options, `LegacyConfigData`, `StartingOption`, `LegacyRule`

### Naming conventions
- Components: PascalCase (`ChallengeTile`, `GridPageShell`)
- Hooks: `use` prefix, camelCase (`useFocusManagement`)
- Constants: UPPER_SNAKE_CASE (`DASHBOARD_TABS`, `SIM_PROGRESS_STORAGE_KEY`)
- Utilities: camelCase (`formatConfigValue`, `getDifficultyColor`)
- Zod schemas: camelCase + `Schema` suffix (`basicInfoSchema`, `legacyConfigSchema`)
- Store actions: camelCase verbs (`fetchChallenge`, `addSim`, `toggleGoalProgress`)

### Path aliases
`@/` resolves to the repo root. So `@/src/lib/...` and `@/src/app/...` both work (mapped in `jest.config.js` and `tsconfig.json`).

## Testing

### Test environments
API route tests must include `/** @jest-environment node */` at the top of the file — jsdom does not have the Web Fetch API that Next.js `NextRequest` requires.

Store tests run in jsdom (the default).

### Shared mock factories
`src/__tests__/utils/test-helpers.ts` exports two Supabase mock factories. Always use these instead of inline mocks:

**`createServerSupabaseMock()`** — for API route tests (`createSupabaseServerClient`). Covers `auth.*` operations and the `from().select().ilike().maybeSingle()` + direct `from().insert()` chains.

```typescript
let mockMaybeSingle: jest.Mock
let mockInsert: jest.Mock
let mockSupabase: any

beforeEach(() => {
    const mock = createServerSupabaseMock()
    mockMaybeSingle = mock.mockMaybeSingle
    mockInsert = mock.mockInsert
    mockSupabase = mock.supabase
    ;(createSupabaseServerClient as jest.Mock).mockResolvedValue(mockSupabase)
})
```

**`createBrowserSupabaseMock()`** — for store tests (`createSupabaseBrowserClient`). Covers chainable `insert().select().single()`, `update().eq().select().single()`, `delete().eq()`, `select().eq().single()`, `upsert`, `rpc`, and all `auth.*` methods.

```typescript
let mockSingle: jest.Mock
let mockInsertSingle: jest.Mock
let mockUpdateSingle: jest.Mock
let mockSupabase: any

beforeEach(() => {
    const mock = createBrowserSupabaseMock()
    mockSingle = mock.mockSingle
    mockInsertSingle = mock.mockInsertSingle
    mockUpdateSingle = mock.mockUpdateSingle
    mockSupabase = mock.supabase
    ;(createSupabaseBrowserClient as jest.Mock).mockReturnValue(mockSupabase)
})
```

The file also exports entity factories (`createMockUser`, `createMockChallenge`, `createMockSim`, `createMockGoal`, `createMockProgress`) for building test data.

### Store testing pattern
Zustand stores are singletons. Reset state in `beforeEach` with `useStore.setState(initialState)`. Call actions via `useStore.getState().actionName()`. Pure selectors like `calculatePoints` can be tested by setting state directly with `setState` then calling the function — no async needed.
