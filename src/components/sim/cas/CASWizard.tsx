'use client'
import clsx from 'clsx'
import { useSimCAS } from './useSimCAS'
import { BasicsStep } from './steps/Basics'
import { TraitsStep } from './steps/Traits'
import { PersonalityStep } from './steps/Personality'
import { ReviewStep } from './steps/Review'
import { Button } from '../../ui/Button'

export function CASWizard({ 
    onSubmit, 
    submitLabel = 'Create Sim',
    isSubmitting = false
  }:{
    onSubmit: (values:any)=>Promise<void>|void
    submitLabel?: string
    isSubmitting?: boolean
  }) {
  const { step, setStep, name, traits } = useSimCAS()

  const steps = [
    { id: 1, label: 'Basics' },
    { id: 2, label: 'Traits' },
    { id: 3, label: 'Personality' },
    { id: 4, label: 'Review' },
  ]

  // Minimal gating logic
  const canGoTo = (target: number) => {
    if (target <= step) return true
    // forward navigation checks
    if (step === 1) {
      if (!name?.trim()) return false
    }
    if (step === 2) {
      if (traits.length < 1) return false
      if (traits.length > 3) return false
    }
    if (step === 3) {
      // nothing mandatory; age gating handled in step
    }
    return true
  }

  const canNext = (() => {
    if (step === 1) return !!name?.trim()
    if (step === 2) {
      return traits.length <= 3 // 0..3 allowed
    }
    if (step === 3) return true
    if (step === 4) return true
    return false
  })()

  function next() { if (step < 4 && canNext) setStep(step + 1) }
  function back() { if (step > 1) setStep(step - 1) }

  return (
    <div className="mx-auto max-w-3xl space-y-6 bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50 p-6 rounded-3xl">
      {/* Stepper - now clickable back/within allowed */}
      <ol className="flex items-center gap-3 text-sm">
        {steps.map(s => {
          const active = step === s.id
          const allowed = s.id <= step || canGoTo(s.id)
          return (
            <li key={s.id}>
              <Button
  type="button"
  onClick={() => allowed && setStep(s.id)}
  variant={active ? "primary" : "ghost"}
  size="sm"
  className={clsx(!allowed && 'opacity-50 cursor-not-allowed')}
  disabled={!allowed}
>
  {s.label}
</Button>
            </li>
          )
        })}
      </ol>

      <div className="rounded-3xl border-2 border-gray-100 bg-white p-6 shadow-lg">
        {step === 1 && <BasicsStep />}
        {step === 2 && <TraitsStep />}
        {step === 3 && <PersonalityStep />}
        {step === 4 && <ReviewStep onSubmit={onSubmit} submitLabel={submitLabel} />}
      </div>

      {/* Footer nav */}
      <div className="flex items-center justify-between pt-2">
      <Button
  type="button"
  onClick={back}
  disabled={step === 1}
  variant="outline"
  size="md"
>
  Back
</Button>

        {step < 4 ? (
          <Button
          type="button"
          onClick={next}
          disabled={!canNext}
          variant="primary"
          size="md"
        >
          Continue
        </Button>
        ) : (
          <span className="text-sm text-gray-500">Review & submit above</span>
        )}
      </div>
    </div>
  )
}
