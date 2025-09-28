'use client'
import clsx from 'clsx'
import { useSimCAS } from './useSimCAS'
import { BasicsStep } from './steps/Basics'
import { TraitsStep } from './steps/Traits'
import { PersonalityStep } from './steps/Personality'
import { ReviewStep } from './steps/Review'
import { isInfant, isToddlerOrInfant } from '@/src/lib/sim/age'

export function CASWizard({ onSubmit, submitLabel = 'Create Sim' }:{
  onSubmit: (values:any)=>Promise<void>|void
  submitLabel?: string
}) {
  const { step, setStep, name, age_stage, traits, career, aspiration } = useSimCAS()

  const steps = [
    { id: 1, label: 'Basics' },
    { id: 2, label: 'Traits' },
    { id: 3, label: 'Personality' },
    { id: 4, label: 'Review' },
  ]

  // Minimal gating logic
  const reqTraits = (isInfant(age_stage) || age_stage === 'toddler') ? 1 : 0

  const canGoTo = (target: number) => {
    if (target <= step) return true
    // forward navigation checks
    if (step === 1) {
      if (!name?.trim()) return false
    }
    if (step === 2) {
      if (reqTraits === 1 && traits.length < 1) return false
      if (traits.length > (reqTraits === 1 ? 1 : 3)) return false
    }
    if (step === 3) {
      // nothing mandatory; age gating handled in step
    }
    return true
  }

  const canNext = (() => {
    if (step === 1) return !!name?.trim()
    if (step === 2) {
      if (reqTraits === 1) return traits.length === 1
      return traits.length <= 3 // 0..3 allowed
    }
    if (step === 3) return true
    if (step === 4) return true
    return false
  })()

  function next() { if (step < 4 && canNext) setStep(step + 1) }
  function back() { if (step > 1) setStep(step - 1) }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      {/* Stepper - now clickable back/within allowed */}
      <ol className="flex items-center gap-2 text-sm">
        {steps.map(s => {
          const active = step === s.id
          const allowed = s.id <= step || canGoTo(s.id)
          return (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => allowed && setStep(s.id)}
                className={clsx(
                  'rounded-md px-2 py-1',
                  active ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
                  !allowed && 'opacity-50 cursor-not-allowed'
                )}
              >
                {s.label}
              </button>
            </li>
          )
        })}
      </ol>

      <div className="rounded-lg border p-4">
        {step === 1 && <BasicsStep />}
        {step === 2 && <TraitsStep />}
        {step === 3 && <PersonalityStep />}
        {step === 4 && <ReviewStep onSubmit={onSubmit} submitLabel={submitLabel} />}
      </div>

      {/* Footer nav */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={back}
          disabled={step === 1}
          className={clsx(
            'rounded-md border border-gray-300 bg-white px-4 py-2 text-sm hover:bg-gray-50',
            step === 1 && 'opacity-50 cursor-not-allowed'
          )}
        >
          Back
        </button>

        {step < 4 ? (
          <button
            type="button"
            onClick={next}
            disabled={!canNext}
            className={clsx(
              'rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700',
              !canNext && 'opacity-60 cursor-not-allowed'
            )}
          >
            Continue
          </button>
        ) : (
          <span className="text-sm text-gray-500">Review & submit above</span>
        )}
      </div>
    </div>
  )
}
