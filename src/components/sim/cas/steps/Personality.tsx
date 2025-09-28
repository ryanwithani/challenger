import { CareerPicker, CareerSelection } from '@/src/components/ui/sim/CareerPicker'
import { AspirationPicker } from '@/src/components/ui/sim/AspirationPicker'
import { isToddlerOrInfant } from '@/src/lib/sim/age'
import { useSimCAS } from '../useSimCAS'

export function PersonalityStep() {
  const { age_stage, career, aspiration, patch } = useSimCAS()
  const baby = isToddlerOrInfant(age_stage)

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Career</label>
        <CareerPicker
          ageStage={age_stage}
          value={career}
          onChange={(c: CareerSelection | null) => patch({ career: c })}
          ownedPacks={['Base Game']}
        />
        {baby && <p className="mt-1 text-xs text-gray-500">Unavailable for infants and toddlers.</p>}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Aspiration</label>
        <AspirationPicker
          ageStage={age_stage}
          value={aspiration}
          onChange={(a: string | null) => patch({ aspiration: a })}
          ownedPacks={['Base Game']}
        />
        {baby && <p className="mt-1 text-xs text-gray-500">Unavailable for infants and toddlers.</p>}
      </div>
    </div>
  )
}
