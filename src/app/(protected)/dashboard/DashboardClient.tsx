'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useChallengeStore } from '@/src/lib/store/challengeStore'
import { useSimStore } from '@/src/lib/store/simStore'
import { ChallengeTile } from '@/src/components/challenge/ChallengeTile'
import { SimCard } from '@/src/components/sim/SimCard'
import { Button } from '@/src/components/ui/Button'
import { Traits } from '@/src/components/sim/TraitsCatalog'
import { DASHBOARD_TABS } from '@/src/lib/constants'
import { Database } from '@/src/types/database.types'

interface DashboardClientProps {
  initialChallenges: Database['public']['Tables']['challenges']['Row'][];
  initialSims: Database['public']['Tables']['sims']['Row'][];
}

export function DashboardClient({ initialChallenges, initialSims }: DashboardClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(DASHBOARD_TABS[0].id);

  // 1. Create an explicit state to track if client stores have been hydrated.
  const [isHydrated, setIsHydrated] = useState(false);

  // Get data and setters from the stores.
  const { challenges, setChallenges } = useChallengeStore();
  const { familyMembers: allSims, setSims } = useSimStore();

  // 2. Hydrate the stores and update our hydration state.
  useEffect(() => {
    setChallenges(initialChallenges);
    setSims(initialSims);
    setIsHydrated(true); // Mark hydration as complete
  }, [initialChallenges, initialSims, setChallenges, setSims]);

  // All memoized logic remains the same.
  const recentChallenges = useMemo(() =>
    challenges
      .sort((a, b) => new Date(b.updated_at ?? '').getTime() - new Date(a.updated_at ?? '').getTime())
      .slice(0, 3), [challenges]
  );
  const recentSims = useMemo(() =>
    allSims
      .sort((a, b) => new Date(b.created_at ?? '').getTime() - new Date(a.created_at ?? '').getTime())
      .slice(0, 6), [allSims]
  );
  const activeChallenges = useMemo(() =>
    challenges.filter(c => c.status === 'active'), [challenges]
  );
  const completedChallenges = useMemo(() =>
    challenges.filter(c => c.status === 'completed'), [challenges]
  );
  const totalGenerations = useMemo(() => {
    // Calculate generations by finding the maximum generation number among all sims
    const maxGeneration = allSims.reduce((max, sim) => {
      const generation = sim.generation || 0;
      return Math.max(max, generation);
    }, 0);
    return maxGeneration + 1; // +1 because generations are 0-indexed
  }, [allSims]);

  const navigateToChallenge = (id: string) => router.push(`/challenge/${id}`);
  const navigateToSim = (id: string) => router.push(`/sim/${id}`);

  // 3. CRITICAL: Do not render the full UI until hydration is complete.
  // This prevents all "unknown" and "isLoading" errors.
  if (!isHydrated) {
    // You can return a spinner here, or null for a flicker-free experience.
    return (
      <div className="text-center p-12">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    );
  }


  return (
    <>
      {/* Quick Stats (Rendered here with client-side data) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Challenges Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border-2 border-gray-100 dark:border-gray-700 hover:shadow-xl transition-shadow duration-200">
          <div className="text-center mb-6">
            <img src="/ChallengeIcon.svg" alt="Challenges" className="w-16 h-16 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Challenges</h3>
          </div>
          <div className="flex items-center justify-center">
            <div className="text-center flex-1">
              <div className="text-3xl font-bold bg-gradient-to-r from-emerald-500 to-teal-600 bg-clip-text text-transparent mb-1">
                {challenges.length}
              </div>
              <div className="text-gray-600 dark:text-gray-400 text-xs font-medium">Total Challenges</div>
            </div>
            <div className="w-px h-12 bg-gray-300 dark:bg-gray-600 mx-3"></div>
            <div className="text-center flex-1">
              <div className="text-3xl font-bold bg-gradient-to-r from-brand-400 to-brand-600 bg-clip-text text-transparent mb-1">
                {completedChallenges.length}
              </div>
              <div className="text-gray-600 dark:text-gray-400 text-xs font-medium">Completed</div>
            </div>
          </div>
        </div>

        {/* Sims Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border-2 border-gray-100 dark:border-gray-700 hover:shadow-xl transition-shadow duration-200">
          <div className="text-center mb-6">
            <img src="/SimIcon.svg" alt="Sims" className="w-16 h-16 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Sims</h3>
          </div>
          <div className="flex items-center justify-center">
            <div className="text-center flex-1">
              <div className="text-3xl font-bold bg-gradient-to-r from-brand-500 to-accent-500 dark:from-brand-600 dark:to-accent-600 bg-clip-text text-transparent mb-1">
                {allSims.length}
              </div>
              <div className="text-gray-600 dark:text-gray-400 text-xs font-medium">Total Sims</div>
            </div>
            <div className="w-px h-12 bg-gray-300 dark:bg-gray-600 mx-3"></div>
            <div className="text-center flex-1">
              <div className="text-3xl font-bold bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent mb-1">
                {totalGenerations}
              </div>
              <div className="text-gray-600 dark:text-gray-400 text-xs font-medium">Generations</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs (Interactive: state is managed here) */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-2 shadow-lg border-2 border-gray-100 dark:border-gray-700">
        <nav className="flex space-x-2" role="tablist">
          {DASHBOARD_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-4 px-6 rounded-xl font-semibold transition-all duration-300 ${activeTab === tab.id
                ? 'bg-gradient-to-r from-brand-500 to-accent-500 dark:from-brand-600 dark:to-accent-600 text-white shadow-lg'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              role="tab"
              aria-selected={activeTab === tab.id}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content (Conditionally rendered based on client-side state) */}
      <div className="space-y-8">
        {activeTab === 'overview' && (
          <div role="tabpanel">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Recent Challenges */}
              <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-lg">
                <h2 className="text-2xl font-bold mb-6">Recent Challenges</h2>
                {recentChallenges.length > 0 ? (
                  <div className="space-y-4">
                    {recentChallenges.map((challenge) => (
                      <div key={challenge.id} onClick={() => navigateToChallenge(challenge.id)} className="cursor-pointer">
                        <ChallengeTile challenge={challenge} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 border-2 border-dashed rounded-2xl">
                    <p>No challenges yet</p>
                    <Link href="/dashboard/new/challenge"><Button>Create One</Button></Link>
                  </div>
                )}
              </div>
              {/* Recent Sims */}
              <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-lg">
                <h2 className="text-2xl font-bold mb-6">Recent Sims</h2>
                {recentSims.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4">
                    {recentSims.map((sim) => (
                      <SimCard key={sim.id} sim={sim} compact traitCatalog={Traits} onClick={() => navigateToSim(sim.id)} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 border-2 border-dashed rounded-2xl">
                    <p className="text-gray-600 dark:text-gray-400 mb-4">You have no sims!</p>
                    <Link href="/dashboard/new/sim"><Button>Create A Sim</Button></Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'challenges' && (
          <div role="tabpanel" className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold mb-6">All Challenges</h2>
            {challenges.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {challenges.map((challenge) => (
                  <div key={challenge.id} onClick={() => navigateToChallenge(challenge.id)} className="cursor-pointer">
                    <ChallengeTile challenge={challenge} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p>No challenges yet. Start your journey!</p>
                <Link href="/dashboard/new/challenge"><Button>Create Your First Challenge</Button></Link>
              </div>
            )}
          </div>
        )}

        {activeTab === 'sims' && (
           <div role="tabpanel" className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-lg">
             <h2 className="text-2xl font-bold mb-6">All Sims</h2>
             {allSims.length > 0 ? (
               <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                 {allSims.map((sim) => (
                   <div key={sim.id} onClick={() => navigateToSim(sim.id)} className="cursor-pointer">
                     <SimCard sim={sim} traitCatalog={Traits} />
                   </div>
                 ))}
               </div>
             ) : (
               <div className="text-center py-16">
                 <p className="text-gray-600 dark:text-gray-400 mb-4">You have no sims!</p>
                 <Link href="/dashboard/new/sim"><Button>Create A Sim</Button></Link>
               </div>
             )}
           </div>
        )}
      </div>
    </>
  );
}