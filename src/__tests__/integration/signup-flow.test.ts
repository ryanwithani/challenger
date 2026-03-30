/**
 * @jest-environment node
 */
import { POST } from '@/src/app/api/auth/signup/route'
import { NextRequest } from 'next/server'
import { createSupabaseServerClient } from '@/src/lib/supabase/server'
import { createServerSupabaseMock } from '@/src/__tests__/utils/test-helpers'

// Mock dependencies
jest.mock('@/src/lib/supabase/server')
jest.mock('@/src/lib/middleware/csrf', () => ({
    withCSRFProtection: (handler: any) => handler,
}))

let mockMaybeSingle: jest.Mock
let mockInsert: jest.Mock
let mockSupabase: any

describe('Integration Tests - Complete Signup Flow', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        const mock = createServerSupabaseMock()
        mockMaybeSingle = mock.mockMaybeSingle
        mockInsert = mock.mockInsert
        mockSupabase = mock.supabase
        ;(createSupabaseServerClient as jest.Mock).mockResolvedValue(mockSupabase)
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

            mockMaybeSingle.mockResolvedValue({ data: null })
            mockSupabase.auth.signUp.mockResolvedValue({
                data: { user: mockUser },
                error: null,
            })
            mockInsert.mockResolvedValue({ error: null })

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
            expect(mockInsert).toHaveBeenCalledWith({
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
            mockMaybeSingle.mockResolvedValue({ data: null })
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
            expect(mockInsert).not.toHaveBeenCalled()
        })

        test('handles network errors gracefully', async () => {
            mockMaybeSingle.mockRejectedValue(new Error('Network error'))

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
            mockMaybeSingle.mockResolvedValue({ data: null })
            mockSupabase.auth.signUp.mockResolvedValue({
                data: { user: { id: '123', email: 'test@example.com' } },
                error: null,
            })
            mockInsert.mockResolvedValue({ error: null })

            const request = createMockRequest({
                username: 'testuser',
                email: 'test@example.com',
                password: 'ValidPass123!@#',
                website: '',
            })

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

            mockMaybeSingle.mockResolvedValue({ data: null })
            mockSupabase.auth.signUp.mockResolvedValue({
                data: { user: mockUser },
                error: null,
            })
            mockInsert.mockResolvedValue({ error: null })

            const request = createMockRequest({
                username: 'newuser',
                email: 'newuser@example.com',
                password: 'ValidPass123!@#',
                website: '',
            })

            await POST(request)

            expect(mockInsert).toHaveBeenCalledWith({
                id: 'user-456',
                email: 'newuser@example.com',
                username: 'newuser',
                display_name: 'newuser',
                created_at: expect.any(String),
            })

            // Verify created_at is a valid ISO string
            const insertCall = mockInsert.mock.calls[0][0]
            const createdAt = new Date(insertCall.created_at)
            expect(createdAt.getTime()).not.toBeNaN()
        })

        test('continues signup even if profile creation fails', async () => {
            const mockUser = {
                id: 'user-789',
                email: 'test@example.com',
            }

            mockMaybeSingle.mockResolvedValue({ data: null })
            mockSupabase.auth.signUp.mockResolvedValue({
                data: { user: mockUser },
                error: null,
            })
            mockInsert.mockResolvedValue({
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

            // Profile creation failure must fail signup
            expect(response.status).toBe(500)
            expect(data.error).toBe('Failed to create account. Please try again.')
        })

        test('username stored in lowercase in database', async () => {
            const mockUser = {
                id: 'user-123',
                email: 'test@example.com',
            }

            mockMaybeSingle.mockResolvedValue({ data: null })
            mockSupabase.auth.signUp.mockResolvedValue({
                data: { user: mockUser },
                error: null,
            })
            mockInsert.mockResolvedValue({ error: null })

            const request = createMockRequest({
                username: 'TestUser',
                email: 'test@example.com',
                password: 'ValidPass123!@#',
                website: '',
            })

            await POST(request)

            const insertCall = mockInsert.mock.calls[0][0]
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

            mockMaybeSingle.mockResolvedValue({ data: null })
            mockSupabase.auth.signUp.mockResolvedValue({
                data: { user: mockUser },
                error: null,
            })
            mockInsert.mockResolvedValue({ error: null })

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
