'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/src/components/ui/Button'
import { Database } from '@/src/types/database.types'
import { LEGACY_CATEGORIES } from '@/src/components/challenge/GoalsSeeder'
import { GoalCompletionModal } from './GoalCompletionModal'

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
  onToggleGoal: (goalId: string) => void
  onUpdateGoalValue: (goalId: string, newValue: number) => void
  onCompleteGoalWithDetails: (goalId: string, simId: string, method: string, notes?: string) => Promise<void>
  onSelectHeir: (simId: string, generation: number) => Promise<void> // Add this
  calculatePoints: () => number
  calculateCategoryPoints: (category: string) => number
}

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

// ===== GOAL COMPONENT FOR DIFFERENT TYPES =====
interface GoalComponentProps {
  goal: Goal
  progress: Progress[]
  sims: Sim[]
  onToggleGoal: (goalId: string) => void
  onUpdateGoalValue: (goalId: string, newValue: number) => void
  onOpenCompletionModal: (goal: Goal) => void
}

function GoalComponent({
  goal,
  progress,
  sims,
  onToggleGoal,
  onUpdateGoalValue,
  onOpenCompletionModal
}: GoalComponentProps) {
  const [editingValue, setEditingValue] = useState(false)
  const [tempValue, setTempValue] = useState(goal.current_value || 0)

  const isCompleted = progress.some(p => p.goal_id === goal.id)

  const handleSaveValue = () => {
    onUpdateGoalValue(goal.id, tempValue)
    setEditingValue(false)
  }

  // Determine if this goal needs the enhanced completion modal
  const needsEnhancedCompletion = () => {
    const title = goal.title.toLowerCase()
    const description = goal.description?.toLowerCase() || ''

    return (
      title.includes('memorialize') ||
      title.includes('creative aspiration') ||
      title.includes('aspiration') ||
      title.includes('collection') ||
      (title.includes('skill') && title.includes('max')) ||
      description.includes('memorialize') ||
      description.includes('aspiration')
    )
  }

  const renderGoalControl = () => {
    // For milestone goals that need enhanced completion
    if (goal.goal_type === 'milestone' && needsEnhancedCompletion()) {
      if (!isCompleted) {
        return (
          <Button
            size="sm"
            onClick={() => onOpenCompletionModal(goal)}
            className="px-3 py-1 text-xs bg-sims-green text-white hover:bg-sims-green/90"
          >
            Complete
          </Button>
        )
      } else {
        // Already completed - show green checkmark but allow unchecking
        return (
          <button
            onClick={() => onToggleGoal(goal.id)}
            className="w-4 h-4 rounded border-2 flex items-center justify-center bg-sims-green border-sims-green text-white hover:bg-sims-green/80"
            title="Click to mark as incomplete"
          >
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </button>
        )
      }
    }

    // For simple milestone goals (no enhanced completion needed)
    if (goal.goal_type === 'milestone') {
      return (
        <button
          onClick={() => onToggleGoal(goal.id)}
          className={`w-4 h-4 rounded border-2 flex items-center justify-center ${isCompleted
            ? 'bg-sims-green border-sims-green text-white hover:bg-sims-green/80'
            : 'border-gray-300 hover:border-sims-green'
            }`}
          title={isCompleted ? "Click to mark as incomplete" : "Click to mark as complete"}
        >
          {isCompleted && (
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )}
        </button>
      )
    }

    // For counter goals that need enhanced completion (like memorialize)
    if ((goal.goal_type === 'counter' || goal.goal_type === 'threshold') && needsEnhancedCompletion()) {
      return (
        <div className="flex items-center space-x-2">
          {/* Show current value */}
          <span className="font-mono text-sm font-bold">{goal.current_value || 0}</span>

          {/* Add completion button */}
          <Button
            size="sm"
            onClick={() => onOpenCompletionModal(goal)}
            className="px-2 py-1 text-xs bg-sims-green text-white hover:bg-sims-green/90"
          >
            +
          </Button>

          {/* Edit value button */}
          <button
            onClick={() => {
              setTempValue(goal.current_value || 0)
              setEditingValue(true)
            }}
            className="p-1 hover:bg-gray-100 rounded"
            title="Edit value manually"
          >
            <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </button>
        </div>
      )
    }

    // For regular counter/threshold goals
    if (goal.goal_type === 'counter' || goal.goal_type === 'threshold') {
      return (
        <div className="flex items-center space-x-2">
          {editingValue ? (
            <div className="flex items-center space-x-1">
              <input
                type="number"
                value={tempValue}
                onChange={(e) => setTempValue(parseInt(e.target.value) || 0)}
                className="w-16 px-2 py-1 text-sm border rounded"
                min="0"
              />
              <Button size="sm" onClick={handleSaveValue} className="px-2 py-1 text-xs">
                ✓
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setEditingValue(false)}
                className="px-2 py-1 text-xs"
              >
                ✕
              </Button>
            </div>
          ) : (
            <div
              className="flex items-center space-x-1 cursor-pointer hover:bg-gray-100 px-2 py-1 rounded"
              onClick={() => {
                setTempValue(goal.current_value || 0)
                setEditingValue(true)
              }}
            >
              <span className="font-mono text-sm font-bold">{goal.current_value || 0}</span>
              <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            </div>
          )}
        </div>
      )
    }

    // Fallback for unknown goal types
    return (
      <button
        onClick={() => onToggleGoal(goal.id)}
        className={`w-4 h-4 rounded border-2 flex items-center justify-center ${isCompleted
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
    )
  }

  const getGoalStatusText = () => {
    if (goal.goal_type === 'threshold' && goal.thresholds) {
      const thresholds = JSON.parse(goal.thresholds)
      const currentValue = goal.current_value || 0
      let currentPoints = 0

      for (const threshold of thresholds) {
        if (currentValue >= threshold.value) {
          currentPoints = threshold.points
        } else {
          break
        }
      }

      return `${currentPoints}/${Math.max(...thresholds.map((t: any) => t.points))} points`
    }

    if (goal.goal_type === 'counter') {
      const currentValue = goal.current_value || 0
      const points = currentValue * goal.point_value
      const maxPoints = goal.max_points || Infinity
      const actualPoints = Math.min(points, maxPoints)

      if (maxPoints < Infinity) {
        return `${actualPoints}/${maxPoints} points`
      } else {
        return `${actualPoints} points`
      }
    }

    return `${goal.point_value} points`
  }

  const completionProgress = progress.find(p => p.goal_id === goal.id)

  return (
    <div className={`flex items-start space-x-3 p-3 border rounded-lg ${isCompleted ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
      }`}>
      <div className="mt-1">
        {renderGoalControl()}
      </div>
      <div className="flex-1">
        <div className={`font-medium ${isCompleted && goal.goal_type === 'milestone' ? 'line-through text-gray-500' : ''}`}>
          {goal.title}
        </div>
        {goal.description && (
          <div className="text-sm text-gray-600 mt-1">{goal.description}</div>
        )}

        {/* Show completion details if completed */}
        {isCompleted && completionProgress?.completion_details && (
          <div className="text-sm text-green-700 mt-2 p-2 bg-green-100 rounded">
            <div className="font-medium">Completed:</div>
            <div>Method: {JSON.parse(completionProgress.completion_details).method}</div>
            {JSON.parse(completionProgress.completion_details).sim_name && (
              <div>By: {JSON.parse(completionProgress.completion_details).sim_name}</div>
            )}
            {JSON.parse(completionProgress.completion_details).notes && (
              <div>Notes: {JSON.parse(completionProgress.completion_details).notes}</div>
            )}
          </div>
        )}

        <div className="text-sm text-sims-green font-medium mt-1">
          {getGoalStatusText()}
        </div>
        {goal.goal_type === 'threshold' && goal.thresholds && (
          <div className="text-xs text-gray-500 mt-1">
            Next: {JSON.parse(goal.thresholds).find((t: any) => (goal.current_value || 0) < t.value)?.value || 'Max reached'}
          </div>
        )}
      </div>
    </div>
  )
}

// ===== SCORING CATEGORY COMPONENT =====
interface ScoringCategoryProps {
  categoryId: string
  currentPoints: number
  goals: Goal[]
  progress: Progress[]
  sims: Sim[]
  onToggleGoal: (goalId: string) => void
  onUpdateGoalValue: (goalId: string, newValue: number) => void
  onOpenCompletionModal: (goal: Goal) => void
}

function ScoringCategory({
  categoryId,
  currentPoints,
  goals,
  progress,
  sims,
  onToggleGoal,
  onUpdateGoalValue,
  onOpenCompletionModal
}: ScoringCategoryProps) {
  const category = LEGACY_CATEGORIES[categoryId as keyof typeof LEGACY_CATEGORIES]
  if (!category) return null

  const categoryGoals = goals.filter(goal => goal.category === categoryId)
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
        <div className="space-y-3">
          {categoryGoals.map((goal) => (
            <GoalComponent
              key={goal.id}
              goal={goal}
              progress={progress}
              sims={sims}
              onToggleGoal={onToggleGoal}
              onUpdateGoalValue={onUpdateGoalValue}
              onOpenCompletionModal={onOpenCompletionModal}
            />
          ))}
        </div>
      ) : (
        <div className="text-sm text-gray-500 italic">No goals in this category</div>
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
  onToggleGoal,
  onUpdateGoalValue,
  onCompleteGoalWithDetails,
  calculatePoints,
  calculateCategoryPoints,
  onSelectHeir
}: LegacyTrackerProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'generations' | 'scoring'>('overview')
  const [goalCompletionModal, setGoalCompletionModal] = useState<{
    isOpen: boolean
    goal: Goal | null
  }>({
    isOpen: false,
    goal: null
  })

  const handleOpenCompletionModal = (goal: Goal) => {
    setGoalCompletionModal({
      isOpen: true,
      goal: goal
    })
  }

  const handleCloseCompletionModal = () => {
    setGoalCompletionModal({
      isOpen: false,
      goal: null
    })
  }

  const handleGoalCompletion = async (goalId: string, simId: string, method: string, notes?: string) => {
    // This function should be passed from the store
    await onCompleteGoalWithDetails(goalId, simId, method, notes)
    handleCloseCompletionModal()
  }

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
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.start_type === 'ultra_extreme' ? 'bg-red-100 text-red-800' :
              config.start_type === 'extreme' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>
              {(config.start_type || 'regular').replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())} Start
            </span>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button onClick={onAddSim} size="sm">Add Sim</Button>
          {/* No Add Goal button for Legacy challenges - they come pre-seeded */}
        </div>
      </div>

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

            {/* Category Score Summary */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold mb-3">Category Scores</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                {Object.entries(LEGACY_CATEGORIES).map(([categoryId, categoryRaw]) => {
                  const category = categoryRaw as {
                    color: string;
                    name: string;
                    maxPoints: number;
                  };
                  return (
                    <div key={categoryId} className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded ${category.color}`}></div>
                      <span className="font-medium">{category.name}:</span>
                      <span>{calculateCategoryPoints(categoryId)}/{category.maxPoints}</span>
                    </div>
                  );
                })}
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
                    onSelectHeir={async (sim) => {
                      try {
                        await onSelectHeir(sim.id, generation) // Use the prop function
                      } catch (error) {
                        console.error('Failed to select heir:', error)
                        // Could add toast notification here
                      }
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
              {Object.keys(LEGACY_CATEGORIES).map((categoryId) => (
                <ScoringCategory
                  key={categoryId}
                  categoryId={categoryId}
                  currentPoints={calculateCategoryPoints(categoryId)}
                  goals={goals}
                  progress={progress}
                  sims={sims}
                  onToggleGoal={onToggleGoal}
                  onUpdateGoalValue={onUpdateGoalValue}
                  onOpenCompletionModal={handleOpenCompletionModal}
                />
              ))}
            </div>
          </div>
        )}
      </div>
      <GoalCompletionModal
        isOpen={goalCompletionModal.isOpen}
        onClose={handleCloseCompletionModal}
        goal={goalCompletionModal.goal}
        sims={sims}
        onComplete={handleGoalCompletion}
      />
    </div>
  )
}