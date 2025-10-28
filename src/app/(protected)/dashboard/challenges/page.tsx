'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { useChallengeStore } from '@/src/lib/store/challengeStore'
import { ChallengeTile } from '@/src/components/challenge/ChallengeTile'
import { Button } from '@/src/components/ui/Button'
import { Input } from '@/src/components/ui/Input'
import { ErrorMessage } from '@/src/components/ui/ErrorMessage'

interface FilterState {
  searchTerm: string
  statusFilter: string
  typeFilter: string
}

export default function ChallengesPage() {
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: '',
    statusFilter: 'all',
    typeFilter: 'all'
  })
  const [error, setError] = useState<string | null>(null)

  const { challenges, fetchChallenges, challengesLoading } = useChallengeStore()

  // Memoized filtered challenges for performance
  const filteredChallenges = useMemo(() => {
    return challenges.filter(challenge => {
      const matchesSearch = challenge.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        (challenge.description && challenge.description.toLowerCase().includes(filters.searchTerm.toLowerCase()))
      const matchesStatus = filters.statusFilter === 'all' || challenge.status === filters.statusFilter
      const matchesType = filters.typeFilter === 'all' || challenge.challenge_type === filters.typeFilter
      return matchesSearch && matchesStatus && matchesType
    })
  }, [challenges, filters])

  // Memoized challenge statistics
  const stats = useMemo(() => ({
    active: challenges.filter(c => c.status === 'active').length,
    completed: challenges.filter(c => c.status === 'completed').length,
    legacy: challenges.filter(c => c.challenge_type === 'legacy').length,
    thisMonth: challenges.filter(c => {
      const challengeDate = new Date(c.created_at ?? '')
      const now = new Date()
      return challengeDate.getMonth() === now.getMonth() &&
        challengeDate.getFullYear() === now.getFullYear()
    }).length
  }), [challenges])

  // Memoized challenge types
  const challengeTypes = useMemo(() => 
    Array.from(new Set(challenges.map(c => c.challenge_type).filter(Boolean))),
    [challenges]
  )

  // Memoized challenges by status
  const challengesByStatus = useMemo(() => {
    return filteredChallenges.reduce((acc, challenge) => {
      const status = challenge.status || 'unknown'
      if (!acc[status]) acc[status] = []
      acc[status].push(challenge)
      return acc
    }, {} as Record<string, typeof challenges>)
  }, [filteredChallenges])

  const handleRetry = useCallback(() => {
    setError(null)
    fetchChallenges().catch(err => {
      setError('Failed to load challenges. Please try again.')
    })
  }, [fetchChallenges])

  const updateFilter = useCallback((key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }, [])

  const clearFilters = useCallback(() => {
    setFilters({
      searchTerm: '',
      statusFilter: 'all',
      typeFilter: 'all'
    })
  }, [])

  useEffect(() => {
    setError(null)
    fetchChallenges().catch(err => {
      setError('Failed to load challenges. Please try again.')
    })
  }, [fetchChallenges])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-[1400px] mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl border-2 border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-blue-500 dark:to-purple-600 bg-clip-text text-transparent">
                All Challenges
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
                {filteredChallenges.length} of {challenges.length} challenges
                {filters.searchTerm && ` matching "${filters.searchTerm}"`}
              </p>
            </div>
            <Link href="/dashboard/new/challenge">
              <Button variant="primary" className="px-6 py-3">
                Create New Challenge
              </Button>
            </Link>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <ErrorMessage 
            error={error}
          />
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: 'Active', value: stats.active, color: 'from-emerald-500 to-teal-600', icon: '⚡' },
            { label: 'Completed', value: stats.completed, color: 'from-blue-500 to-indigo-600', icon: '✅' },
            { label: 'Legacy', value: stats.legacy, color: 'from-purple-500 to-pink-600 dark:from-blue-500 dark:to-purple-600', icon: '🎯' },
            { label: 'This Month', value: stats.thisMonth, color: 'from-amber-500 to-orange-600', icon: '📅' }
          ].map((stat, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border-2 border-gray-100 dark:border-gray-700 hover:shadow-xl transition-shadow duration-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-3xl">{stat.icon}</span>
                <div className={`text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                  {stat.value}
                </div>
              </div>
              <div className="text-gray-600 dark:text-gray-400 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border-2 border-gray-100 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Search Challenges
              </label>
              <Input
                type="text"
                value={filters.searchTerm}
                onChange={(e) => updateFilter('searchTerm', e.target.value)}
                placeholder="Search by name or description..."
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select
                value={filters.statusFilter}
                onChange={(e) => updateFilter('statusFilter', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-purple-400 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="paused">Paused</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Type
              </label>
              <select
                value={filters.typeFilter}
                onChange={(e) => updateFilter('typeFilter', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-purple-400 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="all">All Types</option>
                {challengeTypes.map((type) => (
                  <option key={type} value={type || ''}>
                    {type?.charAt(0).toUpperCase()}{type?.slice(1)} Challenge
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={clearFilters}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        {challengesLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent mx-auto"></div>
            <p className="text-gray-500 dark:text-gray-400 mt-4">Loading challenges...</p>
          </div>
        ) : challenges.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-12 shadow-lg border-2 border-gray-100 dark:border-gray-700 text-center">
            <div className="text-8xl mb-6">🎯</div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">No challenges yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">Create your first challenge to start tracking your Sims gameplay</p>
            <Link href="/dashboard/new/challenge">
              <Button variant="gradient" className="px-8 py-3">
                Create Your First Challenge
              </Button>
            </Link>
          </div>
        ) : filteredChallenges.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-12 shadow-lg border-2 border-gray-100 dark:border-gray-700 text-center">
            <div className="text-6xl mb-6">🔍</div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">No challenges match your filters</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">Try adjusting your search or filter criteria</p>
            <Button
              variant="primary"
              onClick={clearFilters}
              className="px-8 py-3"
            >
              Clear All Filters
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(challengesByStatus).map(([status, statusChallenges]) => (
              <div key={status} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border-2 border-gray-100 dark:border-gray-700">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center">
                  <span className="mr-3 text-2xl">
                    {status === 'active' ? '⚡' : 
                     status === 'completed' ? '✅' : 
                     status === 'paused' ? '⏸️' : 
                     status === 'archived' ? '📦' : '❓'}
                  </span>
                  {status.charAt(0).toUpperCase() + status.slice(1)} Challenges
                  <span className="ml-3 px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400 text-sm rounded-full">
                    {statusChallenges.length}
                  </span>
                </h3>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {statusChallenges
                    .sort((a, b) => new Date(b.updated_at ?? '').getTime() - new Date(a.updated_at ?? '').getTime())
                    .map((challenge) => (
                      <Link key={challenge.id} href={`/challenge/${challenge.id}`}>
                        <ChallengeTile challenge={challenge} />
                      </Link>
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}