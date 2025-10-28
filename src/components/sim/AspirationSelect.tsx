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
import { GroupedSelect } from '@/src/components/ui/Select'

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
  const wholeControlDisabled =
    simAgeStage === 'infant' || simAgeStage === 'toddler'

  const grouped = useMemo(() => {
    // Filter to age-appropriate first; we'll still show disabled ones with reasons
    const byCat = new Map<AspirationCategory, Aspiration[]>()
    for (const a of Aspirations) {
      if (!byCat.has(a.category)) byCat.set(a.category, [])
      byCat.get(a.category)!.push(a)
    }
    // Sort stable by label
    byCat.forEach((arr) => {
      arr.sort((x: Aspiration, y: Aspiration) => x.label.localeCompare(y.label));
    });
    return Array.from(byCat.entries()).map(([category, list]) => ({
      label: category,
      options: list.map((a) => {
        const ageOk = ageMatches(a, simAgeStage)
        const packOk = hasPack(a, ownedPacks)
        const enabled = ageOk && packOk && !wholeControlDisabled
        const reason = !ageOk
          ? (a.ageGroup === 'teen' ? 'Teen-only' : a.ageGroup === 'child' ? 'Child-only' : 'Adult-only')
          : !packOk
            ? `Requires ${a.pack}`
            : undefined
        return {
          value: a.label,
          label: `${a.label}${reason ? ` — ${reason}` : ''}`,
          disabled: !enabled
        }
      })
    })).sort((a, b) => a.label.localeCompare(b.label));
  }, [simAgeStage, ownedPacks, wholeControlDisabled]);

  return (
    <GroupedSelect
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value || null)}
      disabled={wholeControlDisabled}
      groups={grouped}
      placeholder={placeholder}
      className={clsx('mt-1', className)}
    />
  )
}
