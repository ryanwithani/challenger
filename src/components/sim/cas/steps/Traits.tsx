import { TraitPickerPanel } from '@/src/components/ui/sim/TraitPickerPanel'
import { isInfant, isToddler } from '@/src/lib/sim/age'
import { useSimCAS } from '../useSimCAS'

export function TraitsStep() {
  const { age_stage, traits, patch } = useSimCAS()
  const max = (isInfant(age_stage) || isToddler(age_stage)) ? 1 : 3
  return (
    <TraitPickerPanel
      ageStage={age_stage}
      value={traits}
      onChange={(ids: string[]) => patch({ traits: ids })}
      max={max}
    />
  )
}