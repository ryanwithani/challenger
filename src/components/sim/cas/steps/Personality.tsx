import { CareerPicker, CareerSelection } from '@/src/components/sim/CareerPicker'
import { AspirationPicker } from '@/src/components/sim/AspirationPicker'
import { useSimCAS } from '../useSimCAS'

export function PersonalityStep() {
  const { age_stage, career, aspiration, patch } = useSimCAS()

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Career</label>
        <CareerPicker
          value={career}
          onChange={(c: CareerSelection | null) => patch({ career: c })}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Aspiration</label>
        <AspirationPicker
          ageStage={age_stage}
          value={aspiration}
          onChange={(a: string | null) => patch({ aspiration: a })}
        />
      </div>
    </div>
  )
}
