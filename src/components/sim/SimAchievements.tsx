import { Database } from '@/src/types/database.types'
import { SafeText } from '../ui/SafeText'

type Sim = Database['public']['Tables']['sims']['Row']
type SimAchievement = Database['public']['Tables']['sim_achievements']['Row']

interface SimAchievementsProps {
    sim: Sim
    achievements: SimAchievement[]
}

export function SimAchievements({ sim, achievements }: SimAchievementsProps) {
    const totalPoints = achievements.reduce((sum, achievement) => sum + (achievement.points_earned ?? 0), 0)

    const getMethodIcon = (method: string) => {
        const iconMap: Record<string, string> = {
            'painting': '🎨',
            'song': '🎵',
            'book': '📚',
            'photograph': '📸',
            'sculpture': '🗿',
            'cooking': '👨‍🍳',
            'fitness': '💪',
            'charisma': '🗣️',
            'logic': '🧠',
            'programming': '💻',
            'writing': '✍️',
            'completed': '✅',
            'achieved': '🏆',
        }
        return iconMap[method.toLowerCase()] || '⭐'
    }

    const getCategoryColor = (goalTitle: string) => {
        const title = goalTitle.toLowerCase()

        if (title.includes('memorialize') || title.includes('creative')) return 'bg-brand-100 dark:bg-brand-900/30 text-brand-800 dark:text-brand-300 border-brand-200 dark:border-brand-800'
        if (title.includes('skill') || title.includes('knowledge')) return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800'
        if (title.includes('aspiration') || title.includes('athletic')) return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800'
        if (title.includes('fortune') || title.includes('wealth')) return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800'
        if (title.includes('family') || title.includes('generation')) return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800'
        if (title.includes('food') || title.includes('cooking')) return 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 border-orange-200 dark:border-orange-800'
        if (title.includes('collection') || title.includes('nature')) return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
        if (title.includes('party') || title.includes('popularity')) return 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'

        return 'bg-warmGray-100 dark:bg-warmGray-800 text-warmGray-800 dark:text-warmGray-300 border-warmGray-200 dark:border-warmGray-700'
    }

    // Group achievements by category
    const achievementsByCategory = achievements.reduce((acc, achievement) => {
        const title = achievement.goal_title.toLowerCase()
        let category = 'Other'

        if (title.includes('memorialize') || title.includes('creative')) category = 'Creative'
        else if (title.includes('skill') || title.includes('knowledge')) category = 'Knowledge'
        else if (title.includes('aspiration') || title.includes('athletic')) category = 'Athletic'
        else if (title.includes('fortune') || title.includes('wealth')) category = 'Fortune'
        else if (title.includes('family') || title.includes('generation')) category = 'Family'
        else if (title.includes('food') || title.includes('cooking')) category = 'Food'
        else if (title.includes('collection') || title.includes('nature')) category = 'Nature'
        else if (title.includes('party') || title.includes('popularity')) category = 'Popularity'

        if (!acc[category]) acc[category] = []
        acc[category].push(achievement)
        return acc
    }, {} as Record<string, SimAchievement[]>)

    return (
        <div className="space-y-6">
            {/* Achievement Summary */}
            <div className="bg-brand-500 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <h2><SafeText className="text-2xl font-bold">{sim.name}</SafeText>'s Achievements</h2>
                        <p className="opacity-90">Legacy contributions and accomplishments</p>
                    </div>
                    <div className="text-right">
                        <div className="text-3xl font-bold">{achievements.length}</div>
                        <div className="text-sm opacity-90">Total Achievements</div>
                    </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div>
                            <div className="text-xl font-bold">{totalPoints}</div>
                            <div className="text-xs opacity-90">Points Earned</div>
                        </div>
                        <div>
                            <div className="text-xl font-bold">{Object.keys(achievementsByCategory).length}</div>
                            <div className="text-xs opacity-90">Categories</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Achievements by Category */}
            {achievements.length > 0 ? (
                <div className="space-y-6">
                    {Object.entries(achievementsByCategory).map(([category, categoryAchievements]) => (
                        <div key={category} className="bg-white dark:bg-warmGray-900 rounded-2xl border border-warmGray-100 dark:border-warmGray-800 p-6 shadow-sm transition-colors">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold">{category} Achievements</h3>
                                <span className="text-sm text-warmGray-500 dark:text-warmGray-400">
                                    {categoryAchievements.length} achievement{categoryAchievements.length !== 1 ? 's' : ''}
                                </span>
                            </div>

                            <div className="space-y-3">
                                {categoryAchievements
                                    .sort((a, b) => new Date(b.achieved_at ?? '').getTime() - new Date(a.achieved_at ?? '').getTime())
                                    .map((achievement) => (
                                        <div
                                            key={achievement.id}
                                            className={`border rounded-2xl p-4 ${getCategoryColor(achievement.goal_title)}`}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-start space-x-3">
                                                    <span className="text-2xl">{getMethodIcon(achievement.completion_method)}</span>
                                                    <div className="flex-1">
                                                        <h4 className="font-semibold">{achievement.goal_title}</h4>
                                                        <div className="text-sm opacity-75 mt-1">
                                                            <span className="font-medium">Method:</span> {achievement.completion_method}
                                                        </div>
                                                        {achievement.notes && (
                                                            <div className="text-sm opacity-75 mt-1">
                                                                <span className="font-medium">Notes:</span> {achievement.notes}
                                                            </div>
                                                        )}
                                                        <div className="text-xs opacity-60 mt-2">
                                                            {achievement.achieved_at ? (
                                                                <>Achieved on {new Date(achievement.achieved_at).toLocaleDateString()}</>
                                                            ) : (
                                                                <>Not yet achieved</>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-bold text-lg">+{achievement.points_earned}</div>
                                                    <div className="text-xs opacity-75">points</div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                /* No Achievements State */
                <div className="text-center py-12">
                    <div className="text-6xl mb-4">🏆</div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-warmGray-100 mb-2">No Achievements Yet</h3>
                    <p className="text-gray-600 dark:text-warmGray-200 mb-4">
                        <SafeText>{sim.name}</SafeText> hasn't completed any goals yet. Start playing and achieving goals to see them here!
                    </p>
                    <div className="bg-warmGray-50 dark:bg-warmGray-800 rounded-2xl p-4 max-w-md mx-auto">
                        <p className="text-sm text-gray-600 dark:text-warmGray-200">
                            💡 <strong>Tip:</strong> Achievements are earned when you complete goals in the challenge.
                            Visit the Scoring tab to mark goals as complete and they'll appear here.
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
}