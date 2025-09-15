import Link from 'next/link'
import { Database } from '@/src/types/database.types'
import { useChallengeStore } from '@/src/lib/store/challengeStore'

type Sim = Database['public']['Tables']['sims']['Row']
type Challenge = Database['public']['Tables']['challenges']['Row']

interface SimCardProps {
  sim: Sim
  showProfileLink?: boolean
  className?: string
}

export function SimCard({ sim, showProfileLink = true, className = '' }: SimCardProps) {
  const traits = Array.isArray(sim.traits) ? sim.traits : []
  const { challenges } = useChallengeStore()
  const getAgeStageIcon = (ageStage: string | null) => {
    switch (ageStage) {
      case 'baby': return '👶'
      case 'toddler': return '🧒'
      case 'child': return '👧'
      case 'teen': return '🧑‍🎓'
      case 'young_adult': return '🧑'
      case 'adult': return '👨'
      case 'elder': return '👴'
      default: return '👤'
    }
  }

  const getSimAvatar = (sim: Sim) => {
    if (sim.avatar_url) {
      return (
        <img
          src={sim.avatar_url}
          alt={sim.name}
          className="w-8 h-8 rounded-full object-cover"
        />
      )
    }
    return <span className="text-2xl">{getAgeStageIcon(sim.age_stage)}</span>
  }

  const getChallengeName = (challenge_id: string) => {
    const challenge = challenges.find((c: Challenge) => c.id === challenge_id)
    return challenge?.name || 'Unknown Challenge'
  }

  const CardContent = () => (
    <div className={`card hover:shadow-lg transition-shadow ${className}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          {getSimAvatar(sim)}
          <div>
            <h3 className="text-lg font-semibold">{sim.name}</h3>
            <p className="text-sm text-gray-600">{getChallengeName(sim.challenge_id || '')}</p>
          </div>
        </div>

        <div className="flex flex-col items-end space-y-1">
          {sim.is_heir && (
            <span className="inline-block px-2 py-1 bg-sims-yellow/20 text-sims-yellow rounded text-xs font-medium">
              👑 Heir
            </span>
          )}
          {sim.relationship_to_heir === 'spouse' && (
            <span className="inline-block px-2 py-1 bg-pink-100 text-pink-800 rounded text-xs font-medium">
              💍 Spouse
            </span>
          )}
        </div>
      </div>

      <div className="space-y-2 text-sm">
        {sim.age_stage && (
          <p className="text-gray-600">
            <span className="font-medium">Age:</span> {sim.age_stage.replace('_', ' ')}
          </p>
        )}

        {sim.career && (
          <p className="text-gray-600">
            <span className="font-medium">Career:</span> {sim.career}
          </p>
        )}

        {sim.aspiration && (
          <p className="text-gray-600">
            <span className="font-medium">Aspiration:</span> {sim.aspiration}
          </p>
        )}

        {traits.length > 0 && (
          <div>
            <span className="font-medium text-gray-600">Traits:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {traits.slice(0, 3).map((trait, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-sims-purple/20 text-sims-purple rounded text-xs"
                >
                  {String(trait)}
                </span>
              ))}
              {traits.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                  +{traits.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {showProfileLink && (
        <div className="mt-4 pt-3 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">
              Added {new Date(sim.created_at).toLocaleDateString()}
            </span>
            <span className="text-xs text-sims-blue hover:text-sims-blue/80 font-medium">
              View Profile →
            </span>
          </div>
        </div>
      )}
    </div>
  )

  if (showProfileLink) {
    return (
      <Link href={`/sim/${sim.id}`} className="block">
        <CardContent />
      </Link>
    )
  }

  return <CardContent />
}