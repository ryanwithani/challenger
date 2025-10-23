import { TraitPickerPanel } from '@/src/components/sim/TraitPickerPanel'
import { useSimCAS } from '../useSimCAS'

export function TraitsStep() {
  const { age_stage, traits, patch } = useSimCAS()
  const max = 3
  return (
    <TraitPickerPanel
      value={traits}
      onChange={(ids: string[]) => patch({ traits: ids })}
      max={max}
    />
  )
}