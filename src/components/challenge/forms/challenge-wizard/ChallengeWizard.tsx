'use client'

import { useState, useEffect } from 'react'
import { useUserPreferencesStore } from '@/src/lib/store/userPreferencesStore'
import { BasicInfoStep } from './BasicInfoStep'
import { ConfigurationStep } from './ConfigurationStep'
import { ExpansionStep } from './ExpansionStep'
import { SummaryStep } from './SummaryStep'
import { CHALLENGE_TEMPLATES } from '@/src/data/challenge-templates'
import type { BasicInfoData, LegacyConfigData, ExpansionPackData } from '@/src/lib/validations/challenge'
import type { Database } from '@/src/types/database.types'

type Challenge = Database['public']['Tables']['challenges']['Row']

interface WizardData {
  basicInfo?: BasicInfoData
  configuration?: LegacyConfigData | Record<string, any>
  expansionPacks?: ExpansionPackData
}

interface ChallengeWizardProps {
  onSubmit: (data: Partial<Challenge>) => void | Promise<void>
  onCancel: () => void
  loading?: boolean
}

export function ChallengeWizard({ onSubmit, onCancel, loading }: ChallengeWizardProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [wizardData, setWizardData] = useState<WizardData>({})
  const { preferences, fetchPreferences } = useUserPreferencesStore()

  useEffect(() => {
    fetchPreferences()
  }, [fetchPreferences])

  // Determine which steps to show based on challenge type
  const getSteps = () => {
    const template = CHALLENGE_TEMPLATES.find(t => t.value === wizardData.basicInfo?.challenge_type)
    const needsConfig = template?.needsConfiguration || false

    if (needsConfig) {
      return [
        { number: 1, name: 'Challenge Details', step: 1 },
        { number: 2, name: 'Configuration', step: 2 },
        { number: 3, name: 'Expansion Packs', step: 3 },
        { number: 4, name: 'Review', step: 4 },
      ]
    } else {
      return [
        { number: 1, name: 'Challenge Details', step: 1 },
        { number: 2, name: 'Expansion Packs', step: 3 },
        { number: 3, name: 'Review', step: 4 },
      ]
    }
  }

  const steps = getSteps()
  const getCurrentStepIndex = () => steps.findIndex(step => step.step === currentStep)

  const handleBasicInfoNext = (data: BasicInfoData) => {
    setWizardData(prev => ({ ...prev, basicInfo: data }))
    // Skip configuration step if not needed
    if (!CHALLENGE_TEMPLATES.find(t => t.value === data.challenge_type)?.needsConfiguration) {
      setCurrentStep(3)
    } else {
      setCurrentStep(2)
    }
  }

  const handleConfigurationNext = (data: LegacyConfigData) => {
    setWizardData(prev => ({ ...prev, configuration: data }))
    setCurrentStep(3)
  }

  const handleExpansionPackNext = (data: ExpansionPackData) => {
    setWizardData(prev => ({ ...prev, expansionPacks: data }))
    setCurrentStep(4)
  }

  const getExpansionPackData = () => {
    if (wizardData.expansionPacks) return wizardData.expansionPacks
    if (preferences?.expansion_packs) return preferences.expansion_packs as ExpansionPackData
    return undefined
  }

  const handleFinalSubmit = async (data: WizardData) => {
    const challengeData: Partial<Challenge> = {
      name: data.basicInfo!.name,
      description: data.basicInfo?.description,
      challenge_type: data.basicInfo!.challenge_type,
      configuration: data.configuration || null,
    }
    await onSubmit(challengeData)
  }

  const goBack = () => {
    const needsConfig = CHALLENGE_TEMPLATES.find(t => t.value === wizardData.basicInfo?.challenge_type)?.needsConfiguration
    if (currentStep === 3 && !needsConfig) {
      setCurrentStep(1)
    } else if (currentStep === 4 && !needsConfig) {
      setCurrentStep(3)
    } else {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <div className="space-y-8">
      {/* Progress Steps */}
      <nav aria-label="Progress">
        <ol className="flex items-center justify-between">
          {steps.map((step, stepIdx) => {
            const currentIndex = getCurrentStepIndex()
            const isComplete = stepIdx < currentIndex
            const isCurrent = stepIdx === currentIndex

            return (
              <li key={step.name} className="relative flex-1">
                {stepIdx !== steps.length - 1 && (
                  <div className="absolute top-4 left-1/2 w-full h-0.5 bg-gray-200">
                    <div
                      className={`h-full transition-all duration-300 ${isComplete ? 'bg-brand-500 w-full' : 'bg-gray-200 w-0'
                        }`}
                    />
                  </div>
                )}

                <div className="relative flex flex-col items-center">
                  <div className={`
                    w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 bg-white z-10
                    ${isComplete
                      ? 'border-brand-500 bg-brand-500'
                      : isCurrent
                        ? 'border-brand-500 bg-white'
                        : 'border-gray-300 bg-white'
                    }
                  `}>
                    {isComplete ? (
                      <svg className="w-4 h-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <span className={`text-sm font-medium ${isCurrent ? 'text-brand-500' : 'text-gray-500'
                        }`}>
                        {step.number}
                      </span>
                    )}
                  </div>
                  <span className={`mt-2 text-xs font-medium text-center ${isCurrent ? 'text-brand-500' : isComplete ? 'text-gray-700' : 'text-gray-500'
                    }`}>
                    {step.name}
                  </span>
                </div>
              </li>
            )
          })}
        </ol>
      </nav>

      {/* Step Content */}
      <div className="mt-8">
        {currentStep === 1 && (
          <BasicInfoStep
            data={wizardData.basicInfo}
            onNext={handleBasicInfoNext}
            onCancel={onCancel}
          />
        )}

        {currentStep === 2 && (
          <ConfigurationStep
            challengeType={wizardData.basicInfo?.challenge_type || ''}
            data={wizardData.configuration as LegacyConfigData}
            onNext={handleConfigurationNext}
            onBack={goBack}
          />
        )}

        {currentStep === 3 && (
          <ExpansionStep
            data={getExpansionPackData() as ExpansionPackData}
            onNext={handleExpansionPackNext}
            onBack={goBack}
            isLegacyChallenge={wizardData.basicInfo?.challenge_type === 'legacy'}
          />
        )}

        {currentStep === 4 && (
          <SummaryStep
            data={wizardData as WizardData}
            onSubmit={handleFinalSubmit}
            onBack={goBack}
            loading={loading}
          />
        )}
      </div>
    </div>
  )
}