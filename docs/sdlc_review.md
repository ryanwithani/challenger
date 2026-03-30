 Context
                                                                                                                                                                                                                                         
     This is a Next.js 15 + Supabase app for tracking Sims 4 legacy challenge progress. The codebase has solid security infrastructure (CSRF, rate limiting, CSP headers) and decent documentation in docs/, but has significant gaps in 
     CI/CD, automated quality gates, and test coverage that would be expected of a production-grade project.                                                                                                                             

     ---
     Prioritized Gap List

     P0 — Security / Immediate Risk

     1. .env.local committed to git
       - The file contains live Supabase keys and service role key
       - .gitignore has .env* rule but the file was force-added or committed before the rule
       - Fix: git rm --cached .env.local, rotate keys, add .env.example as reference template
       - Files: .env.local, .gitignore

     ---
     P1 — CI/CD (Critical Gap — nothing exists)

     2. No GitHub Actions workflows
       - No automated test runs on PR/push
       - No lint/type-check gates
       - No build verification
       - No deployment pipeline
       - Need: .github/workflows/ci.yml (test + lint + type-check + build) and optionally a deploy workflow for Vercel
       - Impact: broken code ships without any automated catch
     3. No pre-commit hooks (Husky + lint-staged)
       - Developers can commit unformatted, unlinted, type-errored code with no local friction
       - Need: husky, lint-staged; run eslint --fix + tsc --noEmit before commit

     ---
     P2 — Testing (High — coverage severely overstated)

     4. Coverage threshold (70%) not actually met
       - Jest config enforces 70% but actual effective coverage is ~35–40%
       - Untested: 5 of 6 API routes, all 4 Zustand stores (~1000+ LOC), 49 of 50 components
       - Highest-risk untested code:
           - src/app/api/auth/signin/route.ts
         - src/app/api/auth/reset-password/route.ts
         - src/lib/store/authStore.ts
         - src/lib/store/challengeStore.ts (90+ functions)
     5. E2E tests are pseudocode / non-functional
       - @playwright/test installed but no playwright.config.ts
       - src/__tests__/e2e/signup.e2e.test.ts contains placeholder structure, not real selectors
       - Either remove or properly configure with playwright install
     6. No centralized mock factories
       - Supabase client mock duplicated in every test file
       - No MSW for consistent API mocking
       - Need: expand src/__tests__/utils/test-helpers.ts with reusable factories

     ---
     P3 — Code Quality Gates (Medium)

     7. No Prettier config
       - Formatting is entirely unenforced; different editors produce different diffs
       - Need: .prettierrc and add prettier --check to CI
     8. ESLint config is minimal
       - Only extends next/core-web-vitals and next/typescript with no custom rules
       - Missing: no-console, import ordering, react hooks exhaustive deps enforcement
       - File: eslint.config.mjs

     ---
     P4 — Process & Documentation (Medium)

     9. No .env.example
       - Onboarding a new developer requires asking someone for the env vars
       - Need: committed template with placeholder values
     10. No CONTRIBUTING.md
       - No documented branch strategy, PR guidelines, or commit message conventions
       - The project has a clear architecture (CLAUDE.md) but nothing for contributors
     11. No CHANGELOG.md
       - No version history; git log is the only record of changes
     12. No PR or issue templates
       - Need: .github/pull_request_template.md, .github/ISSUE_TEMPLATE/
     13. SECURITY.md missing
       - Given the security investment (CSRF, rate limiting, Supabase auth) this is worth documenting
       - Should include: responsible disclosure process, what's protected, session architecture

     ---
     P5 — Lower Priority / Nice-to-Have

     14. No dependency security scanning — Dependabot or Snyk alerts for CVEs in node_modules
     15. No vercel.json — Deployment config is implicit; explicit config would allow env var validation on deploy
     16. Accessibility testing — No a11y checks in test suite or CI
     17. Docker — Not needed given Vercel/Supabase, but a docker-compose.yml for local Supabase instance would help onboarding

     ---
     Verification (if implementing)

     For each item, the completion test is:
     - P0: git log --oneline .env.local returns nothing; new keys in Supabase dashboard
     - P1: Open a PR → GitHub Actions runs and blocks merge on failure
     - P2: npm run test:coverage passes with no threshold failures
     - P3: npx prettier --check . exits 0 in CI
     - P4: A new developer can clone the repo and run it using only documented steps

● Here's the prioritized gap list:   

  ---
  P0 — Security (fix now)                                                                                                                                                                                                                  1. .env.local is in git — live Supabase service role key is exposed. git rm --cached .env.local, rotate keys in Supabase dashboard, add .env.example.
                                                                                                                                                                                                                                         
  ---                                                                                                                                                                                                                                    
  P1 — CI/CD (nothing exists)                                                                                                                                                                                                            
  2. No GitHub Actions — no automated test/lint/type-check/build gates. Broken code ships with zero automated catch.
  3. No pre-commit hooks — no Husky/lint-staged to catch issues before they're committed locally.

  ---
  P2 — Testing (coverage is misleading)
  4. 70% threshold not actually met — real coverage is ~35–40%. All 4 Zustand stores untested, 5 of 6 API routes untested, 49 of 50 components untested. challengeStore alone is 90+ functions with zero coverage.
  5. E2E tests are pseudocode — playwright.config.ts missing, test file is placeholder selectors that can't run.
  6. No centralized mocks — Supabase mock duplicated in every test file.

  ---
  P3 — Code Quality Gates
  7. No Prettier — formatting unenforced, produces noisy diffs.
  8. ESLint is bare — only Next.js defaults, no custom rules.

  ---
  P4 — Process & Docs
  9. No .env.example
  10. No CONTRIBUTING.md
  11. No CHANGELOG.md
  12. No PR/issue templates in .github/
  13. No SECURITY.md (ironic given the solid CSRF/rate-limiting implementation)

  ---
  P5 — Nice-to-have
  14. No Dependabot/Snyk for CVEs
  15. No vercel.json
  16. No accessibility tests
  17. No Docker/local Supabase for onboarding

  The three highest-leverage moves: rotate the leaked keys (P0), add a GitHub Actions CI workflow (P1), and either delete or properly implement the E2E tests (P2) — the fake 70% coverage threshold creates false confidence.