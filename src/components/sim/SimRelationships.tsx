import { useState, useEffect } from 'react'
import { Database } from '@/src/types/database.types'
import { useSimStore } from '@/src/lib/store/simStore'
import { SimCard } from '@/src/components/sim/SimCard'
import { Traits } from '@/src/components/sim/TraitsCatalog'

type Sim = Database['public']['Tables']['sims']['Row']
type Challenge = Database['public']['Tables']['challenges']['Row']

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

    const children = currentGeneration != null ? familyMembers.filter(member =>
        member.generation === currentGeneration + 1 &&
        member.relationship_to_heir === 'child'
    ) : []

    const siblings = currentGeneration != null ? familyMembers.filter(member =>
        member.generation === currentGeneration &&
        member.id !== sim.id &&
        member.relationship_to_heir !== 'spouse'
    ) : []

    const parents = currentGeneration != null ? familyMembers.filter(member =>
        member.generation === currentGeneration - 1
    ) : []

    return (
        <div className="space-y-6">
            {/* Family Tree Overview */}
            <div className="bg-white dark:bg-warmGray-900 rounded-lg border border-gray-200 dark:border-warmGray-800 p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center text-warmGray-900 dark:text-warmGray-50">
                    <span className="mr-2">🌳</span>
                    Family Tree
                </h3>

                <div className="space-y-6">
                    {/* Parents Generation */}
                    {parents.length > 0 && (
                        <div>
                            <h4 className="font-medium text-warmGray-700 dark:text-warmGray-300 mb-3">Parents (Generation {currentGeneration != null ? currentGeneration - 1 : '?'})</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {parents.map((parent) => (
                                    <div key={parent.id} className="rounded-xl bg-warmGray-50 dark:bg-warmGray-800 p-0.5">
                                        <SimCard sim={parent} traitCatalog={Traits} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Current Generation */}
                    <div>
                        <h4 className="font-medium text-warmGray-700 dark:text-warmGray-300 mb-3">Generation {currentGeneration}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Current Sim */}
                            <div className="relative">
                                <div className="rounded-xl bg-brand-50 dark:bg-brand-900/20 p-0.5">
                                    <SimCard sim={sim} traitCatalog={Traits} />
                                </div>
                                <span className="absolute -top-2 -right-2 px-2 py-1 bg-brand-500 text-white text-xs rounded-full">
                                    You
                                </span>
                            </div>

                            {/* Spouse */}
                            {spouse && (
                                <div className="rounded-xl bg-pink-50 dark:bg-pink-900/20 p-0.5">
                                    <SimCard sim={spouse} traitCatalog={Traits} />
                                </div>
                            )}

                            {/* Siblings */}
                            {siblings.map((sibling) => (
                                <div key={sibling.id} className="rounded-xl bg-blue-50 dark:bg-blue-900/20 p-0.5">
                                    <SimCard sim={sibling} traitCatalog={Traits} />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Children Generation */}
                    {children.length > 0 && (
                        <div>
                            <h4 className="font-medium text-warmGray-700 dark:text-warmGray-300 mb-3">Children (Generation {currentGeneration != null ? currentGeneration + 1 : '?'})</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {children.map((child) => (
                                    <div key={child.id} className="rounded-xl bg-yellow-50 dark:bg-yellow-900/20 p-0.5">
                                        <SimCard sim={child} traitCatalog={Traits} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {familyMembers.length === 1 && (
                    <div className="text-center py-8">
                        <div className="text-4xl mb-2">👨‍👩‍👧‍👦</div>
                        <h4 className="font-medium text-warmGray-700 dark:text-warmGray-300 mb-2">Start Your Family</h4>
                        <p className="text-warmGray-600 dark:text-warmGray-400 text-sm">
                            {sim.name} is ready to start their legacy! Add family members to see the family tree grow.
                        </p>
                    </div>
                )}
            </div>

            {/* Generation Overview */}
            <div className="bg-white dark:bg-warmGray-900 rounded-lg border border-gray-200 dark:border-warmGray-800 p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center text-warmGray-900 dark:text-warmGray-50">
                    <span className="mr-2">📊</span>
                    Generation Overview
                </h3>

                <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-warmGray-50 dark:bg-warmGray-800 rounded-lg">
                        <div className="text-2xl font-bold text-warmGray-900 dark:text-warmGray-50">{Object.keys(familyByGeneration).length}</div>
                        <div className="text-sm text-warmGray-600 dark:text-warmGray-400">Total Generations</div>
                    </div>
                    <div className="text-center p-4 bg-warmGray-50 dark:bg-warmGray-800 rounded-lg">
                        <div className="text-2xl font-bold text-warmGray-900 dark:text-warmGray-50">{familyMembers.length}</div>
                        <div className="text-sm text-warmGray-600 dark:text-warmGray-400">Family Members</div>
                    </div>
                    <div className="text-center p-4 bg-warmGray-50 dark:bg-warmGray-800 rounded-lg">
                        <div className="text-2xl font-bold text-warmGray-900 dark:text-warmGray-50">{children.length}</div>
                        <div className="text-sm text-warmGray-600 dark:text-warmGray-400">Children</div>
                    </div>
                </div>
            </div>
        </div>
    )
}
