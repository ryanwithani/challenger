// Error type definitions
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

