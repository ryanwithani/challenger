import { csrfTokenManager } from '@/src/lib/utils/csrf-client'

export async function signIn(email: string, password: string) {
    const headers = await csrfTokenManager.getHeaders()

    const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Sign in failed')
    }

    return response.json()
}

export async function resetPassword(email: string) {
    const headers = await csrfTokenManager.getHeaders()

    const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({ email }),
    })

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Password reset failed')
    }

    return response.json()
}
