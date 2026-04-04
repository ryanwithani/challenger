// src/components/sim/SimCard.tsx
'use client'

import { memo, useMemo } from 'react'
import { cn } from '@/src/lib/utils/cn'
import { Database } from '@/src/types/database.types'
import { PackIcon } from '@/src/components/sim/PackIcon'
import { TraitIcon } from '@/src/components/sim/TraitIcon'
import { AvatarCircle } from '@/src/components/sim/AvatarCircle'
import { SafeText } from '../ui/SafeText'
import { TbCrown } from 'react-icons/tb'

// Types
type Sim = Database['public']['Tables']['sims']['Row']
type Challenge = Database['public']['Tables']['challenges']['Row']

type TraitCatalogItem = {
  id: string
  label: string
  category?: string | null
  ageStage?: 'infant' | 'toddler' | 'child' | 'teen' | 'young_adult' | 'adult' | 'elder' | null
  expansionPack?: string | null
  description?: string | null
}

export type SimCardProps = {
  sim: Sim
  challenge?: Challenge | null            // pass if you're on a challenge view
  traitCatalog: TraitCatalogItem[]        // your TraitsCatalog flat array
  onLinkToChallenge?: (sim: Sim) => void
  onUnlinkFromChallenge?: (sim: Sim) => void
  onOpenPanel?: () => void
  isSelected?: boolean
  onSelect?: (id: string) => void
  compact?: boolean                       // tighter layout for dense grids
}

// ---------------------------------------------------------------------------
// Local constants
// ---------------------------------------------------------------------------

const MAX_TRAITS_SHOWN = 4

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function titleCaseAge(age?: string | null) {
  if (!age) return '—'
  return age.replaceAll('_', ' ').replace(/(^|\s)\S/g, s => s.toUpperCase())
}

function shouldShowPackIcon(name?: string | null) {
  return !!(name && name !== 'Base Game')
}

function traitMaps(catalog?: TraitCatalogItem[]) {
  if (!Array.isArray(catalog)) return { byId: new Map<string, TraitCatalogItem>() }
  return { byId: new Map(catalog.map(t => [t.id, t])) }
}

// ---------------------------------------------------------------------------
// SimCard
// ---------------------------------------------------------------------------

