'use client'

interface ProgressStep {
  id: string
  label: string
  completed: boolean
}

interface OnboardingProgressProps {
  steps: ProgressStep[]
  currentStep: string
}

export default function OnboardingProgress({ steps, currentStep }: OnboardingProgressProps) {
  const currentIndex = steps.findIndex(s => s.id === currentStep)
  const progress = ((currentIndex + 1) / steps.length) * 100

  return (
    <div className="space-y-6">
      {/* Step Indicators */}
      <div className="flex items-center justify-center">
        {steps.map((step, index) => {
          const isActive = step.id === currentStep
          const isCompleted = step.completed

          return (
            <div key={step.id} className="flex items-center">
              {/* Step Circle */}
              <div className={`relative flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 ${
                isCompleted
                  ? 'bg-gradient-to-br from-green-500 to-green-600 border-green-500'
                  : isActive
                    ? 'bg-white border-brand-500 shadow-lg'
                    : 'bg-gray-100 border-gray-300'
              }`}>
                {isCompleted ? (
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span className={`text-lg font-bold ${
                    isActive ? 'text-brand-600' : 'text-gray-400'
                  }`}>
                    {index + 1}
                  </span>
                )}
              </div>

              {/* Step Label */}
              <div className="ml-3 hidden sm:block">
                <div className={`text-sm font-semibold ${
                  isActive ? 'text-brand-600' : isCompleted ? 'text-green-600' : 'text-gray-400'
                }`}>
                  {step.label}
                </div>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className={`mx-4 sm:mx-6 h-1 w-12 sm:w-16 rounded-full transition-all duration-300 ${
                  step.completed ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          )
        })}
      </div>

      {/* Progress Bar */}
      <div className="max-w-2xl mx-auto">
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-brand-500 to-brand-600 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-2 text-center text-sm text-gray-500">
          Step {currentIndex + 1} of {steps.length}
        </div>
      </div>
    </div>
  )
}