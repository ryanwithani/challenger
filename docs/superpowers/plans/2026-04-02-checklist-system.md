# Checklist System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add per-challenge checklist tracking across 7 Sims 4 gameplay categories (skills, aspirations, careers, parties, traits, deaths, collections) with goal counter integration on completion.

**Architecture:** Static TypeScript catalog (797 items across 7 files) bundled client-side for O(1) lookup. Single `challenge_completions` DB table with sparse rows written only on completion. Atomic Supabase RPC handles insert + goal counter increment in one round-trip. Zustand store extended with `completions` Set and optimistic toggle.

**Tech Stack:** TypeScript, Next.js 15 App Router, Supabase (Postgres + RPC), Zustand, Tailwind CSS, Jest, React Testing Library

**Spec:** `docs/superpowers/specs/2026-04-02-checklist-system-design.md`

---

## File Map

| Action | File | Responsibility |
|--------|------|---------------|
| Create | `src/data/checklists/types.ts` | `ChecklistItem` type definition |
| Create | `src/data/checklists/goalMapping.ts` | `CATEGORY_GOAL_MAP` constant + `CHECKLIST_CATEGORIES` array |
| Create | `src/data/checklists/deaths.ts` | 42 death items |
| Create | `src/data/checklists/parties.ts` | 38 party/event items |
| Create | `src/data/checklists/collections.ts` | 47 collection items |
| Create | `src/data/checklists/skills.ts` | 74 skill items |
| Create | `src/data/checklists/aspirations.ts` | 97 aspiration items |
| Create | `src/data/checklists/careers.ts` | 91 career items |
| Create | `src/data/checklists/traits.ts` | 402 trait items |
| Create | `src/data/checklists/index.ts` | Merged `CATALOG` record + per-category arrays |
| Create | `src/__tests__/data/checklists/catalog.test.ts` | Catalog integrity tests |
| Create | `supabase/migrations/20260403_add_challenge_completions.sql` | Table + RLS + index + RPC |
| Modify | `src/lib/store/challengeStore.ts` | Add `completions`, `fetchCompletions`, `toggleCompletion` |
| Modify | `src/__tests__/unit/challengeStore.test.ts` | Tests for completion actions |
| Create | `src/components/checklist/ChecklistItemRow.tsx` | Single checklist row (checkbox + name + pack badge) |
| Create | `src/components/checklist/ChecklistPanel.tsx` | Category panel with grouped items |
| Create | `src/components/checklist/ChecklistCategoryTabs.tsx` | 7-category tab bar with completion badges |
| Create | `src/components/checklist/index.ts` | Barrel export |
| Create | `src/__tests__/components/checklist/ChecklistItemRow.test.tsx` | Row render + toggle tests |
| Create | `src/__tests__/components/checklist/ChecklistPanel.test.tsx` | Grouping + count tests |
| Create | `src/__tests__/components/checklist/ChecklistCategoryTabs.test.tsx` | Tab switching + badge tests |
| Modify | `src/app/(protected)/challenge/[id]/page.tsx` | Add Checklist tab |
| Modify | `src/data/packs.ts` | Add missing `AA` pack acronym |

---

## Task 1: Add missing pack acronym

The CSV data references `AA` (a pack) which is not in `src/data/packs.ts`. Some CSVs also use `KK` (should be `NK` for Nifty Knitting) and `ROM` (should be `RoM` for Realm of Magic) — those are normalization issues handled in catalog tasks, not here.

**Files:**
- Modify: `src/data/packs.ts:50` (after Enchanted by Nature)
- Test: `src/__tests__/unit/packs.test.ts` (verify new acronym is in PACK_ACRONYMS)

- [ ] **Step 1: Write the failing test**

In `src/__tests__/unit/packs.test.ts`, add:

```typescript
test('AA pack acronym exists', () => {
  expect(PACK_ACRONYMS).toContain('AA')
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest src/__tests__/unit/packs.test.ts --testNamePattern="AA pack" -v`
Expected: FAIL — `AA` not in array

- [ ] **Step 3: Add AA to PACKS array**

In `src/data/packs.ts`, after the Enchanted by Nature line (`{ acronym: 'EBN', ...}`), add:

```typescript
  { acronym: 'AA', name: 'Adventures Aplenty', category: 'expansion_pack' },
```

**Important:** Confirm the official pack name with the user if uncertain. "Adventures Aplenty" is the best guess from item context (getaways, archery, camping, butterflies).

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest src/__tests__/unit/packs.test.ts --testNamePattern="AA pack" -v`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/data/packs.ts src/__tests__/unit/packs.test.ts
git commit -m "feat(packs): add AA pack acronym for Adventures Aplenty"
```

---

## Task 2: Checklist types and goal mapping

**Files:**
- Create: `src/data/checklists/types.ts`
- Create: `src/data/checklists/goalMapping.ts`

- [ ] **Step 1: Create the ChecklistItem type**

Create `src/data/checklists/types.ts`:

```typescript
export interface ChecklistItem {
  /** Unique key in format "{catalogType}:{name}", e.g. "skills:Cooking" */
  readonly key: string
  /** Display name shown in the UI */
  readonly name: string
  /** Subcategory within the catalog (e.g. "Cooking" within Skills) */
  readonly category: string
  /** Pack acronym matching src/data/packs.ts (e.g. "TS4", "GT") */
  readonly pack: string
}

/** The 7 catalog types used as key prefixes */
export type CatalogType =
  | 'skills'
  | 'aspirations'
  | 'careers'
  | 'parties'
  | 'traits'
  | 'deaths'
  | 'collections'
```

- [ ] **Step 2: Create the goal mapping constant**

Create `src/data/checklists/goalMapping.ts`:

```typescript
import type { CatalogType } from './types'

/**
 * Maps each catalog type to the goal_type string used in the goals table.
 * When a checklist item is completed, the system extracts the catalog prefix
 * from the item key and looks up which goal counter to increment.
 */
export const CATEGORY_GOAL_MAP: Record<CatalogType, string> = {
  skills: 'skills_completed',
  aspirations: 'aspirations_completed',
  careers: 'careers_completed',
  parties: 'parties_hosted',
  deaths: 'deaths_collected',
  traits: 'traits_collected',
  collections: 'collections_completed',
} as const

/** Ordered list of checklist categories for tab display */
export const CHECKLIST_CATEGORIES: CatalogType[] = [
  'skills',
  'aspirations',
  'careers',
  'parties',
  'traits',
  'deaths',
  'collections',
]

/** Display labels for each category */
export const CATEGORY_LABELS: Record<CatalogType, string> = {
  skills: 'Skills',
  aspirations: 'Aspirations',
  careers: 'Careers',
  parties: 'Parties',
  traits: 'Traits',
  deaths: 'Deaths',
  collections: 'Collections',
}

/**
 * Extracts the catalog type from an item key.
 * "skills:Cooking" -> "skills"
 */
export function getCatalogType(itemKey: string): CatalogType {
  return itemKey.split(':')[0] as CatalogType
}

/**
 * Resolves the goal_type for a given item key.
 * "skills:Cooking" -> "skills_completed"
 */
export function getGoalTypeForItem(itemKey: string): string | undefined {
  const catalogType = getCatalogType(itemKey)
  return CATEGORY_GOAL_MAP[catalogType]
}
```

