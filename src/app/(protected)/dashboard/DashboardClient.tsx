'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useChallengeStore } from '@/src/lib/store/challengeStore'
import { useSimStore } from '@/src/lib/store/simStore'
import { useAuthStore } from '@/src/lib/store/authStore'
import { ChallengeTile } from '@/src/components/challenge/ChallengeTile'
import { SimCard } from '@/src/components/sim/SimCard'
import { Button } from '@/src/components/ui/Button'
import { Traits } from '@/src/components/sim/TraitsCatalog'
import { cn } from '@/src/lib/utils/cn'
import { Database } from '@/src/types/database.types'
import { TbTarget, TbUsers, TbCheck, TbChevronRight, TbTrendingUp } from 'react-icons/tb'

interface DashboardClientProps {
  initialChallenges: Database['public']['Tables']['challenges']['Row'][];
  initialSims: Database['public']['Tables']['sims']['Row'][];
}

export function DashboardClient({ initialChallenges, initialSims }: DashboardClientProps) {
  const router = useRouter();
  const [isHydrated, setIsHydrated] = useState(false);

  const { challenges, setChallenges } = useChallengeStore();
  const { familyMembers: allSims, setSims } = useSimStore();
  const { user, userProfile } = useAuthStore();

  useEffect(() => {
    setChallenges(initialChallenges);
    setSims(initialSims);
    setIsHydrated(true);
  }, [initialChallenges, initialSims, setChallenges, setSims]);

  const recentChallenges = useMemo(() =>
    [...challenges]
      .sort((a, b) => new Date(b.updated_at ?? '').getTime() - new Date(a.updated_at ?? '').getTime())
      .slice(0, 3),
    [challenges]
  );
  const recentSims = useMemo(() =>
    [...allSims]
      .sort((a, b) => new Date(b.created_at ?? '').getTime() - new Date(a.created_at ?? '').getTime())
      .slice(0, 6),
    [allSims]
  );
  const activeChallenges = useMemo(() =>
    challenges.filter(c => c.status === 'active'),
    [challenges]
  );
  const completedChallenges = useMemo(() =>
    challenges.filter(c => c.status === 'completed'),
    [challenges]
  );

  const completionRate = challenges.length > 0
    ? Math.round((completedChallenges.length / challenges.length) * 100)
    : 0;

  const maxGeneration = useMemo(() =>
    allSims.length > 0 ? Math.max(...allSims.map(s => s.generation ?? 1)) : 0,
    [allSims]
  );

  const mostRecentActiveChallenge = useMemo(() =>
    [...activeChallenges]
      .sort((a, b) => new Date(b.updated_at ?? '').getTime() - new Date(a.updated_at ?? '').getTime())[0] ?? null,
    [activeChallenges]
  );

  const displayName = userProfile?.display_name || userProfile?.username || user?.user_metadata?.username || 'Challenger';

  const statCards = [
    {
      label: 'Challenges',
      value: challenges.length,
      subtitle: `${activeChallenges.length} active`,
      icon: TbTarget,
      iconBg: 'bg-brand-100 dark:bg-brand-900/40',
      iconColor: 'text-brand-500 dark:text-brand-400',
    },
    {
      label: 'Completion',
      value: `${completionRate}%`,
      subtitle: `${completedChallenges.length} finished`,
      icon: TbCheck,
      iconBg: 'bg-accent-500/10 dark:bg-accent-500/20',
      iconColor: 'text-accent-600 dark:text-accent-400',
    },
    {
      label: 'Sims',
      value: allSims.length,
      subtitle: allSims.length === 1 ? '1 sim created' : `${allSims.length} sims created`,
      icon: TbUsers,
      iconBg: 'bg-brand-50 dark:bg-brand-950/60',
      iconColor: 'text-brand-600 dark:text-brand-300',
    },
    {
      label: 'Top Generation',
      value: maxGeneration > 0 ? `Gen ${maxGeneration}` : '—',
      subtitle: 'highest reached',
      icon: TbTrendingUp,
      iconBg: 'bg-warmGray-100 dark:bg-warmGray-800',
      iconColor: 'text-warmGray-600 dark:text-warmGray-300',
    },
  ];

  if (!isHydrated) {
    return (
      <div className="text-center p-12">
        <div className="w-8 h-8 border-4 border-brand-500 dark:border-brand-400 border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-brand-500 to-brand-400 dark:from-brand-600 dark:to-brand-500 p-6 md:p-8 shadow-sm">
        <div className="relative z-10">
          <h1 className="font-display text-2xl md:text-3xl font-bold text-white">
            Welcome back, {displayName}!
          </h1>
          <p className="mt-1 text-sm text-white/80">
            {activeChallenges.length > 0
              ? `${activeChallenges.length} active challenge${activeChallenges.length !== 1 ? 's' : ''} in progress`
              : 'No active challenges yet — start one below'}
          </p>
          <div className="mt-4">
            {mostRecentActiveChallenge ? (
              <Button
                onClick={() => router.push(`/challenge/${mostRecentActiveChallenge.id}`)}
                className="bg-white text-brand-600 hover:bg-brand-50"
                size="sm"
              >
                Continue Challenge
              </Button>
            ) : (
              <Link href="/dashboard/new/challenge">
                <Button className="bg-white text-brand-600 hover:bg-brand-50" size="sm">
                  Start a Challenge
                </Button>
              </Link>
            )}
          </div>
        </div>
        <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white/10" />
        <div className="absolute -bottom-8 -right-2 w-24 h-24 rounded-full bg-white/5" />
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {statCards.map((stat) => (
          <div key={stat.label} className="card flex items-start justify-between min-h-[120px]">
            <div>
              <p className="text-sm font-medium text-warmGray-500 dark:text-warmGray-400">
                {stat.label}
              </p>
              <p className="mt-1 font-display text-3xl font-bold text-warmGray-950 dark:text-warmGray-50">
                {stat.value}
              </p>
              <p className="mt-0.5 text-xs font-medium text-warmGray-500 dark:text-warmGray-500">
                {stat.subtitle}
              </p>
            </div>
            <div className={cn('rounded-lg p-2.5 flex-shrink-0', stat.iconBg)}>
              <stat.icon className={cn('w-5 h-5', stat.iconColor)} />
            </div>
          </div>
        ))}
      </div>

      {/* Quick-glance overview */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Challenges */}
        <div className="card !p-0 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-warmGray-100 dark:border-warmGray-800">
            <h2 className="font-display text-lg font-semibold text-warmGray-950 dark:text-warmGray-100">
              Recent Challenges
            </h2>
            <div className="flex items-center gap-3">
              {challenges.length > 0 && (
                <Link
                  href="/dashboard/challenges"
                  className="text-sm font-medium text-brand-500 hover:text-brand-600 dark:text-brand-400 dark:hover:text-brand-300 flex items-center gap-1"
                >
                  View All
                  <TbChevronRight className="w-4 h-4" />
                </Link>
              )}
              <Link href="/dashboard/new/challenge">
                <Button size="sm">New Challenge</Button>
              </Link>
            </div>
          </div>
          <div className="p-6">
            {recentChallenges.length > 0 ? (
              <div className="space-y-4">
                {recentChallenges.map((challenge) => (
                  <div
                    key={challenge.id}
                    onClick={() => router.push(`/challenge/${challenge.id}`)}
                    className="cursor-pointer"
                  >
                    <ChallengeTile challenge={challenge} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 border border-dashed rounded-lg border-brand-200 dark:border-warmGray-700">
                <p className="text-sm text-warmGray-500 dark:text-warmGray-400 mb-3">
                  {allSims.length > 0
                    ? 'No challenges yet — your sims are waiting for one'
                    : 'No challenges yet — start your legacy'}
                </p>
                <Link href="/dashboard/new/challenge">
                  <Button size="sm">Create One</Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Recent Sims */}
        <div className="card !p-0 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-warmGray-100 dark:border-warmGray-800">
            <h2 className="font-display text-lg font-semibold text-warmGray-950 dark:text-warmGray-100">
              Recent Sims
            </h2>
            <div className="flex items-center gap-3">
              {allSims.length > 0 && (
                <Link
                  href="/sims"
                  className="text-sm font-medium text-brand-500 hover:text-brand-600 dark:text-brand-400 dark:hover:text-brand-300 flex items-center gap-1"
                >
                  View All
                  <TbChevronRight className="w-4 h-4" />
                </Link>
              )}
              <Link href="/dashboard/new/sim">
                <Button size="sm">Add Sim</Button>
              </Link>
            </div>
          </div>
          <div className="p-6">
            {recentSims.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {recentSims.map((sim) => (
                  <SimCard key={sim.id} sim={sim} compact traitCatalog={Traits} />
                ))}
              </div>
            ) : (
              <div className="text-center py-10 border border-dashed rounded-lg border-brand-200 dark:border-warmGray-700">
                <p className="text-sm text-warmGray-500 dark:text-warmGray-400 mb-3">
                  {challenges.length > 0
                    ? 'No sims yet — add one to your challenge'
                    : 'No sims yet'}
                </p>
                <Link href="/dashboard/new/sim">
                  <Button size="sm">Add Sim</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
