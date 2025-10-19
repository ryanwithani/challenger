// src/components/profile/Packs.tsx
'use client';

import { Fragment } from 'react';

export type PacksValue = {
  get_to_work: boolean;
  get_together: boolean;
  city_living: boolean;
  cats_and_dogs: boolean;
  seasons: boolean;
  get_famous: boolean;
  island_living: boolean;
  discover_university: boolean;
  eco_lifestyle: boolean;
  snowy_escape: boolean;
  cottage_living: boolean;
  high_school_years: boolean;
  growing_together: boolean;
  horse_ranch: boolean;
  for_rent: boolean;
  lovestruck?: boolean;
  life_and_death?: boolean;
  enchanted_by_nature?: boolean;
  businesses_and_hobbies?: boolean;
  outdoor_retreat?: boolean;
  spa_day?: boolean;
  strangerville?: boolean;
  dine_out?: boolean;
  vampires?: boolean;
  parenthood?: boolean;
  jungle_adventure?: boolean;
  realm_of_magic?: boolean;
  journey_to_batuu?: boolean;
  dream_home_decorator?: boolean;
  my_wedding_stories?: boolean;
  werewolves?: boolean;
};

export type PackDef = {
  key: keyof PacksValue;
  name: string;
  category: 'Expansion Pack' | 'Game Pack' | 'Stuff Pack' | 'Kits/Other';
  alwaysOn?: boolean;
};

export const PACKS: PackDef[] = [
  { key: 'get_to_work', name: 'Get to Work', category: 'Expansion Pack' },
  { key: 'get_together', name: 'Get Together', category: 'Expansion Pack' },
  { key: 'city_living', name: 'City Living', category: 'Expansion Pack' },
  { key: 'cats_and_dogs', name: 'Cats and Dogs', category: 'Expansion Pack' },
  { key: 'seasons', name: 'Seasons', category: 'Expansion Pack' },
  { key: 'get_famous', name: 'Get Famous', category: 'Expansion Pack' },
  { key: 'island_living', name: 'Island Living', category: 'Expansion Pack' },
  { key: 'discover_university', name: 'Discover University', category: 'Expansion Pack' },
  { key: 'eco_lifestyle', name: 'Eco Lifestyle', category: 'Expansion Pack' },
  { key: 'snowy_escape', name: 'Snowy Escape', category: 'Expansion Pack' },
  { key: 'cottage_living', name: 'Cottage Living', category: 'Expansion Pack' },
  { key: 'high_school_years', name: 'High School Years', category: 'Expansion Pack' },
  { key: 'growing_together', name: 'Growing Together', category: 'Expansion Pack' },
  { key: 'horse_ranch', name: 'Horse Ranch', category: 'Expansion Pack' },
  { key: 'for_rent', name: 'For Rent', category: 'Expansion Pack' },
  { key: 'lovestruck', name: 'Lovestruck', category: 'Expansion Pack' },
  { key: 'life_and_death', name: 'Life and Death', category: 'Expansion Pack' },
  { key: 'enchanted_by_nature', name: 'Enchanted by Nature', category: 'Expansion Pack' },
  { key: 'businesses_and_hobbies', name: 'Businesses and Hobbies', category: 'Expansion Pack' },
  { key: 'outdoor_retreat', name: 'Outdoor Retreat', category: 'Game Pack' },
  { key: 'spa_day', name: 'Spa Day', category: 'Game Pack' },
  { key: 'strangerville', name: 'Strangerville', category: 'Game Pack' },
  { key: 'dine_out', name: 'Dine Out', category: 'Game Pack' },
  { key: 'vampires', name: 'Vampires', category: 'Game Pack' },
  { key: 'parenthood', name: 'Parenthood', category: 'Game Pack' },
  { key: 'jungle_adventure', name: 'Jungle Adventure', category: 'Game Pack' },
  { key: 'realm_of_magic', name: 'Realm of Magic', category: 'Game Pack' },
  { key: 'journey_to_batuu', name: 'Journey to Batuu', category: 'Game Pack' },
  { key: 'dream_home_decorator', name: 'Dream Home Decorator', category: 'Game Pack' },
  { key: 'my_wedding_stories', name: 'My Wedding Stories', category: 'Game Pack' },
  { key: 'werewolves', name: 'Werewolves', category: 'Game Pack' },
];

type Props = {
  value: PacksValue;
  onChange?: (next: PacksValue) => void;
  readOnly?: boolean;
  className?: string;
  header?: React.ReactNode;
  hint?: React.ReactNode;
};

export function Packs({
  value,
  onChange,
  readOnly = false,
  className,
  header = <h2 className="text-lg font-semibold">Expansion Packs</h2>,
  hint,
}: Props) {
  const toggle = (key: keyof PacksValue) => {
    if (readOnly || !onChange) return;
    const next: PacksValue = { ...value, [key]: !value[key] };
    onChange(next);
  };

  const byCategory = PACKS.reduce<Record<string, PackDef[]>>((acc, p) => {
    (acc[p.category] ||= []).push(p);
    return acc;
  }, {});

  return (
    <div className={className}>
      {header}
      {hint && <div className="mt-1 text-xs text-gray-500">{hint}</div>}

      <div className="mt-4 space-y-6">
        {Object.entries(byCategory).map(([category, items]) => (
          <Fragment key={category}>
            <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              {category}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {items.map((pack) => {
                const checked = Boolean(value[pack.key]);
                const disabled = readOnly || pack.alwaysOn;

                return (
                  <button
                    key={String(pack.key)}
                    type="button"
                    role="checkbox"
                    aria-checked={checked}
                    aria-label={pack.name}
                    disabled={disabled}
                    onClick={() => toggle(pack.key)}
                    className={[
                      'group relative h-20 rounded-xl border bg-white dark:bg-zinc-900',
                      'px-3 py-2 text-left transition-all',
                      checked
                        ? 'border-sims-purple ring-0'
                        : 'border-gray-200 hover:border-sims-blue/60',
                      disabled && !checked ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer',
                      'focus:outline-none focus:ring-2 focus:ring-sims-blue',
                    ].join(' ')}
                  >
                    {checked && (
                      <span
                        className="absolute right-1.5 top-1.5 grid h-5 w-5 place-items-center rounded-full bg-sims-purple text-white text-[11px]"
                        aria-hidden
                      >
                        ✓
                      </span>
                    )}

                    <div className="flex h-full items-center">
                      <div className="flex-1 pr-2">
                        <div className="text-[13px] font-medium leading-tight line-clamp-2">
                          {pack.name}
                        </div>
                        {pack.alwaysOn && (
                          <div className="mt-0.5 text-[11px] text-gray-500">Always enabled</div>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </Fragment>
        ))}
      </div>
    </div>
  );
}

export default Packs;