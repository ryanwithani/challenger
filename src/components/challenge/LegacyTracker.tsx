'use client'

import { useCallback, useMemo, useState } from 'react'
import { Button } from '@/src/components/ui/Button'
import { Database } from '@/src/types/database.types'
import { LEGACY_CATEGORIES } from '@/src/components/challenge/GoalsSeeder'
import { SafeText } from '../ui/SafeText'
import { GoalCompletionModal } from './GoalCompletionModal'
import {
  safeParseCompletionDetails,
  safeParseThresholds,
  safeParseChallengeConfig,
  getParsedData,
  isParseSuccess,
  type ChallengeConfig
} from '@/src/lib/utils/safeParse'
import { LEGACY_RULES } from '@/src/data/legacy-rules'
import { LegacyRule, LegacyRules } from '@/src/types/legacy'

const formatRuleName = (rule: string | undefined): string => {
  if (!rule) return 'Not Set'
  return rule
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

const getRuleDescription = (
  ruleType: keyof LegacyRules,
  value: string
): string => {
  const rule = LEGACY_RULES[ruleType].find((r: LegacyRule) => r.value === value)
  return rule?.desc || 'No description available'
}

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
  onSelectHeir: (simId: string, generation: number) => Promise<void>
  calculatePoints: () => number
  calculateCategoryPoints: (category: string) => number
}

interface DifficultyBadgeProps {
  startType: string
}

function DifficultyBadge({ startType }: DifficultyBadgeProps) {
  const badgeStyles = {
    ultra_extreme: 'bg-red-50 text-red-700 border-red-200',
    extreme: 'bg-amber-50 text-amber-700 border-amber-200',
    regular: 'bg-green-50 text-green-700 border-green-200'
  }

  const style = badgeStyles[startType as keyof typeof badgeStyles] || badgeStyles.regular
  const label = formatRuleName(startType)

  return (
    <span
      className={`px-3 py-1.5 rounded-full text-sm font-semibold border ${style}`}
      aria-label={`Challenge difficulty: ${label} start`}
    >
      {label} Start
    </span>
  )
}

// ===== GENERATION CARD COMPONENT =====
interface GenerationCardProps {
  generation: number
  heir: Sim | null
  spouse: Sim | null
  children: Sim[]
  isActive: boolean
  onSelectHeir: (simId: string, generation: number) => void | Promise<void>
}

