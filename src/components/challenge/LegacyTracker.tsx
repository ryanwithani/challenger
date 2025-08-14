'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/src/components/ui/Button'
import { Database } from '@/src/types/database.types'

type Challenge = Database['public']['Tables']['challenges']['Row']
type Sim = Database['public']['Tables']['sims']['Row']
type Goal = Database['public']['Tables']['goals']['Row']
type Progress = Database['public']['Tables']['progress']['Row']

interface LegacyTrackerProps {
  challenge: Challenge
  sims: Sim[]
  goals: Goal[]
  progress: Progress[]
  onAddSim: () => void
  onAddGoal: () => void
  onToggleGoal: (goalId: string) => void
  calculatePoints: () => number
}

// ===== LEGACY SCORING CATEGORIES =====
const scoringCategories = [
  {
    id: 'family',
    name: 'Family',
    maxPoints: 20,
    color: 'bg-red-500',
    description: 'Memorializations, unique spouses, family milestones',
    goals: [
      'Have all heirs memorialize previous generation',
      'Each spouse has unique traits (no repeats)',
      'Complete 10 generations',
      'Maintain family on original lot'
    ]
  },
  {
    id: 'fortune',
    name: 'Fortune',
    maxPoints: 20,
    color: 'bg-yellow-500',
    description: 'Net worth, inheritance, financial achievements',
    goals: [
      'Reach §100,000 net worth',
      'Each heir inherits properly',
      'Complete money-making aspirations',
      'Build valuable estate'
    ]
  },
  {
    id: 'knowledge',
    name: 'Knowledge', 
    maxPoints: 20,
    color: 'bg-blue-500',
    description: 'Skills mastered, careers completed, collections found',
    goals: [
      'Max 27 different skills across family',
      'Complete all career branches',
      'Finish 13+ collections',
      'Achieve knowledge aspirations'
    ]
  },
  {
    id: 'creative',
    name: 'Creative',
    maxPoints: 20,
    color: 'bg-purple-500', 
    description: 'Masterworks created, museum pieces, artistic achievements',
    goals: [
      'Create masterwork paintings/books/songs',
      'Donate items to museum',
      'Complete creative aspirations',
      'Build artistic legacy'
    ]
  },
  {
    id: 'love',
    name: 'Love',
    maxPoints: 10,
    color: 'bg-pink-500',
    description: 'Relationships, marriage, romance achievements',
    goals: [
      'Each generation finds soulmate',
      'Unique spouse traits',
      'Complete romance aspirations',
      'Maintain strong relationships'
    ]
  },
  {
    id: 'athletic',
    name: 'Athletic', 
    maxPoints: 10,
    color: 'bg-green-500',
    description: 'Fitness achievements, sports, physical goals',
    goals: [
      'Max fitness skill multiple times',
      'Win sports competitions',
      'Complete athletic aspirations',
      'Achieve physical milestones'
    ]
  }
]

// ===== GENERATION CARD COMPONENT =====
interface GenerationCardProps {
  generation: number
  heir: Sim | null
  spouse: Sim | null
  children: Sim[]
  isActive: boolean
  onSelectHeir: (sim: Sim) => void
}

