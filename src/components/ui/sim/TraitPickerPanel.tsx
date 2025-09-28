'use client'
import { useMemo, useState } from 'react'
import Image from 'next/image'
import clsx from 'clsx'
import { isInfant, isToddler } from '@/src/lib/sim/age'
import { Traits, type TraitDefinition } from '@/src/components/sim/TraitsCatalog'
import { traitPngPath } from '@/src/components/sim/TraitAssets'
import { PackIcon } from '@/src/components/sim/PackIcon'

const INFANT_IDS = ['calm','cautious','intense','sensitive','sunny','wiggly']
const TODDLER_IDS = ['angelic','charmer','clingy','fussy','independent','inquisitive','silly','wild']
const CATEGORY_ORDER = ['Emotional','Lifestyle','Hobby','Social','Bonus','Infant','Toddler'] as const

export function TraitPickerPanel({
  ageStage,
  value,
  onChange,
  max = 3,
  ownedPacks = ['Base Game'],
}: {
  ageStage: string
  value: string[]              // trait ids
  onChange: (ids: string[]) => void
  max?: number
  ownedPacks?: string[]
}) {
  const [q, setQ] = useState('')
  const [tab, setTab] = useState('All')
  const atCapacity = value.length >= max

  const pool: TraitDefinition[] = useMemo(() => {
    if (isInfant(ageStage)) return Traits.filter(t => INFANT_IDS.includes(t.id))
    if (isToddler(ageStage)) return Traits.filter(t => TODDLER_IDS.includes(t.id))
    return Traits.filter(t => !INFANT_IDS.includes(t.id) && !TODDLER_IDS.includes(t.id))
  }, [ageStage])

  const categories = useMemo(() => {
    const s = new Set<string>(['All'])
    pool.forEach(t => t.category && s.add(t.category))
    if (isInfant(ageStage)) s.add('Infant')
    if (isToddler(ageStage)) s.add('Toddler')
    return Array.from(s).sort((a, b) => {
      const ia = CATEGORY_ORDER.indexOf(a as any)
      const ib = CATEGORY_ORDER.indexOf(b as any)
      if (ia === -1 && ib === -1) return a.localeCompare(b)
      if (ia === -1) return 1
      if (ib === -1) return -1
      return ia - ib
    })
  }, [pool, ageStage])

  const visible = useMemo(() => {
    const term = q.trim().toLowerCase()
    return pool
      .filter(t => tab === 'All' ? true : t.category === tab || tab === 'Infant' || tab === 'Toddler')
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
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search traits…"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
        />
        <div className="shrink-0 text-xs text-gray-500">{value.length}/{max} selected</div>
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.map(c => (
          <button
            key={c}
            type="button"
            onClick={() => setTab(c)}
            className={clsx(
              'rounded-full px-3 py-1 text-xs',
              tab === c ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
          const focusRing = selected ? 'focus-visible:ring-2 focus-visible:ring-indigo-500' : 'focus-visible:ring-2 focus-visible:ring-gray-300'
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
                  'w-full rounded-xl border bg-white p-3 text-left shadow-sm transition hover:shadow focus:outline-none',
                  focusRing,
                  selected ? 'border-indigo-600 ring-1 ring-indigo-600' : 'border-gray-200',
                  !owned && 'opacity-60 grayscale cursor-not-allowed', // show warning if not owned
                  disabledTrait && 'opacity-50 cursor-not-allowed'
                )}
                title={!owned && pack ? `Requires: ${pack}` : disabledTrait ? `Max ${max} traits` : undefined}
                aria-disabled={disabledTrait}
              >
                <div className="flex items-center gap-3">
                  {img ? (
                    <Image src={traitPngPath(t)} alt={t.label} width={28} height={28} className="rounded-sm" />
                  ) : (
                    <div className="h-7 w-7 rounded-sm bg-gray-100" />
                  )}
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{t.label}</div>
                    {t.category && <div className="text-xs text-gray-500">{t.category}</div>}
                  </div>
                  <div className="ml-auto flex items-center gap-2">
                    {showPack && <PackIcon name={pack!} size={14} owned={owned} />}
                    <span className={clsx('h-2 w-2 rounded-full', selected ? 'bg-indigo-600' : 'bg-gray-300')} />
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
