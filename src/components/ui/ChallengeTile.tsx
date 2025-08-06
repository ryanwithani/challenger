import { Database } from '@/src/types/database.types'

type Challenge = Database['public']['Tables']['challenges']['Row']

interface ChallengeTileProps {
  challenge: Challenge
}

export function ChallengeTile({ challenge }: ChallengeTileProps) {
  return (
    <div className="card hover:shadow-lg transition-shadow cursor-pointer">
      <h3 className="text-xl font-semibold mb-2">{challenge.name}</h3>
      {challenge.description && (
        <p className="text-gray-600 text-sm mb-4">{challenge.description}</p>
      )}
      <div className="flex justify-between items-center text-sm text-gray-500">
        <span className="capitalize">{challenge.template_type || 'Custom'}</span>
        <span>{new Date(challenge.created_at).toLocaleDateString()}</span>
      </div>
    </div>
  )
}