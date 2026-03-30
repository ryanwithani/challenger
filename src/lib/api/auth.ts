import { csrfTokenManager } from '@/src/lib/utils/csrf-client'

const API_TIMEOUT_MS = 15_000

function createTimeoutSignal(ms: number): { signal: AbortSignal; clear: () => void } {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), ms)
    return { signal: controller.signal, clear: () => clearTimeout(timeoutId) }
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
            const error = await response.json()
            throw new Error(error.error || 'Sign in failed')
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
    const { signal, clear } = createTimeoutSignal(API_TIMEOUT_MS)

    try {
        const response = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password }),
            signal,
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.error || 'Sign up failed')
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
    const headers = await csrfTokenManager.getHeaders()

    const { signal, clear } = createTimeoutSignal(API_TIMEOUT_MS)

    try {
        const response = await fetch('/api/auth/reset-password', {
            method: 'POST',
            headers,
            credentials: 'include',
            body: JSON.stringify({ email }),
            signal,
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.error || 'Password reset failed')
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
