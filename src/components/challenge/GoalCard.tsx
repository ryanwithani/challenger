import { Database } from '@/src/types/database.types'
import { cn } from '@/src/lib/utils/cn'
import { Button } from '../ui/Button'

type Goal = Database['public']['Tables']['goals']['Row']

interface GoalCardProps {
  goal: Goal
  isCompleted: boolean
  onToggle: () => void
}

export function GoalCard({ goal, isCompleted, onToggle }: GoalCardProps) {
  return (
    <div className={cn('card', isCompleted && 'card--completed')}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="font-semibold text-lg mb-1 text-warmGray-900 dark:text-warmGray-50">{goal.title}</h4>
          {goal.description && (
            <p className="text-warmGray-600 dark:text-warmGray-400 text-sm mb-2">{goal.description}</p>
          )}
          <div className="flex items-center gap-4 text-sm">
            <span className="text-warmGray-500 dark:text-warmGray-400">
              {goal.point_value} {goal.point_value === 1 ? 'point' : 'points'}
            </span>
            {goal.category && (
              <span className="text-warmGray-500 dark:text-warmGray-400 capitalize">{goal.category}</span>
            )}
            {goal.is_required && (
              <span className="text-red-500 dark:text-red-400 font-medium">Required</span>
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