'use client'

import { useMemo, useState, useEffect } from 'react'
import clsx from 'clsx'
import Image from 'next/image'
import {
  Aspirations,
  aspirationIconPath,
  type Aspiration,
  type AspirationCategory,
  type AspirationAgeGroup,
} from '@/src/components/sim/AspirationsCatalog'
import { PackIcon } from '@/src/components/sim/PackIcon'

// Hide "Base Game" icon
export const shouldShowPackIcon = (name?: string | null) =>
  !!(name && name !== 'Base Game')

// Order of tabs (stable)
const CATEGORY_TABS: AspirationCategory[] = [
  'Animal', 'Athletic', 'Creativity', 'Deviance', 'Fairy', 'Family', 'Food', 'Fortune',
  'Knowledge', 'Location', 'Love', 'Nature', 'Popularity', 'Star Wars', 'Wellness',
  'Werewolf', 'Child', 'Teen', 'Limited-Time', 'Tutorial',
]
const AGE_TABS: AspirationAgeGroup[] = ['adult', 'teen', 'child']

export function AspirationPicker({
  value,                // current label (e.g. "Musical Genius")
  onChange,             // (label) => void
  className = '',
  dense = false,        // smaller cards
  defaultCategory = 'Creativity' as AspirationCategory,
  defaultAge = 'adult' as AspirationAgeGroup,
}: {
  value?: string | null
  onChange: (label: string | null) => void
  className?: string
  dense?: boolean
  defaultCategory?: AspirationCategory
  defaultAge?: AspirationAgeGroup
}) {
  // preselect tabs to show the current selection, if any
  const current = useMemo(
    () => (value ? Aspirations.find(a => a.label === value) : null),
    [value]
  )

  const [category, setCategory] = useState<AspirationCategory>(current?.category ?? defaultCategory)
  const [age, setAge] = useState<AspirationAgeGroup>(
    current?.ageGroup && AGE_TABS.includes(current.ageGroup) ? current.ageGroup : defaultAge
  )

  // If external value changes to an aspiration in a different tab, reflect it
  useEffect(() => {
    if (current) {
      if (category !== current.category) setCategory(current.category)
      if (AGE_TABS.includes(current.ageGroup)) setAge(current.ageGroup as AspirationAgeGroup)
    }
  }, [value]) // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = useMemo(() => {
    return Aspirations.filter(a => {
      // child/teen categories have their own tabs; when age tab is 'adult', include adult + everything not explicitly teen/child
      if (age === 'adult') return a.ageGroup === 'adult'
      return a.ageGroup === age
    }).filter(a => a.category === category)
  }, [category, age])

  return (
    <div className={clsx('space-y-3', className)}>
      {/* Category tabs */}
      <TabBar
        tabs={CATEGORY_TABS}
        value={category}
        onChange={(v) => setCategory(v as AspirationCategory)}
        render={(t) => t}
        ariaLabel="Aspiration categories"
        scrollable
      />

      {/* Age tabs (Adult / Teen / Child) */}
      <div className="flex items-center gap-3">
        <TabBar
          tabs={AGE_TABS}
          value={age}
          onChange={(v) => setAge(v as AspirationAgeGroup)}
          render={(t) => t === 'adult' ? 'Adult' : t === 'teen' ? 'Teen' : 'Child'}
          ariaLabel="Age group"
        />
        <button
          type="button"
          onClick={() => onChange(null)}
          className="ml-auto inline-flex items-center rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
          title="Clear selection"
        >
          Clear
        </button>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <EmptyState />
      ) : (
        <ul
          className={clsx(
            'grid gap-3',
            dense
              ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4'
              : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
          )}
        >
          {filtered.map((a) => (
            <li key={a.id}>
              <AspirationCard
                aspiration={a}
                selected={a.label === value}
                onSelect={() => onChange(a.label)}
                dense={dense}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

/* ---- Subcomponents ---- */

function TabBar<T extends string>({
  tabs,
  value,
  onChange,
  render,
  ariaLabel,
  scrollable = false,
}: {
  tabs: readonly T[]
  value: T
  onChange: (v: T) => void
  render: (t: T) => string
  ariaLabel: string
  scrollable?: boolean
}) {
  return (
    <div
      className={clsx(
        'relative -mx-1 flex gap-1',
        scrollable && 'overflow-x-auto pb-1'
      )}
      role="tablist"
      aria-label={ariaLabel}
    >
      {tabs.map((t) => {
        const active = t === value
        return (
          <button
            type="button"
            key={t}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(t)}
            className={clsx(
              'whitespace-nowrap rounded-md px-3 py-1.5 text-sm',
              active
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
            )}
          >
            {render(t)}
          </button>
        )
      })}
    </div>
  )
}

function AspirationCard({
  aspiration,
  selected,
  onSelect,
  dense,
}: {
  aspiration: Aspiration
  selected: boolean
  onSelect: () => void
  dense?: boolean
}) {
  const iconSrc = aspirationIconPath(aspiration.label, aspiration.iconFile)
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={clsx(
        'group w-full rounded-xl border bg-white text-left',
        'transition shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-indigo-500',
        selected ? 'border-indigo-600 ring-1 ring-indigo-600' : 'border-gray-200'
      )}
    >
      <div className={clsx('flex items-center gap-3 p-3', dense && 'p-2')}>
        <Image
          src={iconSrc}
          alt={aspiration.label}
          width={dense ? 28 : 36}
          height={dense ? 28 : 36}
          className="rounded-sm"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className={clsx('truncate font-medium', dense ? 'text-sm' : 'text-[15px]')}>
              {aspiration.label}
            </span>
            {shouldShowPackIcon(aspiration.pack) && (
              <PackIcon name={aspiration.pack!} size={14} className="shrink-0" />
            )}
          </div>
          <p className={clsx('text-gray-500', dense ? 'text-xs' : 'text-[13px]')}>
            {aspiration.category} • {prettyAge(aspiration.ageGroup)}
          </p>
        </div>
        <div
          className={clsx(
            'h-2 w-2 shrink-0 rounded-full',
            selected ? 'bg-indigo-600' : 'bg-gray-300 group-hover:bg-gray-400'
          )}
          aria-hidden="true"
        />
      </div>
    </button>
  )
}

function EmptyState() {
  return (
    <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
      No aspirations in this tab yet.
    </div>
  )
}

function prettyAge(age: AspirationAgeGroup) {
  if (age === 'teen') return 'Teen'
  if (age === 'child') return 'Child'
  return 'Adult'
}
