'use client'

import { useState } from 'react'
import { Database } from '@/src/types/database.types'
import SimOverview from '@/src/components/sim/SimOverview'
import { SimAchievements } from '@/src/components/sim/SimAchievements'
import { SimRelationships } from '@/src/components/sim/SimRelationships'
import { SimTimeline } from '@/src/components/sim/SimTimeline'
import { TbUser, TbTrophy, TbUsers, TbCalendar } from 'react-icons/tb'

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
        { id: 'overview', name: 'Overview', icon: <TbUser className="w-4 h-4" /> },
        { id: 'achievements', name: 'Achievements', icon: <TbTrophy className="w-4 h-4" /> },
        { id: 'relationships', name: 'Family', icon: <TbUsers className="w-4 h-4" /> },
        { id: 'timeline', name: 'Timeline', icon: <TbCalendar className="w-4 h-4" /> },
    ]

    return (
        <div className="space-y-6 p-4">
            {/* Tabs */}
            <div className="border-b border-warmGray-200 dark:border-warmGray-700">
                <nav className="-mb-px flex space-x-8">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`inline-flex items-center gap-1.5 py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${activeTab === tab.id
                                ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                                : 'border-transparent text-warmGray-500 dark:text-warmGray-400 hover:text-warmGray-700 dark:hover:text-warmGray-200 hover:border-warmGray-300 dark:hover:border-warmGray-600'
                                }`}
                        >
                            {tab.icon}
                            {tab.name}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Tab Content */}
            <div className="mt-6">
                {activeTab === 'overview' && (
                    <SimOverview sim={sim as any} challenge={challenge as any} />
                )}

                {activeTab === 'achievements' && (
                    <SimAchievements sim={sim as any} achievements={achievements as any} />
                )}

                {activeTab === 'relationships' && (
                    <SimRelationships sim={sim as any} challenge={challenge as any} />
                )}

                {activeTab === 'timeline' && (
                    <SimTimeline sim={sim} achievements={achievements} />
                )}
            </div>
        </div>
    )
}