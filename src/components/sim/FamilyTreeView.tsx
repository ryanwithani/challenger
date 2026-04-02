'use client'

import { useState, useEffect, useMemo, Fragment } from 'react'
import Link from 'next/link'
import { cn } from '@/src/lib/utils/cn'
import { Database } from '@/src/types/database.types'
import { TbCrown } from 'react-icons/tb'

type Sim = Database['public']['Tables']['sims']['Row']
type Challenge = Database['public']['Tables']['challenges']['Row']

interface FamilyTreeViewProps {
  allSims: Sim[]
  challenges: Challenge[]
  onOpenPanel: (simId: string) => void
}

const GENERATION_COL_SPAN = 5
const EM_DASH = '\u2014'

export default function FamilyTreeView({
  allSims,
  challenges,
  onOpenPanel,
}: FamilyTreeViewProps) {
  const [selectedChallengeId, setSelectedChallengeId] = useState<string | null>(
    null
  )

  const challengesWithSims = useMemo(
    () => challenges.filter((c) => allSims.some((s) => s.challenge_id === c.id)),
    [challenges, allSims]
  )

  useEffect(() => {
    if (!selectedChallengeId && challengesWithSims.length > 0) {
      const active = challengesWithSims.find((c) => c.status === 'active')
      setSelectedChallengeId(active?.id ?? challengesWithSims[0].id)
    }
  }, [challengesWithSims, selectedChallengeId])

  const treeData = useMemo(() => {
    if (!selectedChallengeId) return []

    const simsForChallenge = allSims.filter(
      (s) => s.challenge_id === selectedChallengeId
    )
    const byGen = new Map<number | null, Sim[]>()

    for (const sim of simsForChallenge) {
      const gen = sim.generation ?? null
      const arr = byGen.get(gen) ?? []
      arr.push(sim)
      byGen.set(gen, arr)
    }

    const entries = Array.from(byGen.entries())
    entries.sort((a, b) => {
      if (a[0] === null) return 1
      if (b[0] === null) return -1
      return a[0] - b[0]
    })

    for (const [, sims] of entries) {
      sims.sort((a, b) => {
        if (a.is_heir && !b.is_heir) return -1
        if (!a.is_heir && b.is_heir) return 1
        return (a.name ?? '').localeCompare(b.name ?? '')
      })
    }

    return entries
  }, [allSims, selectedChallengeId])

  if (challengesWithSims.length === 0) {
    return (
      <div className="text-center py-16 border border-dashed rounded-lg border-brand-200 dark:border-warmGray-700">
        <p className="text-sm text-warmGray-500 dark:text-warmGray-400 mb-3">
          Create a challenge and assign sims to see the family tree.
        </p>
        <Link
          href="/dashboard/new/challenge"
          className="text-sm text-brand-500 hover:text-brand-600 font-medium"
        >
          Create a challenge
        </Link>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-4">
        <select
          value={selectedChallengeId ?? ''}
          onChange={(e) => setSelectedChallengeId(e.target.value || null)}
          className="border border-warmGray-300 dark:border-warmGray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-warmGray-900 text-warmGray-900 dark:text-warmGray-100 focus:outline-none focus:ring-2 focus:ring-brand-400"
        >
          {challengesWithSims.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} ({c.status})
            </option>
          ))}
        </select>
      </div>

      {treeData.length === 0 ? (
        <p className="text-sm text-warmGray-500 py-8 text-center">
          No sims in this challenge yet.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-warmGray-200 dark:border-warmGray-700">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-warmGray-50 dark:bg-warmGray-800 text-warmGray-500 dark:text-warmGray-400 text-left">
                <th className="px-4 py-2.5 font-medium">Name</th>
                <th className="px-4 py-2.5 font-medium">Age Stage</th>
                <th className="px-4 py-2.5 font-medium">Role</th>
                <th className="px-4 py-2.5 font-medium">Career</th>
                <th className="px-4 py-2.5 font-medium">Aspiration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-warmGray-100 dark:divide-warmGray-800">
              {treeData.map(([gen, sims]) => (
                <Fragment key={`gen-${gen}`}>
                  <tr className="bg-warmGray-50/50 dark:bg-warmGray-800/30">
                    <td
                      colSpan={GENERATION_COL_SPAN}
                      className="px-4 py-2 font-display font-semibold text-warmGray-700 dark:text-warmGray-300"
                    >
                      {gen !== null
                        ? `Generation ${gen}`
                        : 'Unknown Generation'}
                      {gen === null && (
                        <span className="ml-2 text-xs font-normal text-warmGray-400">
                          Set a generation number on these sims to organise
                          them.
                        </span>
                      )}
                    </td>
                  </tr>
                  {sims.map((sim) => (
                    <tr
                      key={sim.id}
                      onClick={() => onOpenPanel(sim.id)}
                      className={cn(
                        'cursor-pointer hover:bg-warmGray-50 dark:hover:bg-warmGray-800/50 transition-colors',
                        sim.is_heir && 'bg-brand-50 dark:bg-brand-900/20'
                      )}
                    >
                      <td className="px-4 py-2">
                        <span className="flex items-center gap-2">
                          {sim.is_heir && (
                            <TbCrown className="w-4 h-4 text-amber-500" />
                          )}
                          <span className="font-medium">{sim.name}</span>
                        </span>
                      </td>
                      <td className="px-4 py-2 capitalize">
                        {sim.age_stage?.replaceAll('_', ' ') ?? EM_DASH}
                      </td>
                      <td className="px-4 py-2 capitalize">
                        {sim.is_heir
                          ? 'Heir'
                          : (sim.relationship_to_heir ?? EM_DASH)}
                      </td>
                      <td className="px-4 py-2">
                        {sim.career ?? EM_DASH}
                      </td>
                      <td className="px-4 py-2">
                        {sim.aspiration ?? EM_DASH}
                      </td>
                    </tr>
                  ))}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
