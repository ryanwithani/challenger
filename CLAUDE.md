# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quick Start

```bash
git clone <repo-url> && cd challenger
cp .env.local.example .env.local   # Fill in Supabase + Upstash keys (see Environment Variables below)
npm install
npm run dev                        # http://localhost:3000
```

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
npm run test:e2e     # Playwright e2e tests (headless, auto-starts dev server)
npm run test:e2e:headed  # Playwright e2e tests (visible browser)
npm run test:e2e:ui  # Playwright interactive UI mode
```

Run a single test file:
```bash
npx jest src/__tests__/api/signup.test.ts        # Jest unit test
npx playwright test e2e/tests/login.spec.ts      # Playwright e2e test
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

## CI/CD

GitHub Actions workflow (`.github/workflows/ci.yml`) runs on pushes to `main` and PRs targeting `main`:

1. **Lint** — `npm run lint`
2. **Type Check** — `npm run type-check`
3. **Test** — `npm run test:ci` (coverage uploaded as artifact)
4. **Build** — `npm run build` (runs after lint + type-check + test pass)
5. **E2E** — `npx playwright test` (runs after build, requires GitHub secrets for Supabase test credentials)

Deployment is handled by Vercel (auto-deploys on push to main).

## Architecture

This is a **Next.js 15 App Router** app for tracking Sims 4 legacy challenge progress. Backend is **Supabase** (Postgres + auth). State is **Zustand**. Styling is **Tailwind CSS**.

### Route groups
- `src/app/(auth)/` — public auth pages (signup)
- `src/app/(protected)/` — requires login: dashboard, challenges, sims, profile
- `src/app/api/auth/` — API routes: `signin`, `signup`, `reset-password`, `check-username`, `validate-credentials`
- `src/app/api/csrf-token/` — issues CSRF tokens to authenticated browser clients

### Auth architecture
Authentication has **two layers** that must stay in sync:

1. **`middleware.ts`** — Edge middleware. Uses Upstash Redis + `@upstash/ratelimit` for sliding-window rate limiting (10 req/10s on auth/write endpoints). Creates a single Supabase client and calls `getUser()` once — reuses the result for protected route redirect, email verification check, auth page redirect, and CSRF token generation. Handles session cookie refresh via `@supabase/ssr`.

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
- `users` — app profile (id mirrors `auth.users`), created automatically by the `handle_new_user()` DB trigger on `auth.users` INSERT
- `challenges` — owned by a user; has `configuration: Json`, `challenge_type`, status, points
- `sims` — owned by a user (`user_id`); optionally linked to one challenge (`challenge_id` nullable); carry generation, heir flag, and relationship metadata directly
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
- **Icons**: react-icons (Tabler `Tb*`, AntDesign `AiOutline*`, Bootstrap `Bs*`)
- **Sanitization**: isomorphic-dompurify
- **Rate Limiting**: @upstash/ratelimit + @upstash/redis (middleware), lru-cache (in-route fallback)

### Theme system
`src/context/ThemeProvider.tsx` — class-based dark mode (`'light' | 'dark' | 'system'`). Adds/removes `dark` class on `<html>`. SSR-safe. localStorage key: `'theme'`. Custom hook: `useTheme()`.

### Styling conventions
- Dark mode: Tailwind `class` strategy (not `media`)
- Brand palette: warm peach/coral (`brand-50`–`brand-900`, primary at `brand-500` = #ff6b35). Accent is golden/amber.
- Font: `font-display` (Fraunces) for all headings and brand text. `font-body` (Nunito Sans) for body — warm sans-serif with rounded terminals.
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
├── app/                     # Next.js App Router pages
│   ├── (auth)/              # Public: signup
│   ├── (protected)/         # Requires login: dashboard, challenge/[id], sim/[id], profile
│   └── api/                 # auth/ (signin, signup, etc.) + csrf-token/
├── components/              # auth, challenge, sim, layout, onboarding, ui, icons, forms
├── context/                 # ThemeProvider
├── data/                    # Static: challenge-templates, legacy-rules
├── hooks/                   # useFocusManagement, useMaxSelect, useWizardNavigation
├── lib/
│   ├── api/auth.ts          # Client-side auth API calls (used by authStore)
│   ├── constants.ts         # Tabs, statuses, storage keys, UI variants
│   ├── middleware/csrf.ts   # withCSRFProtection() wrapper
│   ├── store/               # Zustand: auth, challenge, sim, userPreferences
│   ├── supabase/            # Client factories: client, server, admin, middleware
│   ├── utils/               # cn, format, csrf, csrf-client, validators, rateLimit, etc.
│   └── validations/         # Zod schemas: challenge, sim, env
└── types/                   # challenge, legacy, database.types (auto-generated)
```

See `docs/component_map.md` and `docs/architecture-overview.md` for full details.

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

### E2E tests (Playwright)
E2E tests live in `e2e/tests/` with Page Object Models in `e2e/pages/`. Config: `playwright.config.ts`. Requires `e2e/.env.e2e` with real Supabase test credentials (`E2E_TEST_EMAIL`, `E2E_TEST_PASSWORD`, plus Supabase connection vars). Tests run against Chromium only, serialized (`workers: 1`) because login tests share auth state.

## Gotchas

- **`csrf-client.ts` must stay client-only.** It is imported by `src/lib/api/auth.ts` which runs in the browser. Never add server imports (`next/headers`, `next/server`, Node `crypto`) to this file — they will break the signin flow silently. Server-side CSRF utilities live in `src/lib/utils/csrf.ts`.
- **`database.types.ts` is auto-generated.** Do not edit manually. Regenerate from Supabase when the schema changes.
- **Middleware creates the Supabase client once and calls `getUser()` once.** Do not add additional client creations or auth checks — this was consolidated to avoid redundant network calls that caused performance issues.
- **Auth API calls go through `src/lib/api/auth.ts`, not Supabase directly.** This ensures rate limiting and CSRF protection are always applied. The authStore's `signIn()` calls the API route, then picks up the session cookie via `getSession()`.
- **`@/` resolves to repo root, not `src/`.** Imports look like `@/src/lib/...` not `@/lib/...`.
- **`public.users` rows are created by the `handle_new_user()` DB trigger, not application code.** The trigger fires on `auth.users` INSERT and reads `raw_user_meta_data->>'username'`. Do NOT also insert into `public.users` from API routes — this causes a duplicate key violation. Migration: `supabase/migrations/20260401_add_handle_new_user_trigger.sql`.
- **E2E tests require a real Supabase project.** Test credentials go in `e2e/.env.e2e` (gitignored). The `webServer` config auto-starts `npm run dev` locally or `npm start` in CI.
