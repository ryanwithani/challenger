import Link from 'next/link';
import { cookies } from 'next/headers';
import { createSupabaseServerClient } from '@/src/lib/supabase/server'; // We need a server client
import { Button } from '@/src/components/ui/Button';
import { DashboardClient } from './DashboardClient'; // Import our new client component

// This is now an async Server Component. No more 'use client'.
export default async function DashboardPage() {
  const cookieStore = cookies();
  const supabase = await createSupabaseServerClient();

  // 1. Fetch data on the server before the page loads.
  const { data: { user } } = await supabase.auth.getUser();

  let challenges = [];
  let sims = [];

  if (user) {
    // Fetch challenges directly
    const challengesResponse = await supabase
      .from('challenges')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    challenges = challengesResponse.data || [];

    // Fetch sims using our efficient RPC call
    const simsResponse = await supabase.rpc('get_all_sims_for_user');
    sims = simsResponse.data || [];
  }

  // 2. Render the static parts of the page and pass data to the client component.
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-900">
      <div className="max-w-[1400px] mx-auto p-6 space-y-8">
        {/* Header (Static: Rendered on the server) */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl border-2 border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-blue-500 dark:to-purple-600 bg-clip-text text-transparent">
                Dashboard
              </h1>
              <p className="text-base text-gray-600 dark:text-gray-400 mt-2">Manage your challenges and sims</p>
            </div>
            <div className="flex space-x-3">
              <Link href="/dashboard/new/challenge">
                <Button variant="primary" className="px-6 py-3">New Challenge</Button>
              </Link>
              <Link href="/dashboard/new/sim">
                <Button variant="secondary" className="px-6 py-3">Add Sim</Button>
              </Link>
            </div>
          </div>
        </div>

        {/* 3. The interactive part of the page is delegated to the Client Component */}
        {/* We pass the server-fetched data down as props. */}
        <DashboardClient initialChallenges={challenges} initialSims={sims} />
      </div>
    </div>
  );
}