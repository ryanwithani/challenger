'use client'

import { Button } from '@/src/components/ui/Button'
import { AppError } from '@/src/components/ui/Error'

interface OnboardingErrorProps {
    error: AppError
    onRetry?: () => void
    onSkip?: () => void
    canRetry?: boolean
    className?: string
}

export function OnboardingError({
    error,
    onRetry,
    onSkip,
    canRetry = true,
    className = ''
}: OnboardingErrorProps) {
    const getErrorIcon = (type: AppError['type']) => {
        switch (type) {
            case 'network':
                return '🌐'
            case 'permission':
                return '🔒'
            case 'validation':
                return '⚠️'
            case 'server':
                return '🖥️'
            default:
                return '❌'
        }
    }

    const getErrorTitle = (type: AppError['type']) => {
        switch (type) {
            case 'network':
                return 'Connection Error'
            case 'permission':
                return 'Access Denied'
            case 'validation':
                return 'Invalid Input'
            case 'server':
                return 'Server Error'
            default:
                return 'Something went wrong'
        }
    }

    return (
        <div className={`bg-red-50 border border-red-200 rounded-xl p-4 ${className}`}>
            <div className="flex items-start gap-3">
                <div className="text-2xl">{getErrorIcon(error.type)}</div>
                <div className="flex-1">
                    <h3 className="text-red-800 font-semibold text-sm mb-1">
                        {getErrorTitle(error.type)}
                    </h3>
                    <p className="text-red-700 text-sm mb-3">{error.message}</p>

                    {(onRetry || onSkip) && (
                        <div className="flex gap-2">
                            {canRetry && onRetry && (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={onRetry}
                                    className="border-red-300 text-red-700 hover:bg-red-100"
                                >
                                    Try Again
                                </Button>
                            )}
                            {onSkip && (
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={onSkip}
                                    className="text-red-600 hover:bg-red-100"
                                >
                                    Skip for Now
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