- [ ] **Step 3: Run type check**

Run: `npx tsc --noEmit`
Expected: No errors from new files

- [ ] **Step 4: Commit**

```bash
git add src/data/checklists/types.ts src/data/checklists/goalMapping.ts
git commit -m "feat(checklists): add ChecklistItem type and goal mapping constants"
```

---

## Task 3: Small catalogs — deaths, parties, collections

Each catalog file exports a `readonly ChecklistItem[]` array. Items are keyed as `"{catalogType}:{name}"` with the subcategory from the CSV's first column.

**Data source CSVs:** `C:\Users\rbwal\Downloads\deaths.csv`, `C:\Users\rbwal\Downloads\parties.csv`, `C:\Users\rbwal\Downloads\collections.csv`

**Files:**
- Create: `src/data/checklists/deaths.ts`
- Create: `src/data/checklists/parties.ts`
- Create: `src/data/checklists/collections.ts`

- [ ] **Step 1: Create deaths catalog**

Create `src/data/checklists/deaths.ts`. Read `C:\Users\rbwal\Downloads\deaths.csv` and transform each data row.

CSV structure: `Category,Death,Completed?,Gen Completed,Dead Sim,Notes,Pack`
- Column A = subcategory (use as `category`). Rows with empty category inherit from the row above.
- Column B = death name (use as `name`)
- Column G = pack acronym (use as `pack`)
- Key format: `deaths:{name}`

Example output showing the first items:

```typescript
import type { ChecklistItem } from './types'

export const DEATHS: readonly ChecklistItem[] = [
  // Animals
  { key: 'deaths:Beetles', name: 'Beetles', category: 'Animals', pack: 'EL' },
  { key: 'deaths:Flies', name: 'Flies', category: 'Animals', pack: 'EL' },
  { key: 'deaths:Killer Chicken', name: 'Killer Chicken', category: 'Animals', pack: 'CLV' },
  { key: 'deaths:Killer Rabbit', name: 'Killer Rabbit', category: 'Animals', pack: 'CLV' },
  { key: 'deaths:Murder of Crows', name: 'Murder of Crows', category: 'Animals', pack: 'L&D' },
  { key: 'deaths:Rabid Rodent Fever', name: 'Rabid Rodent Fever', category: 'Animals', pack: 'MFP' },
  // Elders
  { key: 'deaths:Death in Sleep', name: 'Death in Sleep', category: 'Elders', pack: 'L&D' },
  { key: 'deaths:Old Age', name: 'Old Age', category: 'Elders', pack: 'TS4' },
  { key: 'deaths:Overexertion (Elders)', name: 'Overexertion (Elders)', category: 'Elders', pack: 'TS4' },
  // ... continue for ALL rows in the CSV
] as const
```

**Expected count: 42 items** (CSV data rows 3–44, skipping header rows 1–2).

Subcategories in order: Animals, Elders, Emotion, Failure, Ghost, Item Based, Knowledge, Life Happens, Plants, Poison, Weather.

- [ ] **Step 2: Create parties catalog**

Create `src/data/checklists/parties.ts`. Read `C:\Users\rbwal\Downloads\parties.csv`.

CSV structure: `category,party,Completed?,Gen. Completed,Host Sim,Notes,Pack`
- Column A = subcategory (inherit from above when empty)
- Column B = party name
- Column G = pack acronym
- Key format: `parties:{name}`

Example:

```typescript
import type { ChecklistItem } from './types'

export const PARTIES: readonly ChecklistItem[] = [
  // Parties
  { key: 'parties:Black and White Bash', name: 'Black and White Bash', category: 'Parties', pack: 'TS4' },
  { key: 'parties:Dance Party', name: 'Dance Party', category: 'Parties', pack: 'GT' },
  // ... continue for ALL rows
] as const
```

**Expected count: 38 items** (rows 3–40).

Subcategories: Parties, Celebrities, Outdoors, Family Get Togethers, Wedding Activities, Date/Hangout, School Events, Children.

- [ ] **Step 3: Create collections catalog**

Create `src/data/checklists/collections.ts`. Read `C:\Users\rbwal\Downloads\collections.csv`.

CSV structure: `Category,Collection,Size,Completed?,Gen. Completed,Notes,Pack`
- Column A = subcategory (inherit from above when empty)
- Column B = collection name
- Column C = size (number of items in collection) — **ignore this column**; not part of ChecklistItem
- Column G = pack acronym
- Key format: `collections:{name}`

Example:

```typescript
import type { ChecklistItem } from './types'

export const COLLECTIONS: readonly ChecklistItem[] = [
  // Living Things
  { key: 'collections:Aliens', name: 'Aliens', category: 'Living Things', pack: 'TS4' },
  { key: 'collections:Axolotls', name: 'Axolotls', category: 'Living Things', pack: 'L' },
  // ... continue for ALL rows
] as const
```

**Expected count: 47 items** (rows 3–49).

Subcategories: Living Things, Rocks, Science, Challenges, Location, Plants, Toys, Other.

- [ ] **Step 4: Run type check**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 5: Commit**

```bash
git add src/data/checklists/deaths.ts src/data/checklists/parties.ts src/data/checklists/collections.ts
git commit -m "feat(checklists): add deaths, parties, and collections catalogs"
```

---

## Task 4: Medium catalogs — skills, aspirations, careers

**Data sources:** `C:\Users\rbwal\Downloads\skills.csv`, `C:\Users\rbwal\Downloads\aspirations.csv`, `C:\Users\rbwal\Downloads\careers.csv`

**Files:**
- Create: `src/data/checklists/skills.ts`
- Create: `src/data/checklists/aspirations.ts`
- Create: `src/data/checklists/careers.ts`

- [ ] **Step 1: Create skills catalog**

Read `C:\Users\rbwal\Downloads\skills.csv`.

CSV structure: `Category,Skill,Completed?,Gen. Completed,Skillful Sim,Notes,Pack`
- Column A = subcategory. Column B = skill name. Column G = pack.
- Key format: `skills:{name}`

**Pack normalization:** The CSV uses `KK` for Knitting — normalize to `NK` (the acronym in `src/data/packs.ts` for Nifty Knitting).

Example:

```typescript
import type { ChecklistItem } from './types'

export const SKILLS: readonly ChecklistItem[] = [
  // Animal
  { key: 'skills:Entymology', name: 'Entymology', category: 'Animal', pack: 'AA' },
  { key: 'skills:Horse Riding', name: 'Horse Riding', category: 'Animal', pack: 'HR' },
  { key: 'skills:Pet Training', name: 'Pet Training', category: 'Animal', pack: 'C&D' },
  { key: 'skills:Veterinarian', name: 'Veterinarian', category: 'Animal', pack: 'C&D' },
  // Art
  { key: 'skills:Acting', name: 'Acting', category: 'Art', pack: 'GF' },
  // ... continue for ALL rows
] as const
```

**Expected count: 74 items** (rows 3–76).

Subcategories: Animal, Art, Child, Cooking, Crafting, Fitness, History, Horse, Music, Occult, Outdoors, Social, Technology, Tinkering, Toddler.

- [ ] **Step 2: Create aspirations catalog**

Read `C:\Users\rbwal\Downloads\aspirations.csv`.

