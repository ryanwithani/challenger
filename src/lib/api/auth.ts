import { csrfTokenManager } from '@/src/lib/utils/csrf-client'

const API_TIMEOUT_MS = 15_000

export class ApiFieldError extends Error {
    field: string
    constructor(field: string, message: string) {
        super(message)
        this.name = 'ApiFieldError'
        this.field = field
    }
}

function createTimeoutSignal(ms: number): { signal: AbortSignal; clear: () => void } {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), ms)
    return { signal: controller.signal, clear: () => clearTimeout(timeoutId) }
}

function parseErrorResponse(response: Response): Promise<string> {
    return response.json()
        .then(data => data.error || 'Request failed')
        .catch(() => `Request failed with status ${response.status}`)
}

export async function signIn(email: string, password: string) {
    const headers = await csrfTokenManager.getHeaders()
    const { signal, clear } = createTimeoutSignal(API_TIMEOUT_MS)

    try {
        const response = await fetch('/api/auth/signin', {
            method: 'POST',
            headers,
            credentials: 'include',
            body: JSON.stringify({ email, password }),
            signal,
        })

        if (!response.ok) {
            const message = await parseErrorResponse(response)
            throw new Error(message)
        }

        return response.json()
    } catch (error: unknown) {
        if (error instanceof DOMException && error.name === 'AbortError') {
            throw new Error(`Sign in request timed out after ${API_TIMEOUT_MS}ms`)
        }
        throw error
    } finally {
        clear()
    }
}

export async function signUp(username: string, email: string, password: string) {
    const headers = await csrfTokenManager.getHeaders()
    const { signal, clear } = createTimeoutSignal(API_TIMEOUT_MS)

    try {
        const response = await fetch('/api/auth/signup', {
            method: 'POST',
            headers,
            credentials: 'include',
            body: JSON.stringify({ username, email, password }),
            signal,
        })

        if (!response.ok) {
            const data = await response.json().catch(() => null)
            if (data?.field && data?.error) {
                throw new ApiFieldError(data.field, data.error)
            }
            throw new Error(data?.error || `Sign up failed with status ${response.status}`)
        }

        return response.json()
    } catch (error: unknown) {
        if (error instanceof DOMException && error.name === 'AbortError') {
            throw new Error(`Sign up request timed out after ${API_TIMEOUT_MS}ms`)
        }
        throw error
    } finally {
        clear()
    }
}

export async function resetPassword(email: string) {
    const { signal, clear } = createTimeoutSignal(API_TIMEOUT_MS)

    try {
        const response = await fetch('/api/auth/reset-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
            signal,
        })

        if (!response.ok) {
            const message = await parseErrorResponse(response)
            throw new Error(message)
        }

        return response.json()
    } catch (error: unknown) {
        if (error instanceof DOMException && error.name === 'AbortError') {
            throw new Error(`Password reset request timed out after ${API_TIMEOUT_MS}ms`)
        }
        throw error
    } finally {
        clear()
    }
}
