'use client'

import { useMemo, useState, useEffect } from 'react'
import clsx from 'clsx'
import {
  BASE_CAREERS, getBranchesForBase, careerLabelFromIds, packForCareerIds,
} from '@/src/lib/utils/careers'
import { PackIcon } from '@/src/components/sim/PackIcon'

const hidePack = (p?: string | null) => !!(p && p !== 'Base Game')

export type CareerSelection = {
  baseId?: string
  branchId?: string
  label: string | null
}

export function CareerSelect({
  value,
  onChange,
  disabled = false,
  className = '',
  simAgeStage
}: {
  value?: { baseId?: string; branchId?: string } // controlled (optional)
  onChange: (next: CareerSelection) => void
  simAgeStage?: string
  disabled?: boolean
  className?: string
}) {
  const [baseId, setBaseId] = useState<string | undefined>(value?.baseId)
  const [branchId, setBranchId] = useState<string | undefined>(value?.branchId)

  // keep internal state in sync if parent controls it
  useEffect(() => { if (value) { setBaseId(value.baseId); setBranchId(value.branchId) } }, [value?.baseId, value?.branchId])

useEffect(() => {
        const nonWorking = simAgeStage === 'infant' || simAgeStage === 'toddler' || simAgeStage === 'child'
        if (nonWorking && (baseId || branchId)) {
          setBaseId(undefined)
          setBranchId(undefined)
          onChange({ baseId: undefined, branchId: undefined, label: null })
        }
      }, [simAgeStage]) // eslint-disable-line react-hooks/exhaustive-deps

  const branches = useMemo(() => baseId ? getBranchesForBase(baseId) : [], [baseId])
  const chosenLabel = useMemo(() => careerLabelFromIds(baseId, branchId), [baseId, branchId])
  const pack = useMemo(() => packForCareerIds(baseId, branchId), [baseId, branchId])

  function setBase(nextBaseId: string) {
    setBaseId(nextBaseId || undefined)
    setBranchId(undefined) // reset branch when base changes
    onChange({ baseId: nextBaseId || undefined, branchId: undefined, label: careerLabelFromIds(nextBaseId, undefined) })
  }

  function setBranch(nextBranchId: string) {
    setBranchId(nextBranchId || undefined)
    onChange({ baseId, branchId: nextBranchId || undefined, label: careerLabelFromIds(baseId, nextBranchId) })
  }

  const wholeControlDisabled =
    simAgeStage === 'infant' || simAgeStage === 'toddler' || simAgeStage === 'child'

  return (
    <div className={clsx('grid grid-cols-1 gap-2 md:grid-cols-3', className)}>
      <div className="md:col-span-1">
        <label className="block text-sm font-medium text-gray-700">Base Career</label>
        <select
          disabled={wholeControlDisabled}
          value={baseId ?? ''}
          onChange={(e) => setBase(e.target.value)}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">— Select —</option>
          {BASE_CAREERS.map(b => (
            <option key={b.id} value={b.id}>{b.label}</option>
          ))}
        </select>
      </div>

      <div className="md:col-span-1">
        <label className="block text-sm font-medium text-gray-700">Branch (optional)</label>
        <select
          disabled={wholeControlDisabled || !baseId || branches.length === 0}
          value={branchId ?? ''}
          onChange={(e) => setBranch(e.target.value)}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">— None —</option>
          {branches.map(br => (
            <option key={br.id} value={br.id}>{br.label}</option>
          ))}
        </select>
      </div>

      <div className="md:col-span-1 flex items-end">
        <div className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">
          <div className="flex items-center justify-between">
            <span className="truncate">{chosenLabel ?? 'No career selected'}</span>
            {hidePack(pack) && <PackIcon name={pack!} size={16} className="ml-2" />}
          </div>
        </div>
      </div>
    </div>
  )
}
