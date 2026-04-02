# Checklist System Design
**Date:** 2026-04-02  
**Status:** Approved

## Overview

Add a per-challenge checklist system covering all major Sims 4 gameplay categories. Players track which skills, aspirations, careers, parties, traits, deaths, and collections they have completed within each legacy challenge. Completions are stored sparsely in a DB table; the full item catalog is bundled as static TypeScript. Completing an item atomically increments the related goal counter.

---

## Scope

**In scope:**
- 7 checklist categories: Skills (74), Aspirations (97), Careers (91), Parties (40), Traits (402), Deaths (44), Collections (49)
- 797 total items across all categories
- Per-challenge tracking (not global)
- Goal counter integration on completion
- Checklist UI on the challenge detail page

**Out of scope:**
- Global (cross-challenge) completion statistics
- Sim-level completion tracking
- User-defined custom checklist items

---

## Data Layer

### Static Catalog

Location: `src/data/checklists/`

One file per category, each exporting a typed array:

```ts
// Shared type — src/data/checklists/types.ts
export type ChecklistItem = {
  key: string;      // "{category}:{name}" e.g. "skills:Cooking"
  name: string;     // Display name e.g. "Cooking"
  category: string; // Subcategory e.g. "Cooking" (within Skills)
  pack: string;     // Pack acronym e.g. "TS4", "GT"
};
```

Files:
- `src/data/checklists/skills.ts`
- `src/data/checklists/aspirations.ts`
- `src/data/checklists/careers.ts`
- `src/data/checklists/parties.ts`
- `src/data/checklists/traits.ts`
- `src/data/checklists/deaths.ts`
- `src/data/checklists/collections.ts`
- `src/data/checklists/index.ts` — merges all into `CATALOG: Record<string, ChecklistItem>`

The `CATALOG` object is keyed by item key for O(1) lookup. No network request; zero latency.

### Goal Mapping

```ts
// src/data/checklists/goalMapping.ts
export const CATEGORY_GOAL_MAP: Record<string, string> = {
  skills:       'skills_completed',
  aspirations:  'aspirations_completed',
  careers:      'careers_completed',
  parties:      'parties_hosted',
  deaths:       'deaths_collected',
  traits:       'traits_collected',
  collections:  'collections_completed',
};
```

Category is extracted from the item key prefix (everything before the first `:`).

### Database Schema

```sql
create table public.challenge_completions (
  id           uuid        primary key default gen_random_uuid(),
  challenge_id uuid        not null references public.challenges(id) on delete cascade,
  user_id      uuid        not null references public.users(id) on delete cascade,
  item_key     text        not null,
  completed_at timestamptz not null default now(),
  unique(challenge_id, item_key)
);

-- RLS
alter table public.challenge_completions enable row level security;

create policy "Users manage own completions"
  on public.challenge_completions
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Index for per-challenge bulk load
create index on public.challenge_completions(challenge_id, user_id);
```

The `unique(challenge_id, item_key)` constraint prevents double-completion at the DB level.

### Supabase RPC

An atomic RPC handles both the completion write and goal counter increment in a single round-trip:

```sql
create or replace function toggle_completion(
  p_challenge_id uuid,
  p_item_key     text,
  p_user_id      uuid
) returns json as $$
declare
  v_category  text;
  v_goal_type text;
  v_action    text;
begin
  v_category := split_part(p_item_key, ':', 1);

  -- Attempt insert; if duplicate, delete instead
  begin
    insert into challenge_completions(challenge_id, user_id, item_key)
    values (p_challenge_id, p_user_id, p_item_key);
    v_action := 'completed';
  exception when unique_violation then
    delete from challenge_completions
    where challenge_id = p_challenge_id and item_key = p_item_key;
    v_action := 'uncompleted';
  end;

  -- Resolve goal type from category
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

  -- Increment or decrement matching goal
  if v_goal_type is not null then
    update goals
    set current_value = current_value + (case when v_action = 'completed' then 1 else -1 end)
    where challenge_id = p_challenge_id
      and goal_type    = v_goal_type
      and current_value + (case when v_action = 'completed' then 1 else -1 end) >= 0;
  end if;

  return json_build_object('action', v_action);
end;
$$ language plpgsql security definer;
```

---

## UI Components

Location: `src/components/checklist/`

### `ChecklistCategoryTabs`
Pill-style tabs across the top of the checklist panel: Skills | Aspirations | Careers | Parties | Traits | Deaths | Collections. Each tab shows a completion count badge (e.g., "Skills 3/74"). Lazy-renders each category panel on first visit (no upfront render of all 797 rows).

### `ChecklistPanel`
Renders all items for one category. Groups items by subcategory (e.g., within Skills: "Cooking", "Art", "Fitness", etc.). Each group has a collapsible header showing `N/total` completed. Subcategory groups with 0 completions default to collapsed.

### `ChecklistItemRow`
Single row: checkbox, item name, pack badge. Optimistic toggle — updates local state immediately, rolls back on DB error with a toast notification. Pack badge uses the existing pack acronym → display name mapping from `src/data/packs.ts`.

**Placement:** Checklist lives on the challenge detail page (`src/app/(protected)/dashboard/challenge/[id]/`) as a new tab alongside existing challenge content.

---

## State Management

Additions to `challengeStore` (`src/lib/store/challengeStore.ts`):

```ts
// New state
completions: Set<string>  // item keys completed for the active challenge

// New actions
fetchCompletions(challengeId: string): Promise<void>
toggleCompletion(challengeId: string, itemKey: string): Promise<void>
```

**`fetchCompletions`:** Called when a challenge is opened. Loads all `item_key` values for the challenge from `challenge_completions`. Populates the `completions` Set.

**`toggleCompletion` flow:**
1. Optimistically add or remove `itemKey` from `completions` Set
2. Call `supabase.rpc('toggle_completion', { p_challenge_id, p_item_key, p_user_id })`
3. On success: the RPC has already updated the goal counter in DB; sync goal `current_value` locally
4. On error: revert the optimistic update, show error toast

**Derived selectors (computed, not stored):**
```ts
completionCountByCategory(category: string): { completed: number; total: number }
```
Computed from `completions` Set + CATALOG — no extra DB query.

---

## Dashboard KPI Integration

Once completions exist, stat cards gain specificity. Examples:

| Card | Derived from |
|------|-------------|
| Skills Mastered | `completions` filtered to `skills:*` |
| Deaths Collected | `completions` filtered to `deaths:*` |
| Aspirations Done | `completions` filtered to `aspirations:*` |

All computed client-side from the in-memory Set — zero additional DB queries.

---

## Error Handling

| Scenario | Behavior |
|----------|---------|
| DB write fails | Revert optimistic update; toast: "Couldn't save — try again" |
| Goal row missing for category | RPC skips increment silently; no crash |
| Duplicate completion attempt | DB unique constraint catches it; client treats as no-op |
| Catalog item key not found | Warn in development; no-op in production |

---

## Testing

- **Unit:** Catalog files export correct item counts and key formats; `CATEGORY_GOAL_MAP` covers all 7 categories; `toggleCompletion` action applies and reverts optimistic state correctly
- **Integration:** `toggle_completion` RPC inserts a row and increments goal counter; duplicate call deletes row and decrements; goal floor is 0 (no negative values)
- **E2E:** User marks a skill complete on challenge page → skill count badge updates → challenge goal counter reflects increment

---

## Migration

One migration file: `supabase/migrations/YYYYMMDD_add_challenge_completions.sql`

Contains: table creation, RLS policy, index, and `toggle_completion` RPC definition.
