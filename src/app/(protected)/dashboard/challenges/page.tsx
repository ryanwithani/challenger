'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { useChallengeStore } from '@/src/lib/store/challengeStore'
import { ChallengeTile } from '@/src/components/challenge/ChallengeTile'
import { Button } from '@/src/components/ui/Button'
import { Input } from '@/src/components/ui/Input'
import { ErrorMessage } from '@/src/components/ui/ErrorMessage'
import { cn } from '@/src/lib/utils/cn'
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-warmGray-50">
              All Challenges
            </h1>
            <p className="text-sm text-gray-500 dark:text-warmGray-400 mt-1">
              {filteredChallenges.length} of {challenges.length} challenges
              {filters.searchTerm && ` matching "${filters.searchTerm}"`}
            </p>
          </div>
          <Link href="/dashboard/new/challenge">
            <Button variant="primary" size="sm">
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {[
            { label: 'Active', value: stats.active, icon: TbBolt, iconColor: 'text-amber-500 dark:text-amber-400', iconBg: 'bg-amber-100 dark:bg-amber-900/30' },
            { label: 'Completed', value: stats.completed, icon: TbCheck, iconColor: 'text-green-600 dark:text-green-400', iconBg: 'bg-green-100 dark:bg-green-900/30' },
            { label: 'Legacy', value: stats.legacy, icon: TbTarget, iconColor: 'text-brand-500 dark:text-brand-400', iconBg: 'bg-brand-100 dark:bg-brand-900/40' },
            { label: 'This Month', value: stats.thisMonth, icon: TbCalendar, iconColor: 'text-blue-500 dark:text-blue-400', iconBg: 'bg-blue-100 dark:bg-blue-900/30' }
          ].map((stat) => (
            <div key={stat.label} className="card flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-warmGray-400">{stat.label}</p>
                <p className="mt-1 font-display text-3xl font-bold text-gray-900 dark:text-warmGray-50">{stat.value}</p>
              </div>
              <div className={cn('rounded-lg p-2.5', stat.iconBg)}>
                <stat.icon className={cn('w-5 h-5', stat.iconColor)} />
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
          <div className="space-y-6">
            {Object.entries(challengesByStatus).map(([status, statusChallenges]) => (
              <div key={status} className="card !p-0 overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-warmGray-800">
                  <h3 className="font-display text-lg font-semibold text-gray-900 dark:text-warmGray-100">
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </h3>
                  <span className="px-2.5 py-0.5 bg-gray-100 dark:bg-warmGray-800 text-gray-600 dark:text-warmGray-300 text-xs font-medium rounded-full">
                    {statusChallenges.length}
                  </span>
                </div>
                <div className="p-6">
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
              </div>
            ))}
          </div>
        )}
      </div>
  )
}