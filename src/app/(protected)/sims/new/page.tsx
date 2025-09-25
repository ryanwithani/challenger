// app/sims/new/page.tsx
'use client'

import { useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/src/lib/supabase/client'
import type { Database } from '@/src/types/database.types'
import { SimForm, SimFormValues } from '@/src/components/forms/SimForm'

type ChallengeSimInsert = Database['public']['Tables']['challenge_sims']['Insert']

export default function NewSimPage() {
  const router = useRouter()
  const supabase = createSupabaseBrowserClient()

  async function handleCreate(values: SimFormValues) {
    // 1) create the sim
    const { data: sim, error } = await supabase
      .from('sims')
      .insert({
        name: values.name,
        age_stage: values.age_stage,
        career: values.career,
        aspiration: values.aspiration,
        avatar_url: values.avatar_url,
      })
      .select('*')
      .single()
    if (error) throw error

    // 2) optionally link to a challenge
    if (values.challenge_id) {
      const row: ChallengeSimInsert = { sim_id: sim.id, challenge_id: values.challenge_id }
      const { error: linkErr } = await supabase
        .from('challenge_sims')
        .upsert(row, { onConflict: 'challenge_id,sim_id' })
      if (linkErr) throw linkErr
    }

    // 3) go to the new sim page
    router.replace(`/sims/${sim.id}`)
  }

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="mb-1 text-2xl font-semibold">Create a New Sim</h1>
      <p className="mb-6 text-sm text-gray-600">You can add traits and more details later.</p>
      <SimForm onSubmit={handleCreate} />
    </div>
  )
}
