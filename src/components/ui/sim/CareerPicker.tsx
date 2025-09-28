'use client'
import { useMemo, useState } from 'react'
import clsx from 'clsx'
import { Modal } from '@/src/components/ui/sim/Modal'
import { isToddlerOrInfant } from '@/src/lib/sim/age'
import {
  BASE_CAREERS, getBranchesForBase, careerLabelFromIds, packForCareerIds,
} from '@/src/lib/utils/careers'
import { PackIcon } from '@/src/components/sim/PackIcon'

export type CareerSelection = { baseId?: string; branchId?: string; label: string | null }

export function CareerPicker({
  ageStage, value, onChange, ownedPacks = ['Base Game'],
}: {
  ageStage: string
  value: CareerSelection | null
  onChange: (v: CareerSelection | null) => void
  ownedPacks?: string[]
}) {
  const disabled = isToddlerOrInfant(ageStage)
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const [baseId, setBaseId] = useState<string | undefined>(value?.baseId)
  const [branchId, setBranchId] = useState<string | undefined>(value?.branchId)

  const filteredBases = useMemo(() => {
    const term = q.trim().toLowerCase()
    return BASE_CAREERS
      .filter(b => term ? (b.label.toLowerCase().includes(term) || b.id.includes(term)) : true)
      .sort((a,b) => a.label.localeCompare(b.label))
  }, [q])

  const branches = useMemo(() => baseId ? getBranchesForBase(baseId) : [], [baseId])
  const pack = packForCareerIds(baseId, branchId)
  const selectionLabel = careerLabelFromIds(baseId, branchId)
  const owned = !pack || pack === 'Base Game' || ownedPacks.includes(pack)

  function confirm() {
    if (!baseId) { onChange({ label: null }); setOpen(false); return }
    onChange({ baseId, branchId, label: selectionLabel })
    setOpen(false)
  }
  function clear() {
    setBaseId(undefined); setBranchId(undefined)
    onChange(null); setOpen(false)
  }

  return (
    <div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen(true)}
          className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
        >
          {value?.label ?? 'Choose career'}
        </button>
        {pack && pack !== 'Base Game' && <PackIcon name={pack} size={16} owned={owned} />}
        {value?.label && (
          <button type="button" onClick={() => onChange(null)} className="text-xs text-gray-500 hover:underline">
            Clear
          </button>
        )}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Pick a Career">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {/* Bases */}
          <div className="md:col-span-1">
            <input
              value={q} onChange={e => setQ(e.target.value)}
              placeholder="Search careers…"
              className="mb-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
            />
            <ul className="max-h-80 space-y-1 overflow-auto rounded-md border p-2">
              {filteredBases.map(b => {
                const ownedB = !b.pack || b.pack === 'Base Game' || ownedPacks.includes(b.pack)
                return (
                  <li key={b.id}>
                    <button
                      type="button"
                      onClick={() => ownedB && (setBaseId(b.id), setBranchId(undefined))}
                      className={clsx(
                        'w-full rounded-md px-2 py-1 text-left text-sm hover:bg-gray-100',
                        baseId === b.id && 'bg-indigo-50 ring-1 ring-indigo-500',
                        !ownedB && 'opacity-60 grayscale cursor-not-allowed'
                      )}
                      title={!ownedB && b.pack ? `Requires: ${b.pack}` : undefined}
                    >
                      <div className="flex items-center justify-between">
                        <span>{b.label}</span>
                        {b.pack && b.pack !== 'Base Game' && <PackIcon name={b.pack} size={14} owned={ownedB} />}
                      </div>
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>

          {/* Branches */}
          <div className="md:col-span-2">
            <div className="mb-2 text-xs text-gray-500">Branches (optional)</div>
            <ul className="max-h-80 space-y-1 overflow-auto rounded-md border p-2">
              <li>
                <button
                  type="button"
                  disabled={!baseId}
                  onClick={() => setBranchId(undefined)}
                  className={clsx(
                    'w-full rounded-md px-2 py-1 text-left text-sm hover:bg-gray-100 disabled:opacity-50',
                    baseId && !branchId && 'bg-indigo-50 ring-1 ring-indigo-500'
                  )}
                >
                  — None —
                </button>
              </li>
              {branches.map(br => {
                const ownedBr = !br.pack || br.pack === 'Base Game' || ownedPacks.includes(br.pack)
                return (
                  <li key={br.id}>
                    <button
                      type="button"
                      onClick={() => ownedBr && setBranchId(br.id)}
                      className={clsx(
                        'w-full rounded-md px-2 py-1 text-left text-sm hover:bg-gray-100',
                        branchId === br.id && 'bg-indigo-50 ring-1 ring-indigo-500',
                        !ownedBr && 'opacity-60 grayscale cursor-not-allowed'
                      )}
                      title={!ownedBr && br.pack ? `Requires: ${br.pack}` : undefined}
                    >
                      <div className="flex items-center justify-between">
                        <span>{br.label}</span>
                        {br.pack && br.pack !== 'Base Game' && <PackIcon name={br.pack} size={14} owned={ownedBr} />}
                      </div>
                    </button>
                  </li>
                )
              })}
            </ul>

            <div className="mt-3 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Selected: {selectionLabel ?? '—'} {pack && pack !== 'Base Game' && (
                  <span className={clsx('ml-2 inline-flex items-center gap-1 text-xs', owned ? 'text-gray-500' : 'text-rose-600')}>
                    <PackIcon name={pack} size={12} owned={owned} /> {owned ? '' : `Requires ${pack}`}
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={clear} className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm hover:bg-gray-50">Clear</button>
                <button type="button" onClick={confirm} className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm text-white hover:bg-indigo-700">Confirm</button>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}
