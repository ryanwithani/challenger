'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useChallengeStore } from '@/src/lib/store/challengeStore'
import { useSimStore } from '@/src/lib/store/simStore'
import { ChallengeTile } from '@/src/components/challenge/ChallengeTile'
import { SimCard } from '@/src/components/sim/SimCard'
import { Button } from '@/src/components/ui/Button'

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'challenges' | 'sims'>('overview')
  const [error, setError] = useState<string | null>(null)

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
    setError(null)
    Promise.all([
      fetchChallenges(),
      fetchAllSims()
    ]).catch(error => {
      setError('Failed to load dashboard data. Please try again.')
      if (process.env.NODE_ENV !== 'production') {
        console.error('Error loading dashboard data:', error)
      }
    })
  }, [fetchChallenges, fetchAllSims])

  // Get recent activity
  const recentChallenges = challenges
    .sort((a, b) => new Date(b.updated_at ?? '').getTime() - new Date(a.updated_at ?? '').getTime())
    .slice(0, 3)

  const recentSims = allSims
    .sort((a, b) => new Date(b.created_at ?? '').getTime() - new Date(a.created_at ?? '').getTime())
    .slice(0, 6)

  // Get active challenges
  const activeChallenges = challenges.filter(c => c.status === 'active')

  const tabs = [
    { id: 'overview', name: 'Overview' },
    { id: 'challenges', name: 'Challenges' },
    { id: 'sims', name: 'Sims' }
  ]

  const handleRetry = () => {
    setError(null)
    Promise.all([
      fetchChallenges(),
      fetchAllSims()
    ]).catch(error => {
      setError('Failed to load dashboard data. Please try again.')
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50">
      <div className="max-w-[1400px] mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="bg-white rounded-3xl p-8 shadow-xl border-2 border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Dashboard
              </h1>
              <p className="text-lg text-gray-600 mt-2">Manage your challenges and sims</p>
            </div>
            <div className="flex space-x-3">
              <Link href="/challenge/new">
                <Button className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-200 border-none shadow-lg">
                  New Challenge
                </Button>
              </Link>
              <Link href="/dashboard/new/sim">
                <Button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 border-none shadow-lg">
                  Add Sim
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-4xl">⚠️</div>
              <div>
                <p className="text-red-800 font-semibold">{error}</p>
                <p className="text-red-600 text-sm mt-1">Check your connection and try again</p>
              </div>
            </div>
            <Button 
              onClick={handleRetry}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Retry
            </Button>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: 'Total Challenges', value: challenges.length, color: 'from-emerald-500 to-teal-600', icon: '🎯' },
            { label: 'Active Challenges', value: activeChallenges.length, color: 'from-blue-500 to-indigo-600', icon: '⚡' },
            { label: 'Total Sims', value: allSims.length, color: 'from-purple-500 to-pink-600', icon: '👥' },
            { label: 'Current Heirs', value: allSims.filter(sim => sim.is_heir).length, color: 'from-amber-500 to-orange-600', icon: '👑' }
          ].map((stat, index) => (
            <div key={index} className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-100 hover:shadow-xl transition-shadow duration-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-3xl">{stat.icon}</span>
                <div className={`text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                  {stat.value}
                </div>
              </div>
              <div className="text-gray-600 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl p-2 shadow-lg border-2 border-gray-100">
          <nav className="flex space-x-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 py-4 px-6 rounded-xl font-semibold transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-8">
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Recent Challenges */}
              <div className="bg-white rounded-3xl p-8 shadow-lg border-2 border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Recent Challenges</h2>
                  <button
                    onClick={() => setActiveTab('challenges')}
                    className="text-purple-600 hover:text-purple-700 font-semibold flex items-center gap-2"
                  >
                    View all →
                  </button>
                </div>

                {challengesLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent mx-auto"></div>
                    <p className="text-gray-500 mt-4">Loading challenges...</p>
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
                  <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-2xl">
                    <div className="text-6xl mb-4">🎯</div>
                    <p className="text-gray-500 mb-4">No challenges yet</p>
                    <Link href="/challenge/new">
                      <Button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                        Create Your First Challenge
                      </Button>
                    </Link>
                  </div>
                )}
              </div>

              {/* Recent Sims */}
              <div className="bg-white rounded-3xl p-8 shadow-lg border-2 border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Recent Sims</h2>
                  <button
                    onClick={() => setActiveTab('sims')}
                    className="text-purple-600 hover:text-purple-700 font-semibold flex items-center gap-2"
                  >
                    View all →
                  </button>
                </div>

                {simsLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto"></div>
                    <p className="text-gray-500 mt-4">Loading sims...</p>
                  </div>
                ) : recentSims.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4">
                    {recentSims.map((sim) => (
                      <Link key={sim.id} href={`/sim/${sim.id}`}>
                        <div className="p-3 rounded-xl border-2 border-gray-200 hover:border-blue-400 hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-white to-blue-50">
                          <SimCard sim={sim} compact />
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-2xl">
                    <div className="text-6xl mb-4">👤</div>
                    <p className="text-gray-500 mb-4">No sims yet</p>
                    <Link href="/dashboard/new/sim">
                      <Button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                        Add Your First Sim
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* CHALLENGES TAB */}
          {activeTab === 'challenges' && (
            <div className="bg-white rounded-3xl p-8 shadow-lg border-2 border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">All Challenges</h2>
                <Link href="/challenge/new">
                  <Button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                    New Challenge
                  </Button>
                </Link>
              </div>

              {challengesLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent mx-auto"></div>
                  <p className="text-gray-500 mt-4">Loading challenges...</p>
                </div>
              ) : challenges.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {challenges.map((challenge) => (
                    <Link key={challenge.id} href={`/challenge/${challenge.id}`}>
                        <ChallengeTile challenge={challenge} />
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 border-2 border-dashed border-gray-300 rounded-2xl">
                  <div className="text-8xl mb-4">🎯</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">No challenges yet</h3>
                  <p className="text-gray-500 mb-6">Start your journey by creating your first challenge</p>
                  <Link href="/challenge/new">
                    <Button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3">
                      Create Your First Challenge
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* SIMS TAB */}
          {activeTab === 'sims' && (
            <div className="bg-white rounded-3xl p-8 shadow-lg border-2 border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">All Sims</h2>
                <Link href="/dashboard/new/sim">
                  <Button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                    Add Sim
                  </Button>
                </Link>
              </div>

              {simsLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto"></div>
                  <p className="text-gray-500 mt-4">Loading sims...</p>
                </div>
              ) : allSims.length > 0 ? (
                <>
                  {/* Filter/Sort Options */}
                  <div className="mb-6 flex gap-4 items-center">
                    <div className="text-sm text-gray-600">
                      Showing {allSims.length} sim{allSims.length !== 1 ? 's' : ''}
                    </div>
                    <div className="flex-1"></div>
                    <select className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-400 focus:outline-none">
                      <option>All Challenges</option>
                      {challenges.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Sims Grid */}
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {allSims.map((sim) => (
                      <Link key={sim.id} href={`/sim/${sim.id}`}>
                        <div className="p-4 rounded-xl border-2 border-gray-200 hover:border-blue-400 hover:shadow-xl transition-all duration-200 bg-gradient-to-br from-white to-blue-50 h-full">
                          <SimCard sim={sim} />
                        </div>
                      </Link>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-16 border-2 border-dashed border-gray-300 rounded-2xl">
                  <div className="text-8xl mb-4">👤</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">No sims yet</h3>
                  <p className="text-gray-500 mb-6">Add your first sim to start tracking their journey</p>
                  <Link href="/dashboard/new/sim">
                    <Button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3">
                      Add Your First Sim
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}