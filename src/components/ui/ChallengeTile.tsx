import { Database } from '@/src/types/database.types'

type Challenge = Database['public']['Tables']['challenges']['Row']

interface ChallengeTileProps {
  challenge: Challenge
}

export function ChallengeTile({ challenge }: ChallengeTileProps) {
  const isActive = challenge.status === 'active'
  
  return (
    <div className={`card hover:shadow-lg transition-shadow cursor-pointer ${
      isActive 
        ? 'border-2 border-brand-primary bg-brand-primary/10 shadow-md' 
        : ''
    }`}>
      {/* Active status indicator */}
      {isActive && (
        <div className="flex items-center mb-3">
          <div className="w-2 h-2 bg-brand-accent rounded-full animate-pulse mr-2"></div>
          <span className="text-xs font-medium text-brand-accent uppercase tracking-wide">
            Active
          </span>
        </div>
      )}
      
      <h3 className={`text-xl font-semibold mb-2 ${
        isActive ? 'text-brand-primary' : ''
      }`}>
        {challenge.name}
      </h3>
      
      {challenge.description && (
        <p className={`text-sm mb-4 ${
          isActive ? 'text-brand-primary' : 'text-gray-600'
        }`}>
          {challenge.description}
        </p>
      )}
      
      <div className={`flex justify-between items-center text-sm ${
        isActive ? 'text-brand-primary' : 'text-gray-500'
      }`}>
        <span className="capitalize">{challenge.challenge_type || 'Custom'}</span>
        <span>{new Date(challenge.created_at).toLocaleDateString()}</span>
      </div>
    </div>
  )
}