'use client'
import { useMemo, useState } from 'react'
import clsx from 'clsx'
import { Modal } from '@/src/components/sim/Modal'
import { Aspirations, type Aspiration } from '@/src/components/sim/AspirationsCatalog'
import { PackIcon } from '@/src/components/sim/PackIcon'

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
          className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
        >
          {value ?? 'Choose aspiration'}
        </button>
        {value && (
          <button type="button" onClick={() => onChange(null)} className="text-xs text-gray-500 hover:underline">
            Clear
          </button>
        )}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Pick an Aspiration">
        <div className="mb-3 flex items-center justify-between gap-3">
          <input
            value={q} onChange={e => setQ(e.target.value)}
            placeholder="Search aspirations…"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="mb-3 flex flex-wrap gap-2">
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

        <ul className="grid max-h-[60vh] grid-cols-1 gap-2 overflow-auto rounded-md border p-2 sm:grid-cols-2">
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
                    'flex w-full items-center justify-between rounded-md px-2 py-2 text-left text-sm hover:bg-gray-100',
                    !owned && 'opacity-60 grayscale cursor-not-allowed'
                  )}
                  title={!owned && pack ? `Requires: ${pack}` : undefined}
                >
                  <div className="flex items-center gap-2">
                    <span className="truncate">{a.label}</span>
                    {pack && pack !== 'Base Game' && <PackIcon name={pack} size={14} owned={owned} />}
                    <span className={clsx('h-2 w-2 rounded-full', selected ? 'bg-indigo-600' : 'bg-gray-300')} />
                  </div>
                  <span className={clsx('h-2 w-2 rounded-full', selected ? 'bg-indigo-600' : 'bg-gray-300')} />
                </button>
              </li>
            )
          })}
        </ul>
      </Modal>
    </div>
  )
}
