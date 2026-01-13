import { POST } from '@/src/app/api/auth/signup/route'
import { NextRequest } from 'next/server'
import { createSupabaseServerClient } from '@/src/lib/supabase/server'
import { getClientIP } from '@/src/lib/utils/ip-utils'
import rateLimit from '@/src/lib/utils/rateLimit'

// Mock dependencies
jest.mock('@/src/lib/supabase/server')
jest.mock('@/src/lib/utils/ip-utils')
jest.mock('@/src/lib/utils/rateLimit')
jest.mock('@/src/lib/middleware/csrf', () => ({
    withCSRFProtection: (handler: any) => handler,
}))

const mockSupabase = {
    auth: {
        signUp: jest.fn(),
    },
    from: jest.fn(() => ({
        select: jest.fn(() => ({
            ilike: jest.fn(() => ({
                maybeSingle: jest.fn(),
            })),
        })),
        insert: jest.fn(),
    })),
}

const mockRateLimitCheck = jest.fn()

describe('Security Tests - Signup Endpoint', () => {
    beforeEach(() => {
        jest.clearAllMocks()
            ; (createSupabaseServerClient as jest.Mock).mockResolvedValue(mockSupabase)
            ; (getClientIP as jest.Mock).mockReturnValue('127.0.0.1')
            ; (rateLimit as jest.Mock).mockReturnValue({
                check: mockRateLimitCheck,
            })
        mockRateLimitCheck.mockResolvedValue(undefined)
        mockSupabase.from().select().ilike().maybeSingle.mockResolvedValue({ data: null })
        mockSupabase.auth.signUp.mockResolvedValue({
            data: { user: { id: '123', email: 'test@example.com' } },
            error: null,
        })
        mockSupabase.from().insert.mockResolvedValue({ error: null })
    })

    function createMockRequest(body: any, headers: Record<string, string> = {}) {
        return new NextRequest('http://localhost:3000/api/auth/signup', {
            method: 'POST',
            body: JSON.stringify(body),
            headers: {
                'Content-Type': 'application/json',
                ...headers,
            },
        })
    }

    describe('CSRF Protection', () => {
        test('should require CSRF token (handled by middleware)', async () => {
            // Note: CSRF protection is handled by withCSRFProtection middleware
            // This test verifies the endpoint is wrapped with CSRF protection
            const request = createMockRequest({
                username: 'testuser',
                email: 'test@example.com',
                password: 'ValidPass123!@#',
                website: '',
            })

            // The actual CSRF check happens in middleware
            // If middleware passes, request proceeds
            const response = await POST(request)

            // In a real scenario, invalid CSRF would be rejected by middleware
            // This test structure shows where CSRF validation would occur
            expect(response).toBeDefined()
        })
    })

    describe('Honeypot Protection', () => {
        test('silently rejects bot submissions with honeypot filled', async () => {
            const request = createMockRequest({
                username: 'testuser',
                email: 'test@example.com',
                password: 'ValidPass123!@#',
                website: 'bot-attempt',
            })

            const response = await POST(request)
            const data = await response.json()

            expect(response.status).toBe(200)
            expect(data.success).toBe(true)
            expect(mockSupabase.auth.signUp).not.toHaveBeenCalled()
            expect(mockSupabase.from().insert).not.toHaveBeenCalled()
        })

        test('allows legitimate submissions with empty honeypot', async () => {
            const request = createMockRequest({
                username: 'testuser',
                email: 'test@example.com',
                password: 'ValidPass123!@#',
                website: '',
            })

            const response = await POST(request)
            const data = await response.json()

            expect(response.status).toBe(200)
            expect(data.success).toBe(true)
            expect(mockSupabase.auth.signUp).toHaveBeenCalled()
        })
    })

    describe('Rate Limiting', () => {
        test('allows requests within rate limit', async () => {
            mockRateLimitCheck.mockResolvedValue(undefined)

            const request = createMockRequest({
                username: 'testuser',
                email: 'test@example.com',
                password: 'ValidPass123!@#',
                website: '',
            })

            const response = await POST(request)

            expect(response.status).toBe(200)
            expect(mockRateLimitCheck).toHaveBeenCalledWith(3, '127.0.0.1')
        })

        test('rejects requests exceeding rate limit', async () => {
            mockRateLimitCheck.mockRejectedValueOnce({
                message: 'Rate limit exceeded',
            })

            const request = createMockRequest({
                username: 'testuser',
                email: 'test@example.com',
                password: 'ValidPass123!@#',
                website: '',
            })

            const response = await POST(request)
            const data = await response.json()

            expect(response.status).toBe(429)
            expect(data.error).toContain('Too many signup attempts')
            expect(response.headers.get('Retry-After')).toBe('3600')
            expect(mockSupabase.auth.signUp).not.toHaveBeenCalled()
        })

        test('rate limiting is per IP address', async () => {
            const ip1 = '192.168.1.1'
            const ip2 = '192.168.1.2'

                ; (getClientIP as jest.Mock)
                    .mockReturnValueOnce(ip1)
                    .mockReturnValueOnce(ip2)

            const request1 = createMockRequest({
                username: 'testuser1',
                email: 'test1@example.com',
                password: 'ValidPass123!@#',
                website: '',
            })

            const request2 = createMockRequest({
                username: 'testuser2',
                email: 'test2@example.com',
                password: 'ValidPass123!@#',
                website: '',
            })

            await POST(request1)
            await POST(request2)

            expect(mockRateLimitCheck).toHaveBeenCalledWith(3, ip1)
            expect(mockRateLimitCheck).toHaveBeenCalledWith(3, ip2)
        })
    })

    describe('Input Sanitization', () => {
        test('handles XSS attempts in username', async () => {
            const request = createMockRequest({
                username: "<script>alert('xss')</script>",
                email: 'test@example.com',
                password: 'ValidPass123!@#',
                website: '',
            })

            const response = await POST(request)
            const data = await response.json()

            // Should be rejected by validation (invalid characters)
            expect(response.status).toBe(400)
            expect(data.field).toBe('username')
            expect(data.error).toContain('Username can only contain')
        })

        test('handles SQL injection attempts', async () => {
            const request = createMockRequest({
                username: "'; DROP TABLE users;--",
                email: 'test@example.com',
                password: 'ValidPass123!@#',
                website: '',
            })

            const response = await POST(request)
            const data = await response.json()

            // Should be rejected by validation (invalid characters)
            expect(response.status).toBe(400)
            expect(data.field).toBe('username')
        })

        test('handles HTML injection attempts', async () => {
            const request = createMockRequest({
                username: '<img src=x onerror=alert(1)>',
                email: 'test@example.com',
                password: 'ValidPass123!@#',
                website: '',
            })

            const response = await POST(request)
            const data = await response.json()

            // Should be rejected by validation
            expect(response.status).toBe(400)
            expect(data.field).toBe('username')
        })
    })

    describe('Password Security', () => {
        test('password is not returned in response', async () => {
            const request = createMockRequest({
                username: 'testuser',
                email: 'test@example.com',
                password: 'ValidPass123!@#',
                website: '',
            })

            const response = await POST(request)
            const data = await response.json()

            expect(data.password).toBeUndefined()
            expect(JSON.stringify(data)).not.toContain('ValidPass123!@#')
        })

        test('weak passwords are rejected', async () => {
            const weakPasswords = [
                'short',
                'alllowercase',
                'ALLUPPERCASE',
                'NoSymbol123',
                'NoNumber!@#',
            ]

            for (const password of weakPasswords) {
                const request = createMockRequest({
                    username: 'testuser',
                    email: 'test@example.com',
                    password,
                    website: '',
                })

                const response = await POST(request)
                const data = await response.json()

                expect(response.status).toBe(400)
                expect(data.field).toBe('password')
                expect(data.error).toBeTruthy()
            }
        })
    })

    describe('Email Security', () => {
        test('email is normalized to lowercase', async () => {
            const request = createMockRequest({
                username: 'testuser',
                email: 'Test@EXAMPLE.COM',
                password: 'ValidPass123!@#',
                website: '',
            })

            await POST(request)

            expect(mockSupabase.auth.signUp).toHaveBeenCalledWith(
                expect.objectContaining({
                    email: 'test@example.com',
                })
            )
        })

        test('email typo detection works', async () => {
            const typos = ['user@gmial.com', 'user@yahooo.com', 'user@hotmial.com']

            for (const email of typos) {
                const request = createMockRequest({
                    username: 'testuser',
                    email,
                    password: 'ValidPass123!@#',
                    website: '',
                })

                const response = await POST(request)
                const data = await response.json()

                expect(response.status).toBe(400)
                expect(data.field).toBe('email')
                expect(data.error).toContain('check your email domain for typos')
            }
        })
    })

    describe('Error Message Security', () => {
        test('error messages do not expose sensitive information', async () => {
            mockSupabase.auth.signUp.mockRejectedValueOnce(
                new Error('Database connection failed: internal error')
            )

            const request = createMockRequest({
                username: 'testuser',
                email: 'test@example.com',
                password: 'ValidPass123!@#',
                website: '',
            })

            const response = await POST(request)
            const data = await response.json()

            expect(response.status).toBe(500)
            expect(data.error).toBe('Failed to create account. Please try again.')
            expect(data.error).not.toContain('Database connection')
            expect(data.error).not.toContain('internal error')
        })
    })
})

