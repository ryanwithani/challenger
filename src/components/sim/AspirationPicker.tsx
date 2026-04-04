'use client'
import { useMemo, useState } from 'react'
import clsx from 'clsx'
import { Modal } from '@/src/components/sim/Modal'
import { Aspirations, type Aspiration } from '@/src/components/sim/AspirationsCatalog'
import { PackIcon } from '@/src/components/sim/PackIcon'
import { Input } from '@/src/components/ui/Input'

export function AspirationPicker({
  ageStage, value, onChange, ownedPacks = ['Base Game'],
}: {
  ageStage: string
  value: string | null          // store label or id—adjust below to your schema
  onChange: (next: string | null) => void
  ownedPacks?: string[]
}) {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const [tab, setTab] = useState('All')

  const categories = useMemo(
    () => ['All', ...Array.from(new Set(Aspirations.map(a => a.category).filter(Boolean)))],
    []
  )

  const list: Aspiration[] = useMemo(() => {
    const term = q.trim().toLowerCase()
    return Aspirations
      .filter(a => tab === 'All' ? true : a.category === tab)
      .filter(a => term ? (a.label.toLowerCase().includes(term) || a.id.includes(term)) : true)
      .sort((a,b) => a.label.localeCompare(b.label))
  }, [q, tab, ageStage])

  function choose(a: Aspiration) {
    // If you store id, change to onChange(a.id)
    onChange(a.label)
    setOpen(false)
  }

  return (
    <div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-xl border border-warmGray-300 dark:border-warmGray-600 bg-white dark:bg-warmGray-800 px-3 py-2 text-sm text-warmGray-900 dark:text-warmGray-100 hover:bg-warmGray-50 dark:hover:bg-warmGray-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 disabled:opacity-50"
        >
          {value ?? 'Choose aspiration'}
        </button>
        {value && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-xs text-warmGray-500 dark:text-warmGray-400 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 rounded"
          >
            Clear
          </button>
        )}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Pick an Aspiration">
        <div className="mb-3">
          <Input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search aspirations…"
            type="text"
          />
        </div>

        <div className="mb-3 flex flex-wrap gap-2">
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

        <ul className="grid max-h-[60vh] grid-cols-1 gap-2 overflow-auto rounded-xl border border-warmGray-200 dark:border-warmGray-700 bg-white dark:bg-warmGray-800 p-2 sm:grid-cols-2">
          {list.map(a => {
            const pack = a.pack ?? null
            const selected = a.label === value
            const owned = !pack || pack === 'Base Game' || ownedPacks.includes(pack)
            return (
              <li key={a.id}>
                <button
                  type="button"
                  onClick={() => owned && choose(a)}
                  className={clsx(
                    'flex w-full items-center justify-between rounded-xl px-2 py-2 text-left text-sm text-warmGray-900 dark:text-warmGray-100 hover:bg-warmGray-100 dark:hover:bg-warmGray-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400',
                    selected && 'bg-brand-50 dark:bg-brand-900/20 ring-1 ring-brand-500 dark:ring-brand-400',
                    !owned && 'opacity-60 grayscale cursor-not-allowed'
                  )}
                  title={!owned && pack ? `Requires: ${pack}` : undefined}
                >
                  <div className="flex items-center gap-2">
                    <span className="truncate">{a.label}</span>
                    {pack && pack !== 'Base Game' && <PackIcon name={pack} size={14} owned={owned} />}
                  </div>
                  <span className={clsx(
                    'h-2 w-2 shrink-0 rounded-full',
                    selected ? 'bg-brand-500 dark:bg-brand-400' : 'bg-warmGray-300 dark:bg-warmGray-600'
                  )} />
                </button>
              </li>
            )
          })}
        </ul>
      </Modal>
    </div>
  )
}
