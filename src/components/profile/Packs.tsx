// src/components/profile/Packs.tsx
'use client'

import { Fragment } from 'react'
import {
  PACKS,
  PACK_CATEGORY_LABELS,
  type PackDef,
  type PackCategory,
} from '@/src/data/packs'

const CATEGORY_ORDER: PackCategory[] = [
  'base_game',
  'expansion_pack',
  'game_pack',
  'stuff_pack',
  'kit',
  'lto_event',
]

type Props = {
  value: string[]
  onChange?: (next: string[]) => void
  readOnly?: boolean
  className?: string
  header?: React.ReactNode
  hint?: React.ReactNode
}

export function Packs({
  value,
  onChange,
  readOnly = false,
  className,
  header = <h2 className="text-lg font-semibold">Owned Packs</h2>,
  hint,
}: Props) {
  const ownedSet = new Set(value)

  const toggle = (acronym: string) => {
    if (readOnly || !onChange) return
    const next = ownedSet.has(acronym)
      ? value.filter((a) => a !== acronym)
      : [...value, acronym]
    onChange(next)
  }

  const selectAll = () => {
    if (readOnly || !onChange) return
    onChange(PACKS.map((p) => p.acronym))
  }

  const clearAll = () => {
    if (readOnly || !onChange) return
    onChange(['TS4'])
  }

  const byCategory = CATEGORY_ORDER.reduce<Record<string, PackDef[]>>(
    (acc, cat) => {
      const items = PACKS.filter((p) => p.category === cat)
      if (items.length > 0) acc[cat] = items
      return acc
    },
    {}
  )

  return (
    <div className={className}>
      {header}
      {hint && <div className="mt-1 text-xs text-gray-500">{hint}</div>}

      {!readOnly && onChange && (
        <div className="mt-2 flex gap-2">
          <button
            type="button"
            onClick={selectAll}
            className="text-xs text-brand-600 hover:text-brand-700 font-medium"
          >
            Select All
          </button>
          <span className="text-xs text-gray-300">|</span>
          <button
            type="button"
            onClick={clearAll}
            className="text-xs text-gray-500 hover:text-gray-700 font-medium"
          >
            Clear All
          </button>
        </div>
      )}

      <div className="mt-4 space-y-6">
        {Object.entries(byCategory).map(([category, items]) => (
          <Fragment key={category}>
            <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              {PACK_CATEGORY_LABELS[category as PackCategory]}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {items.map((pack) => {
                const isBaseGame = pack.category === 'base_game'
                const checked = isBaseGame || ownedSet.has(pack.acronym)
                const disabled = readOnly || isBaseGame

                return (
                  <button
                    key={pack.acronym}
                    type="button"
                    role="checkbox"
                    aria-checked={checked}
                    aria-label={pack.name}
                    disabled={disabled}
                    onClick={() => toggle(pack.acronym)}
                    className={[
                      'group relative aspect-square rounded-xl border bg-white dark:bg-zinc-900',
                      'p-2 transition-all',
                      checked
                        ? 'border-brand-600 ring-0'
                        : 'border-gray-200 hover:border-brand-400/60',
                      disabled && !checked
                        ? 'opacity-60 cursor-not-allowed'
                        : 'cursor-pointer',
                      'focus:outline-none focus:ring-2 focus:ring-brand-500',
                    ].join(' ')}
                  >
                    {checked && (
                      <span
                        className="absolute right-1.5 top-1.5 grid h-5 w-5 place-items-center rounded-full bg-brand-600 text-white text-[11px]"
                        aria-hidden
                      >
                        ✓
                      </span>
                    )}

                    <div className="flex flex-col items-center justify-center h-full">
                      <div className="text-xs font-medium leading-tight text-center min-h-[42px] flex items-center">
                        {pack.name}
                      </div>
                      {isBaseGame && (
                        <div className="mt-1 text-[10px] text-gray-500 text-center">
                          Always enabled
                        </div>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </Fragment>
        ))}
      </div>
    </div>
  )
}

export default Packs
