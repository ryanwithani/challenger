'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { createSupabaseBrowserClient } from '@/src/lib/supabase/client'
import { type SimWizardData } from '@/src/lib/validations/sim'
import { BasicInfoStep, TraitsStep, PersonalityStep, ReviewStep } from './steps'
import { Button } from '@/src/components/ui/Button'

type SimInsert = any; // Import your SimInsert type from the store

interface SimWizardProps {
  onSubmit: (data: SimInsert) => void | Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

interface WizardError {
  type: 'validation' | 'network' | 'persistence' | 'general';
  message: string;
  context?: string;
  recoverable: boolean;
  retryAction?: () => void;
}

interface ErrorState {
  hasError: boolean;
  errors: WizardError[];
  currentStepError?: WizardError;
}

const PROGRESS_STORAGE_KEY = 'sim_wizard_progress'
const BASIC_INFO_STORAGE_KEY = 'sim_wizard_basic_info'
const TRAITS_STORAGE_KEY = 'sim_wizard_traits'
const PERSONALITY_STORAGE_KEY = 'sim_wizard_personality'

export function SimWizard({ onSubmit, onCancel, loading }: SimWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [wizardData, setWizardData] = useState<SimWizardData>({
    basicInfo: { firstName: '', familyName: '', age_stage: 'young_adult', avatar_url: null, challenge_id: null },
    traits: [],
    personality: { career: null, aspiration: null }
  });
  const [isClient, setIsClient] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [errorState, setErrorState] = useState<ErrorState>({
    hasError: false,
    errors: [],
  });
  const [isRetrying, setIsRetrying] = useState(false);

  const steps = [
    { number: 1, name: 'Basic Info', nextStep: 'Traits' },
    { number: 2, name: 'Traits', nextStep: 'Personality' },
    { number: 3, name: 'Personality', nextStep: 'Review' },
    { number: 4, name: 'Review', nextStep: null },
  ];

  // Error handling utilities
  const addError = useCallback((error: WizardError) => {
    setErrorState(prev => ({
      hasError: true,
      errors: [...prev.errors, error],
      currentStepError: error,
    }));
  }, []);

  const clearError = useCallback((errorType?: string) => {
    setErrorState(prev => ({
      hasError: false,
      errors: errorType ? prev.errors.filter(e => e.type !== errorType) : [],
      currentStepError: undefined,
    }));
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrorState({
      hasError: false,
      errors: [],
      currentStepError: undefined,
    });
  }, []);

  const handleError = useCallback((error: any, context: string, type: WizardError['type'] = 'general') => {
    console.error(`SimWizard Error [${context}]:`, error);
    
    const wizardError: WizardError = {
      type,
      message: error.message || 'An unexpected error occurred',
      context,
      recoverable: type !== 'validation',
      retryAction: type === 'network' ? () => {
        setIsRetrying(true);
        // Retry the operation that failed
        if (context === 'challenges_fetch') {
          fetchChallengesData();
        } else if (context === 'data_persistence') {
          // Retry data persistence
          try {
            localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify({ currentStep }));
            if (wizardData.basicInfo) {
              localStorage.setItem(BASIC_INFO_STORAGE_KEY, JSON.stringify(wizardData.basicInfo));
            }
            if (wizardData.traits) {
              localStorage.setItem(TRAITS_STORAGE_KEY, JSON.stringify(wizardData.traits));
            }
            if (wizardData.personality) {
              localStorage.setItem(PERSONALITY_STORAGE_KEY, JSON.stringify(wizardData.personality));
            }
            clearError(type);
          } catch (retryError) {
            addError({
              type: 'persistence',
              message: 'Failed to save data even after retry',
              context: 'data_persistence_retry',
              recoverable: false,
            });
          }
        }
        setIsRetrying(false);
      } : undefined,
    };
    
    addError(wizardError);
  }, [addError, clearError, currentStep, wizardData]);

