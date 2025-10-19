'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useChallengeStore } from '@/src/lib/store/challengeStore'
import { useSimStore } from '@/src/lib/store/simStore'
import { ChallengeTile } from '@/src/components/challenge/ChallengeTile'
import { SimCard } from '@/src/components/sim/SimCard'
import { Button } from '@/src/components/ui/Button'
import { Traits } from '@/src/components/sim/TraitsCatalog'

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
    // Run both fetches in parallel instead of sequentially
    Promise.all([
      fetchChallenges(),
      fetchAllSims()
    ]).catch(error => {
      console.error('Error loading dashboard data:', error)
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

  // Group sims by challenge
  const simsByChallenge = allSims.reduce((acc, sim) => {
    const challengeName = challenges.find(c => c.id === sim.challenge_id)?.name || 'Unknown Challenge'
    if (!acc[challengeName]) acc[challengeName] = []
    acc[challengeName].push(sim)
    return acc
  }, {} as Record<string, typeof allSims>)

  const tabs = [
    { id: 'overview', name: 'Overview'},
    { id: 'challenges', name: 'Challenges' },
    { id: 'sims', name: 'Sims' }
  ]

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
  
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: 'Total Challenges', value: challenges.length, color: 'from-emerald-500 to-teal-600' },
            { label: 'Active Challenges', value: activeChallenges.length, color: 'from-blue-500 to-indigo-600' },
            { label: 'Total Sims', value: allSims.length, color: 'from-purple-500 to-pink-600' },
            { label: 'Current Heirs', value: allSims.filter(sim => sim.is_heir).length, color: 'from-amber-500 to-orange-600' }
          ].map((stat, index) => (
            <div key={index} className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-100 text-center">
              <div className={`text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                {stat.value}
              </div>
              <div className="text-gray-600 font-medium mt-1">{stat.label}</div>
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
  
        {/* Tab Content with modern cards */}
        <div className="space-y-8">
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
                        <div className="p-4 rounded-xl border-2 border-gray-200 hover:border-purple-400 hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-white to-purple-50">
                          <ChallengeTile challenge={challenge} />
                        </div>
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
  
              {/* Recent Sims - similar structure */}
              <div className="bg-white rounded-3xl p-8 shadow-lg border-2 border-gray-100">
                {/* Same modern treatment for sims */}
              </div>
            </div>
          )}
  
          {/* Other tabs... */}
        </div>
      </div>
    </div>
  )}