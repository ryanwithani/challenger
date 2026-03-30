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
import { TbTarget, TbUsers } from 'react-icons/tb'

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
        <div className="w-8 h-8 border-4 border-brand-500 dark:border-brand-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    );
  }


  return (
    <>
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <TbTarget className="w-5 h-5 text-brand-500" />
            <span className="text-sm text-gray-600 dark:text-warmGray-300">Challenges</span>
          </div>
          <div className="text-2xl font-semibold text-gray-900 dark:text-warmGray-100">{challenges.length}</div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <TbTarget className="w-5 h-5 text-green-500" />
            <span className="text-sm text-gray-600 dark:text-warmGray-300">Completed</span>
          </div>
          <div className="text-2xl font-semibold text-gray-900 dark:text-warmGray-100">{completedChallenges.length}</div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <TbUsers className="w-5 h-5 text-brand-500" />
            <span className="text-sm text-gray-600 dark:text-warmGray-300">Sims</span>
          </div>
          <div className="text-2xl font-semibold text-gray-900 dark:text-warmGray-100">{allSims.length}</div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <TbUsers className="w-5 h-5 text-brand-400" />
            <span className="text-sm text-gray-600 dark:text-warmGray-300">Generations</span>
          </div>
          <div className="text-2xl font-semibold text-gray-900 dark:text-warmGray-100">{totalGenerations}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-warmGray-700">
        <nav className="flex gap-6" role="tablist">
          {DASHBOARD_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 text-sm font-medium transition-colors border-b-2 ${activeTab === tab.id
                ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-gray-500 dark:text-warmGray-400 hover:text-gray-700 dark:hover:text-warmGray-200'
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
              <div className="bg-white dark:bg-warmGray-900 rounded-lg p-6 border border-gray-200 dark:border-warmGray-800">
                <h2 className="font-display text-xl text-brand-700 dark:text-brand-300 mb-6">Recent Challenges</h2>
                {recentChallenges.length > 0 ? (
                  <div className="space-y-4">
                    {recentChallenges.map((challenge) => (
                      <div key={challenge.id} onClick={() => navigateToChallenge(challenge.id)} className="cursor-pointer">
                        <ChallengeTile challenge={challenge} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 border border-dashed rounded-lg border-gray-300 dark:border-warmGray-700">
                    <p className="text-sm text-gray-500 dark:text-warmGray-400 mb-3">No challenges yet</p>
                    <Link href="/dashboard/new/challenge"><Button size="sm">Create One</Button></Link>
                  </div>
                )}
              </div>
              {/* Recent Sims */}
              <div className="bg-white dark:bg-warmGray-900 rounded-lg p-6 border border-gray-200 dark:border-warmGray-800">
                <h2 className="font-display text-xl text-brand-700 dark:text-brand-300 mb-6">Recent Sims</h2>
                {recentSims.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4">
                    {recentSims.map((sim) => (
                      <SimCard key={sim.id} sim={sim} compact traitCatalog={Traits} onClick={() => navigateToSim(sim.id)} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 border border-dashed rounded-lg border-gray-300 dark:border-warmGray-700">
                    <p className="text-sm text-gray-500 dark:text-warmGray-400 mb-3">No sims yet</p>
                    <Link href="/dashboard/new/sim"><Button size="sm">Add Sim</Button></Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'challenges' && (
          <div role="tabpanel" className="bg-white dark:bg-warmGray-900 rounded-lg p-6 border border-gray-200 dark:border-warmGray-800">
            <h2 className="font-display text-xl text-brand-700 dark:text-brand-300 mb-6">All Challenges</h2>
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
                <p className="text-sm text-gray-500 dark:text-warmGray-400 mb-3">No challenges yet</p>
                <Link href="/dashboard/new/challenge"><Button size="sm">Create a Challenge</Button></Link>
              </div>
            )}
          </div>
        )}

        {activeTab === 'sims' && (
          <div role="tabpanel" className="bg-white dark:bg-warmGray-900 rounded-lg p-6 border border-gray-200 dark:border-warmGray-800">
            <h2 className="font-display text-xl text-brand-700 dark:text-brand-300 mb-6">All Sims</h2>
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
                <p className="text-sm text-gray-500 dark:text-warmGray-400 mb-3">No sims yet</p>
                <Link href="/dashboard/new/sim"><Button size="sm">Add Sim</Button></Link>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}