CSV structure: `Category,Aspiration,Completed?,Gen. Completed,Aspiring Sim,Notes,Pack`
- Column A = subcategory. Column B = aspiration name. Column G = pack.
- Key format: `aspirations:{name}`

**Pack normalization:** Some rows may use `NK` for Nifty Knitting (check CSV) — use `NK`.

Example:

```typescript
import type { ChecklistItem } from './types'

export const ASPIRATIONS: readonly ChecklistItem[] = [
  // Animal
  { key: 'aspirations:Friend of the Animals', name: 'Friend of the Animals', category: 'Animal', pack: 'C&D' },
  // Athletic
  { key: 'aspirations:Bodybuilder', name: 'Bodybuilder', category: 'Athletic', pack: 'TS4' },
  { key: 'aspirations:Extreme Sports Enthusiast', name: 'Extreme Sports Enthusiast', category: 'Athletic', pack: 'SE' },
  // ... continue for ALL rows
] as const
```

**Expected count: 97 items** (rows 3–99).

Subcategories: Animal, Athletic, Children, Creativity, Deviance, Fairy, Family, Food, Fortune, Knowledge, Location, Love, Nature, Teen, Popularity, Star Wars, Wellness, Werewolf.

- [ ] **Step 3: Create careers catalog**

Read `C:\Users\rbwal\Downloads\careers.csv`.

CSV structure: `Career,Branch,Completed?,Gen. Completed,Employed Sim,Notes,Pack`
- Column A = career name (use as `category`). Column B = branch name (use as `name`). Column G = pack.
- Key format: `careers:{branch name}`

**Special handling:** Some careers have a single branch with the same name (e.g., Actor/Actress, Detective, Doctor). For those, `name` and `category` will be the same — that's fine. Trim trailing whitespace from career/branch names (e.g., "Actor/Actress " has a trailing space in the CSV).

Example:

```typescript
import type { ChecklistItem } from './types'

export const CAREERS: readonly ChecklistItem[] = [
  // Actor/Actress
  { key: 'careers:Actor/Actress', name: 'Actor/Actress', category: 'Actor/Actress', pack: 'GF' },
  // Astronaut
  { key: 'careers:Space Ranger', name: 'Space Ranger', category: 'Astronaut', pack: 'TS4' },
  { key: 'careers:Interstellar Smuggler', name: 'Interstellar Smuggler', category: 'Astronaut', pack: 'TS4' },
  // ... continue for ALL rows
] as const
```

**Expected count: 91 items** (rows 3–93).

Career categories: Actor/Actress, Astronaut, Athlete, Business, Civil Designer, Conservationist, Criminal, Critic, Culinary, Detective, Doctor, Education, Engineer, Entertainer, Freelancer, Gardener, Interior Designer, Law, Military, Naturopath, Park Worker, Painter, Politician, Reaper, Romance Consultant, Salaryperson, Scientist, Secret Agent, Social Media, Self-Employed, Style Influencer, Tech Guru, Undertaker, Writer, Part-Time, Afterschool, University Teams, University Organizations.

**Note on parenthetical levels:** Some career names include level indicators like "(3)" or "(4)" — e.g., "Drama Club (4)", "Scout (5)". Preserve these in the name as they appear in the CSV.

- [ ] **Step 4: Run type check**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 5: Commit**

```bash
git add src/data/checklists/skills.ts src/data/checklists/aspirations.ts src/data/checklists/careers.ts
git commit -m "feat(checklists): add skills, aspirations, and careers catalogs"
```

---

## Task 5: Large catalog — traits

**Data source:** `C:\Users\rbwal\Downloads\traits.csv`

**Files:**
- Create: `src/data/checklists/traits.ts`

- [ ] **Step 1: Create traits catalog**

Read `C:\Users\rbwal\Downloads\traits.csv`.

CSV structure: `Category,,Trait,Completed?,First. Gen,Sim with Personality,Notes,Pack`
- **Note the empty column B** — this CSV has 8 columns, not 7. Column A = subcategory, Column C = trait name, Column H = pack.
- Column A = subcategory (inherit from above when empty).
- Key format: `traits:{name}`

**Pack normalization:**
- `ROM` (uppercase) in traits → normalize to `RoM` (matching `src/data/packs.ts`)
- Some traits have an empty pack field (e.g., "Home Turf", "Chopstick Savvy", "Thoughtful Child", "Was a Best Friend") — use empty string `''`

Example:

```typescript
import type { ChecklistItem } from './types'

export const TRAITS: readonly ChecklistItem[] = [
  // Emotional
  { key: 'traits:Active Imagination', name: 'Active Imagination', category: 'Emotional', pack: 'FFE' },
  { key: 'traits:Ambitious', name: 'Ambitious', category: 'Emotional', pack: 'TS4' },
  { key: 'traits:Cheerful', name: 'Cheerful', category: 'Emotional', pack: 'TS4' },
  { key: 'traits:Childish', name: 'Childish', category: 'Emotional', pack: 'TS4' },
  { key: 'traits:Clumsy', name: 'Clumsy', category: 'Emotional', pack: 'TS4' },
  // ... continue for ALL 402 rows
] as const
```

**Expected count: 402 items** (rows 3–404).

Subcategories (in CSV order): Emotional, Hobby, Lifestyle, Social, Toddler, Infant, Adult Aspiration Rewards, Age-Up Rewards, Bonus Traits, Career, Character Value, Child Aspiration Reward, Confidence, Death, Food Mastery, Formative Moments, Getaway Rewards, High School, Inherited, Mountaineer, Occult, Satisfaction Reward, Secret Keeping, Skill Based, Small Business, Teen Aspiration Reward.

**This is the largest catalog.** Take care to:
1. Read ALL 402 rows from the CSV
2. Trim whitespace from names (some have trailing spaces like "Mental " on row 14)
3. Track the current category — many rows have empty Column A, inheriting from above
4. Use Column C for the trait name (not Column B, which is always empty)

- [ ] **Step 2: Run type check**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/data/checklists/traits.ts
git commit -m "feat(checklists): add traits catalog (402 items)"
```

---

## Task 6: Catalog index and tests

**Files:**
- Create: `src/data/checklists/index.ts`
- Create: `src/__tests__/data/checklists/catalog.test.ts`

- [ ] **Step 1: Create the catalog index**

Create `src/data/checklists/index.ts`:

```typescript
import type { ChecklistItem, CatalogType } from './types'
import { SKILLS } from './skills'
import { ASPIRATIONS } from './aspirations'
import { CAREERS } from './careers'
import { PARTIES } from './parties'
import { TRAITS } from './traits'
import { DEATHS } from './deaths'
import { COLLECTIONS } from './collections'

export type { ChecklistItem, CatalogType }
export { CATEGORY_GOAL_MAP, CHECKLIST_CATEGORIES, CATEGORY_LABELS, getCatalogType, getGoalTypeForItem } from './goalMapping'

/** Per-category arrays for iteration and display */
export const CATALOG_BY_TYPE: Record<CatalogType, readonly ChecklistItem[]> = {
  skills: SKILLS,
  aspirations: ASPIRATIONS,
  careers: CAREERS,
  parties: PARTIES,
  traits: TRAITS,
  deaths: DEATHS,
  collections: COLLECTIONS,
}

/** Flat lookup by item key — O(1) access */
export const CATALOG: Record<string, ChecklistItem> = Object.fromEntries(
  Object.values(CATALOG_BY_TYPE)
    .flat()
    .map(item => [item.key, item])
)

