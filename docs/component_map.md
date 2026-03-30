# Component & Module Map

Organized by layer. For each module: responsibility, inputs/outputs, and dependencies on other local modules.

---

## Edge Layer

### `middleware.ts`
**Responsibility:** First point of contact for every page and `/api/auth/*` request. Applies rate limiting, refreshes Supabase session cookies, generates CSRF tokens, enforces auth redirects, and blocks unverified users.

| | |
|---|---|
| **Inputs** | `NextRequest` — every matched HTTP request |
| **Outputs** | `NextResponse` — pass-through, redirect, or 429 |
| **Matcher** | All page routes + `/api/auth/*` (excludes static assets) |

**Dependencies:**
- `src/lib/utils/ip-utils` — extract client IP for rate limit key
- `src/lib/utils/csrf` — generate and set CSRF token cookie
- `@upstash/ratelimit` + `@upstash/redis` — sliding window rate limiter (10 req / 10s per IP per endpoint)
- `@supabase/ssr` — session cookie refresh

---

## Supabase Clients

Three factories — never mix them up.

### `src/lib/supabase/client.ts`
**Responsibility:** Creates a browser-side Supabase client for use in client components and Zustand stores. Subject to Row Level Security.

| | |
|---|---|
| **Inputs** | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (env) |
| **Outputs** | `SupabaseClient` (anon, no cookies) |

**Dependencies:** None (local)

---

### `src/lib/supabase/server.ts`
**Responsibility:** Creates a server-side Supabase client for use in server components and API routes. Reads and writes session cookies so the user's auth state is preserved across SSR.

| | |
|---|---|
| **Inputs** | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (env), `cookies()` from `next/headers` |
| **Outputs** | `SupabaseClient` (anon key + cookie session) |

**Dependencies:** None (local)

---

### `src/lib/supabase/admin.ts`
**Responsibility:** Creates an admin Supabase client that bypasses Row Level Security. Server-only. Used when RLS would block a legitimate privileged operation (e.g. checking email uniqueness across all users).

| | |
|---|---|
| **Inputs** | `SUPABASE_SERVICE_ROLE_KEY` (via `env`) |
| **Outputs** | `SupabaseClient` (service role, no RLS) |

**Dependencies:**
- `src/lib/validations/env` — validated env vars

---

## Security Utilities

### `src/lib/utils/csrf.ts`
**Responsibility:** Server-side CSRF token generation, cookie management, and validation. Tokens are 32-byte cryptographically random hex strings stored in `HttpOnly; Secure; SameSite=Strict` cookies.

| | |
|---|---|
| **Inputs** | `NextRequest` (for reading token from header/cookie) |
| **Outputs** | Token string, `Set-Cookie` header, 403 error response |

**Dependencies:** None (local) — uses Node `crypto`

---

### `src/lib/utils/csrf-client.ts`
**Responsibility:** Client-side CSRF token manager. Lazily fetches a token from `/api/csrf-token`, caches it in memory, and exposes `getHeaders()` for injection into fetch calls.

| | |
|---|---|
| **Inputs** | None (auto-fetches from API) |
| **Outputs** | `{ 'X-CSRF-Token': string }` headers object |

**Dependencies:** None (local)

---

### `src/lib/middleware/csrf.ts`
**Responsibility:** Higher-order function that wraps API route handlers with CSRF validation. Skips GET requests and explicitly public endpoints (`/api/auth/reset-password`).

| | |
|---|---|
| **Inputs** | API handler function |
| **Outputs** | Wrapped handler that returns 403 on invalid CSRF token |

**Dependencies:**
- `src/lib/utils/csrf` — `validateCSRFToken`, `createCSRFErrorResponse`

---

### `src/lib/utils/ip-utils.ts`
**Responsibility:** Extracts client IP from request headers, handling proxy chains (Cloudflare `CF-Connecting-IP`, `X-Forwarded-For`, `X-Real-IP`).

| | |
|---|---|
| **Inputs** | `NextRequest` |
| **Outputs** | IP string or `'unknown'` |

**Dependencies:** None (local)

---

## Validation & Environment

### `src/lib/validations/env.ts`
**Responsibility:** Validates required environment variables at startup using Zod. Hard-fails if any are missing or malformed, preventing silent runtime errors.

| | |
|---|---|
| **Inputs** | `process.env` |
| **Outputs** | `env` object — `{ NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY }` |

**Dependencies:** None (local)

---

### `src/lib/utils/validators.ts`
**Responsibility:** Central validation and sanitization library. Exports Zod schemas for all user input (email, password, username, signup, signin, goals, sims, files) and DOMPurify-backed sanitization utilities.

