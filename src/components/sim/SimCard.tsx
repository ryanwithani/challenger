// src/components/sim/SimCard.tsx
'use client'

import Link from 'next/link'
import { memo, useMemo } from 'react'
import clsx from 'clsx'
import { cn } from '@/src/lib/utils/cn'
import { Database } from '@/src/types/database.types'
import { PackIcon } from '@/src/components/sim/PackIcon'
import { TraitIcon } from '@/src/components/sim/TraitIcon'
import { SafeText } from '../ui/SafeText'
import { TbCrown, TbPencil } from 'react-icons/tb'

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
  onEdit?: (sim: Sim) => void
  onLinkToChallenge?: (sim: Sim) => void
  onUnlinkFromChallenge?: (sim: Sim) => void
  onOpenPanel?: () => void
  isSelected?: boolean
  onSelect?: (id: string) => void
  compact?: boolean                       // tighter layout for dense grids
}

const MAX_TRAITS_SHOWN = 4

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


export const SimCard = memo(function SimCard({
  sim,
  challenge,
  traitCatalog,
  onEdit,
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
      className={clsx(
        'group relative overflow-hidden rounded-xl border transition-colors',
        'bg-white dark:bg-warmGray-900',
        'border-gray-200 dark:border-warmGray-700',
        'hover:shadow-md',
        isHeir && 'border-amber-300 dark:border-amber-500'
      )}
      aria-label={`${sim.name} card`}
    >
      {/* Card body */}
      <div className={clsx('p-4 relative', compact && 'p-3')}>
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

        {/* Edit button — top right */}
        {onEdit && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onEdit(sim) }}
            className="absolute top-2 right-2 z-10 rounded-full p-1.5 text-warmGray-400 hover:text-warmGray-600 dark:text-warmGray-500 dark:hover:text-warmGray-300 hover:bg-warmGray-100 dark:hover:bg-warmGray-800 transition-colors"
            title="Edit"
            aria-label={`Edit ${sim.name}`}
          >
            <TbPencil className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Avatar + Name row — clickable for panel */}
        <div
          className={clsx('flex items-center gap-3', onOpenPanel && 'cursor-pointer')}
          onClick={onOpenPanel}
          role={onOpenPanel ? 'button' : undefined}
          tabIndex={onOpenPanel ? 0 : undefined}
          onKeyDown={onOpenPanel ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpenPanel() } } : undefined}
          aria-label={onOpenPanel ? `View details for ${sim.name}` : undefined}
        >
          {/* Round avatar */}
          <div className="w-12 h-12 rounded-full overflow-hidden bg-brand-100 dark:bg-brand-900/40 flex-shrink-0 flex items-center justify-center">
            {sim.avatar_url ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={sim.avatar_url} alt={`${sim.name} avatar`} className="w-full h-full object-cover" />
            ) : (
              <span className="text-brand-500 dark:text-brand-300 text-lg font-bold font-display">
                {sim.name?.charAt(0)?.toUpperCase() ?? 'S'}
              </span>
            )}
          </div>

          {/* Name + subtitle */}
          <div className="min-w-0 flex-1">
            <Link
              href={`/sim/${sim.id}`}
              className="block text-base font-semibold text-gray-900 dark:text-warmGray-100 hover:underline truncate"
              onClick={(e) => e.stopPropagation()}
            >
              <SafeText>{sim.name}</SafeText>
            </Link>
            <div className="mt-0.5 text-xs text-gray-600 dark:text-warmGray-300 truncate">
              {titleCaseAge(sim.age_stage)}{sim.career ? ` \u2022 ${sim.career}` : ''}{sim.aspiration ? ` \u2022 ${sim.aspiration}` : ''}
            </div>
          </div>
        </div>

        {/* Badges */}
        {(isHeir || typeof generation === 'number' || !isLinked) && (
          <div className="flex flex-wrap items-center gap-1.5 mt-3">
            {isHeir && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 text-xs font-semibold text-amber-900 dark:text-amber-300">
                <TbCrown className="w-3 h-3" /> Heir
              </span>
            )}
            {typeof generation === 'number' && (
              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 dark:bg-indigo-900/30 px-2 py-0.5 text-xs font-medium text-indigo-900 dark:text-indigo-300">
                Gen {generation}
              </span>
            )}
            {!isLinked && (
              <span className="inline-flex items-center gap-1 rounded-full bg-warmGray-100 dark:bg-warmGray-800 px-2 py-0.5 text-xs font-medium text-warmGray-600 dark:text-warmGray-400">
                Unassigned
              </span>
            )}
          </div>
        )}

        {/* Traits */}
        <div className="mt-3">
          {shown.length === 0 ? (
            <div className="text-xs text-gray-500 dark:text-warmGray-300">No traits</div>
          ) : (
            <ul className={clsx('flex flex-wrap gap-2', compact && 'gap-1.5')}>
              {shown.map(t => (
                <li key={t.id} className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 dark:border-warmGray-700 bg-white dark:bg-warmGray-850 px-2 py-0.5 text-[11px] text-gray-800 dark:text-warmGray-100">
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
                <li className="inline-flex items-center rounded-full bg-gray-100 dark:bg-warmGray-800 px-2 py-0.5 text-[11px] text-gray-700 dark:text-warmGray-200">
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