export const SimCard = memo(function SimCard({
  sim,
  challenge,
  traitCatalog,
  onLinkToChallenge,
  onUnlinkFromChallenge,
  onOpenPanel,
  isSelected,
  onSelect,
  compact = false,
}: SimCardProps) {
  const { byId } = useMemo(() => traitMaps(traitCatalog), [traitCatalog])

  const traitsIds: string[] = Array.isArray(sim.traits) ? (sim.traits as unknown as string[]) : []
  const traitItems = traitsIds.map(id => byId.get(id)).filter(Boolean) as TraitCatalogItem[]
  const shown = traitItems.slice(0, MAX_TRAITS_SHOWN)
  const hiddenCount = Math.max(0, traitItems.length - shown.length)

  const isLinked = !!sim.challenge_id
  const generation = sim.generation ?? null
  const isHeir = !!sim.is_heir

  return (
    <article
      className={cn(
        'group relative overflow-hidden rounded-2xl border transition-colors',
        'bg-white dark:bg-warmGray-900',
        'border-gray-200 dark:border-warmGray-700',
        'hover:shadow-md',
        isHeir && 'border-amber-300 dark:border-amber-500',
        onOpenPanel && 'cursor-pointer',
      )}
      onClick={onOpenPanel}
      aria-label={`${sim.name} card`}
    >
      {/* Card body */}
      <div className={cn('p-4 relative', compact && 'p-3')}>
        {/* Selection checkbox — top left */}
        {onSelect && (
          <div className="absolute top-2 left-2 z-10">
            <input
              type="checkbox"
              checked={!!isSelected}
              onChange={() => onSelect(sim.id)}
              onClick={(e) => e.stopPropagation()}
              aria-label={`Select ${sim.name}`}
              className="h-4 w-4 rounded border-warmGray-300 dark:border-warmGray-600 text-brand-500 focus:ring-brand-400"
            />
          </div>
        )}

        {/* Avatar + Name row */}
        <div className={cn('flex items-center gap-3', onSelect && 'pl-6')}>
          <AvatarCircle avatarUrl={sim.avatar_url} name={sim.name} size="md" />

          {/* Name + subtitle */}
          <div className="min-w-0 flex-1">
            <span className="block text-lg font-semibold text-gray-900 dark:text-warmGray-100 truncate">
              <SafeText>{sim.name}</SafeText>
            </span>
            <div className="mt-0.5 text-sm text-gray-600 dark:text-warmGray-300 truncate">
              {titleCaseAge(sim.age_stage)}{sim.career ? ` \u2022 ${sim.career}` : ''}{sim.aspiration ? ` \u2022 ${sim.aspiration}` : ''}
            </div>
          </div>
        </div>

        {/* Badges */}
        {(isHeir || typeof generation === 'number' || !isLinked) && (
          <div className="flex flex-wrap items-center gap-1.5 mt-3">
            {isHeir && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-900/30 px-2.5 py-1 text-sm font-semibold text-amber-900 dark:text-amber-300">
                <TbCrown className="w-4 h-4" /> Heir
              </span>
            )}
            {typeof generation === 'number' && (
              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 dark:bg-indigo-900/30 px-2.5 py-1 text-sm font-medium text-indigo-900 dark:text-indigo-300">
                Gen {generation}
              </span>
            )}
            {!isLinked && (
              <span className="inline-flex items-center gap-1 rounded-full bg-warmGray-100 dark:bg-warmGray-800 px-2.5 py-1 text-sm font-medium text-warmGray-600 dark:text-warmGray-400">
                Unassigned
              </span>
            )}
          </div>
        )}

        {/* Traits */}
        <div className="mt-3">
          {shown.length === 0 ? (
            <div className="text-sm text-gray-500 dark:text-warmGray-300">No traits</div>
          ) : (
            <ul className={cn('flex flex-wrap gap-2', compact && 'gap-1.5')}>
              {shown.map(t => (
                <li key={t.id} className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 dark:border-warmGray-700 bg-white dark:bg-warmGray-850 px-2.5 py-1 text-xs text-gray-800 dark:text-warmGray-100">
                  <TraitIcon label={t.label} size={16} />
                  <span>{t.label}</span>
                  {shouldShowPackIcon(t.expansionPack) && (
                    <PackIcon
                      name={t.expansionPack!}
                      size={12}
                      owned={true}
                      className="ml-0.5"
                    />
                  )}
                </li>
              ))}
              {hiddenCount > 0 && (
                <li className="inline-flex items-center rounded-full bg-gray-100 dark:bg-warmGray-800 px-2.5 py-1 text-xs text-gray-700 dark:text-warmGray-200">
                  +{hiddenCount} more
                </li>
              )}
            </ul>
          )}
        </div>

        {/* Link / Unlink */}
        {challenge ? (
          <div className="mt-3 flex justify-end">
            {isLinked ? (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onUnlinkFromChallenge?.(sim) }}
                className="rounded-md border border-gray-300 dark:border-warmGray-700 bg-white dark:bg-warmGray-850 px-2 py-1 text-xs text-gray-700 dark:text-warmGray-200 hover:bg-gray-50 dark:hover:bg-warmGray-700"
                title="Unlink from challenge"
              >
                Unlink
              </button>
            ) : (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onLinkToChallenge?.(sim) }}
                className="rounded-md bg-brand-500 px-2 py-1 text-xs font-medium text-white hover:bg-brand-600"
                title="Link to this challenge"
              >
                Link
              </button>
            )}
          </div>
        ) : null}
      </div>
    </article>
  )
})
