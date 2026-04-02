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
      {/* Top media */}
      <div className={clsx('relative w-full', compact ? 'h-28' : 'h-36', 'bg-cozy-sand dark:bg-surface-dark')}>
        {/* Panel open button — full cover, sits at z-0 below badges/actions */}
        {onOpenPanel && (
          <button
            type="button"
            onClick={onOpenPanel}
            className="absolute inset-0 z-0 w-full h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-inset"
            aria-label={`View details for ${sim.name}`}
          />
        )}

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={sim.avatar_url || '/images/avatars/default_sim.png'}
          alt={`${sim.name} avatar`}
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.35),transparent_60%)]" />

        {/* Selection checkbox */}
        {onSelect && (
          <div className="absolute top-2 left-2 z-20">
            <input
              type="checkbox"
              checked={!!isSelected}
              onChange={() => onSelect(sim.id)}
              onClick={(e) => e.stopPropagation()}
              aria-label={`Select ${sim.name}`}
              className="h-4 w-4 rounded border-white/60 bg-white/20 text-brand-500 focus:ring-brand-400"
            />
          </div>
        )}

        {/* Heir / Generation badges */}
        <div className={cn('absolute top-2 left-2 flex items-center gap-2 z-10', onSelect && 'pl-6')}>
          {isHeir && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100/90 px-2 py-0.5 text-xs font-semibold text-amber-900 ring-1 ring-amber-200">
              <TbCrown className="w-3 h-3" /> Heir
            </span>
          )}
          {typeof generation === 'number' && (
            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100/90 px-2 py-0.5 text-xs font-medium text-indigo-900 ring-1 ring-indigo-200">
              Gen {generation}
            </span>
          )}
          {!isLinked && (
            <span className="inline-flex items-center gap-1 rounded-full bg-gray-100/90 px-2 py-0.5 text-xs font-medium text-gray-800 ring-1 ring-gray-200">
              Unassigned
            </span>
          )}
        </div>

        {/* Quick actions */}
        <div className="absolute top-2 right-2 flex items-center gap-1 z-10">
          <button
            type="button"
            onClick={() => onEdit?.(sim)}
            className="rounded-full p-1.5 text-white/90 bg-black/30 hover:bg-black/40 backdrop-blur ring-1 ring-white/40 focus:outline-none focus:ring-2 focus:ring-white/60"
            title="Edit"
          >
            <TbPencil className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className={clsx('p-4', compact && 'p-3')}>
        {/* Name & nav */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <Link href={`/sim/${sim.id}`} className="block text-base font-semibold text-gray-900 dark:text-warmGray-100 hover:underline">
              <SafeText>{sim.name}</SafeText>
            </Link>
            <div className="mt-0.5 text-xs text-gray-600 dark:text-warmGray-300">
              {titleCaseAge(sim.age_stage)}{sim.career ? ` • ${sim.career}` : ''}{sim.aspiration ? ` • ${sim.aspiration}` : ''}
            </div>
          </div>

          {/* Link / Unlink to challenge */}
          {challenge ? (
            isLinked ? (
              <button
                type="button"
                onClick={() => onUnlinkFromChallenge?.(sim)}
                className="rounded-md border border-gray-300 dark:border-warmGray-700 bg-white dark:bg-warmGray-850 px-2 py-1 text-xs text-gray-700 dark:text-warmGray-200 hover:bg-gray-50 dark:hover:bg-warmGray-700"
                title="Unlink from challenge"
              >
                Unlink
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onLinkToChallenge?.(sim)}
                className="rounded-md bg-brand-500 px-2 py-1 text-xs font-medium text-white hover:bg-brand-600"
                title="Link to this challenge"
              >
                Link
              </button>
            )
          ) : null}
        </div>

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
                      owned={true /* or compute ownership */}
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
      </div>
    </article>
  )
})