| | |
|---|---|
| **Inputs** | Raw user input strings |
| **Outputs** | Zod parse results, sanitized strings, password check arrays |

**Dependencies:** None (local) — uses `zod`, `dompurify`

---

### `src/lib/validations/challenge.ts`
**Responsibility:** Zod schemas scoped to the challenge wizard — basic info (name, type, description) and legacy config (expansion pack selections, generation settings).

| | |
|---|---|
| **Inputs** | Wizard form data |
| **Outputs** | Typed `BasicInfoData`, `LegacyConfigData`, `ExpansionPackData` |

**Dependencies:** None (local)

---

### `src/lib/validations/sim.ts`
**Responsibility:** Zod schema for the sim wizard — validates basic info, traits array, career, and aspiration.

| | |
|---|---|
| **Inputs** | Sim wizard form data |
| **Outputs** | Typed `SimWizardData` |

**Dependencies:** None (local)

---

## API Layer

### `src/app/api/csrf-token/route.ts`
**Responsibility:** Generates a fresh CSRF token, sets it as an `HttpOnly` cookie, and returns it in the response body for the client-side token manager to cache.

| | |
|---|---|
| **Inputs** | `GET` request |
| **Outputs** | `{ token: string }` + `Set-Cookie` header |

**Dependencies:**
- `src/lib/utils/csrf`

---

### `src/app/api/auth/signup/route.ts`
**Responsibility:** Full registration pipeline: honeypot check → Zod validation → username uniqueness check → `supabase.auth.signUp()` → `INSERT` into `public.users`. Fails hard if profile creation fails.

| | |
|---|---|
| **Inputs** | `POST { username, email, password, website }` |
| **Outputs** | `200 { success, user }` or `400/500 { error }` |
| **Protection** | `withCSRFProtection` wrapper |

**Dependencies:**
- `src/lib/supabase/server`
- `src/lib/middleware/csrf`
- `src/lib/utils/validators`

---

### `src/app/api/auth/signin/route.ts`
**Responsibility:** Authenticates user via `supabase.auth.signInWithPassword()`. Validates email/password format, sets session cookie server-side.

| | |
|---|---|
| **Inputs** | `POST { email, password }` |
| **Outputs** | `200 { success, user }` or `401/500 { error }` |
| **Protection** | `withCSRFProtection` wrapper |

**Dependencies:**
- `src/lib/supabase/server`
- `src/lib/middleware/csrf`
- `src/lib/utils/validators`

---

### `src/app/api/auth/reset-password/route.ts`
**Responsibility:** Sends a password reset email via `supabase.auth.resetPasswordForEmail()`. Always returns success to prevent email enumeration. No CSRF (public endpoint).

| | |
|---|---|
| **Inputs** | `POST { email }` |
| **Outputs** | `200 { success, message }` always |

**Dependencies:**
- `src/lib/supabase/server`

---

### `src/app/api/auth/validate-credentials/route.ts`
**Responsibility:** Checks username and/or email availability during registration. Uses admin client for email check against `auth.users`, anon client for username check against `public.users`.

| | |
|---|---|
| **Inputs** | `POST { username?, email? }` |
| **Outputs** | `{ username?: { available, error? }, email?: { available, error? } }` |

**Dependencies:**
- `src/lib/supabase/server`
- `src/lib/supabase/admin`
- `src/lib/utils/validators`

---

### `src/app/api/auth/check-username/route.ts`
**Responsibility:** Case-insensitive username availability check. Secondary endpoint used at the check-username step.

| | |
|---|---|
| **Inputs** | `POST { username }` |
| **Outputs** | `{ available: boolean }` |

**Dependencies:**
- `src/lib/supabase/server`

---

## Client API Wrapper

### `src/lib/api/auth.ts`
**Responsibility:** Client-side fetch wrappers for all auth API routes. Automatically injects CSRF token headers so callers don't need to handle that themselves.

| | |
|---|---|
| **Inputs** | Auth credentials (email, password, etc.) |
| **Outputs** | Parsed JSON response or thrown error |

**Dependencies:**
- `src/lib/utils/csrf-client` — `csrfTokenManager.getHeaders()`

---

## State Stores

### `src/lib/store/authStore.ts`
**Responsibility:** Client-side source of truth for the authenticated session. Registers a single `onAuthStateChange` listener that handles initial session load, profile fetching, password recovery modal, and wizard storage cleanup on sign-out.

| | |
|---|---|
| **Inputs** | Auth events from Supabase, API responses from `src/lib/api/auth` |
| **Outputs** | `{ user, userProfile, loading, initialized }` state; sign-in/out/up actions |

