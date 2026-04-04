# Sidebar Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give the sidebar clear visual separation from the main content by switching to a dark chrome layout with the navbar spanning full width.

**Architecture:** Restructure the protected layout from sidebar-left + [navbar+main]-right to navbar-top (full width) + [sidebar+main]-below. Sidebar and navbar both use `warmGray-900` dark background. Content area stays cream. This uses only existing palette tokens — no new Tailwind values.

**Tech Stack:** Next.js 15 App Router, Tailwind CSS, Zustand (authStore for user data in sidebar)

**Spec:** `docs/superpowers/specs/2026-04-03-sidebar-redesign.md`

---

## File Map

| File | Change |
|------|--------|
| `src/app/(protected)/layout.tsx` | Restructure outer flex from row to column |
| `src/components/layout/Navbar.tsx` | `bg-warmGray-900`, `border-warmGray-800` |
| `src/components/layout/Sidebar.tsx` | Remove logo section; `bg-warmGray-900`; updated nav item colors |

---

### Task 1: Restructure protected layout

The current layout wraps `<Sidebar />` and `<div class="flex-1 flex-col">` (which contains navbar + main) in a horizontal flex row. We need to lift `<Navbar />` out so it spans full width above both sidebar and main.

**Files:**
- Modify: `src/app/(protected)/layout.tsx`

- [ ] **Step 1: Update the layout JSX**

Replace the `return` block's inner structure. The outer div keeps `flex min-h-screen` but becomes `flex-col`. A new inner row holds sidebar + main.

```tsx
return (
  <div className="flex flex-col min-h-screen bg-cozy-cream dark:bg-surface-dark">
    <Navbar />
    <div className="flex flex-1">
      <Sidebar />
      <main className="flex-1 p-4 lg:p-6 pb-24 lg:pb-6">
        {children}
      </main>
    </div>
  </div>
)
```

The full file after the change (only the return block changes — all the auth redirect logic above it stays identical):

```tsx
'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/src/lib/store/authStore'
import { Sidebar } from '@/src/components/layout/Sidebar'
import { Navbar } from '@/src/components/layout/Navbar'
import { Footer } from '@/src/components/layout/Footer'

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, loading, initialized, initialize } = useAuthStore()

  const isFullPageLayout = pathname?.startsWith('/challenge/')

  useEffect(() => {
    if (!initialized) {
      initialize()
    }
  }, [initialized, initialize])

  useEffect(() => {
    if (initialized && !loading && !user) {
      router.push('/')
    }
  }, [user, loading, initialized, router])

  if (user && !user.email_confirmed_at) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Verify Your Email</h1>
          <p className="text-gray-600">
            Please check your email and click the verification link to continue.
          </p>
        </div>
      </div>
    )
  }

  if (!initialized || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-brand-500 dark:border-brand-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <div className="text-gray-600 dark:text-warmGray-200 mt-4">Loading...</div>
          <div className="text-sm text-gray-400">
            If loading takes more than 10 seconds, please
            <button
              onClick={() => window.location.reload()}
              className="text-brand-500 dark:text-brand-400 hover:underline ml-1">
              refresh the page
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-cozy-cream dark:bg-surface-dark">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-4 lg:p-6 pb-24 lg:pb-6">
          {children}
        </main>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npm run type-check
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/(protected)/layout.tsx
git commit -m "refactor(layout): lift navbar to full-width above sidebar+main"
```

---

### Task 2: Dark navbar

**Files:**
- Modify: `src/components/layout/Navbar.tsx`

The navbar currently uses `bg-surface-muted dark:bg-warmGray-900 border-b border-brand-100 dark:border-warmGray-700`. We change the light-mode values to match the dark sidebar.

- [ ] **Step 1: Update the `<nav>` className**

In `src/components/layout/Navbar.tsx`, the `<nav>` element is on line 23. Change its className from:

```tsx
<nav className="bg-surface-muted dark:bg-warmGray-900 border-b border-brand-100 dark:border-warmGray-700 px-6 lg:px-8 py-4">
```

to:

```tsx
<nav className="bg-warmGray-900 border-b border-warmGray-800 px-6 lg:px-8 py-4">
```

Dark mode variants are removed because `warmGray-900` is already the dark value — both modes use the same dark chrome. `warmGray-800` (`#312b50`) is visible against `#1a1630` in both modes.

- [ ] **Step 2: Verify the logo text still reads correctly**

The logo `<h1>` uses `text-brand-500` (`#8b5cf6` violet). Violet on `#1a1630` dark background has strong contrast — no change needed.

The Sign Out button uses `border-brand-500 text-brand-500` — violet on dark also works fine. No change needed.

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npm run type-check
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/Navbar.tsx
git commit -m "refactor(navbar): switch to dark warmGray-900 background"
```

---

### Task 3: Dark sidebar — remove logo, update colors

**Files:**
- Modify: `src/components/layout/Sidebar.tsx`

Two changes: (1) remove the logo section (navbar now owns the brand), (2) apply dark background + updated nav item colors.

- [ ] **Step 1: Write the full updated Sidebar component**

Replace the entire file contents with:

```tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { clsx } from 'clsx'
import { TbHome, TbTarget, TbUser, TbUsers } from 'react-icons/tb'
import { useAuthStore } from '@/src/lib/store/authStore'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: TbHome },
  { name: 'Challenges', href: '/dashboard/challenges', icon: TbTarget },
  { name: 'Sims', href: '/sims', icon: TbUsers },
  { name: 'Profile', href: '/profile', icon: TbUser },
]

