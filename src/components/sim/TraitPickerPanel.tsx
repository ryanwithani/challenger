'use client'
import { useMemo, useState } from 'react'
import Image from 'next/image'
import clsx from 'clsx'
import { Traits, type TraitDefinition } from '@/src/components/sim/TraitsCatalog'
import { traitPngPath } from '@/src/components/sim/TraitAssets'
import { PackIcon } from '@/src/components/sim/PackIcon'
import { Input } from '@/src/components/ui/Input'

const CATEGORY_ORDER = ['Emotional','Lifestyle','Hobby','Social','Bonus'] as const

export function TraitPickerPanel({
  value,
  onChange,
  max = 3,
  ownedPacks = ['Base Game'],
}: {
  value: string[]              // trait ids
  onChange: (ids: string[]) => void
  max?: number
  ownedPacks?: string[]
}) {
  const [q, setQ] = useState('')
  const [tab, setTab] = useState('All')
  const atCapacity = value.length >= max

  const pool: TraitDefinition[] = useMemo(() => {
    return Traits
  }, [])

  const categories = useMemo(() => {
    const s = new Set<string>(['All'])
    pool.forEach(t => t.category && s.add(t.category))
    return Array.from(s).sort((a, b) => {
      const ia = CATEGORY_ORDER.indexOf(a as any)
      const ib = CATEGORY_ORDER.indexOf(b as any)
      if (ia === -1 && ib === -1) return a.localeCompare(b)
      if (ia === -1) return 1
      if (ib === -1) return -1
      return ia - ib
    })
  }, [pool])

  const visible = useMemo(() => {
    const term = q.trim().toLowerCase()
    return pool
      .filter(t => tab === 'All' ? true : t.category === tab)
      .filter(t => term ? (t.label.toLowerCase().includes(term) || t.id.includes(term)) : true)
      .sort((a,b) => a.label.localeCompare(b.label))
  }, [pool, tab, q])

  function toggle(id: string) {
    if (value.includes(id)) {
      onChange(value.filter(x => x !== id))
    } else {
      if (value.length >= max) {
        if (max === 1) onChange([id])
        else return
      } else {
        onChange([...value, id])
      }
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search traits…"
          type="text"
        />
        <div className="shrink-0 text-xs text-warmGray-500 dark:text-warmGray-400">{value.length}/{max} selected</div>
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.map(c => (
          <button
            key={c}
            type="button"
            onClick={() => setTab(c)}
            className={clsx(
              'rounded-full px-3 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-1',
              tab === c
                ? 'bg-brand-500 dark:bg-brand-600 text-white'
                : 'bg-warmGray-100 dark:bg-warmGray-800 text-warmGray-700 dark:text-warmGray-300 hover:bg-warmGray-200 dark:hover:bg-warmGray-700'
            )}
          >
            {c}
          </button>
        ))}
      </div>

      <ul data-testid="traits-grid" className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {visible.map(t => {
          const selected = value.includes(t.id)
          const img = traitPngPath(t)
          const pack = (t as any).pack as string | undefined
          const showPack = !!pack && pack !== 'Base Game'
          const owned = !pack || pack === 'Base Game' || ownedPacks.includes(pack)
          const disabledTrait = (!owned) || (atCapacity && !selected)
          const focusRing = selected
            ? 'focus-visible:ring-2 focus-visible:ring-brand-400'
            : 'focus-visible:ring-2 focus-visible:ring-warmGray-300 dark:focus-visible:ring-warmGray-600'
          return (
            <li key={t.id}>
              <button
                type="button"
                data-testid={`trait-${t.id}`}
                onClick={() => !disabledTrait && toggle(t.id)}
                disabled={disabledTrait}
                aria-checked={selected}
                aria-label={t.label}
                className={clsx(
                  'w-full rounded-xl border-2 bg-white dark:bg-warmGray-800 p-3 text-left shadow-sm transition hover:shadow focus:outline-none text-warmGray-900 dark:text-warmGray-100',
                  focusRing,
                  selected
                    ? 'border-brand-500 dark:border-brand-400 ring-1 ring-brand-500 dark:ring-brand-400'
                    : 'border-warmGray-200 dark:border-warmGray-700',
                  !owned && 'opacity-60 grayscale cursor-not-allowed',
                  disabledTrait && 'opacity-50 cursor-not-allowed'
                )}
                title={!owned && pack ? `Requires: ${pack}` : disabledTrait ? `Max ${max} traits` : undefined}
                aria-disabled={disabledTrait}
              >
                <div className="flex items-center gap-3">
                  {img ? (
                    <Image src={traitPngPath(t)} alt={t.label} width={28} height={28} className="rounded-sm" />
                  ) : (
                    <div className="h-7 w-7 rounded-sm bg-warmGray-100 dark:bg-warmGray-700" />
                  )}
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{t.label}</div>
                    {t.category && <div className="text-xs text-warmGray-500 dark:text-warmGray-400">{t.category}</div>}
                  </div>
                  <div className="ml-auto flex items-center gap-2">
                    {showPack && <PackIcon name={pack!} size={14} owned={owned} />}
                    <span className={clsx(
                      'h-2 w-2 rounded-full',
                      selected ? 'bg-brand-500 dark:bg-brand-400' : 'bg-warmGray-300 dark:bg-warmGray-600'
                    )} />
                  </div>
                </div>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
