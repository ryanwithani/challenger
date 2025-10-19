// src/components/sim/SimCard.tsx
'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, memo } from 'react'
import clsx from 'clsx'
import { Database } from '@/src/types/database.types'
import { PackIcon } from '@/src/components/sim/PackIcon'
import { TraitIcon } from '@/src/components/sim/TraitIcon'
import { SafeText } from '../ui/SafeText'

// Types
type Sim = Database['public']['Tables']['sims']['Row']
type Challenge = Database['public']['Tables']['challenges']['Row']
type ChallengeSim = Database['public']['Tables']['challenge_sims']['Row']

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
  challenge?: Challenge | null            // pass if you’re on a challenge view
  challengeSim?: ChallengeSim | null      // pass the joined row when available
  traitCatalog: TraitCatalogItem[]        // your TraitsCatalog flat array
  onToggleFavorite?: (id: string, next: boolean) => Promise<void> | void
  onEdit?: (sim: Sim) => void
  onLinkToChallenge?: (sim: Sim) => void
  onUnlinkFromChallenge?: (sim: Sim) => void
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
  challengeSim,
  traitCatalog,
  onToggleFavorite,
  onEdit,
  onLinkToChallenge,
  onUnlinkFromChallenge,
  compact,
}: SimCardProps) {
  const { byId } = traitMaps(traitCatalog)
  const [fav, setFav] = useState<boolean>(false)

  const traitsIds: string[] = Array.isArray(sim.traits) ? (sim.traits as unknown as string[]) : []
  const traitItems = traitsIds.map(id => byId.get(id)).filter(Boolean) as TraitCatalogItem[]
  const shown = traitItems.slice(0, MAX_TRAITS_SHOWN)
  const hiddenCount = Math.max(0, traitItems.length - shown.length)

  const isLinked = !!challengeSim
  const generation = challengeSim?.generation ?? null
  const isHeir = !!challengeSim?.is_heir

  async function toggleFavorite() {
    const next = !fav
    setFav(next)
    try {
      await onToggleFavorite?.(sim.id, next)
    } catch {
      setFav(!next) // rollback on error
    }
  }

  return (
    <article
      className={clsx(
        'group relative overflow-hidden rounded-2xl border-2 bg-white transition-shadow',
        'border-gray-100 shadow hover:shadow-lg focus-within:shadow-lg',
        isHeir && 'border-amber-300'
      )}
      tabIndex={0}
      aria-label={`${sim.name} card`}
    >
      {/* Top media */}
      <div className={clsx('relative w-full', compact ? 'h-28' : 'h-36', 'bg-gradient-to-br from-indigo-50 to-white')}>
        <Image
          src={sim.avatar_url || '/images/avatars/default_sim.png'}
          alt={`${sim.name} avatar`}
          fill
          sizes="(max-width: 640px) 100vw, 33vw"
          className="object-cover"
        />
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.35),transparent_60%)]" />

        {/* Heir / Generation badges */}
        <div className="absolute top-2 left-2 flex items-center gap-2">
          {isHeir && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100/90 px-2 py-0.5 text-xs font-semibold text-amber-900 ring-1 ring-amber-200">
              <span>👑</span> Heir
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
        <div className="absolute top-2 right-2 flex items-center gap-1">
          <button
            type="button"
            onClick={toggleFavorite}
            className={clsx(
              'rounded-full p-1.5 text-white/90 backdrop-blur ring-1 ring-white/40 transition',
              'hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/60',
              fav ? 'bg-rose-500/80 hover:bg-rose-500' : 'bg-black/30 hover:bg-black/40'
            )}
            aria-pressed={fav}
            aria-label={fav ? 'Unfavorite' : 'Favorite'}
            title={fav ? 'Unfavorite' : 'Favorite'}
          >
            {fav ? '♥' : '♡'}
          </button>

          <button
            type="button"
            onClick={() => onEdit?.(sim)}
            className="rounded-full p-1.5 text-white/90 bg-black/30 hover:bg-black/40 backdrop-blur ring-1 ring-white/40 focus:outline-none focus:ring-2 focus:ring-white/60"
            title="Edit"
          >
            ✎
          </button>
        </div>
      </div>

      {/* Body */}
      <div className={clsx('p-4', compact && 'p-3')}>
        {/* Name & nav */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <Link href={`/sims/${sim.id}`} className="block text-base font-semibold text-gray-900 hover:underline">
              <SafeText>{sim.name}</SafeText>
            </Link>
            <div className="mt-0.5 text-xs text-gray-600">
              {titleCaseAge(sim.age_stage)}{sim.career ? ` • ${sim.career}` : ''}{sim.aspiration ? ` • ${sim.aspiration}` : ''}
            </div>
          </div>

          {/* Link / Unlink to challenge */}
          {challenge ? (
            isLinked ? (
              <button
                type="button"
                onClick={() => onUnlinkFromChallenge?.(sim)}
                className="rounded-md border border-gray-300 bg-white px-2 py-1 text-xs text-gray-700 hover:bg-gray-50"
                title="Unlink from challenge"
              >
                Unlink
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onLinkToChallenge?.(sim)}
                className="rounded-md bg-indigo-600 px-2 py-1 text-xs font-medium text-white hover:bg-indigo-700"
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
            <div className="text-xs text-gray-500">No traits</div>
          ) : (
            <ul className={clsx('flex flex-wrap gap-2', compact && 'gap-1.5')}>
              {shown.map(t => (
                <li key={t.id} className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-2 py-0.5 text-[11px] text-gray-800">
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
                <li className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-700">
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
