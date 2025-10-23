import { useCallback, useState } from "react"

// Create error type definitions
export type ErrorType =
    | 'validation'     // Form validation errors
    | 'network'        // API/Network errors  
    | 'permission'     // Auth/Authorization errors
    | 'not_found'      // Resource not found
    | 'server'         // Server errors
    | 'unknown'        // Unexpected errors

export interface AppError {
    type: ErrorType
    message: string
    code?: string
    details?: any
    recoverable?: boolean
}

// Create error context for consistent handling
export function useErrorHandler() {
    const [error, setError] = useState<AppError | null>(null)

    const handleError = useCallback((error: any, context?: string) => {
        const appError: AppError = {
            type: 'unknown',
            message: error.message || 'An unexpected error occurred',
            code: error.code,
            details: error,
            recoverable: true
        }

        setError(appError)

        // Log error
        console.error(`Error in ${context}:`, error)
    }, [])

    const clearError = useCallback(() => setError(null), [])

    return { error, handleError, clearError }
}