  const fetchChallengesData = useCallback(async () => {
    try {
      const supabase = createSupabaseBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        handleError(new Error('User not authenticated'), 'challenges_fetch', 'network');
        return;
      }
      
      const { data, error } = await supabase
        .from('challenges')
        .select('id, name, challenge_type, status')
        .eq('user_id', user.id);
        
      if (error) {
        handleError(error, 'challenges_fetch', 'network');
        return;
      }
      
      setChallenges(data || []);
      clearError('network'); // Clear any previous network errors
    } catch (error) {
      handleError(error, 'challenges_fetch', 'network');
    }
  }, [handleError, clearError]);

  // Load saved progress from localStorage
  useEffect(() => {
    setIsClient(true);

    try {
      const savedProgress = localStorage.getItem(PROGRESS_STORAGE_KEY);
      const savedBasicInfo = localStorage.getItem(BASIC_INFO_STORAGE_KEY);
      const savedTraits = localStorage.getItem(TRAITS_STORAGE_KEY);
      const savedPersonality = localStorage.getItem(PERSONALITY_STORAGE_KEY);

      if (savedProgress) {
        const parsed = JSON.parse(savedProgress);
        setCurrentStep(parsed.currentStep || 1);
      }

      if (savedBasicInfo) {
        const parsed = JSON.parse(savedBasicInfo);
        setWizardData(prev => ({ ...prev, basicInfo: parsed }));
      }

      if (savedTraits) {
        const parsed = JSON.parse(savedTraits);
        setWizardData(prev => ({ ...prev, traits: parsed }));
      }

      if (savedPersonality) {
        const parsed = JSON.parse(savedPersonality);
        setWizardData(prev => ({ ...prev, personality: parsed }));
      }
    } catch (error) {
      handleError(error, 'data_loading', 'persistence');
    }

    // Fetch challenges for the dropdown
    fetchChallengesData();
    setIsInitialized(true);
  }, [fetchChallengesData, handleError]);

  // Auto-save functionality with debouncing
  useEffect(() => {
    if (!isClient) return;

    const timeoutId = setTimeout(() => {
      try {
        // Save current step
        localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify({ currentStep }));
        
        // Save basic info if available
        if (wizardData.basicInfo) {
          localStorage.setItem(BASIC_INFO_STORAGE_KEY, JSON.stringify(wizardData.basicInfo));
        }
        
        // Save traits if available
        if (wizardData.traits) {
          localStorage.setItem(TRAITS_STORAGE_KEY, JSON.stringify(wizardData.traits));
        }
        
        // Save personality if available
        if (wizardData.personality) {
          localStorage.setItem(PERSONALITY_STORAGE_KEY, JSON.stringify(wizardData.personality));
        }
        
        // Clear any previous persistence errors on successful save
        clearError('persistence');
      } catch (error) {
        handleError(error, 'data_persistence', 'persistence');
      }
    }, 500); // Debounce auto-save

    return () => clearTimeout(timeoutId);
  }, [isClient, currentStep, wizardData, handleError, clearError]);

  // Step data handlers with error handling
  const handleBasicInfoNext = useCallback((data: SimWizardData['basicInfo']) => {
    try {
      setWizardData(prev => ({ ...prev, basicInfo: data }));
      setCurrentStep(2);
      clearAllErrors(); // Clear any previous errors on successful step transition
    } catch (error) {
      handleError(error, 'basic_info_transition', 'validation');
    }
  }, [handleError, clearAllErrors]);

  const handleTraitsNext = useCallback((data: string[]) => {
    try {
      setWizardData(prev => ({ ...prev, traits: data }));
      setCurrentStep(3);
      clearAllErrors();
    } catch (error) {
      handleError(error, 'traits_transition', 'validation');
    }
  }, [handleError, clearAllErrors]);

  const handlePersonalityNext = useCallback((data: SimWizardData['personality']) => {
    try {
      setWizardData(prev => ({ ...prev, personality: data }));
      setCurrentStep(4);
      clearAllErrors();
    } catch (error) {
      handleError(error, 'personality_transition', 'validation');
    }
  }, [handleError, clearAllErrors]);

  const handleBack = useCallback(() => {
    try {
      setCurrentStep(prev => prev - 1);
      clearAllErrors(); // Clear errors when going back
    } catch (error) {
      handleError(error, 'step_back_transition', 'general');
    }
  }, [handleError, clearAllErrors]);

  const handleFinalSubmit = useCallback(async (data: SimWizardData) => {
    try {
      // Transform data to match your database schema
      const finalData: SimInsert = {
        firstName: data.basicInfo.firstName,
        familyName: data.basicInfo.familyName,
        age_stage: data.basicInfo.age_stage,
        avatar_url: data.basicInfo.avatar_url,
        challenge_id: data.basicInfo.challenge_id,
        traits: data.traits,
        career: data.personality.career ? JSON.stringify(data.personality.career) : null,
        aspiration: data.personality.aspiration,
      };
      
      // Clear localStorage data on successful submission
      if (isClient) {
        try {
          localStorage.removeItem(PROGRESS_STORAGE_KEY);
          localStorage.removeItem(BASIC_INFO_STORAGE_KEY);
          localStorage.removeItem(TRAITS_STORAGE_KEY);
          localStorage.removeItem(PERSONALITY_STORAGE_KEY);
        } catch (error) {
          handleError(error, 'data_cleanup', 'persistence');
        }
      }
      
      await onSubmit(finalData);
      clearAllErrors(); // Clear any errors on successful submission
    } catch (error) {
      handleError(error, 'final_submit', 'general');
    }
  }, [isClient, onSubmit, handleError, clearAllErrors]);

  // Cleanup on cancel
  const handleCancel = useCallback(() => {
    if (isClient) {
      try {
        localStorage.removeItem(PROGRESS_STORAGE_KEY);
        localStorage.removeItem(BASIC_INFO_STORAGE_KEY);
        localStorage.removeItem(TRAITS_STORAGE_KEY);
        localStorage.removeItem(PERSONALITY_STORAGE_KEY);
      } catch (error) {
        handleError(error, 'cancel_cleanup', 'persistence');
      }
    }
    clearAllErrors();
    onCancel();
  }, [isClient, onCancel, handleError, clearAllErrors]);

  // Show loading state while initializing
  if (!isInitialized) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-gray-600">Loading Sim Creator...</span>
          </div>
        </div>
      </div>
    );
  }

  // Global error display component
  const ErrorDisplay = () => {
    if (!errorState.hasError) return null;

    return (
      <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
        <div className="flex items-start gap-3">
          <span className="text-xl">🚨</span>
          <div className="flex-1">
            <p className="text-red-800 font-semibold mb-2">
              {errorState.errors.length === 1 ? 'An error occurred:' : 'Multiple errors occurred:'}
            </p>
            <ul className="text-sm text-red-700 space-y-1 list-disc list-inside">
              {errorState.errors.map((error, index) => (
                <li key={index}>
                  <strong>{error.context}:</strong> {error.message}
                  {error.recoverable && error.retryAction && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={error.retryAction}
                      disabled={isRetrying}
                      className="ml-2 text-xs"
                    >
                      {isRetrying ? 'Retrying...' : 'Retry'}
                    </Button>
                  )}
                </li>
              ))}
            </ul>
            <div className="mt-3 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllErrors}
                className="text-xs"
              >
                Dismiss
              </Button>
              {errorState.errors.some(e => e.type === 'network') && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    clearError('network');
                    fetchChallengesData();
                  }}
                  disabled={isRetrying}
                  className="text-xs"
                >
                  Refresh Data
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Global Error Display */}
      <ErrorDisplay />
      
      {/* Progress Steps */}
      <nav aria-label="Progress">
        <ol className="flex items-center justify-between">
          {steps.map((step, stepIdx) => {
            const isComplete = currentStep > step.number;
            const isCurrent = currentStep === step.number;

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
            );
          })}
        </ol>
      </nav>

      {/* Step Content */}
      <div className="mt-8">
        {currentStep === 1 && (
          <BasicInfoStep
            data={wizardData.basicInfo}
            challenges={challenges}
            onNext={handleBasicInfoNext}
            onCancel={handleCancel}
            nextStepName={steps[0].nextStep || undefined}
          />
        )}
        {currentStep === 2 && (
          <TraitsStep
            data={wizardData.traits}
            onNext={handleTraitsNext}
            onBack={handleBack}
            nextStepName={steps[1].nextStep || undefined}
          />
        )}
        {currentStep === 3 && (
          <PersonalityStep
            data={wizardData.personality}
            ageStage={wizardData.basicInfo.age_stage}
            onNext={handlePersonalityNext}
            onBack={handleBack}
            nextStepName={steps[2].nextStep || undefined}
          />
        )}
        {currentStep === 4 && (
          <ReviewStep
            data={wizardData}
            onSubmit={handleFinalSubmit}
            onBack={handleBack}
            loading={loading || isRetrying}
          />
        )}
      </div>
    </div>
  );
}