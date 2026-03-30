# Architecture Overview

## System Overview

Challenger is a Next.js 15 web application for tracking Sims 4 legacy challenge progress. Users create challenges, add Sims, define goals, and record progress against those goals. The system is a standard full-stack web app: server-rendered pages, a REST API layer, a relational database, and client-side state management.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15.5 (App Router) + React 18 + TypeScript 5.3 strict |
| Database | Supabase (hosted PostgreSQL) |
| Auth | Supabase GoTrue (email/password) |
| State | Zustand 4 (4 stores) |
| Styling | Tailwind CSS 3 + CVA (Class Variance Authority) |
| Forms | React Hook Form + Zod |
| Rate Limiting | Upstash Redis (sliding window, edge middleware) |
| Security | CSRF tokens, DOMPurify, HttpOnly cookies |
| Testing | Jest + Testing Library |
| Deploy | Vercel (inferred from `@vercel/functions`) |

---

## Application Structure

### Route Groups

```
src/app/
├── page.tsx                        # Public landing page with sign-in modal
├── (auth)/
│   └── signup/                     # Public registration
├── (protected)/                    # Requires authenticated + verified session
│   ├── layout.tsx                  # Auth guard + app shell (Sidebar, Navbar)
│   ├── dashboard/                  # Main hub: challenges list, sims list
│   ├── challenge/[id]/             # Individual challenge detail + goal tracking
│   ├── sim/[id]/                   # Individual sim profile
│   └── profile/                    # User profile + expansion pack prefs
└── api/
    ├── auth/signin                 # POST — sign in
    ├── auth/signup                 # POST — register + create profile row
    ├── auth/reset-password         # POST — request password reset (public)
    ├── auth/validate-credentials   # POST — username/email availability check
    └── csrf-token/                 # GET — fetch CSRF token for client
```

### Key Source Directories

```
src/
├── app/                  # Routes and API handlers
├── components/
│   ├── auth/             # LoginModal, PasswordResetModal, AuthInitializer
│   ├── challenge/        # ChallengeWizard, GoalCard, PointTracker, LegacyTracker
│   ├── sim/              # SimWizard, SimProfile, TraitPickerModal
│   ├── onboarding/       # OnboardingWizard (welcome, account, packs steps)
│   ├── layout/           # Navbar, Sidebar, Footer
│   └── ui/               # Full component library (Button, Card, Modal, etc.)
├── lib/
│   ├── store/            # Zustand stores
│   ├── supabase/         # Three Supabase client factories
│   ├── middleware/        # CSRF wrapper for API routes
│   ├── api/              # Client-side fetch wrappers (auth.ts)
│   ├── utils/            # CSRF, rate limit, validators, IP extraction
│   └── validations/      # Zod schemas + env validation
├── types/                # database.types.ts (auto-generated) + app types
└── data/                 # challenge-templates.ts, legacy-rules.ts
```

---

## Authentication Architecture

Authentication has two coordinated layers:

### 1. Edge Middleware (`middleware.ts`)

Runs before every request on page routes and `/api/auth/*`:

- **Rate limiting** — Upstash Redis sliding window (10 req / 10s per IP per endpoint) on all `/api/auth` routes and non-GET `/api` routes
- **Session refresh** — Supabase SSR client refreshes the session cookie on every request
- **Auth redirects** — unauthenticated users on protected paths → `/login`; unverified email → `/auth/verify-email`; authenticated verified users on `/login` → `/dashboard`
- **CSRF token generation** — stamps an HttpOnly `csrf-token` cookie on first authenticated visit to dashboard/profile/settings

### 2. Zustand Auth Store (`src/lib/store/authStore.ts`)

Client-side source of truth for the active session:

- `initialize()` registers a single `onAuthStateChange` listener. Supabase fires `INITIAL_SESSION` immediately on registration, handling both initial load and subsequent auth changes in one path.
- `signIn()` calls the API route (not Supabase directly) so rate limiting and CSRF apply. After the server sets the session cookie, the browser client calls `getSession()` to pick it up.
- `SIGNED_OUT` event clears wizard localStorage across all wizards.
- `fetchUserProfile()` only fetches — never creates. Profile creation is the responsibility of the signup route.

### Sign-Up Flow

