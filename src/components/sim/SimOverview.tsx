import { Database } from '@/src/types/database.types'
import { AvatarUpload } from '@/src/components/sim/AvatarUpload'
import { useSimStore } from '@/src/lib/store/simStore'
import { useChallengeStore } from '@/src/lib/store/challengeStore'
import Link from 'next/link'
import { useEffect, useState } from 'react'

type Sim = Database['public']['Tables']['sims']['Row']
type Challenge = Database['public']['Tables']['challenges']['Row']

interface SimOverviewProps {
    sim: Sim
    challenge: Challenge | null
}

export function SimOverview({ sim, challenge }: SimOverviewProps) {
    const traits = Array.isArray(sim.traits) ? sim.traits as string[] : []
    const { updateSim } = useSimStore()
    const { fetchChallenge } = useChallengeStore()
    const [linkedChallenge, setLinkedChallenge] = useState<Challenge | null>(challenge)

    // Fetch challenge if not provided or if sim has a different challenge_id
    useEffect(() => {
        if (sim.challenge_id && (!challenge || challenge.id !== sim.challenge_id)) {
            fetchChallenge(sim.challenge_id).then(() => {
                // The challenge will be available in the store after fetch
                const { currentChallenge } = useChallengeStore.getState()
                if (currentChallenge && currentChallenge.id === sim.challenge_id) {
                    setLinkedChallenge(currentChallenge)
                }
            })
        } else if (challenge) {
            setLinkedChallenge(challenge)
        }
    }, [sim.challenge_id, challenge, fetchChallenge])

    const getAgeStageIcon = (ageStage: string | null) => {
        switch (ageStage) {
            case 'baby': return '👶'
            case 'toddler': return '🧒'
            case 'child': return '👧'
            case 'teen': return '🧑‍🎓'
            case 'young_adult': return '🧑'
            case 'adult': return '👨'
            case 'elder': return '👴'
            default: return '👤'
        }
    }

    const getRelationshipIcon = (relationship: string | null) => {
        switch (relationship) {
            case 'spouse': return '💍'
            case 'child': return '👶'
            case 'parent': return '👨‍👩‍👧'
            default: return '👤'
        }
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Basic Information */}
            <div className="lg:col-span-2 space-y-6">
                {/* Personal Details */}
                <div className="bg-white rounded-2xl border-2 border-gray-100 p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <span className="mr-2">📋</span>
                        Personal Details
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Full Name</label>
                            <p className="text-lg font-medium text-gray-900">{sim.name}</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Age Stage</label>
                            <p className="text-lg flex items-center">
                                <span className="mr-2">{getAgeStageIcon(sim.age_stage)}</span>
                                {sim.age_stage?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Generation</label>
                            <p className="text-lg font-medium text-gray-900">Generation {sim.generation}</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Role</label>
                            <p className="text-lg flex items-center">
                                <span className="mr-2">{getRelationshipIcon(sim.relationship_to_heir)}</span>
                                {sim.is_heir ? 'Heir' : sim.relationship_to_heir?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Family Member'}
                            </p>
                        </div>

                        {sim.career && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Career</label>
                                <p className="text-lg font-medium text-gray-900">{sim.career}</p>
                            </div>
                        )}

                        {sim.aspiration && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Aspiration</label>
                                <p className="text-lg font-medium text-gray-900">{sim.aspiration}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Traits */}
                <div className="bg-white rounded-2xl border-2 border-gray-100 p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <span className="mr-2">✨</span>
                        Personality Traits
                    </h3>

                    {traits.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {traits.map((trait, index) => (
                                <span
                                    key={index}
                                    className="px-3 py-2 bg-sims-purple/20 text-sims-purple rounded-lg text-sm font-medium"
                                >
                                    {trait}
                                </span>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 italic">No traits assigned</p>
                    )}
                </div>

                {/* Challenge Information */}
                {linkedChallenge && (
                    <div className="bg-white rounded-2xl border-2 border-gray-100 p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                        <h3 className="text-lg font-semibold mb-4 flex items-center">
                            <span className="mr-2">🎯</span>
                            Challenge Details
                        </h3>

                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Challenge</label>
                                <p className="text-lg font-medium text-gray-900">{linkedChallenge.name}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Challenge Type</label>
                                <p className="text-lg font-medium text-gray-900 capitalize">
                                    {linkedChallenge.challenge_type?.replace('_', ' ')} Challenge
                                </p>
                            </div>

                            {linkedChallenge.description && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Description</label>
                                    <p className="text-gray-600">{linkedChallenge.description}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Quick Stats Sidebar */}
            <div className="space-y-6">
                {/* Status Card */}
                <div className="bg-gradient-to-br from-sims-green to-sims-blue rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="text-center">
                        <AvatarUpload
                            simId={sim.id}
                            currentAvatarUrl={sim.avatar_url}
                            onAvatarUpdate={(url) => {
                                // Update sim in store or trigger refetch
                                updateSim(sim.id, { avatar_url: url })
                            }}
                        />
                        <h3 className="text-xl font-bold mt-2">{sim.name}</h3>
                        <p className="opacity-90">Generation {sim.generation}</p>
                        {sim.is_heir && (
                            <span className="inline-block mt-2 px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
                                👑 Current Heir
                            </span>
                        )}
                    </div>
                </div>

                {/* Legacy Info */}
                <div className="bg-white rounded-2xl border-2 border-gray-100 p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                    <h3 className="text-lg font-semibold mb-4">Legacy Info</h3>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Linked Challenge</span>
                            <span className="text-sm font-medium">
                                {linkedChallenge?.id ? (
                                    <Link href={`/challenge/${linkedChallenge.id}`} className="text-blue-500 hover:text-blue-600">
                                        {linkedChallenge.name}
                                    </Link>
                                ) : (
                                    <span className="text-gray-500 italic">No challenge linked</span>
                                )}
                            </span>
                        </div>

                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Generation Status</span>
                            <span className={`text-sm font-medium ${sim.is_heir ? 'text-sims-green' : 'text-gray-600'}`}>
                                {sim.is_heir ? 'Active Heir' : 'Family Member'}
                            </span>
                        </div>

                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Traits Count</span>
                            <span className="text-sm font-medium">{traits.length}</span>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-2xl border-2 border-gray-100 p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                    <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>

                    <div className="space-y-2">
                        <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                            📝 Add Life Event
                        </button>
                        <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                            🎯 View Goals
                        </button>
                        <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                            👨‍👩‍👧‍👦 Family Tree
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}