**Dependencies:**
- `src/lib/supabase/client` — session management
- `src/lib/api/auth` — `signIn()` goes through the API route

---

### `src/lib/store/challengeStore.ts`
**Responsibility:** The largest store. Manages the full challenge lifecycle: CRUD for challenges, goals, sims, and progress. Calculates and persists points after every mutation. Maintains a 5-minute fetch cache keyed by `lastChallengesFetch`.

| | |
|---|---|
| **Inputs** | Supabase DB reads; mutations from UI components |
| **Outputs** | `{ challenges, currentChallenge, goals, progress, sims }` state; calculated points; `persistPoints()` writes to DB |

**Dependencies:**
- `src/lib/supabase/client`
- `src/types/database.types`
- `src/components/challenge/GoalsSeeder` — seeds legacy challenge goals on creation

---

### `src/lib/store/simStore.ts`
**Responsibility:** Manages sim records, achievements, family/heir relationships, and challenge-sim links. Provides helper methods for heir selection and relationship display.

| | |
|---|---|
| **Inputs** | Supabase DB reads; sim creation/update from SimWizard |
| **Outputs** | `{ sims, achievements, familyMembers }` state |

**Dependencies:**
- `src/lib/supabase/client`
- `src/types/database.types`

---

### `src/lib/store/userPreferencesStore.ts`
**Responsibility:** Stores and syncs user expansion pack preferences (32 Sims 4 packs). Creates a preferences row on first save.

| | |
|---|---|
| **Inputs** | Pack selection from `PacksStep` / profile page |
| **Outputs** | `{ preferences }` state |

**Dependencies:**
- `src/lib/supabase/client`

---

### `src/lib/store/index.ts`
**Responsibility:** Barrel re-export of all stores plus convenience selector hooks (`useUser`, `useChallenges`, `useTotalPoints`, etc.) and `resetAllStores()`.

| | |
|---|---|
| **Inputs** | — |
| **Outputs** | All store hooks + selector hooks |

**Dependencies:**
- `src/lib/store/authStore`
- `src/lib/store/challengeStore`

---

## Dashboard

### `src/app/(protected)/dashboard/page.tsx`
**Responsibility:** Async server component. Fetches the current user's challenges and sims before the page renders, eliminating a client-side loading state on first visit.

| | |
|---|---|
| **Inputs** | Session cookie (via Supabase server client) |
| **Outputs** | Server-rendered HTML + `initialChallenges`/`initialSims` props to `DashboardClient` |

**Dependencies:**
- `src/lib/supabase/server`
- `src/app/(protected)/dashboard/DashboardClient`

---

### `src/app/(protected)/dashboard/DashboardClient.tsx`
**Responsibility:** Interactive dashboard shell. On mount, hydrates Zustand stores with SSR-provided data (and stamps `lastChallengesFetch` so the cache is warm). Renders challenge tiles, sim cards, and navigation tabs.

| | |
|---|---|
| **Inputs** | `initialChallenges`, `initialSims` props from server component |
| **Outputs** | Rendered dashboard with tabs (Overview, Challenges, Sims) |

**Dependencies:**
- `src/lib/store/challengeStore` — `setChallenges`
- `src/lib/store/simStore` — `setSims`
- `src/components/challenge/ChallengeTile`
- `src/components/sim/SimCard`

---

## Protected Layout

### `src/app/(protected)/layout.tsx`
**Responsibility:** Wraps all protected routes. Calls `authStore.initialize()` once, shows a loading spinner while auth is resolving, redirects unauthenticated users client-side, and renders the Sidebar + Navbar shell.

| | |
|---|---|
| **Inputs** | Auth state from `authStore` |
| **Outputs** | App shell (Sidebar, Navbar, `children`) or redirect or loading screen |

**Dependencies:**
- `src/lib/store/authStore`
- `src/components/layout/Sidebar`
- `src/components/layout/Navbar`
- `src/components/layout/Footer`

---

## Auth Components

### `src/components/auth/AuthInitializer.tsx`
**Responsibility:** Invisible client component whose only job is calling `authStore.initialize()` on mount. Used on public pages where the protected layout doesn't run.

| | |
|---|---|
| **Inputs** | None |
| **Outputs** | `null` (renders nothing) |

**Dependencies:**
- `src/lib/store/authStore`

---

### `src/components/auth/LoginModal.tsx`
**Responsibility:** Sign-in dialog with email/password fields, error display, and a link to open the password reset modal.

| | |
|---|---|
| **Inputs** | `isOpen`, `onClose` props |
| **Outputs** | Calls `authStore.signIn()` on submit |

