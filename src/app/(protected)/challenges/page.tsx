'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useChallengeStore } from '@/src/lib/store/challengeStore'
import { ChallengeTile } from '@/src/components/ui/ChallengeTile'
import { Button } from '@/src/components/ui/Button'

export default function ChallengesPage() {
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [typeFilter, setTypeFilter] = useState<string>('all')

    const { challenges, fetchChallenges, loading } = useChallengeStore()

    useEffect(() => {
        fetchChallenges()
    }, [])

    // Filter challenges based on search and filters
    const filteredChallenges = challenges.filter(challenge => {
        const matchesSearch = challenge.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (challenge.description && challenge.description.toLowerCase().includes(searchTerm.toLowerCase()))

        const matchesStatus = statusFilter === 'all' || challenge.status === statusFilter

        const matchesType = typeFilter === 'all' || challenge.challenge_type === typeFilter

        return matchesSearch && matchesStatus && matchesType
    })

    // Group challenges by status
    const challengesByStatus = filteredChallenges.reduce((acc, challenge) => {
        const status = challenge.status || 'unknown'
        if (!acc[status]) acc[status] = []
        acc[status].push(challenge)
        return acc
    }, {} as Record<string, typeof challenges>)

    // Get unique challenge types
    const challengeTypes = Array.from(new Set(challenges.map(c => c.challenge_type).filter(Boolean)))

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'active': return '⚡'
            case 'completed': return '✅'
            case 'paused': return '⏸️'
            case 'archived': return '📦'
            default: return '❓'
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'text-green-600'
            case 'completed': return 'text-blue-600'
            case 'paused': return 'text-yellow-600'
            case 'archived': return 'text-gray-600'
            default: return 'text-gray-600'
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">All Challenges</h1>
                    <p className="text-gray-600">
                        {filteredChallenges.length} of {challenges.length} challenges
                        {searchTerm && ` matching "${searchTerm}"`}
                    </p>
                </div>
                <Link href="/challenge/new">
                    <Button>Create New Challenge</Button>
                </Link>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center">
                        <span className="text-2xl mr-3">⚡</span>
                        <div>
                            <p className="text-sm text-gray-600">Active</p>
                            <p className="text-xl font-semibold">
                                {challenges.filter(c => c.status === 'active').length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center">
                        <span className="text-2xl mr-3">✅</span>
                        <div>
                            <p className="text-sm text-gray-600">Completed</p>
                            <p className="text-xl font-semibold">
                                {challenges.filter(c => c.status === 'completed').length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center">
                        <span className="text-2xl mr-3">🎯</span>
                        <div>
                            <p className="text-sm text-gray-600">Legacy</p>
                            <p className="text-xl font-semibold">
                                {challenges.filter(c => c.challenge_type === 'legacy').length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center">
                        <span className="text-2xl mr-3">📅</span>
                        <div>
                            <p className="text-sm text-gray-600">This Month</p>
                            <p className="text-xl font-semibold">
                                {challenges.filter(c => {
                                    const challengeDate = new Date(c.created_at)
                                    const now = new Date()
                                    return challengeDate.getMonth() === now.getMonth() &&
                                        challengeDate.getFullYear() === now.getFullYear()
                                }).length}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Search */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Search Challenges
                        </label>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by name or description..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sims-green"
                        />
                    </div>

                    {/* Status Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Status
                        </label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sims-green"
                        >
                            <option value="all">All Statuses</option>
                            <option value="active">Active</option>
                            <option value="completed">Completed</option>
                            <option value="paused">Paused</option>
                            <option value="archived">Archived</option>
                        </select>
                    </div>

                    {/* Type Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Type
                        </label>
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sims-green"
                        >
                            <option value="all">All Types</option>
                            {challengeTypes.map((type) => (
                                <option key={type} value={type || ''}>
                                    {type?.charAt(0).toUpperCase()}{type?.slice(1)} Challenge
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Clear Filters */}
                    <div className="flex items-end">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setSearchTerm('')
                                setStatusFilter('all')
                                setTypeFilter('all')
                            }}
                            className="w-full"
                        >
                            Clear Filters
                        </Button>
                    </div>
                </div>
            </div>

            {/* Content */}
            {loading ? (
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
            ) : filteredChallenges.length === 0 ? (
                <div className="text-center py-12">
                    <div className="text-4xl mb-4">🔍</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No challenges match your filters</h3>
                    <p className="text-gray-600 mb-4">Try adjusting your search or filter criteria</p>
                    <Button
                        onClick={() => {
                            setSearchTerm('')
                            setStatusFilter('all')
                            setTypeFilter('all')
                        }}
                    >
                        Clear All Filters
                    </Button>
                </div>
            ) : (
                <div className="space-y-8">
                    {Object.entries(challengesByStatus).map(([status, statusChallenges]) => (
                        <div key={status}>
                            <h3 className={`text-lg font-semibold mb-4 flex items-center ${getStatusColor(status)}`}>
                                <span className="mr-2">{getStatusIcon(status)}</span>
                                {status.charAt(0).toUpperCase() + status.slice(1)} Challenges
                                <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                                    {statusChallenges.length}
                                </span>
                            </h3>

                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {statusChallenges
                                    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
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