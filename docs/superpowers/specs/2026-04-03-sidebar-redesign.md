# Sidebar Redesign

**Date:** 2026-04-03  
**Status:** Approved

## Context

The sidebar has no visual separation from the main content. The root cause: `surface-muted` (`#f5f3ff`) and `cozy-cream` (`#f5f3ff`) are the same hex value — sidebar and page background are identical colors. The only differentiator is a 1px `border-brand-100` (`#ede9fe`) that is nearly invisible against both surfaces. The result reads as amateur.

## Goal

Give the sidebar clear, modern visual identity using existing palette tokens. No new tokens, no new components.

## Design

### Layout restructure

Change `(protected)/layout.tsx` from a side-by-side flex row (sidebar | [navbar + main]) to a column layout (navbar | [sidebar + main]):

```
Before:                         After:
┌────────┬──────────────┐       ┌───────────────────────┐
│        │   Navbar     │       │        Navbar          │  ← full width, dark
│Sidebar │──────────────│       ├────────┬──────────────┤
│        │   Main       │       │Sidebar │   Main        │
└────────┴──────────────┘       └────────┴──────────────┘
```

The navbar already has the brand logo (CrownIcon + "Challenger"), so moving it to full-width means the sidebar loses its redundant logo section.

### Navbar (`Navbar.tsx`)

- Background: `bg-warmGray-900 dark:bg-warmGray-950` (was `bg-surface-muted`)
- Border: `border-warmGray-800` (was `border-brand-100`)
- Logo text color: keep `text-brand-500` (violet on dark — already works)
- Sign out button: keep existing, already has dark-mode variant

### Sidebar (`Sidebar.tsx`)

**Remove:** the logo section (the top `<div>` with the brand icon + "Challenger" text) — navbar owns this now.

**Background:** `bg-warmGray-900 dark:bg-warmGray-950`  
**Right border:** `border-r border-warmGray-800`

Nav item states:
| State    | Background              | Text                    | Icon                    |
|----------|-------------------------|-------------------------|-------------------------|
| Inactive | —                       | `text-warmGray-400`     | `text-warmGray-500`     |
| Hover    | `bg-warmGray-800`       | `text-warmGray-100`     | `text-warmGray-300`     |
| Active   | `bg-brand-900/40`       | `text-brand-300`        | `text-brand-400`        |

User footer:
- Border: `border-warmGray-800`
- Name text: `text-warmGray-300`
- Settings icon: `text-warmGray-500 hover:text-warmGray-200 hover:bg-warmGray-800`

**Mobile nav:** unchanged — bottom bar stays as-is.

## Files Changed

| File | Change |
|------|--------|
| `src/app/(protected)/layout.tsx` | Restructure flex direction: navbar full-width at top, sidebar+main below |
| `src/components/layout/Navbar.tsx` | Dark background (`warmGray-900`), dark border (`warmGray-800`) |
| `src/components/layout/Sidebar.tsx` | Remove logo section; dark background; updated nav item colors for dark surface |

## Verification

1. `npm run dev` — visually confirm sidebar is clearly distinct from cream content area
2. Toggle dark mode — confirm sidebar reads correctly on both themes
3. Navigate between routes — confirm active state highlights work
4. Resize to mobile — confirm bottom nav unchanged
5. `npm run type-check` — no TS errors
6. `npm run lint` — no lint errors
