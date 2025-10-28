'use client'

import { cn } from '@/src/lib/utils/cn'

export interface ProgressStep {
  id: string
  name: string
  completed?: boolean
  disabled?: boolean
}

export interface ProgressProps {
  steps: ProgressStep[]
  currentStep: number
  variant?: 'default' | 'compact' | 'minimal'
  showLabels?: boolean
  showProgressBar?: boolean
  className?: string
  'aria-label'?: string
}

export function Progress({
  steps,
  currentStep,
  variant = 'default',
  showLabels = true,
  showProgressBar = true,
  className,
  'aria-label': ariaLabel = 'Progress',
  ...props
}: ProgressProps) {
  const progressPercentage = ((currentStep + 1) / steps.length) * 100

  if (variant === 'minimal') {
    return (
      <div className={cn('flex items-center space-x-2', className)} {...props}>
        <div className="flex-1 bg-gray-200 rounded-full h-1">
          <div
            className="bg-brand-500 h-1 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progressPercentage}%` }}
            aria-hidden="true"
          />
        </div>
        <span className="text-sm text-gray-600 font-medium">
          {currentStep + 1} of {steps.length}
        </span>
      </div>
    )
  }

  if (variant === 'compact') {
    return (
      <nav aria-label={ariaLabel} className={cn('', className)} {...props}>
        <ol className="flex items-center space-x-2">
          {steps.map((step, stepIdx) => {
            const isComplete = stepIdx < currentStep || step.completed
            const isCurrent = stepIdx === currentStep
            const isDisabled = step.disabled

            return (
              <li key={step.id} className="flex items-center">
                <div
                  className={cn(
                    'w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200',
                    isComplete
                      ? 'border-brand-500 bg-brand-500'
                      : isCurrent
                        ? 'border-brand-500 bg-white dark:bg-gray-800'
                        : isDisabled
                          ? 'border-gray-300 bg-gray-100'
                          : 'border-gray-300 bg-white dark:bg-gray-800'
                  )}
                  aria-current={isCurrent ? 'step' : undefined}
                >
                  {isComplete ? (
                    <svg
                      className="w-3 h-3 text-white"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <span
                      className={cn(
                        'text-xs font-medium',
                        isCurrent ? 'text-brand-500' : 'text-gray-500'
                      )}
                    >
                      {stepIdx + 1}
                    </span>
                  )}
                </div>
                {showLabels && (
                  <span
                    className={cn(
                      'ml-2 text-xs font-medium',
                      isCurrent
                        ? 'text-brand-500'
                        : isComplete
                          ? 'text-gray-700'
                          : 'text-gray-500'
                    )}
                  >
                    {step.name}
                  </span>
                )}
                {stepIdx < steps.length - 1 && (
                  <div
                    className={cn(
                      'mx-2 h-0.5 w-4 transition-all duration-200',
                      isComplete ? 'bg-brand-500' : 'bg-gray-200'
                    )}
                    aria-hidden="true"
                  />
                )}
              </li>
            )
          })}
        </ol>
        {showProgressBar && (
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-1">
              <div
                className="bg-brand-500 h-1 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progressPercentage}%` }}
                aria-hidden="true"
              />
            </div>
          </div>
        )}
      </nav>
    )
  }

  // Default variant
  return (
    <nav aria-label={ariaLabel} className={cn('', className)} {...props}>
      <ol className="flex items-center justify-between">
        {steps.map((step, stepIdx) => {
          const isComplete = stepIdx < currentStep || step.completed
          const isCurrent = stepIdx === currentStep
          const isDisabled = step.disabled

          return (
            <li key={step.id} className="relative flex-1">
              {stepIdx !== steps.length - 1 && (
                <div className="absolute top-4 left-1/2 w-full h-0.5 bg-gray-200">
                  <div
                    className={cn(
                      'h-full transition-all duration-300',
                      isComplete ? 'bg-brand-500 w-full' : 'bg-gray-200 w-0'
                    )}
                    aria-hidden="true"
                  />
                </div>
              )}

              <div className="relative flex flex-col items-center">
                <div
                  className={cn(
                    'w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 z-10',
                    isComplete
                      ? 'border-brand-500 bg-brand-500'
                      : isCurrent
                        ? 'border-brand-500 bg-white dark:bg-gray-800'
                        : isDisabled
                          ? 'border-gray-300 bg-gray-100'
                          : 'border-gray-300 bg-white dark:bg-gray-800'
                  )}
                  aria-current={isCurrent ? 'step' : undefined}
                >
                  {isComplete ? (
                    <svg
                      className="w-4 h-4 text-white"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <span
                      className={cn(
                        'text-sm font-medium',
                        isCurrent ? 'text-brand-500' : 'text-gray-500'
                      )}
                    >
                      {stepIdx + 1}
                    </span>
                  )}
                </div>
                {showLabels && (
                  <span
                    className={cn(
                      'mt-2 text-xs font-medium text-center',
                      isCurrent
                        ? 'text-brand-500'
                        : isComplete
                          ? 'text-gray-700'
                          : 'text-gray-500'
                    )}
                  >
                    {step.name}
                  </span>
                )}
              </div>
            </li>
          )
        })}
      </ol>
      {showProgressBar && (
        <div className="mt-6">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-brand-500 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progressPercentage}%` }}
              aria-hidden="true"
            />
          </div>
          <div className="mt-2 text-center text-sm text-gray-500">
            Step {currentStep + 1} of {steps.length}
          </div>
        </div>
      )}
    </nav>
  )
}