/** All catalog items as a flat array */
export const ALL_ITEMS: readonly ChecklistItem[] = Object.values(CATALOG_BY_TYPE).flat()

/** Total number of items across all catalogs */
export const CATALOG_SIZE = ALL_ITEMS.length
```

- [ ] **Step 2: Write catalog integrity tests**

Create `src/__tests__/data/checklists/catalog.test.ts`:

```typescript
import {
  CATALOG,
  CATALOG_BY_TYPE,
  ALL_ITEMS,
  CATALOG_SIZE,
  CHECKLIST_CATEGORIES,
  CATEGORY_GOAL_MAP,
  getCatalogType,
  getGoalTypeForItem,
} from '@/src/data/checklists'
import type { CatalogType } from '@/src/data/checklists'
import { PACK_ACRONYMS } from '@/src/data/packs'

describe('Checklist catalog', () => {
  test('CATALOG_BY_TYPE has all 7 categories', () => {
    expect(Object.keys(CATALOG_BY_TYPE)).toHaveLength(7)
    expect(Object.keys(CATALOG_BY_TYPE).sort()).toEqual([
      'aspirations', 'careers', 'collections', 'deaths', 'parties', 'skills', 'traits',
    ])
  })

  test('all items have required fields', () => {
    for (const item of ALL_ITEMS) {
      expect(item.key).toBeTruthy()
      expect(item.name).toBeTruthy()
      expect(item.category).toBeTruthy()
      // pack can be empty string for some traits
      expect(typeof item.pack).toBe('string')
    }
  })

  test('all item keys have the format "catalogType:name"', () => {
    for (const item of ALL_ITEMS) {
      const colonIndex = item.key.indexOf(':')
      expect(colonIndex).toBeGreaterThan(0)
      const prefix = item.key.substring(0, colonIndex)
      expect(CHECKLIST_CATEGORIES).toContain(prefix)
    }
  })

  test('no duplicate keys in CATALOG', () => {
    const keys = ALL_ITEMS.map(item => item.key)
    const uniqueKeys = new Set(keys)
    expect(uniqueKeys.size).toBe(keys.length)
  })

  test('CATALOG lookup matches ALL_ITEMS', () => {
    expect(Object.keys(CATALOG)).toHaveLength(ALL_ITEMS.length)
    for (const item of ALL_ITEMS) {
      expect(CATALOG[item.key]).toBe(item)
    }
  })

  test('CATALOG_SIZE matches total item count', () => {
    expect(CATALOG_SIZE).toBe(ALL_ITEMS.length)
  })

  test('CATEGORY_GOAL_MAP covers all catalog types', () => {
    for (const type of CHECKLIST_CATEGORIES) {
      expect(CATEGORY_GOAL_MAP[type]).toBeTruthy()
    }
  })

  test('all non-empty pack acronyms exist in PACKS', () => {
    const missingPacks: string[] = []
    for (const item of ALL_ITEMS) {
      if (item.pack && !PACK_ACRONYMS.includes(item.pack)) {
        missingPacks.push(`${item.key} has unknown pack "${item.pack}"`)
      }
    }
    expect(missingPacks).toEqual([])
  })

  test.each([
    ['skills', 74],
    ['aspirations', 97],
    ['careers', 91],
    ['parties', 38],
    ['traits', 402],
    ['deaths', 42],
    ['collections', 47],
  ] as [CatalogType, number][])('%s catalog has %d items', (type, expected) => {
    expect(CATALOG_BY_TYPE[type]).toHaveLength(expected)
  })

  test('getCatalogType extracts prefix correctly', () => {
    expect(getCatalogType('skills:Cooking')).toBe('skills')
    expect(getCatalogType('deaths:Fire')).toBe('deaths')
  })

  test('getGoalTypeForItem resolves goal type', () => {
    expect(getGoalTypeForItem('skills:Cooking')).toBe('skills_completed')
    expect(getGoalTypeForItem('deaths:Fire')).toBe('deaths_collected')
    expect(getGoalTypeForItem('parties:Dinner Party')).toBe('parties_hosted')
  })
})
```

- [ ] **Step 3: Run tests**

Run: `npx jest src/__tests__/data/checklists/catalog.test.ts -v`
Expected: ALL PASS

If "pack acronyms exist" test fails, identify which CSVs have non-standard acronyms and normalize them in the catalog files.

- [ ] **Step 4: Commit**

```bash
git add src/data/checklists/index.ts src/__tests__/data/checklists/catalog.test.ts
git commit -m "feat(checklists): add catalog index and integrity tests"
```

---

## Task 7: Database migration

**Files:**
- Create: `supabase/migrations/20260403_add_challenge_completions.sql`

- [ ] **Step 1: Create migration file**

Create `supabase/migrations/20260403_add_challenge_completions.sql`:

```sql
-- Checklist completion tracking: stores one row per completed item per challenge.
-- Design: sparse rows (only completions stored), static catalog lives client-side.

create table public.challenge_completions (
  id           uuid        primary key default gen_random_uuid(),
  challenge_id uuid        not null references public.challenges(id) on delete cascade,
  user_id      uuid        not null references public.users(id) on delete cascade,
  item_key     text        not null,
  completed_at timestamptz not null default now(),
  unique(challenge_id, item_key)
);

-- RLS: users can only read/write their own completions
alter table public.challenge_completions enable row level security;

create policy "Users manage own completions"
  on public.challenge_completions
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Index for bulk-loading all completions for a challenge
create index idx_challenge_completions_lookup
  on public.challenge_completions(challenge_id, user_id);

-- Atomic toggle: insert on first call, delete on second call.
-- Also increments/decrements the matching goal counter in one transaction.
create or replace function public.toggle_completion(
  p_challenge_id uuid,
  p_item_key     text,
  p_user_id      uuid
) returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_category  text;
  v_goal_type text;
  v_action    text;
begin
  -- Extract catalog type from item key ("skills:Cooking" -> "skills")
  v_category := split_part(p_item_key, ':', 1);

  -- Try to insert; if the unique constraint fires, delete instead (toggle off)
  begin
    insert into challenge_completions(challenge_id, user_id, item_key)
    values (p_challenge_id, p_user_id, p_item_key);
    v_action := 'completed';
  exception when unique_violation then
    delete from challenge_completions
    where challenge_id = p_challenge_id
      and item_key     = p_item_key
      and user_id      = p_user_id;
    v_action := 'uncompleted';
  end;

  -- Map catalog type to goal_type
  v_goal_type := case v_category
    when 'skills'       then 'skills_completed'
    when 'aspirations'  then 'aspirations_completed'
    when 'careers'      then 'careers_completed'
    when 'parties'      then 'parties_hosted'
    when 'deaths'       then 'deaths_collected'
    when 'traits'       then 'traits_collected'
    when 'collections'  then 'collections_completed'
    else null
  end;

  -- Increment or decrement the matching goal counter (if one exists)
  if v_goal_type is not null then
    update goals
    set current_value = current_value + (case when v_action = 'completed' then 1 else -1 end)
    where challenge_id = p_challenge_id
      and goal_type    = v_goal_type
      and current_value + (case when v_action = 'completed' then 1 else -1 end) >= 0;
  end if;

  return json_build_object('action', v_action);