export function Sidebar() {
  const pathname = usePathname()
  const { user, userProfile } = useAuthStore()
  const displayName = userProfile?.display_name || userProfile?.username || user?.user_metadata?.username || 'Challenger'
  const userInitial = displayName.charAt(0).toUpperCase()

  const isActiveLink = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard'
    }
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:flex w-64 bg-warmGray-900 border-r border-warmGray-800 flex-col transition-colors">
        <div className="flex-1 flex flex-col pt-4 pb-4 overflow-y-auto">
          <nav className="flex-1 px-4 space-y-1">
            <div className="space-y-1">
              {navigation.map((item) => {
                const isActive = isActiveLink(item.href)

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={clsx(
                      'group flex items-center px-4 py-3 text-base font-medium rounded-lg transition-colors',
                      {
                        'bg-brand-900/40 text-brand-300': isActive,
                        'text-warmGray-400 hover:bg-warmGray-800 hover:text-warmGray-100': !isActive,
                      }
                    )}
                  >
                    <item.icon
                      className={clsx(
                        'mr-3 h-6 w-6 flex-shrink-0',
                        {
                          'text-brand-400': isActive,
                          'text-warmGray-500 group-hover:text-warmGray-300': !isActive,
                        }
                      )}
                      aria-hidden="true"
                    />
                    <div className="flex-1">
                      <div>{item.name}</div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </nav>
        </div>

        {/* User Section */}
        <div className="flex-shrink-0 flex border-t border-warmGray-800 p-5">
          <div className="flex items-center w-full">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-brand-500 rounded-full flex items-center justify-center">
                <span className="text-white text-base font-bold">{userInitial}</span>
              </div>
            </div>
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-base font-medium text-warmGray-300 truncate">
                {displayName}
              </p>
            </div>

            {/* Settings Icon */}
            <Link
              href="/profile"
              className="ml-2 p-2 rounded-lg text-warmGray-500 hover:text-warmGray-200 hover:bg-warmGray-800 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile bottom navigation — unchanged */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-surface-muted dark:bg-warmGray-900 border-t border-brand-100 dark:border-warmGray-700">
        <div className="flex justify-around items-center h-[72px]">
          {navigation.map((item) => {
            const isActive = isActiveLink(item.href)
            return (
              <Link
                key={item.name}
                href={item.href}
                className={clsx(
                  'flex flex-col items-center justify-center flex-1 h-full text-[11px] font-semibold tracking-wide transition-colors',
                  {
                    'text-brand-600 dark:text-brand-400': isActive,
                    'text-warmGray-500 dark:text-warmGray-400': !isActive,
                  }
                )}
              >
                <item.icon className="h-6 w-6 mb-1" aria-hidden="true" />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
```

Key changes from original:
- Removed the top logo `<div>` block entirely
- `bg-surface-muted dark:bg-warmGray-900` → `bg-warmGray-900` (single value, no dark variant needed)
- `border-r border-brand-100 dark:border-warmGray-700` → `border-r border-warmGray-800`
- `mt-4` on `<nav>` removed (was spacing below logo — now just `pt-4` on wrapper)
- Active state: `bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300` → `bg-brand-900/40 text-brand-300`
- Inactive state: `text-warmGray-600 hover:bg-warmGray-50 hover:text-warmGray-950 dark:text-warmGray-200 dark:hover:bg-warmGray-800` → `text-warmGray-400 hover:bg-warmGray-800 hover:text-warmGray-100`
- Active icon: `text-brand-600 dark:text-brand-400` → `text-brand-400`
- Inactive icon: `text-warmGray-400 group-hover:text-warmGray-500 dark:text-warmGray-300 dark:group-hover:text-warmGray-200` → `text-warmGray-500 group-hover:text-warmGray-300`
- User footer border: `border-brand-100 dark:border-warmGray-700` → `border-warmGray-800`
- User name text: `text-warmGray-600 dark:text-warmGray-200` → `text-warmGray-300`
- Settings icon: removed dark variants, simplified to `text-warmGray-500 hover:text-warmGray-200 hover:bg-warmGray-800`

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npm run type-check
```

Expected: no errors.

- [ ] **Step 3: Run lint**

```bash
npm run lint
```

Expected: no errors.

- [ ] **Step 4: Start dev server and visually verify**

```bash
npm run dev
```

Check at `http://localhost:3000`:
1. Dark sidebar (`#1a1630`) is clearly distinct from the cream content area (`#f5f3ff`)
2. Navbar spans full width with same dark background
3. Active nav item shows violet highlight (`brand-300` text, `brand-900/40` bg)
4. Hover states work on inactive items
5. User avatar + name visible at bottom of sidebar
6. Toggle dark mode — sidebar remains dark, reads correctly
7. Resize to mobile (< 1024px) — sidebar hidden, bottom nav appears unchanged

- [ ] **Step 5: Commit**

```bash
git add src/components/layout/Sidebar.tsx
git commit -m "refactor(sidebar): dark chrome, remove redundant logo, update nav item colors"
```