**Dependencies:**
- `src/lib/store/authStore`
- `src/components/auth/PasswordInput`
- `src/components/auth/PasswordResetModal`
- `src/components/ui/Input`, `Button`

---

### `src/components/auth/PasswordInput.tsx`
**Responsibility:** Password field with toggle visibility button, real-time requirement checklist (length, uppercase, number, symbol), and error display.

| | |
|---|---|
| **Inputs** | Standard input props + optional `showRequirements` flag |
| **Outputs** | Controlled input value; visual validation feedback |

**Dependencies:**
- `src/lib/utils/validators` — `getPasswordChecks()`
- `src/lib/utils/cn`

---

### `src/components/auth/PasswordResetModal.tsx`
**Responsibility:** Two-state modal: email input → calls `authStore.requestPasswordReset()` → success confirmation.

| | |
|---|---|
| **Inputs** | `isOpen`, `onClose` props |
| **Outputs** | Triggers password reset email |

**Dependencies:**
- `src/lib/store/authStore`
- `src/components/ui/Input`, `Button`

---

## Wizard Components

### `src/components/challenge/forms/challenge-wizard/ChallengeWizard.tsx`
**Responsibility:** Multi-step challenge creation wizard. Steps vary by challenge type (with or without configuration step). Auto-saves to `localStorage` (debounced 500ms), user-scoped via userId, cleared on submit/cancel/logout.

| | |
|---|---|
| **Inputs** | `onSubmit(challengeData)`, `onCancel()` callbacks; `loading` flag |
| **Outputs** | `Partial<Challenge>` submitted to parent; localStorage side effects |

**Dependencies:**
- `src/lib/store/userPreferencesStore` — expansion pack data for config step
- `src/lib/store/authStore` — user ID for localStorage scoping
- `src/lib/validations/challenge`
- `src/data/challenge-templates`
- Step components: `BasicInfoStep`, `ConfigurationStep`, `SummaryStep`

---

### `src/components/sim/form/SimWizard.tsx`
**Responsibility:** Multi-step sim creation wizard (basic info → traits → personality → review). Same localStorage persistence pattern as ChallengeWizard, user-scoped and cleared on logout.

| | |
|---|---|
| **Inputs** | `onSubmit(simData)`, `onCancel()` callbacks; `loading` flag |
| **Outputs** | Sim insert data submitted to parent; localStorage side effects |

**Dependencies:**
- `src/lib/store/authStore` — user ID for localStorage scoping
- `src/lib/supabase/client` — challenge dropdown
- `src/lib/validations/sim`
- Step components: `BasicInfoStep`, `TraitsStep`, `PersonalityStep`, `ReviewStep`

---

### `src/components/onboarding/OnboardingWizard.tsx`
**Responsibility:** Three-step onboarding flow (welcome → account → packs). Saves expansion pack preferences on completion and persists progress to `localStorage`.

| | |
|---|---|
| **Inputs** | `onComplete()` callback |
| **Outputs** | Calls `userPreferencesStore.savePreferences()` on completion |

**Dependencies:**
- `src/lib/store/authStore`
- `src/lib/store/userPreferencesStore`
- Step components: `WelcomeStep`, `AccountStep`, `PacksStep`

---

## Layout Components

### `src/components/layout/Navbar.tsx`
**Responsibility:** Top bar. Shows logo, authenticated user's display name, theme toggle, and sign-in/sign-out. Conditionally renders `PasswordUpdateModal` when auth store flag is set (password recovery flow).

| | |
|---|---|
| **Inputs** | Auth state from `authStore` |
| **Outputs** | Navigation UI; calls `authStore.signOut()` |

**Dependencies:**
- `src/lib/store/authStore`
- `src/components/auth/PasswordUpdateModal`
- `src/components/layout/ThemeToggleCompact`
- `src/components/ui/Button`

---

### `src/components/layout/Sidebar.tsx`
**Responsibility:** Left navigation panel with links to Dashboard, Challenges, Sims, and Profile. Highlights active route.

| | |
|---|---|
| **Inputs** | Current pathname from `next/navigation` |
| **Outputs** | Navigation links |

**Dependencies:** None (local)

---

## Challenge Feature Components

### `src/components/challenge/GoalCard.tsx`
**Responsibility:** Renders a single goal — title, category badge, point value, completion status, and a toggle/increment button depending on goal type.

| | |
|---|---|
| **Inputs** | `Goal` row, current progress, callback handlers |
| **Outputs** | UI; calls parent handlers on interaction |

**Dependencies:**
- `src/types/database.types`
- `src/components/ui/Button`

---

### `src/components/challenge/PointTracker.tsx`
**Responsibility:** Visual score display — progress bar, current/max points, milestone markers, achievement badge, and context-aware encouragement messages.

