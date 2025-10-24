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
      className={`card mb-4 hover:shadow-lg transition-shadow cursor-pointer ${isActive
        ? 'border-2 border-purple-500 bg-purple-500/10 dark:bg-purple-500/20 shadow-md'
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
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
          <span className="text-xs font-medium text-green-500 uppercase tracking-wide">
            Active
          </span>
        </div>
      )}

      <h3 className={`text-xl font-semibold mb-2 ${isActive ? 'text-purple-500' : 'text-gray-900 dark:text-gray-100'
        }`}>
        <SafeText>{challenge.name}</SafeText>
      </h3>

      {challenge.description && (
        <p className={`text-sm mb-4 ${isActive ? 'text-purple-500' : 'text-gray-600 dark:text-gray-400'
          }`}>
          <SafeText>{challenge.description}</SafeText>
        </p>
      )}

      <div className={`flex justify-between items-center text-sm ${isActive ? 'text-purple-500' : 'text-gray-500 dark:text-gray-400'
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