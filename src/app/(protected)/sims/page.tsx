import { createSupabaseServerClient } from '@/src/lib/supabase/server'
import SimsClient from './SimsClient'

export default async function SimsPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  let initialSims: Awaited<ReturnType<typeof supabase.from<'sims'>>>['data'] = []

  if (user) {
    const { data } = await supabase
      .from('sims')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    initialSims = data ?? []
  }

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      <SimsClient initialSims={initialSims} />
    </div>
  )
}
