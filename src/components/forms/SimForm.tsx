'use client'

import { useEffect, useMemo, useState } from 'react'
import clsx from 'clsx'
import { createSupabaseBrowserClient } from '@/src/lib/supabase/client'
import type { Database } from '@/src/types/database.types'
import { CareerSelect, type CareerSelection } from '@/src/components/sim/CareerSelect'
import { AspirationPicker } from '../sim/AspirationsPicker'
import { AspirationSelect } from '../sim/AspirationSelect'

type SimRow = Database['public']['Tables']['sims']['Row']
type SimInsert = Database['public']['Tables']['sims']['Insert']
type ChallengeRow = Database['public']['Tables']['challenges']['Row']

type AgeStage =
  | 'infant' | 'toddler' | 'child' | 'teen'
  | 'young_adult' | 'adult' | 'elder'

const AGE_OPTS: { value: AgeStage; label: string }[] = [
  { value: 'infant', label: 'Infant' },
  { value: 'toddler', label: 'Toddler' },
  { value: 'child', label: 'Child' },
  { value: 'teen', label: 'Teen' },
  { value: 'young_adult', label: 'Young Adult' },
  { value: 'adult', label: 'Adult' },
  { value: 'elder', label: 'Elder' },
]

export type SimFormValues = {
  name: string
  age_stage: AgeStage
  career?: CareerSelection | null
  aspiration?: string | null
  avatar_url?: string | null
  // optional quick-link to a challenge (creates join row after sim insert)
  challenge_id?: string | null
}

export function SimForm({
  sim,                               // pass to edit; omit for create
  onSubmit,                          // gets normalized values
  submitLabel = sim ? 'Save changes' : 'Create Sim',
  compact = false,
  showChallengePicker = true,
}: {
  sim?: SimRow | null
  onSubmit: (values: SimFormValues) => Promise<void> | void
  submitLabel?: string
  compact?: boolean
  showChallengePicker?: boolean
}) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), [])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [name, setName] = useState(sim?.name ?? '')
  const [ageStage, setAgeStage] = useState<AgeStage>((sim?.age_stage as AgeStage) ?? 'young_adult')
  const [careerSel, setCareerSel] = useState<CareerSelection>({
    baseId: undefined,
    branchId: undefined,
    label: sim?.career ?? null, // if editing, prefill from existing label
  })
  const [aspiration, setAspiration] = useState<string | null>(sim?.aspiration ?? null)
  const [avatarUrl, setAvatarUrl] = useState(sim?.avatar_url ?? '')
  const [challengeId, setChallengeId] = useState<string>('')

  // Challenges for optional link
  const [challenges, setChallenges] = useState<ChallengeRow[]>([])
  useEffect(() => {
    let mounted = true
    ;(async () => {
      if (!showChallengePicker) return
      const { data, error } = await supabase
        .from('challenges')
        .select('id,challenge_type')
        .order('created_at', { ascending: false })
      if (mounted) {
        if (!error) setChallenges(data as ChallengeRow[])
      }
    })()
    return () => { mounted = false }
  }, [supabase, showChallengePicker])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!name.trim()) { setError('Name is required.'); return }

    const chosenCareerLabel = careerSel.label ?? null

    const values: SimFormValues = {
      name: name.trim(),
      age_stage: ageStage,
      career: chosenCareerLabel ? { baseId: careerSel.baseId, branchId: careerSel.branchId, label: chosenCareerLabel } : null,
      aspiration: aspiration || null,
      avatar_url: avatarUrl?.trim() || null,
      challenge_id: challengeId || null,
    }

    setLoading(true)
    try {
      await onSubmit(values)
    } catch (err: any) {
      setError(err?.message ?? 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={clsx('space-y-4', compact && 'space-y-3')}>
      {error && (
        <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Bella Goth"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Age Stage</label>
          <select
            value={ageStage}
            onChange={(e) => setAgeStage(e.target.value as AgeStage)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {AGE_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        <div className="md:col-span-2">
  <label className="block text-sm font-medium text-gray-700">Career</label>
  <CareerSelect
    value={careerSel}
    onChange={setCareerSel}
    simAgeStage={ageStage}
  />
  <p className="mt-1 text-xs text-gray-500">Pick a base career; add a branch if applicable.</p>
</div>

<div className="md:col-span-2">
  <label className="block text-sm font-medium text-gray-700">Aspiration</label>
  <AspirationSelect
    value={aspiration}
    onChange={setAspiration}
    simAgeStage={ageStage}          // enables age gating
    ownedPacks={['Base Game']}      // or user?.ownedPacks
  />
  <p className="mt-1 text-xs text-gray-500">Optional. Disabled items indicate age or pack requirements.</p>
</div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Avatar URL</label>
          <input
            value={avatarUrl ?? ''}
            onChange={(e) => setAvatarUrl(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="https://..."
          />
        </div>

        {showChallengePicker && (
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Link to Challenge (optional)</label>
            <select
              value={challengeId}
              onChange={(e) => setChallengeId(e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">— None —</option>
              {challenges.map(c => <option key={c.id} value={c.id}>{c.challenge_type}</option>)}
            </select>
          </div>
        )}
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={loading}
          className={clsx(
            'inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700',
            loading && 'opacity-60'
          )}
        >
          {loading ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  )
}
