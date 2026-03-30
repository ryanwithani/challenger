import Link from 'next/link';
import { cookies } from 'next/headers';
import { createSupabaseServerClient } from '@/src/lib/supabase/server';
import { Button } from '@/src/components/ui/Button';
import { DashboardClient } from './DashboardClient';

export default async function DashboardPage() {
  const cookieStore = cookies();
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

    const simsResponse = await supabase.rpc('get_all_sims_for_user');
    sims = simsResponse.data || [];
  }

  return (
    <div className="max-w-[1400px] mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-brand-700 dark:text-brand-300">Dashboard</h1>
          <p className="text-base text-gray-600 dark:text-warmGray-300 mt-1">Manage your challenges and sims</p>
        </div>
        <div className="flex space-x-3">
          <Link href="/dashboard/new/challenge">
            <Button variant="primary">New Challenge</Button>
          </Link>
          <Link href="/dashboard/new/sim">
            <Button variant="secondary">Add Sim</Button>
          </Link>
        </div>
      </div>
      <DashboardClient initialChallenges={challenges} initialSims={sims} />
    </div>
  );
}