function GenerationCard({ generation, heir, spouse, children, isActive, onSelectHeir }: GenerationCardProps) {
  return (
    <div className={`relative rounded-xl p-6 border transition-colors ${isActive
      ? 'border-l-[3px] border-l-green-500 bg-green-50/50'
      : 'border-gray-200 bg-white hover:border-gray-300'
      }`}>
      {/* Generation Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg ${isActive ? 'bg-green-500' : 'bg-gray-500'
            }`}>
            {generation}
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Generation {generation}</h3>
            {isActive && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                Current
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Heir Section */}
      <div className="mb-6">
        <div className="flex items-center mb-3">

          <span className="text-sm font-semibold text-gray-700">Heir</span>
        </div>
        {heir ? (
          <div className="flex items-center space-x-3 p-3 bg-white rounded-xl border border-amber-200">
            <div className="w-12 h-12 bg-accent-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
              <SafeText>{heir?.name?.charAt(0) ?? ''}</SafeText>
            </div>
            <div>
              <div className="font-semibold text-gray-900"><SafeText>{heir.name}</SafeText></div>
              <div className="text-sm text-gray-500">Age: {heir.age_stage}</div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-xl">
            <span className="text-sm text-gray-500">No heir selected</span>
          </div>
        )}
      </div>

      {/* Spouse Section */}
      <div className="mb-6">
        <div className="flex items-center mb-3">
          <span className="text-sm font-semibold text-gray-700">Primary Spouse</span>
        </div>
        {spouse ? (
          <div className="flex items-center space-x-3 p-3 bg-white rounded-xl border border-pink-200">
            <div className="w-12 h-12 bg-brand-500 dark:bg-brand-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {spouse?.name?.charAt(0) ?? ''}
            </div>
            <div>
              <div className="font-semibold text-gray-900"><SafeText>{spouse.name}</SafeText></div>
              <div className="text-sm text-gray-500">Age: {spouse.age_stage}</div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-xl">
            <span className="text-sm text-gray-500">No spouse</span>
          </div>
        )}
      </div>

      {/* Children Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <span className="text-sm font-semibold text-gray-700">Children</span>
          </div>
          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
            {children.length}
          </span>
        </div>
        {children.length > 0 ? (
          <div className="space-y-2">
            {children.slice(0, 3).map((child) => (
              <div key={child.id} className="flex items-center justify-between p-3 bg-white rounded-xl border border-blue-200">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    <SafeText>{child?.name?.charAt(0) ?? ''}</SafeText>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900"><SafeText>{child.name}</SafeText></div>
                    <div className="text-xs text-gray-500">Age: {child.age_stage}</div>
                  </div>
                </div>
                {!heir && isActive && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onSelectHeir(child.id, generation)}
                    className="text-xs"
                  >
                    Make Heir
                  </Button>
                )}
              </div>
            ))}
            {children.length > 3 && (
              <div className="text-center text-sm text-gray-500 py-2">
                +{children.length - 3} more children
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-xl">
            <span className="text-sm text-gray-500">No children yet</span>
          </div>
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

  const handleSaveValue = async () => {
    try {
      await onUpdateGoalValue(goal.id, tempValue)
      setEditingValue(false)
    } catch (error) {
      console.error('Goal value update failed:', error)
    }
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
            onClick={() => {
              onOpenCompletionModal(goal)
            }}
            className="px-3 py-1 text-xs bg-green-500 hover:bg-green-600 text-white border-none"
          >
            Complete
          </Button>
        )
      } else {
        // Already completed - show green checkmark but allow unchecking
        return (
          <button
            onClick={async () => {
              try {
                await onToggleGoal(goal.id)
              } catch (error) {
                console.error('Goal toggle failed:', error)
              }
            }}
            className="w-8 h-8 rounded-xl border-2 flex items-center justify-center bg-green-500 border-green-500 text-white hover:bg-green-600 transition-all duration-300"
            title="Click to mark as incomplete"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
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
          onClick={async () => {
            try {
              await onToggleGoal(goal.id)
            } catch (error) {
              console.error('Milestone goal toggle failed:', error)
            }
          }}
          className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all duration-300 ${isCompleted
            ? 'bg-green-500 border-green-500 text-white'
            : 'border-gray-300 hover:border-green-400 hover:bg-green-50'
            }`}
          title={isCompleted ? "Click to mark as incomplete" : "Click to mark as complete"}
        >
          {isCompleted && (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
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
          <span className="px-3 py-2 bg-blue-100 text-blue-800 rounded-lg font-bold">
            {goal.current_value || 0}
          </span>

          {/* Add completion button */}
          <Button
            size="sm"
            onClick={() => {
              onOpenCompletionModal(goal)
            }}
            className="px-2 py-1 text-xs bg-green-500 hover:bg-green-600 text-white border-none"
          >
            +
          </Button>

          {/* Edit value button */}
          <button
            onClick={() => {
              setTempValue(goal.current_value || 0)
              setEditingValue(true)
            }}
            className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
            title="Edit value manually"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
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
            <div className="flex items-center space-x-2">
              <input
                type="number"
                value={tempValue}
                onChange={(e) => setTempValue(parseInt(e.target.value) || 0)}
                className="w-16 px-2 py-1 text-sm border-2 border-blue-200 rounded-lg focus:border-blue-400 focus:outline-none"
                min="0"
              />
              <button
                onClick={handleSaveValue}
                className="p-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                Save
              </button>
              <button
                onClick={() => setEditingValue(false)}
                className="p-1 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div
              className="flex items-center space-x-1 cursor-pointer hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors"
              onClick={() => {
                setTempValue(goal.current_value || 0)
                setEditingValue(true)
              }}
            >
              <span className="px-3 py-2 bg-blue-100 text-blue-800 rounded-lg font-bold">{goal.current_value || 0}</span>
            </div>
          )}
        </div>
      )
    }

    // Fallback for unknown goal types
    return (
      <button
        onClick={async () => {
          try {
            await onToggleGoal(goal.id)
          } catch (error) {
            console.error('Fallback goal toggle failed:', error)
          }
        }}
        className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all duration-300 ${isCompleted
          ? 'bg-green-500 border-green-500 text-white'
          : 'border-gray-300 hover:border-green-400 hover:bg-green-50'
          }`}
        title={isCompleted ? "Click to mark as incomplete" : "Click to mark as complete"}
      >
        {isCompleted ? (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        ) : (
          <span className="text-xs font-medium">✓</span>
        )}
      </button>
    )
  }

  const getGoalStatusText = useMemo(() => {
    if (goal.goal_type === 'threshold' && goal.thresholds) {
      const thresholdsResult = safeParseThresholds(goal.thresholds)
      if (!isParseSuccess(thresholdsResult)) {
        return `${goal.point_value || 0} points`
      }

      const thresholds = thresholdsResult.data
      const currentValue = goal.current_value || 0
      let currentPoints = 0

      for (const threshold of thresholds) {
        if (currentValue >= threshold.value) {
          currentPoints = threshold.points
        } else {
          break
        }
      }

      const maxPoints = Math.max(...thresholds.map(t => t.points))
      return `${currentPoints}/${maxPoints} points`
    }

    if (goal.goal_type === 'counter') {
      const currentValue = goal.current_value || 0
      const points = currentValue * (goal.point_value || 0)
      const maxPoints = goal.max_points || Infinity
      const actualPoints = Math.min(points, maxPoints)

      if (maxPoints < Infinity) {
        return `${actualPoints}/${maxPoints} points`
      } else {
        return `${actualPoints} points`
      }
    }

    return `${goal.point_value || 0} points`
  }, [goal.goal_type, goal.thresholds, goal.current_value, goal.point_value, goal.max_points])

  const completionProgress = progress.find(p => p.goal_id === goal.id)

  return (
    <div className={`relative rounded-xl p-5 border transition-colors ${isCompleted
      ? 'border-green-200 bg-green-50/50'
      : 'border-gray-200 bg-white hover:border-gray-300'
      }`}>
      {/* Goal Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h4 className={`font-bold text-lg ${isCompleted && goal.goal_type === 'milestone' ? 'line-through text-gray-500' : 'text-gray-900'}`}>
            {goal.title}
          </h4>
          {goal.description && (
            <p className="text-gray-600 mt-1">{goal.description}</p>
          )}
        </div>

        {/* Goal Controls */}
        <div className="ml-4">
          {renderGoalControl()}
        </div>
      </div>

      {/* Show completion details if completed */}
      {isCompleted && completionProgress?.completion_details && (() => {
        const detailsResult = safeParseCompletionDetails(completionProgress.completion_details as string)
        if (!isParseSuccess(detailsResult)) return null

        const details = detailsResult.data
        return (
          <div className="p-4 bg-emerald-100 rounded-xl border border-emerald-200 mb-4" role="status" aria-label="Goal completion details">
            <div className="font-semibold text-emerald-800 mb-2">Completed</div>
            <div className="space-y-1 text-sm text-emerald-700">
              <div><strong>Method:</strong> <SafeText>{details.method}</SafeText></div>
              {details.sim_name && (
                <div><strong>By:</strong> <SafeText>{details.sim_name}</SafeText></div>
              )}
              {details.notes && (
                <div><strong>Notes:</strong> <SafeText>{details.notes}</SafeText></div>
              )}
            </div>
          </div>
        )
      })()}

      {/* Goal Points and Progress */}
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold text-emerald-600">
          {getGoalStatusText}
        </div>
        {goal.goal_type === 'threshold' && goal.thresholds && (() => {
          const thresholdsResult = safeParseThresholds(goal.thresholds)
          if (!isParseSuccess(thresholdsResult)) return null

          const thresholds = thresholdsResult.data
          const currentValue = goal.current_value || 0
          const nextThreshold = thresholds.find(t => currentValue < t.value)

          return (
            <div className="text-xs text-gray-500">
              Next: {nextThreshold?.value || 'Max reached'}
            </div>
          )
        })()}
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
  const progressPercentage = category.maxPoints > 0 ? Math.min((currentPoints / category.maxPoints) * 100, 100) : 0

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 transition-colors">
      {/* Category Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center">
            <img src={category.icon} alt={category.name} width={40} height={40} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
            <p className="text-sm text-gray-600">{category.description}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xl font-semibold text-gray-900">{currentPoints}</div>
          <div className="text-sm text-gray-500">/ {category.maxPoints}</div>
          <div className="text-xs text-gray-400">{Math.round(progressPercentage)}%</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${category.color}`}
            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
          />
        </div>
      </div>

      {/* Goals */}
      {categoryGoals.length > 0 ? (
        <div className="space-y-4">
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
        <div className="flex items-center justify-center p-6 border border-dashed border-gray-300 rounded-lg">
          <span className="text-sm text-gray-500">No goals in this category</span>
        </div>
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

  const handleOpenCompletionModal = useCallback((goal: Goal) => {
    setGoalCompletionModal({ isOpen: true, goal });
  }, []);

  const handleCloseCompletionModal = useCallback(() => {
    setGoalCompletionModal({ isOpen: false, goal: null });
  }, []);

  const handleGoalCompletion = useCallback(async (goalId: string, simId: string, method: string, notes?: string) => {
    await onCompleteGoalWithDetails(goalId, simId, method, notes);
    handleCloseCompletionModal();
  }, [onCompleteGoalWithDetails, handleCloseCompletionModal]);

  // Parse challenge configuration safely
  const config = useMemo(() => {
    const configResult = safeParseChallengeConfig(challenge.configuration as string)
    return getParsedData(configResult, {
      start_type: 'regular',
      gender_law: 'traditional',
      bloodline_law: 'traditional',
      heir_selection: 'traditional',
      species_rule: 'traditional',
      expansion_packs: []
    } as ChallengeConfig)
  }, [challenge.configuration])
  const totalPoints = calculatePoints()


  // Group sims by generation
  const simsByGeneration = useMemo(() => {
    return sims.reduce<Record<number, Sim[]>>((acc, s) => {
      const gen = s.generation ?? 1;
      (acc[gen] ||= []).push(s);
      return acc;
    }, {});
  }, [sims]);


  const currentGeneration = useMemo(() => {
    const keys = Object.keys(simsByGeneration).map(Number);
    return Math.max(1, ...(keys.length ? keys : [1]));
  }, [simsByGeneration]);


  const tabs = [
    { id: 'overview', name: 'Overview' },
    { id: 'generations', name: 'Generations' },
    { id: 'scoring', name: 'Scoring' }
  ]

  return (
    <div className="min-h-screen bg-cozy-cream dark:bg-surface-dark p-6">
      <div className="max-w-[1400px] mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white dark:bg-surface-dark rounded-xl p-6 border border-gray-200 dark:border-warmGray-700">          {/* Row 1: Challenge Identity + Actions */}
          <div className="flex items-start justify-between gap-6 mb-6">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-semibold text-brand-600 dark:text-brand-400 mb-3">
                <SafeText>{challenge.name}</SafeText>
              </h1>

              {/* Metadata Bar */}
              <div className="flex flex-wrap items-center gap-4 text-base text-gray-600 dark:text-warmGray-200">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900 dark:text-warmGray-100">Generation {currentGeneration}</span>
                </div>

                <div className="w-px h-5 bg-gray-300" aria-hidden="true" />

                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900 dark:text-warmGray-100">{totalPoints}</span>
                  <span className="text-gray-400">/</span>
                  <span>100 pts</span>
                </div>

                <div className="w-px h-5 bg-gray-300" aria-hidden="true" />

                <DifficultyBadge startType={config.start_type || 'regular'} />
              </div>
            </div>

            {/* Actions */}
            <Button
              onClick={onAddSim}
              size="sm"
              variant="primary"
              aria-label="Add a new Sim to this challenge"
            >
              Add Sim
            </Button>
          </div>

          {/* Row 2: Challenge Rules (Compact Reference) */}
          <div className="pt-6 border-t border-gray-200 dark:border-brand-800">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Challenge Rules
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Gender Law', value: config.gender_law, type: 'genderLaw' as const },
                { label: 'Bloodline', value: config.bloodline_law, type: 'bloodlineLaw' as const },
                { label: 'Heir Selection', value: config.heir_selection, type: 'heirSelection' as const },
                { label: 'Species', value: config.species_rule, type: 'speciesRule' as const }
              ].map((rule, index) => (
                <div key={index} className="flex flex-col space-y-1">
                  <span className="text-xs font-medium text-gray-500 dark:text-warmGray-300 uppercase tracking-wide">
                    {rule.label}
                  </span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-warmGray-100">
                    {formatRuleName(rule.value)}
                  </span>
                  <span className="text-xs text-gray-600 dark:text-warmGray-200 leading-tight">
                    {getRuleDescription(rule.type, rule.value ?? '')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-warmGray-700">
          <nav className="flex gap-6" role="tablist" aria-label="Challenge sections">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls={`${tab.id}-panel`}
                id={`${tab.id}-tab`}
                className={`pb-3 text-sm font-medium transition-colors border-b-2 focus:outline-none ${activeTab === tab.id
                  ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                  : 'border-transparent text-gray-500 dark:text-warmGray-400 hover:text-gray-700 dark:hover:text-warmGray-200'
                  }`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-8">
          {activeTab === 'overview' && (
            <div className="space-y-8" role="tabpanel" id="overview-panel" aria-labelledby="overview-tab">
              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Generation', value: currentGeneration, valueClass: 'text-gray-900 dark:text-warmGray-100' },
                  { label: 'Sims', value: sims.length, valueClass: 'text-gray-900 dark:text-warmGray-100' },
                  { label: 'Goals', value: goals.length, valueClass: 'text-gray-900 dark:text-warmGray-100' },
                  { label: 'Score', value: `${totalPoints}/100`, valueClass: 'text-brand-500' }
                ].map((stat, index) => (
                  <div key={index} className="card">
                    <div className="text-sm text-gray-500 dark:text-warmGray-400 mb-1">{stat.label}</div>
                    <div className={`text-2xl font-semibold ${stat.valueClass}`}>
                      {stat.value}
                    </div>
                  </div>
                ))}
              </div>

              {/* Category Score Summary */}
              <div className="bg-white dark:bg-warmGray-900 rounded-xl p-6 border border-gray-200 dark:border-warmGray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-warmGray-100 mb-5">Category Progress</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Object.entries(LEGACY_CATEGORIES).map(([categoryId, categoryRaw]) => {
                    const category = categoryRaw as {
                      color: string;
                      name: string;
                      maxPoints: number;
                    };
                    const points = calculateCategoryPoints(categoryId)
                    const percentage = (points / category.maxPoints) * 100
                    return (
                      <div key={categoryId} className="p-4 rounded-lg bg-gray-50 dark:bg-warmGray-800 border border-gray-200 dark:border-warmGray-700">
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-semibold text-gray-900">{category.name}</span>
                          <span className="font-bold text-lg">{points}/{category.maxPoints}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                          <div
                            className={`h-3 rounded-full transition-all duration-500 ${category.color}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <div className="text-sm text-gray-500">{Math.round(percentage)}% complete</div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'generations' && (
            <div className="space-y-6" role="tabpanel" id="generations-panel" aria-labelledby="generations-tab">
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
                      onSelectHeir={async (simId) => {
                        try {
                          await onSelectHeir(simId, generation)
                        } catch (error) {
                          console.error('Failed to select heir:', error)
                        }
                      }}
                    />
                  )
                })}
              </div>
            </div>
          )}

          {activeTab === 'scoring' && (
            <div className="space-y-6" role="tabpanel" id="scoring-panel" aria-labelledby="scoring-tab">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
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

        {/* Footer */}
        <div className="mt-12 py-6 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div>© 2025 Sims Challenge Tracker. All rights reserved.</div>
            <div className="flex gap-6">
              <a href="#" className="hover:text-gray-900">Privacy Policy</a>
              <a href="#" className="hover:text-gray-900">Terms of Service</a>
              <a href="#" className="hover:text-gray-900">Support</a>
            </div>
          </div>
        </div>

        <GoalCompletionModal
          isOpen={goalCompletionModal.isOpen}
          onClose={handleCloseCompletionModal}
          goal={goalCompletionModal.goal}
          sims={sims}
          onComplete={handleGoalCompletion}
        />
      </div>
    </div>
  )
}