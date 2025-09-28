'use client'

import { useRouter } from 'next/navigation'
import { CASWizard } from '@/src/components/sim/cas/CASWizard'
import { createSupabaseBrowserClient } from '@/src/lib/supabase/client'

export default function NewSimClient() {
  const router = useRouter()

  async function save(values: any) {
    const supabase = createSupabaseBrowserClient()
    const { error } = await supabase.from('sims').insert({
      name: values.name,
      age_stage: values.age_stage,
      avatar_url: values.avatar_url,
      career: values.career?.label ?? null,
      career_base_id: values.career?.baseId ?? null,
      career_branch_id: values.career?.branchId ?? null,
      aspiration: values.aspiration ?? null,
      traits: values.traits ?? null,
      challenge_id: values.challenge_id ?? null,
    })
    if (error) throw error
    router.push('/sims') // or `/sims/${newId}` if you select().single() and get id
  }

  return <CASWizard onSubmit={save} submitLabel="Create Sim" />
}
