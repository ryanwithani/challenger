import { createSupabaseServerClient } from '@/src/lib/supabase/server';
import { DashboardClient } from './DashboardClient';

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  let challenges = [];
  let sims = [];

  if (user) {
    const challengesResponse = await supabase
      .from('challenges')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    challenges = challengesResponse.data || [];

    const simsResponse = await supabase
      .from('sims')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    sims = simsResponse.data || [];
  }

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      <DashboardClient initialChallenges={challenges} initialSims={sims} />
    </div>
  );
}