```
POST /api/auth/signup
  → validate input (Zod)
  → honeypot check
  → username uniqueness check (public.users)
  → supabase.auth.signUp() — creates auth.users row
  → INSERT into public.users — fails hard if this fails
  → return 200
```

### Session Flow

```
Browser request → middleware.ts
  → Upstash rate limit check (auth routes)
  → Supabase session cookie refresh
  → Auth/redirect checks
  → (protected)/layout.tsx
      → authStore.initialize() (once)
          → onAuthStateChange registered
              → INITIAL_SESSION fires
                  → fetchUserProfile()
```

---

## Data Model

### Tables (`public` schema)

| Table | Purpose |
|---|---|
| `users` | App profile; `id` mirrors `auth.users.id`; created at signup |
| `challenges` | User's challenges; `configuration: JSON` stores type-specific rules; `total_points` stores current earned score |
| `sims` | Characters; `traits: JSON`; belong to a challenge; have `generation`, `is_heir` |
| `challenge_sims` | Junction: sims ↔ challenges with `generation`, `is_heir`, `relationship_to_heir` |
| `challenge_members` | Multi-user challenge participation |
| `goals` | Objectives per challenge; `goal_type` (milestone / counter / threshold / penalty); `point_value`, `max_points`, `thresholds: JSON` |
| `progress` | Goal completion records; one row per user/goal for milestones, multiple for penalties |
| `sim_achievements` | Achievement records attached to a sim |
| `user_preferences` | `expansion_packs: JSON` (32 Sims 4 DLC packs) |
| `audit_log` | Security event log |
| `failed_login_attempts` | Brute force tracking |

### Key Relationships

```
users
  └── challenges (user_id)
        ├── goals (challenge_id)
        │     └── progress (goal_id)
        └── challenge_sims (challenge_id)
              └── sims (id)
                    └── sim_achievements (sim_id)
```

### Goal Types

| Type | Scoring |
|---|---|
| `milestone` | Binary — completed or not; earns full `point_value` |
| `counter` | `current_value × point_value`, capped at `max_points` |
| `threshold` | Highest threshold met by `current_value` determines score |
| `penalty` | Negative scoring; incremented/decremented separately |

### Points

Points are calculated dynamically in `challengeStore.calculatePoints()` by reducing over all goals and the current progress state. The result is persisted to `challenges.total_points` after every mutation (progress toggle, counter increment, goal completion). This denormalized column enables efficient score reads without re-joining goals and progress.

### RPC Functions

- `can_manage_challenge` — authorization check
- `is_account_locked` — brute force lockout check
- `link_sim_to_challenge` — creates `challenge_sims` row
- `update_challenge_sim` — updates junction table
- `log_audit` — appends to `audit_log`
- `get_all_sims_for_user` — efficient sim fetch used on dashboard

---

## State Management

Four Zustand stores, all browser-side only:

| Store | Responsibility |
|---|---|
| `authStore` | Session, user object, user profile; auth actions |
| `challengeStore` | Challenges, goals, progress, sims for the active session; point calculation and persistence; 5-minute fetch cache |
| `simStore` | Sim data, achievements, family/heir relationships |
| `userPreferencesStore` | Expansion pack selection (32 Sims 4 packs) |

### Dashboard Data Flow

The dashboard uses a hybrid SSR + client-state pattern:

1. Server component (`dashboard/page.tsx`) fetches challenges and sims before render
2. `DashboardClient` receives them as props and hydrates Zustand via `setChallenges()` / `setSims()` — also stamps `lastChallengesFetch` so the 5-minute cache is respected
3. Subsequent navigations use the Zustand cache; after 5 minutes, `fetchChallenges()` re-fetches in the background without a loading state

---

## Security Architecture

### CSRF Protection

- Tokens are 32-byte cryptographically random hex strings generated by `crypto.randomBytes()`
- Stored as `HttpOnly; Secure; SameSite=Strict` cookies (1-hour expiry)
- Sent on mutating requests as `X-CSRF-Token` header via `csrfTokenManager.getHeaders()`
- Validated server-side in `withCSRFProtection()` by format check (length + hex regex) — not a database lookup
- `/api/auth/reset-password` is explicitly excluded (public unauthenticated endpoint)

### Rate Limiting

- **Primary**: Upstash Redis sliding window (10 req / 10s per IP per endpoint) on all `/api/auth/*` routes, applied at the edge in `middleware.ts`
- Keyed by `{ip}:{pathname}` to provide per-endpoint limits
- Redis is distributed — works correctly across serverless function instances