end;
$$;
```

- [ ] **Step 2: Apply migration**

Use the Supabase MCP tool or CLI:

```bash
# If using Supabase CLI locally:
npx supabase db push
# OR apply via MCP tool: mcp__plugin_supabase_supabase__apply_migration
```

- [ ] **Step 3: Verify the table and RPC exist**

Run a quick SQL check:

```sql
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'challenge_completions' ORDER BY ordinal_position;
```

Expected: id (uuid), challenge_id (uuid), user_id (uuid), item_key (text), completed_at (timestamptz).

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/20260403_add_challenge_completions.sql
git commit -m "feat(checklists): add challenge_completions table and toggle_completion RPC"
```

---

## Task 8: challengeStore extensions

Extends the Zustand store with `completions` state and two new actions.

**Files:**
- Modify: `src/lib/store/challengeStore.ts`
- Modify: `src/__tests__/unit/challengeStore.test.ts`

- [ ] **Step 1: Write failing tests for completion actions**

Add to `src/__tests__/unit/challengeStore.test.ts`, inside the existing `describe('challengeStore', ...)` block:

```typescript
// ---- Completions ----

describe('completions', () => {
  test('fetchCompletions populates completions set from DB data', async () => {
    mockSupabase.from.mockReturnValueOnce({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: [
              { item_key: 'skills:Cooking' },
              { item_key: 'deaths:Fire' },
            ],
            error: null,
          }),
        }),
      }),
    })

    await useChallengeStore.getState().fetchCompletions('challenge-1')

    const completions = useChallengeStore.getState().completions
    expect(completions.has('skills:Cooking')).toBe(true)
    expect(completions.has('deaths:Fire')).toBe(true)
    expect(completions.size).toBe(2)
  })

  test('toggleCompletion adds item key optimistically and calls RPC', async () => {
    useChallengeStore.setState({
      completions: new Set<string>(),
      currentChallenge: { id: 'challenge-1' } as any,
      goals: [makeGoal({ goal_type: 'counter', current_value: 0 })],
    })

    mockSupabase.rpc.mockResolvedValueOnce({
      data: { action: 'completed' },
      error: null,
    })

    await useChallengeStore.getState().toggleCompletion('challenge-1', 'skills:Cooking')

    expect(useChallengeStore.getState().completions.has('skills:Cooking')).toBe(true)
    expect(mockSupabase.rpc).toHaveBeenCalledWith('toggle_completion', {
      p_challenge_id: 'challenge-1',
      p_item_key: 'skills:Cooking',
      p_user_id: 'user-123',
    })
  })

  test('toggleCompletion removes item key when already completed', async () => {
    useChallengeStore.setState({
      completions: new Set<string>(['skills:Cooking']),
      currentChallenge: { id: 'challenge-1' } as any,
      goals: [],
    })

    mockSupabase.rpc.mockResolvedValueOnce({
      data: { action: 'uncompleted' },
      error: null,
    })

    await useChallengeStore.getState().toggleCompletion('challenge-1', 'skills:Cooking')

    expect(useChallengeStore.getState().completions.has('skills:Cooking')).toBe(false)
  })

  test('toggleCompletion reverts optimistic update on RPC error', async () => {
    useChallengeStore.setState({
      completions: new Set<string>(),
      currentChallenge: { id: 'challenge-1' } as any,
      goals: [],
    })

    mockSupabase.rpc.mockResolvedValueOnce({
      data: null,
      error: { message: 'RPC failed' },
    })

    await expect(
      useChallengeStore.getState().toggleCompletion('challenge-1', 'skills:Cooking')
    ).rejects.toThrow('RPC failed')

    // Should have reverted
    expect(useChallengeStore.getState().completions.has('skills:Cooking')).toBe(false)
  })
})
```

Also update the `initialState` object in the test file to include:

```typescript
completions: new Set<string>(),
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx jest src/__tests__/unit/challengeStore.test.ts --testNamePattern="completions" -v`
Expected: FAIL — `fetchCompletions` and `toggleCompletion` not found on state

- [ ] **Step 3: Add completions state and actions to challengeStore**

In `src/lib/store/challengeStore.ts`, make these changes:

**3a. Add to the `ChallengeState` interface** (after `lastChallengesFetch: number | null`):

```typescript
  completions: Set<string>

  // Checklist methods
  fetchCompletions: (challengeId: string) => Promise<void>
  toggleCompletion: (challengeId: string, itemKey: string) => Promise<void>
```

**3b. Add initial state** (after `lastChallengesFetch: null`):

```typescript
  completions: new Set<string>(),
```

**3c. Add `fetchCompletions` action** (after the `fetchChallenge` action):

```typescript
  fetchCompletions: async (challengeId: string) => {
    try {
      const supabase = createSupabaseBrowserClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('challenge_completions')
        .select('item_key')
        .eq('challenge_id', challengeId)
        .eq('user_id', user.id)

      if (error) throw error

      set({ completions: new Set((data || []).map(row => row.item_key)) })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load completions'
      set({ error: message })
    }
  },
```

**3d. Add `toggleCompletion` action** (after `fetchCompletions`):

```typescript
  toggleCompletion: async (challengeId: string, itemKey: string) => {
    const supabase = createSupabaseBrowserClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const prev = new Set(get().completions)
    const wasCompleted = prev.has(itemKey)

    // Optimistic update
    const next = new Set(prev)
    if (wasCompleted) {
      next.delete(itemKey)
    } else {
      next.add(itemKey)
    }
    set({ completions: next })

    try {
      const { data, error } = await supabase.rpc('toggle_completion', {
        p_challenge_id: challengeId,
        p_item_key: itemKey,
        p_user_id: user.id,
      })

      if (error) throw new Error(error.message)

      // Sync goal counter locally: find the matching goal and apply +/-1
      const catalogType = itemKey.split(':')[0]
      const goalTypeMap: Record<string, string> = {
        skills: 'skills_completed',
        aspirations: 'aspirations_completed',
        careers: 'careers_completed',
        parties: 'parties_hosted',
        deaths: 'deaths_collected',
        traits: 'traits_collected',
        collections: 'collections_completed',
      }
      const goalType = goalTypeMap[catalogType]
      if (goalType) {
        const delta = data?.action === 'completed' ? 1 : -1
        set({
          goals: get().goals.map(g =>
            g.goal_type === goalType
              ? { ...g, current_value: Math.max(0, (g.current_value || 0) + delta) }
              : g
          ),
        })
      }
    } catch (error) {
      // Revert optimistic update
      set({ completions: prev })
      throw error
    }
  },
```

**3e. Update `fetchChallenge`** to also load completions after fetching challenge data. Add this line at the end of the `try` block in `fetchChallenge`, right before the final `set(...)` call:

After the line `const { data: progress } = goalIds.length > 0 ...`, add:

```typescript
      // Fetch checklist completions in parallel would require another await;
      // instead, kick off completions load after setting main state
```

Actually, a cleaner approach: call `fetchCompletions` after setting state. After the `set({...})` block inside `fetchChallenge`'s try block, add:

```typescript
      // Load checklist completions (non-blocking)
      get().fetchCompletions(id)
```

