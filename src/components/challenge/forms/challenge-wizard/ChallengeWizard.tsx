'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useUserPreferencesStore } from '@/src/lib/store/userPreferencesStore'
import { BasicInfoStep } from './BasicInfoStep'
import { ConfigurationStep } from './ConfigurationStep'
import { SummaryStep } from './SummaryStep'
import { CHALLENGE_TEMPLATES } from '@/src/data/challenge-templates'
import type { BasicInfoData, LegacyConfigData } from '@/src/lib/validations/challenge'
import type { Database } from '@/src/types/database.types'

type Challenge = Database['public']['Tables']['challenges']['Row']

interface WizardData {
  basicInfo?: BasicInfoData
  configuration?: LegacyConfigData | Record<string, any>
}

interface ChallengeWizardProps {
  onSubmit: (data: Partial<Challenge>) => void | Promise<void>
  onCancel: () => void
  loading?: boolean
}

const PROGRESS_STORAGE_KEY = 'challenge_wizard_progress'
const BASIC_INFO_STORAGE_KEY = 'challenge_wizard_basic_info'
const CONFIG_STORAGE_KEY = 'challenge_wizard_config'

export function ChallengeWizard({ onSubmit, onCancel, loading }: ChallengeWizardProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [wizardData, setWizardData] = useState<WizardData>({})
  const [isClient, setIsClient] = useState(false)
  const { preferences, fetchPreferences } = useUserPreferencesStore()

  // Load saved progress from localStorage
  useEffect(() => {
    setIsClient(true)
    fetchPreferences()

    try {
      const savedProgress = localStorage.getItem(PROGRESS_STORAGE_KEY)
      const savedBasicInfo = localStorage.getItem(BASIC_INFO_STORAGE_KEY)
      const savedConfig = localStorage.getItem(CONFIG_STORAGE_KEY)

      if (savedProgress) {
        const parsed = JSON.parse(savedProgress)
        setCurrentStep(parsed.currentStep || 1)
      }

      if (savedBasicInfo) {
        const parsed = JSON.parse(savedBasicInfo)
        setWizardData(prev => ({ ...prev, basicInfo: parsed }))
      }

      if (savedConfig) {
        const parsed = JSON.parse(savedConfig)
        setWizardData(prev => ({ ...prev, configuration: parsed }))
      }
    } catch (error) {
      console.warn('Failed to load saved challenge wizard data:', error)
    }
  }, [fetchPreferences])

  // Memoized steps array to prevent recreation
  const steps = useMemo(() => {
    const template = CHALLENGE_TEMPLATES.find(t => t.value === wizardData.basicInfo?.challenge_type)
    const needsConfig = template?.needsConfiguration || false

    if (needsConfig) {
      return [
        { number: 1, name: 'Challenge Details', step: 1 },
        { number: 2, name: 'Configuration', step: 2 },
        { number: 3, name: 'Review', step: 3 },
      ]
    } else {
      return [
        { number: 1, name: 'Challenge Details', step: 1 },
        { number: 2, name: 'Review', step: 2 },
      ]
    }
  }, [wizardData.basicInfo?.challenge_type])

  // Memoized current step index
  const getCurrentStepIndex = useMemo(() => 
    () => steps.findIndex(step => step.step === currentStep), 
    [steps, currentStep]
  )

  // Auto-save functionality with debouncing
  useEffect(() => {
    if (!isClient) return

    const timeoutId = setTimeout(() => {
      try {
        // Save current step
        localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify({ currentStep }))
        
        // Save basic info if available
        if (wizardData.basicInfo) {
          localStorage.setItem(BASIC_INFO_STORAGE_KEY, JSON.stringify(wizardData.basicInfo))
        }
        
        // Save configuration if available
        if (wizardData.configuration) {
          localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(wizardData.configuration))
        }
      } catch (error) {
        console.warn('Failed to save challenge wizard data:', error)
      }
    }, 500) // Debounce auto-save

    return () => clearTimeout(timeoutId)
  }, [isClient, currentStep, wizardData])

  // Memoized handlers with useCallback
  const handleBasicInfoNext = useCallback((data: BasicInfoData) => {
    setWizardData(prev => ({ ...prev, basicInfo: data }))
    
    // Skip to review if no configuration needed
    const template = CHALLENGE_TEMPLATES.find(t => t.value === data.challenge_type)
    if (!template?.needsConfiguration) {
      setCurrentStep(2) // Go to review
    } else {
      setCurrentStep(2) // Go to configuration
    }
  }, [])

  const handleConfigurationNext = useCallback((data: LegacyConfigData) => {
    setWizardData(prev => ({ ...prev, configuration: data }))
    setCurrentStep(3) // Go to review
  }, [])

  const handleFinalSubmit = useCallback(async (data: WizardData) => {
    const challengeData: Partial<Challenge> = {
        name: data.basicInfo!.name,
        description: data.basicInfo?.description,
        challenge_type: data.basicInfo!.challenge_type,
        configuration: data.configuration || null,
        status: 'active',
    }
    
    console.log('Transformed challenge data:', challengeData)
    
    // Clear localStorage data on successful submission
    if (isClient) {
      try {
        localStorage.removeItem(PROGRESS_STORAGE_KEY)
        localStorage.removeItem(BASIC_INFO_STORAGE_KEY)
        localStorage.removeItem(CONFIG_STORAGE_KEY)
      } catch (error) {
        console.warn('Failed to clear challenge wizard data:', error)
      }
    }
    
    await onSubmit(challengeData)
  }, [isClient, onSubmit])

  const goBack = useCallback(() => {
    const needsConfig = CHALLENGE_TEMPLATES.find(t => t.value === wizardData.basicInfo?.challenge_type)?.needsConfiguration
    if (currentStep === 2 && !needsConfig) {
      setCurrentStep(1) // From review to basic info
    } else if (currentStep === 3 && needsConfig) {
      setCurrentStep(2) // From review to configuration
    } else {
      setCurrentStep(currentStep - 1)
    }
  }, [currentStep, wizardData.basicInfo?.challenge_type])

  // Cleanup on unmount or cancel
  const handleCancel = useCallback(() => {
    if (isClient) {
      try {
        localStorage.removeItem(PROGRESS_STORAGE_KEY)
        localStorage.removeItem(BASIC_INFO_STORAGE_KEY)
        localStorage.removeItem(CONFIG_STORAGE_KEY)
      } catch (error) {
        console.warn('Failed to clear challenge wizard data:', error)
      }
    }
    onCancel()
  }, [isClient, onCancel])

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
                      className={`h-full transition-all duration-300 ${
                        isComplete ? 'bg-brand-500 w-full' : 'bg-gray-200 w-0'
                      }`}
                    />
                  </div>
                )}

                <div className="relative flex flex-col items-center">
                  <div className={`
                    w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 z-10
                    ${isComplete
                      ? 'border-brand-500 bg-brand-500'
                      : isCurrent
                        ? 'border-brand-500 bg-white dark:bg-gray-800'
                        : 'border-gray-300 bg-white dark:bg-gray-800'
                    }
                  `}>
                    {isComplete ? (
                      <svg className="w-4 h-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <span className={`text-sm font-medium ${
                        isCurrent ? 'text-brand-500' : 'text-gray-500'
                      }`}>
                        {step.number}
                      </span>
                    )}
                  </div>
                  <span className={`mt-2 text-xs font-medium text-center ${
                    isCurrent ? 'text-brand-500' : isComplete ? 'text-gray-700' : 'text-gray-500'
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
            onCancel={handleCancel}
          />
        )}

        {currentStep === 2 && wizardData.basicInfo?.challenge_type === 'legacy' && (
          <ConfigurationStep
            challengeType={wizardData.basicInfo.challenge_type}
            data={wizardData.configuration}
            onNext={handleConfigurationNext}
            onBack={goBack}
          />
        )}

        {((currentStep === 2 && wizardData.basicInfo?.challenge_type !== 'legacy') ||
          (currentStep === 3 && wizardData.basicInfo?.challenge_type === 'legacy')) && (
          <SummaryStep
            data={wizardData}
            onSubmit={handleFinalSubmit}
            onBack={goBack}
            loading={loading}
          />
        )}
      </div>
    </div>
  )
}