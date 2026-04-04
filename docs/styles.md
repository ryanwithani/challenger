# Design System — Challenger (Sims 4 Legacy Tracker)

Quick reference for developers writing new components. Theme: **Deep Violet** — a jewel-toned palette built around violet/purple brand colors with deep purple dark mode surfaces and teal accents.

---

## 1. Color Palette

### Brand Scale (violet/purple)

| Token        | Hex       | Usage                          |
|--------------|-----------|--------------------------------|
| `brand-50`   | `#f5f3ff` | Hover/active tint backgrounds  |
| `brand-100`  | `#ede9fe` | Subtle tinted surfaces         |
| `brand-200`  | `#ddd6fe` | Light fills                    |
| `brand-300`  | `#c4b5fd` | Secondary button base (light)  |
| `brand-400`  | `#a78bfa` | Focus ring color, ghost hover  |
| `brand-500`  | `#8b5cf6` | **Primary brand** — buttons, CTAs, links |
| `brand-600`  | `#7c3aed` | Hover state for primary        |
| `brand-700`  | `#6d28d9` | Active/pressed, dark mode primary base |
| `brand-800`  | `#5b21b6` | Dark mode hover                |
| `brand-900`  | `#4c1d95` | Deepest brand, dark mode tints |

Dark mode overrides `bg-brand-50` → `#4c1d95` and `bg-brand-100` → `#5b21b6` via utility class overrides in `globals.css`.

### Accent (teal — split-complement to violet)

| Token             | Hex       | Usage                     |
|-------------------|-----------|---------------------------|
| `accent-400`      | `#2dd4bf` | Teal highlight, badges    |
| `accent-500`      | `#14b8a6` | Accent button base        |
| `accent-600`      | `#0d9488` | Accent button hover       |
| `accent.success`  | `#22c55e` | Success states            |

### Cozy Named Colors

| Token               | Hex       | Usage                     |
|---------------------|-----------|---------------------------|
| `cozy-cream`        | `#f5f3ff` | Page backgrounds, muted   |
| `cozy-sand`         | `#ede9fe` | Section fills             |
| `cozy-terracotta`   | `#a78bfa` | Decorative accents        |
| `cozy-clay`         | `#6d28d9` | Deep violet text accents  |

### Semantic Surface Tokens

| Token              | Light value          | Dark value           |
|--------------------|----------------------|----------------------|
| `surface.DEFAULT`  | `#ffffff`            | —                    |
| `surface.muted`    | `#f5f3ff` (lavender) | —                    |
| `surface.dark`     | —                    | `#0f0d1a` (deep purple) |

### CSS Custom Properties (HSL)

Consumed by `globals.css`; assigned via `.dark` class:

