 Entry Points                                                                                                                                                                                                                                                                                                                                                                                                                                                                    
  There are 4 distinct entry points depending on how a user arrives:                                                                                                                                                                                                                                                                                                                                                                                                              
  ┌─────────────────────┬────────────────────────────────┬─────────────────────────────────────────────┐                                                                                                                                   │     Entry Point     │              File              │                    Type                     │                                                                                                                                   ├─────────────────────┼────────────────────────────────┼─────────────────────────────────────────────┤                                                                                                                                   │ Landing / login     │ src/app/page.tsx               │ Server component                            │                                                                                                                                 
  ├─────────────────────┼────────────────────────────────┼─────────────────────────────────────────────┤
  │ Sign up             │ src/app/(auth)/signup/page.tsx │ Server component                            │
  ├─────────────────────┼────────────────────────────────┼─────────────────────────────────────────────┤
  │ Any protected route │ middleware.ts                  │ Edge middleware (runs first, every request) │
  ├─────────────────────┼────────────────────────────────┼─────────────────────────────────────────────┤
  │ Any API call        │ src/app/api/auth/*/route.ts    │ API route handler                           │
  └─────────────────────┴────────────────────────────────┴─────────────────────────────────────────────┘

  ---
  Flow 1: Initial Page Load (unauthenticated)

  User hits /
    → middleware.ts: rate limit check → no auth cookie → let through
    → src/app/page.tsx renders (server)
    → AuthInitializer mounts (client)
    → authStore.initialize()
        → onAuthStateChange listener registered
        → supabase.auth.getSession() → null
        → set { user: null, loading: false, initialized: true }
    → Landing page ready, sign-in form shown

  ---
  Flow 2: Sign Up

  User fills out OnboardingWizard (3 steps: Account → Packs → Welcome)

  Step 1 – Account:
    → POST /api/auth/signup
        → Rate limit: 3/hour/IP
        → Honeypot check (website field)
        → Zod validation: username, email, password
        → Check username uniqueness: SELECT from users WHERE ilike username
        → supabase.auth.signUp() → creates row in auth.users
        → INSERT into public.users { id, email, username, display_name }
        → returns { success: true, user }

  Step 2 – Packs:
    → Creates user_preferences row with selected expansion packs

  Step 3 – Welcome:
    → Clears localStorage onboarding keys
    → router.push('/dashboard') or '/dashboard/new/challenge'

  ---
  Flow 3: Sign In

  User submits email + password on landing page
    → authStore.signIn()
        → csrfTokenManager.getHeaders()  ← fetches token from /api/csrf-token if not cached
        → POST /api/auth/signin  (X-CSRF-Token header)
            → Middleware: Upstash sliding window (10req/10s)
            → withCSRFProtection: validates token hex format
            → In-route rate limit: 5/15min/IP
            → supabase.auth.signInWithPassword()  [server client]
            → Session cookies set in response
            → returns { success: true, user }
        → supabase.auth.getSession()  [browser client picks up the cookie]
        → set { user: session.user }
        → onAuthStateChange fires → fetchUserProfile()
            → SELECT from public.users WHERE id = user.id
            → If missing: INSERT new profile row
            → set { userProfile, profileFetched: true }
    → router.push('/dashboard')

  ---
  Flow 4: Dashboard Load

  GET /dashboard
    → middleware.ts:
        → supabase.auth.getUser() [server]
        → No user → redirect /login
        → Unverified email → redirect /auth/verify-email
        → Authenticated → set CSRF cookie if missing, continue

    → src/app/(protected)/dashboard/page.tsx  [Server Component]
        → supabase.auth.getUser()
        → SELECT * FROM challenges WHERE user_id = user.id ORDER BY created_at DESC
        → supabase.rpc('get_all_sims_for_user')
        → Passes { initialChallenges, initialSims } as props to DashboardClient

    → DashboardClient.tsx  [Client Component]
        → useEffect: setChallenges(initialChallenges), setSims(initialSims)
        → Memoizes: recentChallenges (top 3), activeChallenges, totalGenerations
        → Renders stats cards + tabbed UI

  ---
  Flow 5: Create Challenge

  User completes ChallengeWizard (2-3 steps depending on type)
    → Step 1: BasicInfoStep → name, description, challenge_type
    → Step 2 (if legacy): ConfigurationStep → rules, lot traits, lifespan settings
    → Final step: SummaryStep → confirms, calls onSubmit(challengeData)

    → NewChallengePage.handleSubmit()
        → Promise.race([createChallenge(data), timeout(60s)])

    → challengeStore.createChallenge()
        → supabase.auth.getUser()
        → INSERT into challenges { name, description, challenge_type, configuration, user_id, status: 'active' }
        → Append to store.challenges[]
        → If challenge_type === 'legacy':
            → seedLegacyChallengeGoals(challengeId, config)
                → Reads predefined templates from legacy-rules.ts
                → INSERT all goal rows into goals table in one batch
                → Each goal: { title, category, goal_type, point_value, challenge_id, ... }

    → Success modal shown → user navigates to challenge detail

  ---
  Flow 6: Create Sim

  User completes SimWizard (steps: BasicInfo → Traits → Personality → Career → Review)
    → NewSimClient.handleFinalSubmit(simData)
        → supabase.auth.getUser()
        → INSERT into sims { name, age_stage, traits, career, aspiration, challenge_id, user_id, generation, is_heir }
        → If challenge_id provided:
            → simStore.linkSimToChallenge(simId, challengeId)
                → UPSERT into challenge_sims { sim_id, challenge_id } ON CONFLICT DO UPDATE
    → Toast shown → router.push('/sim/{id}') after 1.5s

  ---
  Flow 7: Goal Completion

  User marks a goal complete on challenge page

  Standard goal:
    → challengeStore.toggleGoalProgress(goalId)
        → Check if progress record exists for this goal
        → If exists: DELETE from progress WHERE goal_id = goalId
        → If not exists: INSERT into progress { user_id, goal_id, challenge_id }
        → Update store.progress[]

  Legacy goal (with details — sim, method, notes):
    → challengeStore.completeGoalWithDetails(goalId, { sim_id, method, notes })
        → Build completion_details JSON
        → INSERT/UPDATE progress row with completion_details
        → addSimAchievement():
            → INSERT into sim_achievements { sim_id, goal_title, completion_method, points_earned, notes }

  Penalty goal:
    → incrementPenalty(): INSERT new progress row (each = one occurrence)
    → decrementPenalty(): DELETE most recent progress row by occurred_at timestamp

  Points recalculate automatically — calculatePoints() is a derived function that reads store.goals + store.progress and sums live. Nothing is stored as a running total.

  ---
  Flow 8: Every API Route

  ┌─────────────────────────────────────┬──────┬─────────────┬────────────┬───────────────────────────────────┬────────────────────────────────────┐
  │                Route                │ Auth │    CSRF     │ Rate Limit │            Core Action            │              Response              │
  ├─────────────────────────────────────┼──────┼─────────────┼────────────┼───────────────────────────────────┼────────────────────────────────────┤
  │ POST /api/auth/signup               │ None │ No          │ 3/hr/IP    │ auth.signUp() + INSERT users      │ { success, user }                  │
  ├─────────────────────────────────────┼──────┼─────────────┼────────────┼───────────────────────────────────┼────────────────────────────────────┤
  │ POST /api/auth/signin               │ None │ Yes         │ 5/15min/IP │ auth.signInWithPassword()         │ { success, user } + session cookie │
  ├─────────────────────────────────────┼──────┼─────────────┼────────────┼───────────────────────────────────┼────────────────────────────────────┤
  │ POST /api/auth/reset-password       │ None │ No (public) │ 3/hr/IP    │ auth.resetPasswordForEmail()      │ Always 200 (prevents enumeration)  │
  ├─────────────────────────────────────┼──────┼─────────────┼────────────┼───────────────────────────────────┼────────────────────────────────────┤
  │ POST /api/auth/check-username       │ None │ No          │ —          │ SELECT users WHERE ilike username │ { available: bool }                │
  ├─────────────────────────────────────┼──────┼─────────────┼────────────┼───────────────────────────────────┼────────────────────────────────────┤
  │ POST /api/auth/validate-credentials │ None │ No          │ —          │ Credential pre-validation         │ { valid: bool }                    │
  ├─────────────────────────────────────┼──────┼─────────────┼────────────┼───────────────────────────────────┼────────────────────────────────────┤
  │ GET /api/csrf-token                 │ None │ N/A         │ —          │ generateCSRFToken() + set cookie  │ { token }                          │
  └─────────────────────────────────────┴──────┴─────────────┴────────────┴───────────────────────────────────┴────────────────────────────────────┘

  ---
  Key Architectural Observations

  - Points are never stored — always recalculated live from goals + progress in challengeStore.calculatePoints()
  - Two caching layers: Server-side via SSR props on dashboard load; client-side via Zustand with a 5-minute lastChallengesFetch cache timeout
  - Wizard progress survives page refreshes — both ChallengeWizard and OnboardingWizard save step data to localStorage with a 500ms debounce
  - Profile creation is lazy — fetchUserProfile() inserts a public.users row on first login if one doesn't exist, rather than requiring signup to always create it