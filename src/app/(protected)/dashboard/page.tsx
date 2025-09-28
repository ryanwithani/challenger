'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useChallengeStore } from '@/src/lib/store/challengeStore'
import { useSimStore } from '@/src/lib/store/simStore'
import { ChallengeTile } from '@/src/components/ui/challenge/ChallengeTile'
import { SimCard } from '@/src/components/ui/sim/SimCard'
import { Button } from '@/src/components/ui/Button'

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'challenges' | 'sims'>('overview')

  const {
    challenges,
    fetchChallenges,
    loading: challengesLoading
  } = useChallengeStore()

  const {
    familyMembers: allSims,
    loading: simsLoading,
    fetchAllSims
  } = useSimStore()

  useEffect(() => {
    fetchChallenges()
    fetchAllSims()
  }, [])

  // Get recent activity
  const recentChallenges = challenges
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 3)

  const recentSims = allSims
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 6)

  // Get active challenges
  const activeChallenges = challenges.filter(c => c.status === 'active')

  // Group sims by challenge
  const simsByChallenge = allSims.reduce((acc, sim) => {
    const challengeName = challenges.find(c => c.id === sim.challenge_id)?.name || 'Unknown Challenge'
    if (!acc[challengeName]) acc[challengeName] = []
    acc[challengeName].push(sim)
    return acc
  }, {} as Record<string, typeof allSims>)

  const tabs = [
    { id: 'overview', name: 'Overview', icon: '📊' },
    { id: 'challenges', name: 'Challenges', icon: '🎯' },
    { id: 'sims', name: 'Sims', icon: '👤' }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Manage your challenges and sims</p>
        </div>
        <div className="flex space-x-3">
          <Link href="/challenge/new">
            <Button variant="outline">New Challenge</Button>
          </Link>
          <Link href="/sim/new">
            <Button>Add Sim</Button>
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-sims-green rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">🎯</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Challenges</p>
              <p className="text-2xl font-semibold text-gray-900">{challenges.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-sims-blue rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">⚡</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Challenges</p>
              <p className="text-2xl font-semibold text-gray-900">{activeChallenges.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-sims-purple rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">👤</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Sims</p>
              <p className="text-2xl font-semibold text-gray-900">{allSims.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-sims-yellow rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">👑</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Current Heirs</p>
              <p className="text-2xl font-semibold text-gray-900">
                {allSims.filter(sim => sim.is_heir).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${activeTab === tab.id
                ? 'border-sims-green text-sims-green'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Recent Activity */}
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Recent Challenges */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Recent Challenges</h2>
                  <Link href="#" onClick={() => setActiveTab('challenges')} className="text-sims-blue hover:text-sims-blue/80 text-sm font-medium">
                    View all →
                  </Link>
                </div>

                {challengesLoading ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Loading challenges...</p>
                  </div>
                ) : recentChallenges.length > 0 ? (
                  <div className="space-y-4">
                    {recentChallenges.map((challenge) => (
                      <Link key={challenge.id} href={`/challenge/${challenge.id}`}>
                        <ChallengeTile challenge={challenge} />
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                    <p className="text-gray-500 mb-2">No challenges yet</p>
                    <Link href="/challenge/new">
                      <Button size="sm">Create Your First Challenge</Button>
                    </Link>
                  </div>
                )}
              </div>

              {/* Recent Sims */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Recent Sims</h2>
                  <Link href="#" onClick={() => setActiveTab('sims')} className="text-sims-blue hover:text-sims-blue/80 text-sm font-medium">
                    View all →
                  </Link>
                </div>

                {simsLoading ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Loading sims...</p>
                  </div>
                ) : recentSims.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {recentSims.map((sim) => (
                      <SimCard key={sim.id} sim={sim} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                    <p className="text-gray-500 mb-2">No sims yet</p>
                    <Link href="/sim/new">
                      <Button size="sm">Add Your First Sim</Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'challenges' && (
          <div>
            {challengesLoading ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Loading challenges...</p>
              </div>
            ) : challenges.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🎯</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No challenges yet</h3>
                <p className="text-gray-600 mb-4">Create your first challenge to start tracking your Sims gameplay</p>
                <Link href="/challenge/new">
                  <Button>Create Your First Challenge</Button>
                </Link>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {challenges.map((challenge) => (
                  <Link key={challenge.id} href={`/challenge/${challenge.id}`}>
                    <ChallengeTile challenge={challenge} />
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'sims' && (
          <div>
            {simsLoading ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Loading sims...</p>
              </div>
            ) : allSims.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">👤</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No sims yet</h3>
                <p className="text-gray-600 mb-4">Add sims to your challenges to start building your legacy</p>
                <div className="flex justify-center space-x-3">
                  <Link href="/challenge/new">
                    <Button variant="outline">Create Challenge First</Button>
                  </Link>
                  {challenges.length > 0 && (
                    <Link href="/sim/new">
                      <Button>Add Your First Sim</Button>
                    </Link>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                {Object.entries(simsByChallenge).map(([challengeName, sims]) => (
                  <div key={challengeName}>
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <span className="mr-2">🎯</span>
                      {challengeName}
                      <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                        {sims.length} sim{sims.length !== 1 ? 's' : ''}
                      </span>
                    </h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {sims
                        .sort((a, b) => {
                          // Sort by: heirs first, then by generation, then by creation date
                          if (a.is_heir && !b.is_heir) return -1
                          if (!a.is_heir && b.is_heir) return 1
                          if (a.generation !== b.generation) return a.generation - b.generation
                          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                        })
                        .map((sim) => (
                          <SimCard key={sim.id} sim={sim} />
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}