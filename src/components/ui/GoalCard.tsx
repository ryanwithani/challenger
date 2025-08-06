import { Database } from '@/src/types/database.types'
import { Button } from './Button'

type Goal = Database['public']['Tables']['goals']['Row']

interface GoalCardProps {
  goal: Goal
  isCompleted: boolean
  onToggle: () => void
}

export function GoalCard({ goal, isCompleted, onToggle }: GoalCardProps) {
  return (
    <div className={`card ${isCompleted ? 'bg-green-50 border-green-200' : ''}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="font-semibold text-lg mb-1">{goal.title}</h4>
          {goal.description && (
            <p className="text-gray-600 text-sm mb-2">{goal.description}</p>
          )}
          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-500">
              {goal.point_value} {goal.point_value === 1 ? 'point' : 'points'}
            </span>
            {goal.category && (
              <span className="text-gray-500 capitalize">{goal.category}</span>
            )}
            {goal.is_required && (
              <span className="text-red-500 font-medium">Required</span>
            )}
          </div>
        </div>
        
        <Button
          onClick={onToggle}
          variant={isCompleted ? 'secondary' : 'outline'}
          size="sm"
        >
          {isCompleted ? 'Completed' : 'Mark Complete'}
        </Button>
      </div>
    </div>
  )
}