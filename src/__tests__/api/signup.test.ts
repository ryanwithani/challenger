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

describe('POST /api/auth/signup', () => {
    beforeEach(() => {
        jest.clearAllMocks()
            ; (createSupabaseServerClient as jest.Mock).mockResolvedValue(mockSupabase)
            ; (getClientIP as jest.Mock).mockReturnValue('127.0.0.1')
            ; (rateLimit as jest.Mock).mockReturnValue({
                check: mockRateLimitCheck,
            })
        mockRateLimitCheck.mockResolvedValue(undefined)
    })

    function createMockRequest(body: any) {
        return new NextRequest('http://localhost:3000/api/auth/signup', {
            method: 'POST',
            body: JSON.stringify(body),
            headers: {
                'Content-Type': 'application/json',
            },
        })
    }

    describe('Successful Signup', () => {
        test('creates account with valid data', async () => {
            const mockUser = {
                id: 'user-123',
                email: 'test@example.com',
                user_metadata: { username: 'testuser' },
            }

            mockSupabase.from().select().ilike().maybeSingle.mockResolvedValue({ data: null })
            mockSupabase.auth.signUp.mockResolvedValue({
                data: { user: mockUser },
                error: null,
            })
            mockSupabase.from().insert.mockResolvedValue({ error: null })

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
            expect(data.user).toEqual(mockUser)
            expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
                email: 'test@example.com',
                password: 'ValidPass123!@#',
                options: {
                    data: {
                        username: 'testuser',
                    },
                },
            })
        })

        test('username is stored in lowercase', async () => {
            mockSupabase.from().select().ilike().maybeSingle.mockResolvedValue({ data: null })
            mockSupabase.auth.signUp.mockResolvedValue({
                data: { user: { id: '123', email: 'test@example.com' } },
                error: null,
            })
            mockSupabase.from().insert.mockResolvedValue({ error: null })

            const request = createMockRequest({
                username: 'TestUser',
                email: 'test@example.com',
                password: 'ValidPass123!@#',
                website: '',
            })

            await POST(request)

            expect(mockSupabase.auth.signUp).toHaveBeenCalledWith(
                expect.objectContaining({
                    options: expect.objectContaining({
                        data: expect.objectContaining({
                            username: 'testuser',
                        }),
                    }),
                })
            )
        })
    })

    describe('Validation Errors', () => {
        test('returns error for missing required fields', async () => {
            const request = createMockRequest({
                username: '',
                email: 'test@example.com',
                password: 'ValidPass123!@#',
                website: '',
            })

            const response = await POST(request)
            const data = await response.json()

            expect(response.status).toBe(400)
            expect(data.error).toBe('All fields are required')
        })

        test('returns error for username too short', async () => {
            const request = createMockRequest({
                username: 'ab',
                email: 'test@example.com',
                password: 'ValidPass123!@#',
                website: '',
            })

            const response = await POST(request)
            const data = await response.json()

            expect(response.status).toBe(400)
            expect(data.field).toBe('username')
            expect(data.error).toContain('at least 3 characters')
        })

        test('returns error for invalid email format', async () => {
            const request = createMockRequest({
                username: 'testuser',
                email: 'invalid-email',
                password: 'ValidPass123!@#',
                website: '',
            })

            const response = await POST(request)
            const data = await response.json()

            expect(response.status).toBe(400)
            expect(data.field).toBe('email')
            expect(data.error).toContain('valid email')
        })

        test('returns error for weak password', async () => {
            const request = createMockRequest({
                username: 'testuser',
                email: 'test@example.com',
                password: 'short',
                website: '',
            })

            const response = await POST(request)
            const data = await response.json()

            expect(response.status).toBe(400)
            expect(data.field).toBe('password')
            expect(data.error).toBeTruthy()
        })
    })

    describe('Duplicate Checks', () => {
        test('returns error for existing username', async () => {
            mockSupabase.from().select().ilike().maybeSingle.mockResolvedValue({
                data: { username: 'testuser' },
            })

            const request = createMockRequest({
                username: 'testuser',
                email: 'test@example.com',
                password: 'ValidPass123!@#',
                website: '',
            })

            const response = await POST(request)
            const data = await response.json()

            expect(response.status).toBe(400)
            expect(data.field).toBe('username')
            expect(data.error).toBe('This username is already taken')
        })

        test('returns error for existing email', async () => {
            mockSupabase.from().select().ilike().maybeSingle.mockResolvedValue({ data: null })
            mockSupabase.auth.signUp.mockResolvedValue({
                data: null,
                error: { message: 'User already registered' },
            })

            const request = createMockRequest({
                username: 'testuser',
                email: 'existing@example.com',
                password: 'ValidPass123!@#',
                website: '',
            })

            const response = await POST(request)
            const data = await response.json()

            expect(response.status).toBe(400)
            expect(data.field).toBe('email')
            expect(data.error).toBe('This email is already registered')
        })

        test('username check is case-insensitive', async () => {
            mockSupabase.from().select().ilike().maybeSingle.mockResolvedValue({
                data: { username: 'testuser' },
            })

            const request = createMockRequest({
                username: 'TestUser',
                email: 'test@example.com',
                password: 'ValidPass123!@#',
                website: '',
            })

            const response = await POST(request)
            const data = await response.json()

            expect(response.status).toBe(400)
            expect(data.error).toBe('This username is already taken')
        })
    })

    describe('Honeypot Protection', () => {
        test('silently rejects bot submissions', async () => {
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
        })
    })

    describe('Rate Limiting', () => {
        test('enforces rate limit', async () => {
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
        })
    })

    describe('Server Errors', () => {
        test('handles Supabase errors gracefully', async () => {
            mockSupabase.from().select().ilike().maybeSingle.mockResolvedValue({ data: null })
            mockSupabase.auth.signUp.mockResolvedValue({
                data: null,
                error: { message: 'Invalid email format' },
            })

            const request = createMockRequest({
                username: 'testuser',
                email: 'invalid@example.com',
                password: 'ValidPass123!@#',
                website: '',
            })

            const response = await POST(request)
            const data = await response.json()

            expect(response.status).toBe(400)
            expect(data.field).toBe('email')
            expect(data.error).toContain('valid email address')
        })

        test('handles database errors', async () => {
            mockSupabase.from().select().ilike().maybeSingle.mockResolvedValue({ data: null })
            mockSupabase.auth.signUp.mockResolvedValue({
                data: { user: { id: '123', email: 'test@example.com' } },
                error: null,
            })
            mockSupabase.from().insert.mockResolvedValue({
                error: { message: 'Database error' },
            })

            const request = createMockRequest({
                username: 'testuser',
                email: 'test@example.com',
                password: 'ValidPass123!@#',
                website: '',
            })

            const response = await POST(request)
            const data = await response.json()

            // Profile creation failure shouldn't fail signup
            expect(response.status).toBe(200)
            expect(data.success).toBe(true)
        })

        test('handles unexpected errors', async () => {
            mockRateLimitCheck.mockRejectedValueOnce(new Error('Unexpected error'))

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
        })
    })

    describe('Profile Creation', () => {
        test('creates user profile in database', async () => {
            const mockUser = {
                id: 'user-123',
                email: 'test@example.com',
            }

            mockSupabase.from().select().ilike().maybeSingle.mockResolvedValue({ data: null })
            mockSupabase.auth.signUp.mockResolvedValue({
                data: { user: mockUser },
                error: null,
            })
            mockSupabase.from().insert.mockResolvedValue({ error: null })

            const request = createMockRequest({
                username: 'testuser',
                email: 'test@example.com',
                password: 'ValidPass123!@#',
                website: '',
            })

            await POST(request)

            expect(mockSupabase.from().insert).toHaveBeenCalledWith({
                id: 'user-123',
                email: 'test@example.com',
                username: 'testuser',
                display_name: 'testuser',
                created_at: expect.any(String),
            })
        })
    })
})

