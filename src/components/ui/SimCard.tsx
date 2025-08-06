import { Database } from '@/src/types/database.types'

type Sim = Database['public']['Tables']['sims']['Row']

interface SimCardProps {
  sim: Sim
}

export function SimCard({ sim }: SimCardProps) {
  const traits = Array.isArray(sim.traits) ? sim.traits : []
  
  return (
    <div className="card hover:shadow-lg transition-shadow">
      <h3 className="text-lg font-semibold mb-2">{sim.name}</h3>
      
      <div className="space-y-2 text-sm">
        <p className="text-gray-600">
          <span className="font-medium">Generation:</span> {sim.generation}
        </p>
        
        {sim.age_stage && (
          <p className="text-gray-600">
            <span className="font-medium">Age:</span> {sim.age_stage}
          </p>
        )}
        
        {sim.career && (
          <p className="text-gray-600">
            <span className="font-medium">Career:</span> {sim.career}
          </p>
        )}
        
        {traits.length > 0 && (
          <div>
            <span className="font-medium text-gray-600">Traits:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {traits.map((trait, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-sims-purple/20 text-sims-purple rounded text-xs"
                >
                  {String(trait)}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {sim.is_heir && (
          <span className="inline-block px-2 py-1 bg-sims-yellow/20 text-sims-yellow rounded text-xs font-medium">
            Heir
          </span>
        )}
      </div>
    </div>
  )
}