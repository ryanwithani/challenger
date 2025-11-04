'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
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

const PROGRESS_STORAGE_KEY = 'onboarding_progress'

export function OnboardingWizard() {
  // Load saved progress from localStorage

  const [currentStep, setCurrentStep] = useState<OnboardingStep>('account')
  const [data, setData] = useState<OnboardingData>({ accountCreated: false })
  const [loading, setLoading] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)

    try {
      const saved = localStorage.getItem(PROGRESS_STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        setCurrentStep(parsed.currentStep || 'account')
        setData(parsed.data || { accountCreated: false })
      }
    } catch {
      // Fall through to default state
    }
  }, [])

  const router = useRouter()
  const { user } = useAuthStore()
  const { createInitialPreferences } = useUserPreferencesStore()

  // Memoize steps array to prevent recreation
  const steps: OnboardingStep[] = useMemo(() => ['account', 'packs', 'welcome'], [])
  const currentStepIndex = useMemo(() => steps.indexOf(currentStep), [steps, currentStep])

  // Optimized save progress function with useCallback
  const saveProgress = useCallback((step: OnboardingStep, stepData: OnboardingData) => {
    if (!isClient) return // Don't save during SSR

    try {
      localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify({
        currentStep: step,
        data: stepData
      }))
    } catch (error) {
      console.warn('Failed to save onboarding progress:', error)
    }
  }, [isClient])
  // Optimized navigation handlers with useCallback
  const goBack = useCallback(() => {
    const prevIndex = Math.max(0, currentStepIndex - 1)
    const prevStep = steps[prevIndex]
    setCurrentStep(prevStep)
    saveProgress(prevStep, data)
  }, [currentStepIndex, steps, saveProgress, data])

  const goNext = useCallback(() => {
    const nextIndex = Math.min(steps.length - 1, currentStepIndex + 1)
    const nextStep = steps[nextIndex]
    setCurrentStep(nextStep)
    saveProgress(nextStep, data)
  }, [currentStepIndex, steps, saveProgress, data])

  // Optimized step completion handlers with useCallback
  const handleAccountCreated = useCallback(() => {
    const newData = { ...data, accountCreated: true }
    setData(newData)
    saveProgress('packs', newData)
    goNext()
  }, [data, saveProgress, goNext])

  const handlePacksSelected = useCallback(async (packs: Record<string, boolean>) => {
    setLoading(true)
    try {
      await createInitialPreferences({ ...packs, base_game: true } as ExpansionPacks)
      const newData = { ...data, packs }
      setData(newData)
      saveProgress('welcome', newData)
      goNext()
    } catch (error) {
      console.error('Failed to save packs:', error)
      // Still proceed to welcome step - they can update packs later
      const newData = { ...data, packs }
      setData(newData)
      saveProgress('welcome', newData)
      goNext()
    } finally {
      setLoading(false)
    }
  }, [data, createInitialPreferences, saveProgress, goNext])

  const handleSkipPacks = useCallback(() => {
    // Create default preferences with just base game
    createInitialPreferences({ base_game: true } as ExpansionPacks)
      .catch(err => console.error('Failed to create default preferences:', err))
    const newData = { ...data, packs: {} }
    setData(newData)
    saveProgress('welcome', newData)
    goNext()
  }, [data, createInitialPreferences, saveProgress, goNext])

  const handleComplete = useCallback((route?: string) => {
    // Clear all onboarding data on completion (only on client)
    if (isClient) {
      localStorage.removeItem(PROGRESS_STORAGE_KEY)
      localStorage.removeItem('onboarding_account_data')
      localStorage.removeItem('onboarding_packs_data')
    }

    // Route based on selected option
    let targetRoute = '/dashboard'
    if (route === 'challenge') {
      targetRoute = '/dashboard/new/challenge'
    } else if (route === 'sim') {
      targetRoute = '/dashboard/new/sim'
    }

    router.push(targetRoute)
  }, [isClient, router])

  useEffect(() => {
    if (!isClient) return // Don't add listener during SSR

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (loading) {
        e.preventDefault()
        e.returnValue = ''
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [loading, isClient])

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-100 via-white to-accent-400/20 flex items-center justify-center p-4">
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