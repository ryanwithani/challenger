import { useState, useEffect } from 'react'
import { Database } from '@/src/types/database.types'
import { useSimStore } from '@/src/lib/store/simStore'
import { SimCard } from '@/src/components/ui/sim/SimCard'

type Sim = Database['public']['Tables']['sims']['Row']
type Challenge = Database['public']['Tables']['challenges']['Row']
type SimAchievement = Database['public']['Tables']['sim_achievements']['Row']

// ===== SIM RELATIONSHIPS COMPONENT =====
interface SimRelationshipsProps {
    sim: Sim
    challenge: Challenge | null
}

export function SimRelationships({ sim, challenge }: SimRelationshipsProps) {
    const { familyMembers, fetchFamilyMembers } = useSimStore()

    useEffect(() => {
        if (challenge?.id) {
            fetchFamilyMembers(challenge.id)
        }
    }, [challenge?.id])

    // Group family members by generation
    const familyByGeneration = familyMembers.reduce((acc, member) => {
        const gen = member.generation || 1
        if (!acc[gen]) acc[gen] = []
        acc[gen].push(member)
        return acc
    }, {} as Record<number, Sim[]>)

    // Get family relationships
    const currentGeneration = sim.generation
    const spouse = familyMembers.find(member =>
        member.generation === currentGeneration &&
        member.relationship_to_heir === 'spouse' &&
        member.id !== sim.id
    )

    const children = familyMembers.filter(member =>
        member.generation === currentGeneration + 1 &&
        member.relationship_to_heir === 'child'
    )

    const siblings = familyMembers.filter(member =>
        member.generation === currentGeneration &&
        member.id !== sim.id &&
        member.relationship_to_heir !== 'spouse'
    )

    const parents = familyMembers.filter(member =>
        member.generation === currentGeneration - 1
    )

    return (
        <div className="space-y-6">
            {/* Family Tree Overview */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <span className="mr-2">🌳</span>
                    Family Tree
                </h3>

                <div className="space-y-6">
                    {/* Parents Generation */}
                    {parents.length > 0 && (
                        <div>
                            <h4 className="font-medium text-gray-700 mb-3">Parents (Generation {currentGeneration - 1})</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {parents.map((parent) => (
                                    <SimCard key={parent.id} sim={parent} className="bg-gray-50" />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Current Generation */}
                    <div>
                        <h4 className="font-medium text-gray-700 mb-3">Generation {currentGeneration}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Current Sim */}
                            <div className="relative">
                                <SimCard sim={sim} showProfileLink={false} className="bg-sims-green/10 border-sims-green" />
                                <span className="absolute -top-2 -right-2 px-2 py-1 bg-sims-green text-white text-xs rounded-full">
                                    You
                                </span>
                            </div>

                            {/* Spouse */}
                            {spouse && (
                                <SimCard sim={spouse} className="bg-pink-50" />
                            )}

                            {/* Siblings */}
                            {siblings.map((sibling) => (
                                <SimCard key={sibling.id} sim={sibling} className="bg-blue-50" />
                            ))}
                        </div>
                    </div>

                    {/* Children Generation */}
                    {children.length > 0 && (
                        <div>
                            <h4 className="font-medium text-gray-700 mb-3">Children (Generation {currentGeneration + 1})</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {children.map((child) => (
                                    <SimCard key={child.id} sim={child} className="bg-yellow-50" />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {familyMembers.length === 1 && (
                    <div className="text-center py-8">
                        <div className="text-4xl mb-2">👨‍👩‍👧‍👦</div>
                        <h4 className="font-medium text-gray-700 mb-2">Start Your Family</h4>
                        <p className="text-gray-600 text-sm">
                            {sim.name} is ready to start their legacy! Add family members to see the family tree grow.
                        </p>
                    </div>
                )}
            </div>

            {/* Generation Overview */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <span className="mr-2">📊</span>
                    Generation Overview
                </h3>

                <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-gray-900">{Object.keys(familyByGeneration).length}</div>
                        <div className="text-sm text-gray-600">Total Generations</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-gray-900">{familyMembers.length}</div>
                        <div className="text-sm text-gray-600">Family Members</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-gray-900">{children.length}</div>
                        <div className="text-sm text-gray-600">Children</div>
                    </div>
                </div>
            </div>
        </div>
    )
}