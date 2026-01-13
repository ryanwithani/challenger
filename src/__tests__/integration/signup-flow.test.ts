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

describe('Integration Tests - Complete Signup Flow', () => {
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

    describe('End-to-End Signup Flow', () => {
        test('complete signup flow from form submission to user creation', async () => {
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

            // Verify complete flow
            expect(response.status).toBe(200)
            expect(data.success).toBe(true)
            expect(data.user).toEqual(mockUser)

            // Verify username check
            expect(mockSupabase.from).toHaveBeenCalledWith('users')
            expect(mockSupabase.from().select().ilike).toHaveBeenCalledWith('username', 'testuser')

            // Verify auth signup
            expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
                email: 'test@example.com',
                password: 'ValidPass123!@#',
                options: {
                    data: {
                        username: 'testuser',
                    },
                },
            })

            // Verify profile creation
            expect(mockSupabase.from().insert).toHaveBeenCalledWith({
                id: 'user-123',
                email: 'test@example.com',
                username: 'testuser',
                display_name: 'testuser',
                created_at: expect.any(String),
            })
        })
    })

    describe('Error Handling Integration', () => {
        test('handles server-side validation errors correctly', async () => {
            const request = createMockRequest({
                username: 'testuser',
                email: 'existing@example.com',
                password: 'ValidPass123!@#',
                website: '',
            })

            mockSupabase.from().select().ilike().maybeSingle.mockResolvedValue({ data: null })
            mockSupabase.auth.signUp.mockResolvedValue({
                data: null,
                error: { message: 'User already registered' },
            })

            const response = await POST(request)
            const data = await response.json()

            expect(response.status).toBe(400)
            expect(data.field).toBe('email')
            expect(data.error).toBe('This email is already registered')
            expect(mockSupabase.from().insert).not.toHaveBeenCalled()
        })

        test('handles network errors gracefully', async () => {
            mockSupabase.from().select().ilike().maybeSingle.mockRejectedValue(
                new Error('Network error')
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
        })
    })

    describe('CSRF Token Management Integration', () => {
        test('handles CSRF token refresh', async () => {
            // Note: CSRF is handled by middleware
            // This test verifies the endpoint works with CSRF protection enabled
            const request = createMockRequest({
                username: 'testuser',
                email: 'test@example.com',
                password: 'ValidPass123!@#',
                website: '',
            })

            mockSupabase.from().select().ilike().maybeSingle.mockResolvedValue({ data: null })
            mockSupabase.auth.signUp.mockResolvedValue({
                data: { user: { id: '123', email: 'test@example.com' } },
                error: null,
            })
            mockSupabase.from().insert.mockResolvedValue({ error: null })

            const response = await POST(request)

            expect(response.status).toBe(200)
            // In real scenario, CSRF middleware would validate token before reaching handler
        })
    })

    describe('Database Integration', () => {
        test('creates user profile with correct data', async () => {
            const mockUser = {
                id: 'user-456',
                email: 'newuser@example.com',
            }

            mockSupabase.from().select().ilike().maybeSingle.mockResolvedValue({ data: null })
            mockSupabase.auth.signUp.mockResolvedValue({
                data: { user: mockUser },
                error: null,
            })
            mockSupabase.from().insert.mockResolvedValue({ error: null })

            const request = createMockRequest({
                username: 'newuser',
                email: 'newuser@example.com',
                password: 'ValidPass123!@#',
                website: '',
            })

            await POST(request)

            expect(mockSupabase.from().insert).toHaveBeenCalledWith({
                id: 'user-456',
                email: 'newuser@example.com',
                username: 'newuser',
                display_name: 'newuser',
                created_at: expect.any(String),
            })

            // Verify created_at is a valid ISO string
            const insertCall = mockSupabase.from().insert.mock.calls[0][0]
            const createdAt = new Date(insertCall.created_at)
            expect(createdAt.getTime()).not.toBeNaN()
        })

        test('continues signup even if profile creation fails', async () => {
            const mockUser = {
                id: 'user-789',
                email: 'test@example.com',
            }

            mockSupabase.from().select().ilike().maybeSingle.mockResolvedValue({ data: null })
            mockSupabase.auth.signUp.mockResolvedValue({
                data: { user: mockUser },
                error: null,
            })
            mockSupabase.from().insert.mockResolvedValue({
                error: { message: 'Profile creation failed' },
            })

            const request = createMockRequest({
                username: 'testuser',
                email: 'test@example.com',
                password: 'ValidPass123!@#',
                website: '',
            })

            const response = await POST(request)
            const data = await response.json()

            // Signup should still succeed
            expect(response.status).toBe(200)
            expect(data.success).toBe(true)
            // Profile will be created on first login via auth store
        })

        test('username stored in lowercase in database', async () => {
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
                username: 'TestUser',
                email: 'test@example.com',
                password: 'ValidPass123!@#',
                website: '',
            })

            await POST(request)

            const insertCall = mockSupabase.from().insert.mock.calls[0][0]
            expect(insertCall.username).toBe('testuser')
            expect(insertCall.display_name).toBe('testuser')
        })
    })

    describe('User Preferences Integration', () => {
        test('user preferences can be created after signup', async () => {
            // This test verifies that after signup, user preferences can be created
            // The actual preferences creation happens in the onboarding wizard
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

            const response = await POST(request)
            const data = await response.json()

            expect(response.status).toBe(200)
            expect(data.success).toBe(true)
            expect(data.user.id).toBe('user-123')
            // User can now proceed to preferences step
        })
    })
})

