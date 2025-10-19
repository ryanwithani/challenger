// src/components/sim/cas/steps/BasicsStep.tsx
'use client'
import { useEffect, useMemo, useState } from 'react'
import { createSupabaseBrowserClient } from '@/src/lib/supabase/client'
import type { Database } from '@/src/types/database.types'
import { useSimCAS } from '../useSimCAS'

import { AvatarUploader } from '@/src/components/profile/AvatarUpload'

type ChallengeRow = Database['public']['Tables']['challenges']['Row']
const AGE_OPTS = [
  { value: 'infant', label: 'Infant' }, { value: 'toddler', label: 'Toddler' },
  { value: 'child', label: 'Child' }, { value: 'teen', label: 'Teen' },
  { value: 'young_adult', label: 'Young Adult' }, { value: 'adult', label: 'Adult' },
  { value: 'elder', label: 'Elder' },
] as const

export function BasicsStep() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), [])
  const { name, age_stage, avatar_url, challenge_id, patch, setStep } = useSimCAS()
  const [challenges, setChallenges] = useState<ChallengeRow[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('challenges').select('id,challenge_type').order('created_at', { ascending: false })
      setChallenges((data ?? []) as ChallengeRow[])
    })()
  }, [supabase])

  function next() {
    if (!name.trim()) { setError('Name is required.'); return }
    setStep(2)
  }

  return (
    <div className="space-y-4">
      {error && <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div>}

      <div>
        <label className="block text-sm font-medium text-gray-700">Name</label>
        <input
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
          value={name}
          onChange={(e) => patch({ name: e.target.value })}
          placeholder="Bella Goth"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Age Stage</label>
        <select
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
          value={age_stage}
          onChange={(e) => {
            const nextAge = e.target.value as any
            // Clear personality fields that may become invalid
            patch({ age_stage: nextAge, career: null, aspiration: null, traits: [] })
          }}
        >
          {AGE_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Avatar</label>
        <AvatarUploader value={avatar_url} onChange={(url) => patch({ avatar_url: url })} />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Link to Challenge (optional)</label>
        <select
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
          value={challenge_id ?? ''} onChange={(e) => patch({ challenge_id: e.target.value || null })}
        >
          <option value="">— None —</option>
          {challenges.map(c => <option key={c.id} value={c.id}>{c.challenge_type}</option>)}
        </select>
      </div>
    </div>
  )
}
