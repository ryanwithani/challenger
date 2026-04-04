'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useSimStore } from '@/src/lib/store/simStore'
import { useChallengeStore } from '@/src/lib/store/challengeStore'
import { useFocusManagement } from '@/src/hooks/useFocusManagement'
import { Button } from '@/src/components/ui/Button'
import { Traits } from '@/src/components/sim/TraitsCatalog'
import { AvatarCircle } from '@/src/components/sim/AvatarCircle'
import { cn } from '@/src/lib/utils/cn'
import { Database } from '@/src/types/database.types'
import { TbChevronLeft, TbChevronRight, TbCrown, TbX } from 'react-icons/tb'

type Sim = Database['public']['Tables']['sims']['Row']
type Challenge = Database['public']['Tables']['challenges']['Row']

interface PanelNav {
  index: number
  prevId: string | null
  nextId: string | null
  total: number
}

interface SimDetailPanelProps {
  simId: string
  allSims: Sim[]
  panelNav: PanelNav
  onClose: () => void
  onNavigate: (simId: string) => void
}

const TRAIT_LOOKUP = new Map(Traits.map(t => [t.id, t]))

function titleCaseAge(age?: string | null): string {
  if (!age) return '\u2014'
  return age.replaceAll('_', ' ').replace(/(^|\s)\S/g, s => s.toUpperCase())
}

