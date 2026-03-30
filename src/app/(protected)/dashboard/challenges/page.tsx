'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { useChallengeStore } from '@/src/lib/store/challengeStore'
import { ChallengeTile } from '@/src/components/challenge/ChallengeTile'
import { Button } from '@/src/components/ui/Button'
import { Input } from '@/src/components/ui/Input'
import { ErrorMessage } from '@/src/components/ui/ErrorMessage'
import { TbBolt, TbCheck, TbTarget, TbCalendar } from 'react-icons/tb'

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
    <div className="max-w-[1400px] mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl text-brand-700 dark:text-brand-300">
              All Challenges
            </h1>
            <p className="text-base text-gray-600 dark:text-warmGray-300 mt-1">
              {filteredChallenges.length} of {challenges.length} challenges
              {filters.searchTerm && ` matching "${filters.searchTerm}"`}
            </p>
          </div>
          <Link href="/dashboard/new/challenge">
            <Button variant="primary">
              Create New Challenge
            </Button>
          </Link>
        </div>

        {/* Error State */}
        {error && (
          <ErrorMessage
            error={error}
          />
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Active', value: stats.active, icon: TbBolt, iconClass: 'text-brand-500' },
            { label: 'Completed', value: stats.completed, icon: TbCheck, iconClass: 'text-green-500' },
            { label: 'Legacy', value: stats.legacy, icon: TbTarget, iconClass: 'text-brand-500' },
            { label: 'This Month', value: stats.thisMonth, icon: TbCalendar, iconClass: 'text-brand-400' }
          ].map((stat, index) => (
            <div key={index} className="card">
              <div className="flex items-center gap-3 mb-2">
                <stat.icon className={`w-5 h-5 ${stat.iconClass}`} />
                <span className="text-sm text-gray-600 dark:text-warmGray-300">{stat.label}</span>
              </div>
              <div className="text-2xl font-semibold text-gray-900 dark:text-warmGray-100">
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="card">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-warmGray-200 mb-2">
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
              <label className="block text-sm font-medium text-gray-700 dark:text-warmGray-200 mb-2">
                Status
              </label>
              <select
                value={filters.statusFilter}
                onChange={(e) => updateFilter('statusFilter', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 dark:border-warmGray-700 rounded-lg focus:border-brand-400 dark:focus:border-brand-500 focus:outline-none bg-white dark:bg-warmGray-900 text-gray-900 dark:text-warmGray-100"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="paused">Paused</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-warmGray-200 mb-2">
                Type
              </label>
              <select
                value={filters.typeFilter}
                onChange={(e) => updateFilter('typeFilter', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 dark:border-warmGray-700 rounded-lg focus:border-brand-400 dark:focus:border-brand-500 focus:outline-none bg-white dark:bg-warmGray-900 text-gray-900 dark:text-warmGray-100"
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
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand-500 dark:border-brand-400 border-t-transparent mx-auto"></div>
            <p className="text-gray-500 dark:text-warmGray-300 mt-4">Loading challenges...</p>
          </div>
        ) : challenges.length === 0 ? (
          <div className="card text-center py-12">
            <h3 className="font-display text-xl text-brand-700 dark:text-brand-300 mb-2">No challenges yet</h3>
            <p className="text-sm text-gray-500 dark:text-warmGray-400 mb-6">Create a challenge to start tracking your gameplay</p>
            <Link href="/dashboard/new/challenge">
              <Button variant="primary">Create a Challenge</Button>
            </Link>
          </div>
        ) : filteredChallenges.length === 0 ? (
          <div className="card text-center py-12">
            <h3 className="font-display text-xl text-brand-700 dark:text-brand-300 mb-2">No matches</h3>
            <p className="text-sm text-gray-500 dark:text-warmGray-400 mb-6">Try adjusting your search or filters</p>
            <Button variant="outline" onClick={clearFilters}>Clear Filters</Button>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(challengesByStatus).map(([status, statusChallenges]) => (
              <div key={status} className="card">
                <h3 className="font-display text-lg text-gray-900 dark:text-warmGray-100 mb-6 flex items-center">
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                  <span className="ml-2 px-2 py-0.5 bg-gray-100 dark:bg-warmGray-800 text-gray-600 dark:text-warmGray-300 text-xs rounded-full">
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
  )
}