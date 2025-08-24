'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSimStore } from '@/src/lib/store/simStore'
import { useChallengeStore } from '@/src/lib/store/challengeStore'
import { SimCard } from '@/src/components/ui/SimCard'
import { Button } from '@/src/components/ui/Button'

export default function SimsPage() {
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedChallenge, setSelectedChallenge] = useState<string>('all')
    const [generationFilter, setGenerationFilter] = useState<string>('all')

    const {
        familyMembers: allSims,
        loading: simsLoading,
        fetchAllSims
    } = useSimStore()

    const {
        challenges,
        fetchChallenges
    } = useChallengeStore()

    useEffect(() => {
        fetchAllSims()
        fetchChallenges()
    }, [])

    // Filter sims based on search and filters
    const filteredSims = allSims.filter(sim => {
        const matchesSearch = sim.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (sim.career && sim.career.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (sim.aspiration && sim.aspiration.toLowerCase().includes(searchTerm.toLowerCase()))

        const matchesChallenge = selectedChallenge === 'all' || sim.challenge_id === selectedChallenge

        const matchesGeneration = generationFilter === 'all' || sim.generation.toString() === generationFilter

        return matchesSearch && matchesChallenge && matchesGeneration
    })

    // Group sims by challenge
    const simsByChallenge = filteredSims.reduce((acc, sim) => {
        const challenge = challenges.find(c => c.id === sim.challenge_id)
        const challengeName = challenge?.name || 'Unknown Challenge'
        if (!acc[challengeName]) acc[challengeName] = []
        acc[challengeName].push(sim)
        return acc
    }, {} as Record<string, typeof allSims>)

    // Get unique generations
    const generations = Array.from(new Set(allSims.map(sim => sim.generation))).sort((a, b) => a - b)

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">All Sims</h1>
                    <p className="text-gray-600">
                        {filteredSims.length} of {allSims.length} sims
                        {searchTerm && ` matching "${searchTerm}"`}
                    </p>
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

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Search */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Search Sims
                        </label>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by name, career, or aspiration..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sims-green"
                        />
                    </div>

                    {/* Challenge Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Challenge
                        </label>
                        <select
                            value={selectedChallenge}
                            onChange={(e) => setSelectedChallenge(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sims-green"
                        >
                            <option value="all">All Challenges</option>
                            {challenges.map((challenge) => (
                                <option key={challenge.id} value={challenge.id}>
                                    {challenge.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Generation Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Generation
                        </label>
                        <select
                            value={generationFilter}
                            onChange={(e) => setGenerationFilter(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sims-green"
                        >
                            <option value="all">All Generations</option>
                            {generations.map((gen) => (
                                <option key={gen} value={gen.toString()}>
                                    Generation {gen}
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
                                setSelectedChallenge('all')
                                setGenerationFilter('all')
                            }}
                            className="w-full"
                        >
                            Clear Filters
                        </Button>
                    </div>
                </div>
            </div>

            {/* Content */}
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
            ) : filteredSims.length === 0 ? (
                <div className="text-center py-12">
                    <div className="text-4xl mb-4">🔍</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No sims match your filters</h3>
                    <p className="text-gray-600 mb-4">Try adjusting your search or filter criteria</p>
                    <Button
                        onClick={() => {
                            setSearchTerm('')
                            setSelectedChallenge('all')
                            setGenerationFilter('all')
                        }}
                    >
                        Clear All Filters
                    </Button>
                </div>
            ) : (
                <div className="space-y-8">
                    {Object.entries(simsByChallenge).map(([challengeName, sims]) => (
                        <div key={challengeName}>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold flex items-center">
                                    <span className="mr-2">🎯</span>
                                    {challengeName}
                                    <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                                        {sims.length} sim{sims.length !== 1 ? 's' : ''}
                                    </span>
                                </h3>

                                {/* Quick stats for this challenge */}
                                <div className="flex items-center space-x-4 text-sm text-gray-600">
                                    <span>👑 {sims.filter(s => s.is_heir).length} heir{sims.filter(s => s.is_heir).length !== 1 ? 's' : ''}</span>
                                    <span>🏠 {Math.max(...sims.map(s => s.generation))} generation{Math.max(...sims.map(s => s.generation)) !== 1 ? 's' : ''}</span>
                                </div>
                            </div>

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
    )
}