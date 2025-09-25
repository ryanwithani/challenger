// src/components/sim/AspirationSelect.tsx
'use client'

import { useMemo } from 'react'
import clsx from 'clsx'
import {
  Aspirations,
  type Aspiration,
  type AspirationAgeGroup,
  type AspirationCategory,
} from '@/src/components/sim/AspirationsCatalog'

const AGE_TABS: AspirationAgeGroup[] = ['adult', 'teen', 'child']

function isWorkingAge(age: string | undefined) {
  return !!age && ['teen','young_adult','adult','elder'].includes(age)
}

function ageMatches(a: Aspiration, simAge?: string): boolean {
  if (!simAge) return true
  if (simAge === 'teen') return a.ageGroup === 'teen'
  if (simAge === 'child') return a.ageGroup === 'child'
  // young_adult/adult/elder → treat as adult
  return a.ageGroup === 'adult'
}

function hasPack(a: Aspiration, ownedPacks?: string[]): boolean {
  if (!a.pack || a.pack === 'Base Game') return true
  return !!ownedPacks?.includes(a.pack)
}

export function AspirationSelect({
  value,                    // current label or null
  onChange,                 // (label|null) => void
  simAgeStage,              // 'infant'|'toddler'|'child'|'teen'|'young_adult'|'adult'|'elder'
  ownedPacks = ['Base Game'],
  className = '',
  placeholder = '— None —',
}: {
  value: string | null
  onChange: (label: string | null) => void
  simAgeStage?: string
  ownedPacks?: string[]
  className?: string
  placeholder?: string
}) {
  const grouped = useMemo(() => {
    // Filter to age-appropriate first; we’ll still show disabled ones with reasons
    const byCat = new Map<AspirationCategory, Aspiration[]>()
    for (const a of Aspirations) {
      if (!byCat.has(a.category)) byCat.set(a.category, [])
      byCat.get(a.category)!.push(a)
    }
    // Sort stable by label
    byCat.forEach((arr) => {
      arr.sort((x: Aspiration, y: Aspiration) => x.label.localeCompare(y.label));
    });
    return Array.from(byCat.entries()).sort(
      (a, b) => a[0].localeCompare(b[0])
    );
  }, []);

  const wholeControlDisabled =
    simAgeStage === 'infant' || simAgeStage === 'toddler'

  return (
    <select
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value || null)}
      disabled={wholeControlDisabled}
      className={clsx(
        'mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500',
        className
      )}
    >
      <option value="">{placeholder}</option>
      {grouped.map(([category, list]) => (
        <optgroup key={category} label={category}>
          {list.map((a) => {
            const ageOk = ageMatches(a, simAgeStage)
            const packOk = hasPack(a, ownedPacks)
            const enabled = ageOk && packOk && !wholeControlDisabled
            const reason = !ageOk
              ? (a.ageGroup === 'teen' ? 'Teen-only' : a.ageGroup === 'child' ? 'Child-only' : 'Adult-only')
              : !packOk
                ? `Requires ${a.pack}`
                : undefined
            return (
              <option
                key={a.id}
                value={a.label}
                disabled={!enabled}
                title={reason ?? ''}
              >
                {a.label}{reason ? ` — ${reason}` : ''}
              </option>
            )
          })}
        </optgroup>
      ))}
    </select>
  )
}
