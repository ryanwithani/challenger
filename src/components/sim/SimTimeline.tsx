import { useState, useEffect } from 'react'
import { Database } from '@/src/types/database.types'
import { useSimStore } from '@/src/lib/store/simStore'
import { SimCard } from '@/src/components/sim/SimCard'

type Sim = Database['public']['Tables']['sims']['Row']
type Challenge = Database['public']['Tables']['challenges']['Row']
type SimAchievement = Database['public']['Tables']['sim_achievements']['Row']

interface SimTimelineProps {
    sim: Sim
    achievements: SimAchievement[]
}

export function SimTimeline({ sim, achievements }: SimTimelineProps) {
    // Create timeline events from sim data and achievements
    const timelineEvents = [
        {
            id: 'birth',
            date: sim.created_at,
            type: 'milestone',
            title: `${sim.name} was born`,
            description: `Generation ${sim.generation} • ${sim.age_stage?.replace('_', ' ')}`,
            icon: '👶'
        },
        ...achievements.map(achievement => ({
            id: achievement.id,
            date: achievement.achieved_at,
            type: 'achievement',
            title: achievement.goal_title,
            description: `Completed via ${achievement.completion_method}${achievement.notes ? ` • ${achievement.notes}` : ''}`,
            icon: '🏆',
            points: achievement.points_earned
        }))
    ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    const getEventColor = (type: string) => {
        switch (type) {
            case 'milestone': return 'bg-blue-500'
            case 'achievement': return 'bg-green-500'
            case 'relationship': return 'bg-pink-500'
            case 'career': return 'bg-brand-500'
            default: return 'bg-gray-500'
        }
    }

    return (
        <div className="space-y-6">
            {/* Timeline Header */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-2 flex items-center">
                    <span className="mr-2">📅</span>
                    {sim.name}'s Timeline
                </h3>
                <p className="text-gray-600">Key moments and achievements in their legacy journey</p>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                {timelineEvents.length > 0 ? (
                    <div className="relative">
                        {/* Timeline line */}
                        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>

                        <div className="space-y-6">
                            {timelineEvents.map((event, index) => (
                                <div key={event.id} className="relative flex items-start space-x-4">
                                    {/* Timeline dot */}
                                    <div className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full ${getEventColor(event.type)} text-white text-xl`}>
                                        {event.icon}
                                    </div>

                                    {/* Event content */}
                                    <div className="flex-1 min-w-0 pb-6">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-gray-900">{event.title}</h4>
                                                <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                                                <p className="text-xs text-gray-500 mt-2">
                                                    {new Date(event.date).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}
                                                </p>
                                            </div>

                                            {event.type === 'achievement' && 'points' in event && (
                                                <div className="ml-4 text-right">
                                                    <div className="font-bold text-green-600">+{event.points}</div>
                                                    <div className="text-xs text-gray-500">points</div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <div className="text-4xl mb-2">📅</div>
                        <h4 className="font-medium text-gray-700 mb-2">Timeline Starting</h4>
                        <p className="text-gray-600 text-sm">
                            {sim.name}'s story is just beginning. Achievements and milestones will appear here as they happen.
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}