| Variable          | Light                        | Dark                        |
|-------------------|------------------------------|-----------------------------|
| `--background`    | `hsl(270 25% 98%)`           | `hsl(270 30% 7%)`           |
| `--foreground`    | `hsl(260 30% 12%)`           | `hsl(270 20% 95%)`          |
| `--border`        | `hsl(265 20% 88%)`           | `hsl(265 20% 22%)`          |
| `--card`          | `hsl(270 40% 99%)`           | `hsl(270 25% 11%)`          |
| `--muted`         | `hsl(265 20% 96%)`           | `hsl(265 15% 17%)`          |
| `--primary`       | `hsl(258 90% 66%)` (#8b5cf6) | `hsl(258 80% 72%)`          |
| `--secondary`     | `hsl(265 20% 96%)`           | `hsl(265 15% 17%)`          |

---

## 2. Typography

### Font Families

| Tailwind class  | Family            | Role                                      | Source       |
|-----------------|-------------------|-------------------------------------------|--------------|
| `font-body`     | Nunito Sans       | Body text, UI labels, data tables, forms  | Google Fonts |
| `font-display`  | Fraunces          | All headings, brand/logo, section titles  | Google Fonts |

`font-body` (Nunito Sans) is the default applied to `body` in `globals.css`. Its rounded terminals echo Fraunces' `SOFT` axis, maintaining warmth while providing better readability than serif at small UI sizes. Fraunces is loaded as a variable font with `SOFT` and `opsz` axes; use `font-variation-settings` for fine-grained control.

### Font Size Scale

| Class      | Size  | Line height |
|------------|-------|-------------|
| `text-xs`  | 12px  | 16px        |
| `text-sm`  | 14px  | 20px        |
| `text-base`| 16px  | 24px        |
| `text-lg`  | 18px  | 28px        |
| `text-xl`  | 20px  | 28px        |
| `text-2xl` | 24px  | 32px        |
| `text-3xl` | 30px  | 36px        |
| `text-4xl` | 36px  | 40px        |
| `text-5xl` | 48px  | 1 (tight)   |
| `text-6xl` | 60px  | 1           |
| `text-7xl` | 72px  | 1           |
| `text-8xl` | 96px  | 1           |
| `text-9xl` | 128px | 1           |

**High-DPI override** (`min-resolution: 2dppx`): base font size reduces to 14px; `text-5xl` → 40px, `text-4xl` → 32px, `text-3xl` → 28px, `text-2xl` → 24px. Wide screens (1920px+) restore to 15–16px.

---

## 3. Spacing & Shape

### Border Radius Conventions

| Radius class  | Value   | Use case                                     |
|---------------|---------|----------------------------------------------|
| `rounded-xl`  | 1rem    | Inputs, Toast, small interactive elements    |
| `rounded-2xl` | 1.25rem | Buttons, Cards                               |
| `rounded-3xl` | 1.5rem  | Modals, overlays, larger panels              |

The config extends `xl` to `1rem` and `2xl` to `1.25rem` — these override Tailwind's defaults. `rounded-3xl` is Tailwind's built-in default (1.5rem).

### Common Padding and Gap Values

| Context          | Classes used    |
|------------------|-----------------|
| Card body        | `p-6`           |
| Card header      | `p-6 pb-4`      |
| Card content     | `p-6 pt-0`      |
| Button — sm      | `px-3` (h-8)    |
| Button — md      | `px-4` (h-10)   |
| Button — lg      | `px-6` (h-12)   |
| Button — xl      | `px-8` (h-14)   |
| Input            | `px-3` (h-10)   |
| Toast            | `px-4 py-2`     |

---

## 4. Dark Mode

**Strategy:** class-based (`darkMode: 'class'` in `tailwind.config.ts`). Add the `dark` class to `<html>` to activate. A `ThemeProvider` persists the user's preference (typically to `localStorage`) and applies the class on mount to prevent flash.

**Palette rationale:** Dark mode uses deep purple tones rather than cold grays. `--background` becomes `hsl(270 30% 7%)` (deep purple) and `--card` becomes `hsl(270 25% 11%)`, creating an immersive jewel-toned experience. Pure black is never used.

`body` in `globals.css` transitions `background-color` and `color` over `0.3s ease` when the dark class toggles.

**Gray utility overrides:** `globals.css` overrides common Tailwind gray classes (`.text-gray-900`, `.bg-white`, `.bg-gray-50`, `.border-gray-200`, etc.) under `.dark` selectors so that components using standard gray classes adapt automatically without per-component dark variants.

---

## 5. Component Variants

### Button (`src/components/ui/Button.tsx`)

Base classes on all buttons: `inline-flex items-center justify-center gap-2 rounded-2xl font-medium transition-all duration-base focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 disabled:opacity-50`.

**Variants:**

| Variant       | Visual description                                                        |
|---------------|---------------------------------------------------------------------------|
| `primary`     | Violet gradient (`brand-500` → `brand-600`); white text; `shadow-lg`     |
| `secondary`   | Lighter violet gradient (`brand-400` → `brand-500`); white text          |
| `accent`      | Solid amber (`accent-500`); white text; `shadow-md`                       |
| `outline`     | Transparent bg; `brand-500` border (2px) and text; hover fills `brand-50` |
| `ghost`       | No border/bg; `brand-600` text; hover fills `brand-50`                   |
| `destructive` | Solid red-600; white text; hover red-700                                  |
| `gradient`    | Same as `primary` + `hover:shadow-xl` — use for hero-level CTAs          |

**Sizes:**

| Size | Height | Horizontal padding | Font size   |
|------|--------|--------------------|-------------|
| `sm` | 32px   | 12px               | `text-xs`   |
| `md` | 40px   | 16px               | `text-sm`   |
| `lg` | 48px   | 24px               | `text-sm`   |
| `xl` | 56px   | 32px               | `text-base` |

Default: `variant="primary" size="md"`.

**Loading state:** Pass `loading` prop. Renders a spinning border ring (16×16px, `animate-spin`) with `loadingText` (defaults to `"Loading..."`). Button is `disabled` while loading.

### Input (`src/components/ui/Input.tsx`)

| State   | Classes                                                         |
|---------|-----------------------------------------------------------------|
| Default | `border-gray-300 bg-white text-gray-900`                        |
| Focus   | `focus:border-brand-500 focus:ring-2 focus:ring-brand-200`      |
| Error   | `border-red-500 focus:ring-red-200` + `<p class="text-xs text-red-600">` below |

Height: `h-10`. Radius: `rounded-xl`. Padding: `px-3`. Full width (`w-full`). Placeholder: `text-gray-400`.

Pass `error="message"` to activate the error state and render the message text below the field.

### Card (`src/components/ui/Card.tsx`)

Compound component — four named exports:

| Export        | Element | Default classes                                                             |
|---------------|---------|-----------------------------------------------------------------------------|
| `Card`        | `div`   | `rounded-2xl border border-gray-200 bg-white shadow-sm` (dark: warm equivalents) |
| `CardHeader`  | `div`   | `flex flex-col space-y-1.5 p-6 pb-4`                                       |
| `CardTitle`   | `h3`    | `text-lg font-semibold leading-none tracking-tight`                         |
| `CardContent` | `div`   | `p-6 pt-0`                                                                  |

All four accept a `className` prop for extension.

### Toast (`src/components/ui/Toast.tsx`)

Fixed position: `bottom-4 right-4`. Radius: `rounded-xl`. Auto-dismisses after 2500ms.

| `type` prop | Background      |
|-------------|-----------------|
| `success`   | `bg-emerald-600` |
| `error`     | `bg-red-600`    |

Uses `shadow-card`. White text, `text-sm`. Note: no dark mode variant — a gap to address if building new notification components.

---

## 6. Shadows & Focus Rings

### Box Shadow Tokens

| Token         | Value                                  | Use case                          |
|---------------|----------------------------------------|-----------------------------------|
| `shadow-card` | `0 8px 20px rgba(22, 8, 62, 0.08)`     | Cards, Toasts, elevated surfaces  |
| `shadow-glow` | `0 0 0 3px rgba(139, 92, 246, 0.25)`   | Brand-colored glow on focus/hover |

### Focus Rings

- Buttons: `focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2`
- Input normal: `focus:ring-2 focus:ring-brand-200` (lighter, with border color change)
- Input error: `focus:ring-red-200`

Use `focus-visible` wherever possible — keyboard users see rings, pointer users do not.

---

## 7. Icon System

Three CSS mask classes in `globals.css` under `@layer utilities`. Each renders a brand-gradient SVG mask over a positioned `::before` pseudo-element (parent must be `position: relative` with explicit dimensions).

| Class                          | SVG file                 | Use case               |
|--------------------------------|--------------------------|------------------------|
| `icon-gradient-mask`           | `/ChallengerCrown.svg`   | App logo / branding    |
| `challenge-icon-gradient-mask` | `/ChallengeIcon.svg`     | Challenge list items   |
| `sim-icon-gradient-mask`       | `/SimIcon.svg`           | Sim list items         |

Gradient: `linear-gradient(135deg, #8b5cf6 0%, #7c3aed 50%, #6d28d9 100%)`. Dark mode shifts the last stop to `#5b21b6`. The `<img>` inside the wrapper is hidden (`opacity: 0`) when the mask class is active.

**Filter-based alternatives** (for `<img>` or `<svg>` that cannot use `::before`):

| Class                 | Effect                                        |
|-----------------------|-----------------------------------------------|
| `icon-brand`          | Recolors to solid brand-500 equivalent        |
| `icon-brand-gradient` | Recolors with slight gradient/saturation boost |

Both have `.dark` variants with adjusted filter values.

---

## 8. Motion & Transitions

### Duration Tokens

| Token name | Value | Tailwind class  |
|------------|-------|-----------------|
| `fast`     | 150ms | `duration-fast` |
| `base`     | 250ms | `duration-base` |

### Where Each Is Applied

| Duration | Applied to                                                              |
|----------|-------------------------------------------------------------------------|
| `fast`   | Color-only hover transitions on links and icons                         |
| `base`   | Button `transition-all` (all variants); general component state changes |

`body` uses `transition: background-color 0.3s ease, color 0.3s ease` (hardcoded 300ms) for theme switching.

`tailwindcss-animate` provides `animate-spin` (Button loading spinner) and additional keyframe utilities.

Always add `prefers-reduced-motion: reduce` overrides when introducing new animations beyond simple color transitions.