function GenerationCard({ generation, heir, spouse, children, isActive, onSelectHeir }: GenerationCardProps) {
  return (
    <div className={`rounded-lg border-2 p-4 ${isActive ? 'border-sims-green bg-sims-green/5' : 'border-gray-200'}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">Generation {generation}</h3>
        {isActive && (
          <span className="px-2 py-1 bg-sims-green text-white text-xs rounded-full">Current</span>
        )}
      </div>
      
      {/* Heir */}
      <div className="mb-3">
        <div className="text-sm font-medium text-gray-700 mb-1">Heir</div>
        {heir ? (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-sims-blue rounded-full flex items-center justify-center text-white text-sm font-medium">
              {heir.name.charAt(0)}
            </div>
            <div>
              <div className="font-medium">{heir.name}</div>
              <div className="text-xs text-gray-500">Age: {heir.age_stage}</div>
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-500 italic">No heir selected</div>
        )}
      </div>

      {/* Spouse */}
      <div className="mb-3">
        <div className="text-sm font-medium text-gray-700 mb-1">Primary Spouse</div>
        {spouse ? (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
              {spouse.name.charAt(0)}
            </div>
            <div>
              <div className="font-medium">{spouse.name}</div>
              <div className="text-xs text-gray-500">Age: {spouse.age_stage}</div>
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-500 italic">No spouse</div>
        )}
      </div>

      {/* Children */}
      <div>
        <div className="text-sm font-medium text-gray-700 mb-1">Children ({children.length})</div>
        {children.length > 0 ? (
          <div className="space-y-1">
            {children.slice(0, 3).map((child) => (
              <div key={child.id} className="flex items-center justify-between text-sm">
                <span>{child.name}</span>
                {!heir && isActive && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onSelectHeir(child)}
                    className="text-xs py-1 px-2 h-6"
                  >
                    Make Heir
                  </Button>
                )}
              </div>
            ))}
            {children.length > 3 && (
              <div className="text-xs text-gray-500">+{children.length - 3} more</div>
            )}
          </div>
        ) : (
          <div className="text-sm text-gray-500 italic">No children yet</div>
        )}
      </div>
    </div>
  )
}

// ===== SCORING CATEGORY COMPONENT =====
interface ScoringCategoryProps {
  category: typeof scoringCategories[0]
  currentPoints: number
  goals: Goal[]
  progress: Progress[]
  onToggleGoal: (goalId: string) => void
}

function ScoringCategory({ category, currentPoints, goals, progress, onToggleGoal }: ScoringCategoryProps) {
  const categoryGoals = goals.filter(goal => goal.category === category.id)
  const completedGoals = categoryGoals.filter(goal => 
    progress.some(p => p.goal_id === goal.id)
  )
  
  const progressPercentage = category.maxPoints > 0 ? (currentPoints / category.maxPoints) * 100 : 0

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className={`w-4 h-4 rounded ${category.color}`}></div>
          <h3 className="font-semibold">{category.name}</h3>
        </div>
        <div className="text-right">
          <div className="font-bold text-lg">{currentPoints}/{category.maxPoints}</div>
          <div className="text-xs text-gray-500">{Math.round(progressPercentage)}% complete</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${category.color}`}
            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
          ></div>
        </div>
      </div>

      <p className="text-sm text-gray-600 mb-3">{category.description}</p>

      {/* Goals */}
      {categoryGoals.length > 0 ? (
        <div className="space-y-2">
          {categoryGoals.map((goal) => {
            const isCompleted = progress.some(p => p.goal_id === goal.id)
            return (
              <div key={goal.id} className="flex items-start space-x-2">
                <button
                  onClick={() => onToggleGoal(goal.id)}
                  className={`mt-1 w-4 h-4 rounded border-2 flex items-center justify-center ${
                    isCompleted 
                      ? 'bg-sims-green border-sims-green text-white' 
                      : 'border-gray-300 hover:border-sims-green'
                  }`}
                >
                  {isCompleted && (
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
                <div className="flex-1">
                  <div className={`text-sm ${isCompleted ? 'line-through text-gray-500' : ''}`}>
                    {goal.title}
                  </div>
                  {goal.description && (
                    <div className="text-xs text-gray-500 mt-1">{goal.description}</div>
                  )}
                  <div className="text-xs text-sims-green font-medium">
                    {goal.point_value} points
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-sm text-gray-500 italic">No goals added yet</div>
      )}
    </div>
  )
}

// ===== MAIN LEGACY TRACKER COMPONENT =====
export function LegacyTracker({ 
  challenge, 
  sims, 
  goals, 
  progress, 
  onAddSim, 
  onAddGoal, 
  onToggleGoal,
  calculatePoints 
}: LegacyTrackerProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'generations' | 'scoring'>('overview')
  
  // Parse challenge configuration
  const config = challenge.configuration as any || {}
  const totalPoints = calculatePoints()
  
  // Group sims by generation
  const simsByGeneration = sims.reduce((acc, sim) => {
    const gen = sim.generation || 1
    if (!acc[gen]) acc[gen] = []
    acc[gen].push(sim)
    return acc
  }, {} as Record<number, Sim[]>)

  // Find current generation (highest generation with sims)
  const currentGeneration = Math.max(...Object.keys(simsByGeneration).map(Number), 1)
  
  // Calculate points by category
  const pointsByCategory = scoringCategories.reduce((acc, category) => {
    const categoryGoals = goals.filter(goal => goal.category === category.id)
    const completedGoals = categoryGoals.filter(goal => 
      progress.some(p => p.goal_id === goal.id)
    )
    acc[category.id] = completedGoals.reduce((sum, goal) => sum + (goal.point_value || 0), 0)
    return acc
  }, {} as Record<string, number>)

  const tabs = [
    { id: 'overview', name: 'Overview', icon: '📊' },
    { id: 'generations', name: 'Generations', icon: '👨‍👩‍👧‍👦' },
    { id: 'scoring', name: 'Scoring', icon: '🏆' }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{challenge.name}</h1>
          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
            <span>Generation {currentGeneration}/10</span>
            <span>•</span>
            <span>Total Score: {totalPoints}/100</span>
            <span>•</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              config.start_type === 'ultra_extreme' ? 'bg-red-100 text-red-800' :
              config.start_type === 'extreme' ? 'bg-yellow-100 text-yellow-800' :
              'bg-green-100 text-green-800'
            }`}>
              {(config.start_type || 'regular').replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())} Start
            </span>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button onClick={onAddSim} size="sm">Add Sim</Button>
          <Button onClick={onAddGoal} size="sm" variant="outline">Add Goal</Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === tab.id
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
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
                <div className="text-2xl font-bold text-sims-green">{currentGeneration}</div>
                <div className="text-sm text-gray-600">Current Generation</div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
                <div className="text-2xl font-bold text-blue-600">{sims.length}</div>
                <div className="text-sm text-gray-600">Total Sims</div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
                <div className="text-2xl font-bold text-purple-600">{goals.length}</div>
                <div className="text-sm text-gray-600">Total Goals</div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
                <div className="text-2xl font-bold text-yellow-600">{totalPoints}/100</div>
                <div className="text-sm text-gray-600">Legacy Score</div>
              </div>
            </div>

            {/* Challenge Rules Summary */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold mb-3">Challenge Rules</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Gender Law:</span> {(config.gender_law || '').replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                </div>
                <div>
                  <span className="font-medium">Bloodline Law:</span> {(config.bloodline_law || '').replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                </div>
                <div>
                  <span className="font-medium">Heir Selection:</span> {(config.heir_selection || '').replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                </div>
                <div>
                  <span className="font-medium">Species Rule:</span> {(config.species_rule || '').replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                </div>
              </div>
            </div>

            {/* Recent Progress */}
            <div>
              <h3 className="font-semibold mb-3">Recent Progress</h3>
              {progress.length > 0 ? (
                <div className="space-y-2">
                  {progress.slice(-5).reverse().map((p) => {
                    const goal = goals.find(g => g.id === p.goal_id)
                    if (!goal) return null
                    return (
                      <div key={p.id} className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{goal.title}</div>
                          <div className="text-sm text-gray-600">+{goal.point_value} points</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-gray-500 italic">No progress yet - start completing goals!</div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'generations' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {Array.from({ length: 10 }, (_, i) => i + 1).map((generation) => {
                const generationSims = simsByGeneration[generation] || []
                const heir = generationSims.find(sim => sim.is_heir)
                const spouse = generationSims.find(sim => sim.relationship_to_heir === 'spouse')
                const children = generationSims.filter(sim => sim.relationship_to_heir === 'child')
                
                return (
                  <GenerationCard
                    key={generation}
                    generation={generation}
                    heir={heir || null}
                    spouse={spouse || null}
                    children={children}
                    isActive={generation === currentGeneration}
                    onSelectHeir={(sim) => {
                      // Handle heir selection logic here
                      console.log('Select heir:', sim)
                    }}
                  />
                )
              })}
            </div>
          </div>
        )}

        {activeTab === 'scoring' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {scoringCategories.map((category) => (
                <ScoringCategory
                  key={category.id}
                  category={category}
                  currentPoints={pointsByCategory[category.id] || 0}
                  goals={goals}
                  progress={progress}
                  onToggleGoal={onToggleGoal}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}