This way `fetchCompletions` runs after the main challenge data is rendered, avoiding a waterfall.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx jest src/__tests__/unit/challengeStore.test.ts -v`
Expected: ALL PASS (existing tests + new completions tests)

- [ ] **Step 5: Run type check**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 6: Commit**

```bash
git add src/lib/store/challengeStore.ts src/__tests__/unit/challengeStore.test.ts
git commit -m "feat(checklists): add completions state and toggle action to challengeStore"
```

---

## Task 9: ChecklistItemRow component

A single row in the checklist: checkbox, item name, and pack badge.

**Files:**
- Create: `src/components/checklist/ChecklistItemRow.tsx`
- Create: `src/__tests__/components/checklist/ChecklistItemRow.test.tsx`

- [ ] **Step 1: Write failing test**

Create `src/__tests__/components/checklist/ChecklistItemRow.test.tsx`:

```tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { ChecklistItemRow } from '@/src/components/checklist/ChecklistItemRow'
import type { ChecklistItem } from '@/src/data/checklists/types'

const mockItem: ChecklistItem = {
  key: 'skills:Cooking',
  name: 'Cooking',
  category: 'Cooking',
  pack: 'TS4',
}

describe('ChecklistItemRow', () => {
  test('renders item name and pack badge', () => {
    render(<ChecklistItemRow item={mockItem} completed={false} onToggle={jest.fn()} />)

    expect(screen.getByText('Cooking')).toBeInTheDocument()
    expect(screen.getByText('TS4')).toBeInTheDocument()
  })

  test('shows checked state when completed', () => {
    render(<ChecklistItemRow item={mockItem} completed={true} onToggle={jest.fn()} />)

    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toBeChecked()
  })

  test('shows unchecked state when not completed', () => {
    render(<ChecklistItemRow item={mockItem} completed={false} onToggle={jest.fn()} />)

    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).not.toBeChecked()
  })

  test('calls onToggle with item key when clicked', () => {
    const onToggle = jest.fn()
    render(<ChecklistItemRow item={mockItem} completed={false} onToggle={onToggle} />)

    fireEvent.click(screen.getByRole('checkbox'))
    expect(onToggle).toHaveBeenCalledWith('skills:Cooking')
  })

  test('applies completed styling when checked', () => {
    render(<ChecklistItemRow item={mockItem} completed={true} onToggle={jest.fn()} />)

    const nameElement = screen.getByText('Cooking')
    expect(nameElement).toHaveClass('line-through')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest src/__tests__/components/checklist/ChecklistItemRow.test.tsx -v`
Expected: FAIL — module not found

- [ ] **Step 3: Implement ChecklistItemRow**

Create `src/components/checklist/ChecklistItemRow.tsx`:

```tsx
'use client'

import { memo } from 'react'
import type { ChecklistItem } from '@/src/data/checklists/types'
import { cn } from '@/src/lib/utils/cn'
import { getPackName } from '@/src/data/packs'

interface ChecklistItemRowProps {
  item: ChecklistItem
  completed: boolean
  onToggle: (itemKey: string) => void
}

export const ChecklistItemRow = memo(function ChecklistItemRow({
  item,
  completed,
  onToggle,
}: ChecklistItemRowProps) {
  return (
    <label
      className={cn(
        'flex items-center gap-3 px-4 py-2.5 rounded-lg cursor-pointer transition-colors',
        'hover:bg-warmGray-50 dark:hover:bg-warmGray-800',
        completed && 'bg-warmGray-50/50 dark:bg-warmGray-800/30'
      )}
    >
      <input
        type="checkbox"
        checked={completed}
        onChange={() => onToggle(item.key)}
        className={cn(
          'h-4.5 w-4.5 rounded border-warmGray-300 dark:border-warmGray-600',
          'text-brand-500 focus:ring-brand-500 focus:ring-offset-0',
          'dark:bg-warmGray-700'
        )}
      />
      <span
        className={cn(
          'flex-1 text-sm text-warmGray-800 dark:text-warmGray-200',
          completed && 'line-through text-warmGray-400 dark:text-warmGray-500'
        )}
      >
        {item.name}
      </span>
      {item.pack && (
        <span
          className="text-xs px-2 py-0.5 rounded-full bg-warmGray-100 dark:bg-warmGray-700 text-warmGray-500 dark:text-warmGray-400"
          title={getPackName(item.pack)}
        >
          {item.pack}
        </span>
      )}
    </label>
  )
})
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest src/__tests__/components/checklist/ChecklistItemRow.test.tsx -v`
Expected: ALL PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/checklist/ChecklistItemRow.tsx src/__tests__/components/checklist/ChecklistItemRow.test.tsx
git commit -m "feat(checklists): add ChecklistItemRow component with tests"
```

---

## Task 10: ChecklistPanel component

Renders all items for one category, grouped by subcategory with collapsible sections.

**Files:**
- Create: `src/components/checklist/ChecklistPanel.tsx`
- Create: `src/__tests__/components/checklist/ChecklistPanel.test.tsx`

- [ ] **Step 1: Write failing test**

Create `src/__tests__/components/checklist/ChecklistPanel.test.tsx`:

```tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { ChecklistPanel } from '@/src/components/checklist/ChecklistPanel'
import type { ChecklistItem } from '@/src/data/checklists/types'

const mockItems: ChecklistItem[] = [
  { key: 'skills:Cooking', name: 'Cooking', category: 'Cooking', pack: 'TS4' },
  { key: 'skills:Baking', name: 'Baking', category: 'Cooking', pack: 'GTW' },
  { key: 'skills:Painting', name: 'Painting', category: 'Art', pack: 'TS4' },
  { key: 'skills:Guitar', name: 'Guitar', category: 'Music', pack: 'TS4' },
]

describe('ChecklistPanel', () => {
  test('renders subcategory group headers', () => {
    render(
      <ChecklistPanel
        items={mockItems}
        completions={new Set()}
        onToggle={jest.fn()}
      />
    )

    expect(screen.getByText('Cooking')).toBeInTheDocument()
    expect(screen.getByText('Art')).toBeInTheDocument()
    expect(screen.getByText('Music')).toBeInTheDocument()
  })

  test('shows completion count per subcategory', () => {
    render(
      <ChecklistPanel
        items={mockItems}
        completions={new Set(['skills:Cooking'])}
        onToggle={jest.fn()}
      />
    )

    // Cooking group: 1/2 completed
    expect(screen.getByText('1/2')).toBeInTheDocument()
  })

  test('renders all item names', () => {
    render(
      <ChecklistPanel
        items={mockItems}
        completions={new Set()}
        onToggle={jest.fn()}
      />
    )

    expect(screen.getByText('Cooking')).toBeInTheDocument()
    expect(screen.getByText('Baking')).toBeInTheDocument()
    expect(screen.getByText('Painting')).toBeInTheDocument()
    expect(screen.getByText('Guitar')).toBeInTheDocument()
  })

  test('passes onToggle to item rows', () => {
    const onToggle = jest.fn()
    render(
      <ChecklistPanel
        items={mockItems}
        completions={new Set()}
        onToggle={onToggle}
      />
    )

    fireEvent.click(screen.getAllByRole('checkbox')[0])
    expect(onToggle).toHaveBeenCalledWith('skills:Cooking')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest src/__tests__/components/checklist/ChecklistPanel.test.tsx -v`
Expected: FAIL — module not found

- [ ] **Step 3: Implement ChecklistPanel**

Create `src/components/checklist/ChecklistPanel.tsx`:

```tsx
'use client'

import { useMemo, useState } from 'react'
import type { ChecklistItem } from '@/src/data/checklists/types'
import { ChecklistItemRow } from './ChecklistItemRow'
import { cn } from '@/src/lib/utils/cn'
import { TbChevronDown, TbChevronRight } from 'react-icons/tb'

interface ChecklistPanelProps {
  items: readonly ChecklistItem[]
  completions: Set<string>
  onToggle: (itemKey: string) => void
}

interface SubcategoryGroup {
  name: string
  items: ChecklistItem[]
  completedCount: number
}

export function ChecklistPanel({ items, completions, onToggle }: ChecklistPanelProps) {
  const groups = useMemo(() => {
    const groupMap = new Map<string, ChecklistItem[]>()

    for (const item of items) {
      const existing = groupMap.get(item.category)
      if (existing) {
        existing.push(item)
      } else {
        groupMap.set(item.category, [item])
      }
    }

    const result: SubcategoryGroup[] = []
    for (const [name, groupItems] of groupMap) {
      result.push({
        name,
        items: groupItems,
        completedCount: groupItems.filter(i => completions.has(i.key)).length,
      })
    }

    return result
  }, [items, completions])

  return (
    <div className="space-y-2">
      {groups.map(group => (
        <SubcategorySection
          key={group.name}
          group={group}
          completions={completions}
          onToggle={onToggle}
        />
      ))}
    </div>
  )
}

function SubcategorySection({
  group,
  completions,
  onToggle,
}: {
  group: SubcategoryGroup
  completions: Set<string>
  onToggle: (itemKey: string) => void
}) {
  const allComplete = group.completedCount === group.items.length
  const [expanded, setExpanded] = useState(group.completedCount > 0 || !allComplete)

  return (
    <div className="rounded-lg border border-warmGray-100 dark:border-warmGray-800 overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded(prev => !prev)}
        className={cn(
          'flex items-center justify-between w-full px-4 py-3 text-left',
          'hover:bg-warmGray-50 dark:hover:bg-warmGray-800/50 transition-colors'
        )}
      >
        <div className="flex items-center gap-2">
          {expanded
            ? <TbChevronDown className="h-4 w-4 text-warmGray-400" />
            : <TbChevronRight className="h-4 w-4 text-warmGray-400" />
          }
          <span className="font-medium text-sm text-warmGray-800 dark:text-warmGray-200">
            {group.name}
          </span>
        </div>
        <span
          className={cn(
            'text-xs font-medium px-2 py-0.5 rounded-full',
            allComplete
              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
              : 'bg-warmGray-100 dark:bg-warmGray-700 text-warmGray-500 dark:text-warmGray-400'
          )}
        >
          {group.completedCount}/{group.items.length}
        </span>
      </button>
      {expanded && (
        <div className="border-t border-warmGray-100 dark:border-warmGray-800">
          {group.items.map(item => (
            <ChecklistItemRow
              key={item.key}
              item={item}
              completed={completions.has(item.key)}
              onToggle={onToggle}
            />
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest src/__tests__/components/checklist/ChecklistPanel.test.tsx -v`
Expected: ALL PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/checklist/ChecklistPanel.tsx src/__tests__/components/checklist/ChecklistPanel.test.tsx
git commit -m "feat(checklists): add ChecklistPanel component with grouped subcategories"
```

---

## Task 11: ChecklistCategoryTabs component

Tab bar across the top of the checklist area with completion count badges.

**Files:**
- Create: `src/components/checklist/ChecklistCategoryTabs.tsx`
- Create: `src/__tests__/components/checklist/ChecklistCategoryTabs.test.tsx`

- [ ] **Step 1: Write failing test**

Create `src/__tests__/components/checklist/ChecklistCategoryTabs.test.tsx`:

```tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { ChecklistCategoryTabs } from '@/src/components/checklist/ChecklistCategoryTabs'

// Mock the catalog data to keep tests fast
jest.mock('@/src/data/checklists', () => ({
  CATALOG_BY_TYPE: {
    skills: Array(74).fill({ key: 'skills:test', name: 'test', category: 'test', pack: 'TS4' }),
    aspirations: Array(97).fill({ key: 'aspirations:test', name: 'test', category: 'test', pack: 'TS4' }),
    careers: Array(91).fill({ key: 'careers:test', name: 'test', category: 'test', pack: 'TS4' }),
    parties: Array(38).fill({ key: 'parties:test', name: 'test', category: 'test', pack: 'TS4' }),
    traits: Array(402).fill({ key: 'traits:test', name: 'test', category: 'test', pack: 'TS4' }),
    deaths: Array(42).fill({ key: 'deaths:test', name: 'test', category: 'test', pack: 'TS4' }),
    collections: Array(47).fill({ key: 'collections:test', name: 'test', category: 'test', pack: 'TS4' }),
  },
  CHECKLIST_CATEGORIES: ['skills', 'aspirations', 'careers', 'parties', 'traits', 'deaths', 'collections'],
  CATEGORY_LABELS: {
    skills: 'Skills', aspirations: 'Aspirations', careers: 'Careers',
    parties: 'Parties', traits: 'Traits', deaths: 'Deaths', collections: 'Collections',
  },
}))

describe('ChecklistCategoryTabs', () => {
  test('renders all 7 category tabs', () => {
    render(
      <ChecklistCategoryTabs
        activeCategory="skills"
        completions={new Set()}
        onCategoryChange={jest.fn()}
      />
    )

    expect(screen.getByRole('tab', { name: /Skills/ })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /Aspirations/ })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /Deaths/ })).toBeInTheDocument()
  })

  test('marks active tab as selected', () => {
    render(
      <ChecklistCategoryTabs
        activeCategory="deaths"
        completions={new Set()}
        onCategoryChange={jest.fn()}
      />
    )

    expect(screen.getByRole('tab', { name: /Deaths/ })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tab', { name: /Skills/ })).toHaveAttribute('aria-selected', 'false')
  })

  test('calls onCategoryChange when tab is clicked', () => {
    const onCategoryChange = jest.fn()
    render(
      <ChecklistCategoryTabs
        activeCategory="skills"
        completions={new Set()}
        onCategoryChange={onCategoryChange}
      />
    )

    fireEvent.click(screen.getByRole('tab', { name: /Deaths/ }))
    expect(onCategoryChange).toHaveBeenCalledWith('deaths')
  })

  test('shows completion count in tab badge', () => {
    render(
      <ChecklistCategoryTabs
        activeCategory="skills"
        completions={new Set(['skills:Cooking', 'skills:Painting', 'deaths:Fire'])}
        onCategoryChange={jest.fn()}
      />
    )

    // Skills tab should show "2" (2 of 74 completed with skills: prefix)
    const skillsTab = screen.getByRole('tab', { name: /Skills/ })
    expect(skillsTab).toHaveTextContent('2')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest src/__tests__/components/checklist/ChecklistCategoryTabs.test.tsx -v`
Expected: FAIL — module not found

- [ ] **Step 3: Implement ChecklistCategoryTabs**

Create `src/components/checklist/ChecklistCategoryTabs.tsx`:

```tsx
'use client'

import { useMemo } from 'react'
import type { CatalogType } from '@/src/data/checklists/types'
import {
  CATALOG_BY_TYPE,
  CHECKLIST_CATEGORIES,
  CATEGORY_LABELS,
} from '@/src/data/checklists'
import { cn } from '@/src/lib/utils/cn'

interface ChecklistCategoryTabsProps {
  activeCategory: CatalogType
  completions: Set<string>
  onCategoryChange: (category: CatalogType) => void
}

export function ChecklistCategoryTabs({
  activeCategory,
  completions,
  onCategoryChange,
}: ChecklistCategoryTabsProps) {
  const counts = useMemo(() => {
    const result: Record<string, number> = {}
    for (const cat of CHECKLIST_CATEGORIES) {
      const prefix = `${cat}:`
      let count = 0
      for (const key of completions) {
        if (key.startsWith(prefix)) count++
      }
      result[cat] = count
    }
    return result
  }, [completions])

  return (
    <div
      className="flex gap-1 overflow-x-auto p-1 bg-cozy-sand dark:bg-warmGray-850 rounded-xl"
      role="tablist"
      aria-label="Checklist categories"
    >
      {CHECKLIST_CATEGORIES.map(cat => {
        const isActive = cat === activeCategory
        const completed = counts[cat] || 0
        const total = CATALOG_BY_TYPE[cat].length

        return (
          <button
            key={cat}
            role="tab"
            aria-selected={isActive}
            onClick={() => onCategoryChange(cat)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all',
              isActive
                ? 'bg-white dark:bg-warmGray-800 shadow-sm text-warmGray-900 dark:text-warmGray-100'
                : 'text-cozy-clay dark:text-warmGray-400 hover:text-warmGray-700 dark:hover:text-warmGray-300'
            )}
          >
            {CATEGORY_LABELS[cat]}
            {completed > 0 && (
              <span
                className={cn(
                  'text-xs px-1.5 py-0.5 rounded-full',
                  isActive
                    ? 'bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400'
                    : 'bg-warmGray-200 dark:bg-warmGray-700 text-warmGray-500 dark:text-warmGray-400'
                )}
              >
                {completed}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 4: Create barrel export**

Create `src/components/checklist/index.ts`:

```typescript
export { ChecklistItemRow } from './ChecklistItemRow'
export { ChecklistPanel } from './ChecklistPanel'
export { ChecklistCategoryTabs } from './ChecklistCategoryTabs'
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx jest src/__tests__/components/checklist/ChecklistCategoryTabs.test.tsx -v`
Expected: ALL PASS

- [ ] **Step 6: Commit**

```bash
git add src/components/checklist/ChecklistCategoryTabs.tsx src/components/checklist/index.ts src/__tests__/components/checklist/ChecklistCategoryTabs.test.tsx
git commit -m "feat(checklists): add ChecklistCategoryTabs with completion badges"
```

---

## Task 12: Challenge page integration

Add a "Checklist" tab to the challenge detail page. When active, renders `ChecklistCategoryTabs` + `ChecklistPanel`. The existing Sims/Goals content is the default tab.

**Files:**
- Modify: `src/app/(protected)/challenge/[id]/page.tsx`

- [ ] **Step 1: Add imports**

At the top of `src/app/(protected)/challenge/[id]/page.tsx`, add:

```typescript
import { ChecklistCategoryTabs, ChecklistPanel } from '@/src/components/checklist'
import { CATALOG_BY_TYPE } from '@/src/data/checklists'
import type { CatalogType } from '@/src/data/checklists/types'
```

- [ ] **Step 2: Add checklist state to ChallengePageContent**

Inside `ChallengePageContent`, add after the existing `useState` declarations:

```typescript
const [activeTab, setActiveTab] = useState<'overview' | 'checklist'>('overview')
const [checklistCategory, setChecklistCategory] = useState<CatalogType>('skills')

// Completions from store
const completions = useChallengeStore(state => state.completions)
const toggleCompletion = useCallback(
  (itemKey: string) => useChallengeStore.getState().toggleCompletion(challengeId, itemKey),
  [challengeId]
)
```

- [ ] **Step 3: Add tab bar and checklist panel to JSX**

In the non-legacy return block (around line 171), replace the existing outer `<div>` with a structure that includes overview/checklist tabs:

```tsx
return (
  <div>
    <div className="mb-8">
      <h1 className="text-3xl font-display font-bold text-warmGray-900 dark:text-warmGray-100">
        {currentChallenge.name}
      </h1>
      {currentChallenge.description && (
        <p className="text-warmGray-600 dark:text-warmGray-400 mt-2">
          {currentChallenge.description}
        </p>
      )}
    </div>

    {/* Overview / Checklist tabs */}
    <div className="flex gap-2 mb-6">
      <button
        onClick={() => setActiveTab('overview')}
        className={cn(
          'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
          activeTab === 'overview'
            ? 'bg-brand-500 text-white'
            : 'bg-warmGray-100 dark:bg-warmGray-800 text-warmGray-600 dark:text-warmGray-400'
        )}
      >
        Overview
      </button>
      <button
        onClick={() => setActiveTab('checklist')}
        className={cn(
          'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
          activeTab === 'checklist'
            ? 'bg-brand-500 text-white'
            : 'bg-warmGray-100 dark:bg-warmGray-800 text-warmGray-600 dark:text-warmGray-400'
        )}
      >
        Checklist
      </button>
    </div>

    {activeTab === 'overview' ? (
      <div className="grid lg:grid-cols-3 gap-8">
        {/* existing overview content (Sims, Goals, PointTracker) — keep as-is */}
      </div>
    ) : (
      <div className="space-y-4">
        <ChecklistCategoryTabs
          activeCategory={checklistCategory}
          completions={completions}
          onCategoryChange={setChecklistCategory}
        />
        <ChecklistPanel
          items={CATALOG_BY_TYPE[checklistCategory]}
          completions={completions}
          onToggle={toggleCompletion}
        />
      </div>
    )}

    {/* Modals — keep existing SimForm and GoalForm modals */}
  </div>
)
```

Also add the `cn` import if not already present:

```typescript
import { cn } from '@/src/lib/utils/cn'
```

**For the legacy challenge branch** (the `isLegacyChallenge` block): apply the same tab pattern, wrapping the `<LegacyTracker>` in an overview tab and adding a checklist tab alongside it.

- [ ] **Step 4: Run type check and dev server**

Run: `npx tsc --noEmit`
Expected: No errors

Run: `npm run dev` and navigate to an existing challenge page. Verify:
- Overview tab shows existing Sims/Goals
- Checklist tab shows 7 category tabs with grouped items
- Clicking a checkbox toggles completion

- [ ] **Step 5: Commit**

```bash
git add src/app/(protected)/challenge/[id]/page.tsx
git commit -m "feat(checklists): integrate checklist tabs into challenge detail page"
```

---

## Verification Checklist

After all tasks are complete:

- [ ] `npx tsc --noEmit` — no type errors
- [ ] `npx jest --coverage` — all tests pass, coverage above 70% threshold
- [ ] `npm run lint` — no lint errors
- [ ] Dev server: navigate to challenge page, switch to Checklist tab
- [ ] Complete a skill → verify it appears checked, count badge updates
- [ ] Uncomplete it → verify it unchecks, count decrements
- [ ] Refresh page → verify completion persists
- [ ] Check dark mode renders correctly
- [ ] Check mobile: tabs should scroll horizontally
