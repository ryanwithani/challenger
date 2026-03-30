import { Database } from '@/src/types/database.types'
import { SafeText } from '../ui/SafeText'

type Challenge = Database['public']['Tables']['challenges']['Row']

interface ChallengeTileProps {
  challenge: Challenge
}

export function ChallengeTile({ challenge }: ChallengeTileProps) {
  const isActive = challenge.status === 'active'

  return (
    <div
      className={`card mb-4 cursor-pointer transition-colors hover:bg-brand-50/30 dark:hover:bg-warmGray-850 ${isActive
        ? 'border-l-[3px] border-l-brand-500 dark:border-l-brand-400'
        : ''
        }`}
      role="button"
      tabIndex={0}
      aria-label={`${challenge.name} challenge card`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          // Add navigation logic here if needed
        }
      }}
    >
      {/* Active status indicator */}
      {isActive && (
        <div className="flex items-center mb-3">
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></div>
          <span className="text-xs font-medium text-green-600 dark:text-green-400 uppercase tracking-wide">
            Active
          </span>
        </div>
      )}

      <h3 className={`text-xl font-semibold mb-2 ${isActive ? 'text-brand-500 dark:text-brand-400' : 'text-gray-900 dark:text-warmGray-100'
        }`}>
        <SafeText>{challenge.name}</SafeText>
      </h3>

      {challenge.description && (
        <p className={`text-sm mb-4 ${isActive ? 'text-brand-600 dark:text-brand-400' : 'text-gray-600 dark:text-warmGray-200'
          }`}>
          <SafeText>{challenge.description}</SafeText>
        </p>
      )}

      <div className={`flex justify-between items-center text-sm ${isActive ? 'text-brand-600 dark:text-brand-400' : 'text-gray-500 dark:text-warmGray-300'
        }`}>
        <span className="capitalize">{challenge.challenge_type || 'Custom'}</span>
        <span>
          {challenge.created_at
            ? new Date(challenge.created_at).toLocaleDateString()
            : ''}
        </span>
      </div>
    </div>
  )
}