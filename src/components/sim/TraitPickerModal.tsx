'use client'

import React, { useEffect, useMemo, useState } from 'react'
import clsx from 'clsx'
import { TraitIcon } from './TraitIcon'
import { PackIcon } from './PackIcon'

type AgeStage = 'infant' | 'toddler' | 'child' | 'teen' | 'young_adult' | 'adult' | 'elder'

// This matches your TraitsCatalog.ts entries
export type CatalogTrait = {
  id: string
  label: string
  category?: string
  icon?: string
  expansionPack?: string | null
  ageStage?: AgeStage | null
  description?: string | null
}

type Props = {
  isOpen: boolean
  onClose: () => void
  initialSelected: string[]        // trait ids currently on the Sim
  catalog: CatalogTrait[]          // from TraitsCatalog.ts
  simAgeStage: AgeStage | null | undefined
  ownedPacks?: string[]            // if you track ownership (optional)
  maxSelectable?: number           // e.g., 3
  onSave: (next: string[]) => Promise<void> | void
}



export default function TraitPickerModal({
  isOpen,
  onClose,
  initialSelected,
  catalog,
  simAgeStage,
  ownedPacks,
  maxSelectable = 3,
  onSave,
}: Props) {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set(initialSelected))

  // Tabs
  const categories = useMemo(
    () => ['All', ...Array.from(new Set(catalog.map(t => t.category).filter(Boolean) as string[])).sort()],
    [catalog]
  )
  const [categoryTab, setCategoryTab] = useState<string>('All')

  const ageTabs: Array<'All' | 'infant' | 'toddler'> = ['All', 'infant', 'toddler']
  const [ageTab, setAgeTab] = useState<'All' | 'infant' | 'toddler'>('All')

  useEffect(() => {
    if (!isOpen) return
    setSelected(new Set(initialSelected ?? []))
  }, [isOpen, initialSelected])

  

  // Filtering for the grid
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return catalog.filter(t => {
      if (categoryTab !== 'All') {
        if ((t.category ?? null) !== categoryTab) return false
      }
      if (ageTab !== 'All') {
        // Only show traits explicitly marked for that age
        if (t.ageStage !== ageTab) return false
      }
      if (q) {
        const hay = `${t.label} ${(t.category ?? '')} ${(t.expansionPack ?? '')}`.toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
  }, [catalog, categoryTab, ageTab, query])

  // Compatibility
  function isAgeCompatible(t: CatalogTrait, simAge: AgeStage | null | undefined) {
    if (!t.ageStage) return true           // no trait age restriction -> allowed
    if (!simAge) return true               // no sim age -> allow
    return t.ageStage === simAge
  }
  function isPackCompatible(t: CatalogTrait, ownedPacks?: string[]) {
    if (!t.expansionPack) return true      // base game -> allowed
    if (!ownedPacks?.length) return true   // not enforcing packs -> allowed
    return ownedPacks.includes(t.expansionPack)
  }
  
  /** Allow deselects even at the max. Only block selecting new ones. */
  function canToggle(t: CatalogTrait): { allowed: boolean; reason?: string } {
    const checked = selected.has(t.id)
    if (!isAgeCompatible(t, simAgeStage)) return { allowed: false, reason: 'Not available for this Sim’s age' }
    if (!isPackCompatible(t, ownedPacks)) return { allowed: false, reason: 'Requires expansion pack' }
    if (!checked && maxSelectable && selected.size >= maxSelectable) {
      return { allowed: false, reason: `Max ${maxSelectable} traits` }
    }
    return { allowed: true }
  }
  
  function toggle(t: CatalogTrait) {
    const checked = selected.has(t.id)
    const ok = canToggle(t).allowed
    if (!ok && !checked) return            // block new select when not allowed
    setSelected(prev => {
      const next = new Set(prev)
      if (checked) next.delete(t.id)
      else next.add(t.id)
      return next
    })
  }

  async function handleSave() {
    await onSave(Array.from(selected))
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/30" onClick={onClose} aria-hidden="true" />

      {/* modal */}
      <div className="relative z-10 w-[96vw] max-w-5xl max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/10">
        {/* header */}
        <div className="border-b p-4 md:p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Edit Traits</h2>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search traits…"
              className="w-60 rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Category tabs */}
          <div className="mt-3 flex flex-wrap gap-2">
            {categories.map(cat => {
              const active = categoryTab === cat
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoryTab(cat)}
                  className={clsx(
                    'rounded-full px-3 py-1 text-xs font-medium border transition',
                    active
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  )}
                >
                  {cat}
                </button>
              )
            })}
          </div>

          {/* Age tabs (Infant / Child specific) */}
          <div className="mt-2 flex flex-wrap gap-2">
            {ageTabs.map(a => {
              const active = ageTab === a
              return (
                <button
                  key={a}
                  type="button"
                  onClick={() => setAgeTab(a)}
                  className={clsx(
                    'rounded-full px-3 py-1 text-xs font-medium border transition',
                    active
                      ? 'bg-sky-50 border-sky-300 text-sky-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  )}
                  title={a === 'All' ? 'Show all ages' : `Show traits for ${a.replace('_', ' ')}`}
                >
                  {a === 'All' ? 'All Ages' : a.replace('_', ' ')}
                </button>
              )
            })}
          </div>
        </div>

        {/* grid */}
        <div className="overflow-auto p-4 md:p-5" style={{ maxHeight: 'calc(90vh - 148px)' }}>
          {filtered.length === 0 ? (
            <p className="text-sm text-gray-500">No traits match.</p>
          ) : (
            <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map(t => {
                const checked = selected.has(t.id)
                const gate = canToggle(t)
                return (
                  <li key={t.id}>
                    <button
  type="button"
  onClick={() => toggle(t)}
  disabled={!checked && !gate.allowed} // ✅ selected items are never disabled
  title={!checked && !gate.allowed ? gate.reason : undefined}
  className={clsx(
    'w-full rounded-xl border p-3 text-left transition',
    checked ? 'border-indigo-400 bg-indigo-50' : 'border-gray-200 bg-white hover:bg-gray-50',
    !checked && !gate.allowed && 'opacity-50 cursor-not-allowed'
  )}
>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <TraitIcon label={t.label} size={24} />
                          <div>
                            <div className="font-medium text-gray-900">{t.label}</div>
                            <div className="text-xs text-gray-500">{t.category ?? '—'}</div>
                          </div>
                        </div>
                        <input type="checkbox" readOnly checked={checked} className="h-4 w-4" />
                      </div>

                      <div className="mt-2 flex flex-wrap gap-1">
                      {t.expansionPack  && (
  <PackIcon name={t.expansionPack} size={16} owned={ownedPacks?.includes(t.expansionPack)} className="mr-1" />
)}
                        {t.ageStage && (
                          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-700">
                            {t.ageStage.replace('_',' ')}
                          </span>
                        )}
                      </div>

                      {t.description && (
                        <p className="mt-2 line-clamp-2 text-xs text-gray-600">{t.description}</p>
                      )}
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        {/* footer */}
        <div className="border-t p-4 md:p-5 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Selected: <span className="font-medium">{selected.size}</span>{maxSelectable ? <> / {maxSelectable}</> : null}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
