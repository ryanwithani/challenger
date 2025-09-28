import { useState } from 'react'
import { CHALLENGE_TEMPLATES } from '@/src/data/challenge-templates'

export function useWizardNavigation(wizardData: any) {
    const [currentStep, setCurrentStep] = useState(1)

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

    return {
        currentStep,
        setCurrentStep,
        getSteps,
        goBack,
        getCurrentStepIndex: () => getSteps().findIndex(step => step.step === currentStep)
    }
}