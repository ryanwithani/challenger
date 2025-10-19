'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/src/lib/store/authStore'
import { useUserPreferencesStore } from '@/src/lib/store/userPreferencesStore'
import AccountStep from '@/src/components/onboarding/steps/AccountStep'
import PacksStep from '@/src/components/onboarding/steps/PacksStep'
import WelcomeStep from '@/src/components/onboarding/steps/WelcomeStep'
import OnboardingProgress from '@/src/components/onboarding/OnboardingProgress'
import type { ExpansionPacks } from '@/src/lib/store/userPreferencesStore'

type OnboardingStep = 'account' | 'packs' | 'welcome'

interface OnboardingData {
  accountCreated: boolean
  packs?: Record<string, boolean>
}

export function OnboardingWizard() {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('account')
  const [data, setData] = useState<OnboardingData>({ accountCreated: false })
  const [loading, setLoading] = useState(false)
  
  const router = useRouter()
  const { user } = useAuthStore()
  const { createInitialPreferences } = useUserPreferencesStore()

  const steps: OnboardingStep[] = ['account', 'packs', 'welcome']
  const currentStepIndex = steps.indexOf(currentStep)

  // Navigation handlers
  const goToStep = (step: OnboardingStep) => setCurrentStep(step)
  const goBack = () => {
    const prevIndex = Math.max(0, currentStepIndex - 1)
    setCurrentStep(steps[prevIndex])
  }
  const goNext = () => {
    const nextIndex = Math.min(steps.length - 1, currentStepIndex + 1)
    setCurrentStep(steps[nextIndex])
  }

  // Step completion handlers
  const handleAccountCreated = () => {
    setData(prev => ({ ...prev, accountCreated: true }))
    goNext()
  }

  const handlePacksSelected = async (packs: Record<string, boolean>) => {
    setLoading(true)
    try {
      await createInitialPreferences({ ...packs, base_game: true } as ExpansionPacks)
      setData(prev => ({ ...prev, packs }))
      goNext()
    } catch (error) {
      console.error('Failed to save packs:', error)
      // Still proceed to welcome step - they can update packs later
      goNext()
    } finally {
      setLoading(false)
    }
  }

  const handleSkipPacks = () => {
    // Create default preferences with just base game
    createInitialPreferences({ base_game: true } as ExpansionPacks)
      .catch(err => console.error('Failed to create default preferences:', err))
    goNext()
  }

  const handleComplete = () => {
    router.push('/dashboard')
  }
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (loading) {
        e.preventDefault()
      }
    }
    
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [loading])

  return (
    <div className="min-h-screen bg-gradient-to-br from-sims-green/10 via-white to-sims-blue/10 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Progress Indicator */}
        <OnboardingProgress
          steps={[
            { id: 'account', label: 'Create Account', completed: data.accountCreated },
            { id: 'packs', label: 'Choose Packs', completed: !!data.packs },
            { id: 'welcome', label: 'Get Started', completed: false }
          ]}
          currentStep={currentStep}
        />

        {/* Step Content */}
        <div className="mt-8 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {currentStep === 'account' && (
            <AccountStep onSuccess={handleAccountCreated} />
          )}

          {currentStep === 'packs' && (
            <PacksStep
              onBack={goBack}
              onNext={handlePacksSelected}
              onSkip={handleSkipPacks}
              loading={loading}
            />
          )}

          {currentStep === 'welcome' && (
            <WelcomeStep
              onComplete={handleComplete}
              userName={user?.user_metadata?.username || 'there'}
            />
          )}
        </div>
      </div>
    </div>
  )
}