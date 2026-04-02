// src/components/sim/ByChallengeView.tsx
'use client'

import { useState } from 'react'
import { SimCard, type SimCardProps } from '@/src/components/sim/SimCard'
import { cn } from '@/src/lib/utils/cn'
import { Database } from '@/src/types/database.types'
import { TbChevronDown } from 'react-icons/tb'

type Sim = Database['public']['Tables']['sims']['Row']
type Challenge = Database['public']['Tables']['challenges']['Row']

interface ByChallengeViewProps {
  groupedSims: Map<string, Sim[]>
  unassigned: Sim[]
  challenges: Challenge[]
  traitCatalog: SimCardProps['traitCatalog']
  onOpenPanel: (simId: string) => void
  isBulkMode: boolean
  selectedSimIds: Record<string, true>
  onSelect?: (simId: string) => void
}

const UNASSIGNED_KEY = 'unassigned'

export default function ByChallengeView({
  groupedSims,
  unassigned,
  challenges,
  traitCatalog,
  onOpenPanel,
  isBulkMode,
  selectedSimIds,
  onSelect,
}: ByChallengeViewProps) {
  const [expandedIds, setExpandedIds] = useState<Record<string, true>>(() => {
    const initial: Record<string, true> = { [UNASSIGNED_KEY]: true }
    Array.from(groupedSims.keys()).forEach(id => {
      initial[id] = true
    })
    return initial
  })

  function toggleExpand(id: string) {
    setExpandedIds(prev => {
      const next = { ...prev }
      if (next[id]) delete next[id]
      else next[id] = true
      return next
    })
  }

  return (
    <div>
      {Array.from(groupedSims.entries()).map(([challengeId, sims]) => {
        const ch = challenges.find(c => c.id === challengeId)

        return (
          <section key={challengeId} className="mb-6">
            <button
              type="button"
              onClick={() => toggleExpand(challengeId)}
              className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-warmGray-50 dark:hover:bg-warmGray-800/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="font-display text-base font-semibold text-warmGray-950 dark:text-warmGray-50">
                  {ch?.name ?? ch?.challenge_type ?? 'Unknown Challenge'}
                </span>
                <span className="bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300 px-2 py-0.5 rounded-full text-xs font-medium">
                  {sims.length}
                </span>
                {ch?.status && (
                  <span className="text-xs text-warmGray-500 dark:text-warmGray-400 capitalize">
                    {ch.status}
                  </span>
                )}
              </div>
              <TbChevronDown
                className={cn(
                  'w-5 h-5 text-warmGray-400 transition-transform',
                  expandedIds[challengeId] && 'rotate-180',
                )}
              />
            </button>

            {expandedIds[challengeId] && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-3">
                {sims.map(sim => (
                  <SimCard
                    key={sim.id}
                    sim={sim}
                    challenge={ch ?? null}
                    traitCatalog={traitCatalog}
                    onOpenPanel={() => onOpenPanel(sim.id)}
                    isSelected={!!selectedSimIds[sim.id]}
                    onSelect={isBulkMode ? onSelect : undefined}
                  />
                ))}
              </div>
            )}
          </section>
        )
      })}

      {unassigned.length > 0 && (
        <section className="mb-6 border-t border-warmGray-200 dark:border-warmGray-700 pt-4">
          <button
            type="button"
            onClick={() => toggleExpand(UNASSIGNED_KEY)}
            className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-warmGray-50 dark:hover:bg-warmGray-800/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="text-base font-semibold text-warmGray-500 dark:text-warmGray-400">
                Unassigned Sims
              </span>
              <span className="bg-warmGray-200 text-warmGray-600 dark:bg-warmGray-700 dark:text-warmGray-300 px-2 py-0.5 rounded-full text-xs font-medium">
                {unassigned.length}
              </span>
            </div>
            <TbChevronDown
              className={cn(
                'w-5 h-5 text-warmGray-400 transition-transform',
                expandedIds[UNASSIGNED_KEY] && 'rotate-180',
              )}
            />
          </button>

          {expandedIds[UNASSIGNED_KEY] && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-3">
              {unassigned.map(sim => (
                <SimCard
                  key={sim.id}
                  sim={sim}
                  traitCatalog={traitCatalog}
                  onOpenPanel={() => onOpenPanel(sim.id)}
                  isSelected={!!selectedSimIds[sim.id]}
                  onSelect={isBulkMode ? onSelect : undefined}
                />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  )
}