| | |
|---|---|
| **Inputs** | `currentPoints`, `maxPoints`, milestone thresholds |
| **Outputs** | Score visualization UI |

**Dependencies:** None (local)

---

### `src/components/challenge/GoalsSeeder.tsx`
**Responsibility:** On legacy challenge creation, seeds the `goals` table with predefined goal rows based on the challenge configuration (selected expansion packs, generation rules).

| | |
|---|---|
| **Inputs** | `challengeId`, `LegacyChallengeConfig`, Supabase client |
| **Outputs** | Batch `INSERT` into `goals` table |

**Dependencies:**
- `src/data/legacy-rules` — predefined goal definitions
- `src/lib/supabase/client`

---

## Utility Modules

### `src/lib/utils/safeParse.ts`
**Responsibility:** Type-safe JSON parsing for database JSON columns (`completion_details`, `thresholds`, `configuration`). Returns typed results with a success/failure discriminant rather than throwing.

| | |
|---|---|
| **Inputs** | Raw JSON string or `unknown` |
| **Outputs** | `ParseResult<T>` — `{ success: true, data: T }` or `{ success: false, error }` |

**Dependencies:** None (local)

---

### `src/lib/utils/avatarUpload.ts`
**Responsibility:** Validates, uploads, and manages sim avatar images in Supabase Storage. Generates a public URL and updates the sim's `avatar_url` field.

| | |
|---|---|
| **Inputs** | `File`, `simId`, user ID |
| **Outputs** | Public URL string; updated sim record in DB |

**Dependencies:**
- `src/lib/supabase/client`
- `src/lib/utils/validators` — file validation (`avatarFileSchema`)

---

### `src/lib/utils/careers.ts`
**Responsibility:** Maps career IDs to labels and expansion pack requirements. Provides lookups between base careers and their branch variants.

| | |
|---|---|
| **Inputs** | Career ID strings |
| **Outputs** | Career labels, branch lists, pack requirements |

**Dependencies:**
- `src/components/sim/CareersCatalog` — raw career data

---

### `src/lib/utils/legacy-scoring.ts`
**Responsibility:** Calculates the maximum possible legacy challenge score based on which expansion packs are enabled, since some goals only appear with certain packs.

| | |
|---|---|
| **Inputs** | `LegacyConfigData` (pack selections) |
| **Outputs** | `LegacyScoring` — `{ maxPoints, breakdown }` |

**Dependencies:** None (local)

---

## Data / Constants

### `src/data/challenge-templates.ts`
**Responsibility:** Static list of available challenge types with display labels, descriptions, and a `needsConfiguration` flag controlling whether the wizard shows the configuration step.

| | |
|---|---|
| **Inputs** | — |
| **Outputs** | `CHALLENGE_TEMPLATES: ChallengeTemplate[]` |

**Dependencies:** None

---

### `src/data/legacy-rules.ts`
**Responsibility:** Predefined goal definitions for the Legacy Challenge — titles, point values, categories, goal types, and which expansion packs gate each goal.

| | |
|---|---|
| **Inputs** | — |
| **Outputs** | Goal definition objects consumed by `GoalsSeeder` |

**Dependencies:** None

---

## Dependency Graph (high-level)

```
middleware.ts
  ├── lib/utils/ip-utils
  └── lib/utils/csrf

API Routes
  ├── lib/supabase/server
  ├── lib/supabase/admin       (validate-credentials only)
  ├── lib/middleware/csrf      (signin, signup)
  └── lib/utils/validators

lib/api/auth.ts
  └── lib/utils/csrf-client

Stores
  ├── authStore
  │     ├── lib/supabase/client
  │     └── lib/api/auth
  ├── challengeStore
  │     ├── lib/supabase/client
  │     └── components/challenge/GoalsSeeder
  ├── simStore
  │     └── lib/supabase/client
  └── userPreferencesStore
        └── lib/supabase/client

ChallengeWizard
  ├── stores/authStore          (userId scoping)
  ├── stores/userPreferencesStore
  ├── lib/validations/challenge
  └── data/challenge-templates

SimWizard
  ├── stores/authStore          (userId scoping)
  ├── lib/supabase/client       (challenge dropdown)
  └── lib/validations/sim

ProtectedLayout
  ├── stores/authStore
  └── components/layout/{Sidebar, Navbar, Footer}

Dashboard (server)
  ├── lib/supabase/server
  └── DashboardClient
        ├── stores/challengeStore
        └── stores/simStore

GoalsSeeder
  ├── lib/supabase/client
  └── data/legacy-rules
```