function AssignDropdown({
  simId,
  challenges,
  onAssign,
}: {
  simId: string
  challenges: Challenge[]
  onAssign: (simId: string, challengeId: string) => Promise<void>
}) {
  const [selected, setSelected] = useState('')

  if (challenges.length === 0) {
    return <p className="text-xs text-warmGray-400">No challenges available</p>
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
        className="text-sm border border-warmGray-300 dark:border-warmGray-700 rounded-md px-2 py-1 bg-white dark:bg-warmGray-900 flex-1"
      >
        <option value="">Select a challenge...</option>
        {challenges.map(c => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>
      <button
        type="button"
        disabled={!selected}
        onClick={() => selected && onAssign(simId, selected)}
        className={cn(
          'text-xs font-medium px-2 py-1 rounded-md',
          selected
            ? 'bg-brand-500 text-white hover:bg-brand-600'
            : 'bg-warmGray-200 text-warmGray-400 cursor-not-allowed'
        )}
      >
        Assign
      </button>
    </div>
  )
}

export default function SimDetailPanel({
  simId,
  allSims,
  panelNav,
  onClose,
  onNavigate,
}: SimDetailPanelProps) {
  const sim = allSims.find(s => s.id === simId)
  const challenges = useChallengeStore(s => s.challenges)
  const challenge = challenges.find(c => c.id === sim?.challenge_id) ?? null
  const { simAchievements, fetchSimAchievements, assignToChallenge, unassignFromChallenge } = useSimStore()

  const { containerRef } = useFocusManagement({
    autoFocus: true,
    trapFocus: true,
    restoreFocus: true,
  })

  useEffect(() => {
    if (simId) fetchSimAchievements(simId)
  }, [simId, fetchSimAchievements])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const traitIds: string[] = useMemo(
    () => (Array.isArray(sim?.traits) ? (sim.traits as unknown as string[]) : []),
    [sim?.traits]
  )

  const traitItems = useMemo(
    () => traitIds.map(id => TRAIT_LOOKUP.get(id)).filter(Boolean),
    [traitIds]
  )

  if (!sim) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-20 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="sim-panel-title"
        ref={containerRef as React.RefObject<HTMLDivElement>}
        className={cn(
          'fixed z-30 bg-white dark:bg-warmGray-900 shadow-xl flex flex-col',
          // Mobile
          'left-0 right-0 bottom-[72px] h-[75vh] rounded-t-2xl',
          // Desktop
          'lg:left-auto lg:right-0 lg:top-0 lg:bottom-0 lg:h-full lg:w-[420px] lg:rounded-none'
        )}
      >
        {/* Mobile drag handle */}
        <div className="lg:hidden flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full bg-warmGray-300 dark:bg-warmGray-600" />
        </div>

        {/* Header nav */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2 border-b border-warmGray-100 dark:border-warmGray-800">
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={!panelNav.prevId}
              aria-disabled={!panelNav.prevId}
              aria-label={`Previous sim (${panelNav.index} of ${panelNav.total})`}
              onClick={() => panelNav.prevId && onNavigate(panelNav.prevId)}
              className={cn('p-1 rounded', !panelNav.prevId && 'opacity-40 cursor-not-allowed')}
            >
              <TbChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              disabled={!panelNav.nextId}
              aria-disabled={!panelNav.nextId}
              aria-label={`Next sim (${panelNav.index + 2} of ${panelNav.total})`}
              onClick={() => panelNav.nextId && onNavigate(panelNav.nextId)}
              className={cn('p-1 rounded', !panelNav.nextId && 'opacity-40 cursor-not-allowed')}
            >
              <TbChevronRight className="w-5 h-5" />
            </button>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close sim details"
            className="p-1 rounded text-warmGray-400 hover:text-warmGray-600 dark:hover:text-warmGray-200"
          >
            <TbX className="w-5 h-5" />
          </button>
        </div>

        {/* Sim identity */}
        <div className="px-4 py-3 flex items-center gap-3">
          <AvatarCircle key={simId} avatarUrl={sim.avatar_url} name={sim.name} size="lg" className="w-14 h-14" />
          <div>
            <h2
              id="sim-panel-title"
              className="font-display text-2xl font-semibold text-warmGray-950 dark:text-warmGray-50"
            >
              {sim.name}
            </h2>
            <div className="flex items-center gap-2 text-sm text-warmGray-500 dark:text-warmGray-400">
              <span>{titleCaseAge(sim.age_stage)}</span>
              {challenge && (
                <span className="bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 px-2 py-0.5 rounded-full">
                  {challenge.name}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-5">
          {/* Quick stats */}
          <div className="flex flex-wrap gap-2">
            {typeof sim.generation === 'number' && (
              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 dark:bg-indigo-900/30 px-2.5 py-1 text-sm font-medium text-indigo-900 dark:text-indigo-300">
                Gen {sim.generation}
              </span>
            )}
            {sim.is_heir && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-900/30 px-2.5 py-1 text-sm font-semibold text-amber-900 dark:text-amber-300">
                <TbCrown className="w-4 h-4" /> Heir
              </span>
            )}
          </div>

          {/* Traits */}
          <section>
            <h3 className="text-sm font-medium text-warmGray-500 dark:text-warmGray-400 mb-2">Traits</h3>
            {traitItems.length === 0 ? (
              <p className="text-sm text-warmGray-400">No traits</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {traitItems.map(t => (
                  <span
                    key={t!.id}
                    className="inline-flex items-center gap-1.5 rounded-full border border-warmGray-200 dark:border-warmGray-700 bg-white dark:bg-warmGray-850 px-2.5 py-1 text-xs text-warmGray-800 dark:text-warmGray-100"
                  >
                    {t!.label}
                  </span>
                ))}
              </div>
            )}
          </section>

          {/* Details */}
          <section>
            <h3 className="text-sm font-medium text-warmGray-500 dark:text-warmGray-400 mb-2">Details</h3>
            <dl className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-warmGray-500">Career</dt>
                <dd>{sim.career ?? '\u2014'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-warmGray-500">Aspiration</dt>
                <dd>{sim.aspiration ?? '\u2014'}</dd>
              </div>
              {sim.relationship_to_heir && (
                <div className="flex justify-between">
                  <dt className="text-warmGray-500">Relationship</dt>
                  <dd className="capitalize">{sim.relationship_to_heir}</dd>
                </div>
              )}
            </dl>
          </section>

          {/* Challenge context */}
          <section>
            <h3 className="text-sm font-medium text-warmGray-500 dark:text-warmGray-400 mb-2">Challenge</h3>
            {challenge ? (
              <div className="flex items-center justify-between">
                <span className="text-sm">{challenge.name}</span>
                <button
                  type="button"
                  onClick={() => unassignFromChallenge(sim.id)}
                  className="text-xs text-warmGray-500 hover:text-rose-500 border border-warmGray-300 dark:border-warmGray-700 rounded-md px-2 py-1"
                >
                  Unassign
                </button>
              </div>
            ) : (
              <AssignDropdown
                simId={sim.id}
                challenges={challenges}
                onAssign={assignToChallenge}
              />
            )}
          </section>

          {/* Achievements */}
          <section>
            <h3 className="text-sm font-medium text-warmGray-500 dark:text-warmGray-400 mb-2">Achievements</h3>
            <div className="flex items-center justify-between">
              <span className="text-sm">
                {simAchievements.length} achievement{simAchievements.length !== 1 ? 's' : ''}
              </span>
              <Link
                href={`/sim/${sim.id}?tab=achievements`}
                className="text-xs text-brand-500 hover:text-brand-600 font-medium"
              >
                View on full profile &rarr;
              </Link>
            </div>
          </section>
        </div>

        {/* Sticky footer */}
        <div className="border-t border-warmGray-100 dark:border-warmGray-800 p-4 flex gap-3">
          <Link href={`/sim/${simId}`} className="flex-1">
            <Button className="w-full">View Full Profile</Button>
          </Link>
          <Link href={`/sim/${simId}`}>
            <Button variant="outline">Edit Sim</Button>
          </Link>
        </div>
      </div>
    </>
  )
}
