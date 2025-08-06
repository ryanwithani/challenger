import { useMemo } from 'react'
import { clsx } from 'clsx'

interface PointTrackerProps {
  totalPoints: number
  possiblePoints: number
  showMilestones?: boolean
  className?: string
}

export function PointTracker({ 
  totalPoints, 
  possiblePoints, 
  showMilestones = true,
  className 
}: PointTrackerProps) {
  const percentage = useMemo(() => {
    return possiblePoints > 0 ? (totalPoints / possiblePoints) * 100 : 0
  }, [totalPoints, possiblePoints])

  const milestones = useMemo(() => {
    if (!showMilestones || possiblePoints === 0) return []
    
    return [
      { percent: 25, label: '25%', points: Math.floor(possiblePoints * 0.25) },
      { percent: 50, label: '50%', points: Math.floor(possiblePoints * 0.50) },
      { percent: 75, label: '75%', points: Math.floor(possiblePoints * 0.75) },
      { percent: 100, label: '100%', points: possiblePoints },
    ]
  }, [possiblePoints, showMilestones])

  const getProgressColor = () => {
    if (percentage >= 100) return 'bg-sims-yellow'
    if (percentage >= 75) return 'bg-sims-green'
    if (percentage >= 50) return 'bg-sims-blue'
    if (percentage >= 25) return 'bg-sims-purple'
    return 'bg-sims-pink'
  }

  return (
    <div className={clsx('card sticky top-6', className)}>
      <h3 className="text-lg font-semibold mb-4">Progress Tracker</h3>
      
      {/* Points Display */}
      <div className="text-center mb-6">
        <div className="text-5xl font-bold text-gray-900 mb-1">
          {totalPoints}
        </div>
        <div className="text-gray-600">
          of {possiblePoints} points
        </div>
        <div className="text-sm text-gray-500 mt-1">
          {percentage.toFixed(1)}% Complete
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="relative">
        <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
          <div
            className={clsx(
              'h-full rounded-full transition-all duration-500 ease-out',
              getProgressColor()
            )}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
        
        {/* Milestone Markers */}
        {showMilestones && milestones.map((milestone) => (
          <div
            key={milestone.percent}
            className="absolute top-0 h-6 w-0.5 bg-gray-400"
            style={{ left: `${milestone.percent}%` }}
          >
            <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-500 whitespace-nowrap">
              {milestone.label}
            </span>
          </div>
        ))}
      </div>
      
      {/* Achievement Badges */}
      {percentage >= 100 && (
        <div className="mt-6 text-center">
          <div className="inline-flex items-center px-4 py-2 bg-sims-yellow/20 text-sims-yellow rounded-full">
            <span className="text-2xl mr-2">🏆</span>
            <span className="font-semibold">Challenge Complete!</span>
          </div>
        </div>
      )}
      
      {/* Milestone List */}
      {showMilestones && possiblePoints > 0 && (
        <div className="mt-6 space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Milestones</h4>
          {milestones.map((milestone) => {
            const isReached = totalPoints >= milestone.points
            return (
              <div
                key={milestone.percent}
                className={clsx(
                  'flex items-center justify-between text-sm',
                  isReached ? 'text-green-600' : 'text-gray-400'
                )}
              >
                <span className="flex items-center">
                  {isReached ? (
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" strokeWidth="2" />
                    </svg>
                  )}
                  {milestone.label}
                </span>
                <span>{milestone.points} pts</span>
              </div>
            )
          })}
        </div>
      )}
      
      {/* Encouragement Message */}
      {percentage > 0 && percentage < 100 && (
        <div className="mt-4 text-center text-sm text-gray-600">
          {percentage < 25 && "Great start! Keep going! 💪"}
          {percentage >= 25 && percentage < 50 && "You're making progress! 🌟"}
          {percentage >= 50 && percentage < 75 && "Halfway there! You've got this! 🎯"}
          {percentage >= 75 && percentage < 100 && "Almost done! Final stretch! 🏁"}
        </div>
      )}
    </div>
  )
}