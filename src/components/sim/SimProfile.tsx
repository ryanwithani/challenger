'use client'

import { useState } from 'react'
import { Database } from '@/src/types/database.types'
import { SimOverview } from '@/src/components/sim/SimOverview'
import { SimAchievements } from '@/src/components/sim/SimAchievements'
import { SimRelationships } from '@/src/components/sim/SimRelationships'
import { SimTimeline } from '@/src/components/sim/SimTimeline'

type Sim = Database['public']['Tables']['sims']['Row']
type Challenge = Database['public']['Tables']['challenges']['Row']
type SimAchievement = Database['public']['Tables']['sim_achievements']['Row']

interface SimProfileProps {
    sim: Sim
    achievements: SimAchievement[]
    challenge: Challenge | null
}

export function SimProfile({ sim, achievements, challenge }: SimProfileProps) {
    const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'relationships' | 'timeline'>('overview')

    const tabs = [
        { id: 'overview', name: 'Overview', icon: '👤' },
        { id: 'achievements', name: 'Achievements', icon: '🏆' },
        { id: 'relationships', name: 'Family', icon: '👨‍👩‍👧‍👦' },
        { id: 'timeline', name: 'Timeline', icon: '📅' }
    ]

    return (
        <div className="space-y-6 min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${activeTab === tab.id
                                ? 'border-sims-green text-sims-green'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            <span className="mr-2">{tab.icon}</span>
                            {tab.name}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Tab Content */}
            <div className="mt-6">
                {activeTab === 'overview' && (
                    <SimOverview sim={sim} challenge={challenge} />
                )}

                {activeTab === 'achievements' && (
                    <SimAchievements sim={sim} achievements={achievements} />
                )}

                {activeTab === 'relationships' && (
                    <SimRelationships sim={sim} challenge={challenge} />
                )}

                {activeTab === 'timeline' && (
                    <SimTimeline sim={sim} achievements={achievements} />
                )}
            </div>
        </div>
    )
}