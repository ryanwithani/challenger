const FETCH_TIMEOUT_MS = 10_000

/**
 * Client-side CSRF token management.
 * Fetches a token from /api/csrf-token and caches it for subsequent requests.
 */
class CSRFTokenManager {
    private token: string | null = null
    private tokenPromise: Promise<string> | null = null

    /**
     * Get CSRF token, fetching from server if not cached.
     * Safe for concurrent calls — deduplicates in-flight fetches.
     */
    async getToken(): Promise<string> {
        if (this.token) {
            return this.token
        }

        if (this.tokenPromise) {
            return this.tokenPromise
        }

        this.tokenPromise = this.fetchToken()

        try {
            this.token = await this.tokenPromise
            return this.token
        } finally {
            this.tokenPromise = null
        }
    }

    /**
     * Fetch CSRF token from server with timeout.
     */
    private async fetchToken(): Promise<string> {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

        try {
            const response = await fetch('/api/csrf-token', {
                method: 'GET',
                credentials: 'include',
                signal: controller.signal,
            })

            if (!response.ok) {
                throw new Error(`Failed to fetch CSRF token: ${response.status}`)
            }

            const data = await response.json()
            return data.token
        } catch (error: unknown) {
            if (error instanceof DOMException && error.name === 'AbortError') {
                throw new Error(`CSRF token fetch timed out after ${FETCH_TIMEOUT_MS}ms`)
            }
            throw error
        } finally {
            clearTimeout(timeoutId)
        }
    }

    /**
     * Clear cached token (call on logout).
     */
    clearToken(): void {
        this.token = null
        this.tokenPromise = null
    }

    /**
     * Get headers object for API requests including CSRF token.
     */
    async getHeaders(): Promise<Record<string, string>> {
        const token = await this.getToken()
        return {
            'X-CSRF-Token': token,
            'Content-Type': 'application/json',
        }
    }
}

export const csrfTokenManager = new CSRFTokenManager()