### Supabase Clients — Three Tiers

| Client | Key | Usage |
|---|---|---|
| `createSupabaseBrowserClient()` | Anon key | Client components; subject to RLS |
| `createSupabaseServerClient()` | Anon key + cookies | Server components and API routes; session-aware |
| `createSupabaseAdminClient()` | Service role key | Server-only privileged ops; bypasses RLS |

### Wizard Data Isolation

Wizard progress persisted to `localStorage` is tagged with the authenticated user's ID. On restore, the stored ID is compared to the current user — mismatch clears all keys. Additionally, `SIGNED_OUT` auth event clears all wizard keys immediately, ensuring no data lingers after logout.

### Environment Validation

All required environment variables are validated at startup via Zod (`src/lib/validations/env.ts`). Missing or malformed vars cause a hard failure rather than silent runtime errors.

---

## External Integrations

| Service | Purpose | Access |
|---|---|---|
| Supabase | PostgreSQL database + GoTrue auth + Row Level Security | Server and browser clients |
| Upstash Redis | Distributed rate limiting at the edge | `@upstash/redis` + `@upstash/ratelimit` in middleware |
| Vercel | Hosting and serverless function runtime | Inferred from `@vercel/functions` dependency |

---

## Notable Design Patterns

### CVA Component Variants
All UI components define type-safe `variants` using Class Variance Authority. Consumers specify `variant`, `size`, and `intent` props; CVA maps these to Tailwind classes. This keeps styling logic out of component logic and makes the design system explicit.

### API Route Pattern
Every API route follows the same pipeline: validate input with Zod → CSRF check (via `withCSRFProtection`) → call Supabase → return JSON. Input is always validated before any database interaction.

### Wizard Persistence
Multi-step wizards (`ChallengeWizard`, `SimWizard`) auto-save progress to `localStorage` with a 500ms debounce. State is user-scoped and cleared on completion, cancellation, or logout.

### Optimistic Local State
Zustand stores update local state immediately after DB writes succeed, rather than re-fetching. This makes the UI feel instant. The `lastChallengesFetch` cache timestamp prevents redundant network requests while keeping data reasonably fresh.

---

## Architectural & Security Concerns

### CSRF Validation is Format-Only
`validateCSRFToken()` checks that the token is a 64-character hex string — nothing more. It does not verify the token against a server-side store or compare the cookie value to the header value. A token stolen from the cookie would pass validation. True double-submit cookie protection requires comparing the cookie value to the header value.

### Protected Layout Relies on Client-Side Auth Check
`(protected)/layout.tsx` redirects unauthenticated users client-side (`router.push('/')`). There is a window between render and the redirect where protected page content may be visible. The middleware should be the authoritative guard — but the middleware matcher currently covers `protectedPaths` only for `/dashboard`, `/profile`, `/settings`, missing routes like `/challenge/[id]` and `/sim/[id]`.

### `supabase.auth.getUser()` Called Multiple Times per Request
The middleware creates two Supabase server clients and calls `auth.getUser()` in separate blocks — once for CSRF token generation and once for auth redirect checks. These could be consolidated into a single client and single `getUser()` call per request.

### No Expiry on Wizard `localStorage`
Wizard data has no time-based expiry. If a user starts a wizard, their browser crashes, and they return days later, stale form data is restored. A timestamp on the saved progress that expires after (e.g.) 24 hours would prevent confusing restores.

### `validate-credentials` Uses `auth.admin.listUsers()`
The email availability check fetches up to 1,000 users and filters client-side. This does not scale. As the user base grows, it will miss users beyond the first page. A direct query against `auth.users` via a server-side lookup or a unique constraint check is preferable.

### Google One-Tap Component Exists but is Unused
`OneTapComponent` is fully implemented but never mounted anywhere in the app. If it is added to a page in the future, OAuth users will have no `public.users` profile (lazy creation was removed). A Supabase database trigger on `auth.users INSERT` or an OAuth callback handler would be needed to cover this path.

### No Real-Time Sync Between Browser Tabs
The Zustand cache is process-local. Changes made in one tab are not reflected in another until the cache expires (5 minutes) or the user refreshes. For a single-user app this is acceptable, but multi-tab usage can produce inconsistent state.
