// src/components/sim/cas/steps/ReviewStep.tsx
'use client'
import { useState } from 'react'
import { useSimCAS } from '../useSimCAS'
import { isToddlerOrInfant, isWorkingAge } from '@/src/lib/sim/age'

export function ReviewStep({
  onSubmit, submitLabel,
}: { onSubmit: (values: any) => Promise<void> | void; submitLabel: string }) {
  const state = useSimCAS()
  const [saving, setSaving] = useState(false)

  const clean = {
    name: state.name.trim(),
    age_stage: state.age_stage,
    avatar_url: state.avatar_url || null,
    challenge_id: state.challenge_id || null,
    traits: state.traits,
    career: isWorkingAge(state.age_stage) && state.career?.label ? state.career : null,
    aspiration: isToddlerOrInfant(state.age_stage) ? null : (state.aspiration ?? null),
  }

  async function save() {
    setSaving(true)
    try { await onSubmit(clean) } finally { setSaving(false) }
  }

  return (
    <div className="space-y-4">
      <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {Object.entries({
          Name: clean.name,
          Age: clean.age_stage.replace('_',' '),
          Traits: clean.traits.length ? clean.traits.join(', ') : '—',
          Career: clean.career?.label ?? '—',
          Aspiration: clean.aspiration ?? '—',
          'Challenge Link': clean.challenge_id ? 'Yes' : 'No',
        }).map(([k, v]) => (
          <div key={k} className="rounded-md border p-3">
            <dt className="text-xs uppercase text-gray-500">{k}</dt>
            <dd className="text-sm text-gray-900">{v as any}</dd>
          </div>
        ))}
      </dl>

      <div className="flex justify-between">
        <button onClick={() => useSimCAS.getState().setStep(3)} className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm hover:bg-gray-50">Back</button>
        <button onClick={save} disabled={saving} className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60">
          {saving ? 'Creating…' : submitLabel}
        </button>
      </div>
    </div>
  )
}
