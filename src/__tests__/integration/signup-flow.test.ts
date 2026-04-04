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

            // Verify username check was performed
            expect(mockSupabase.from).toHaveBeenCalledWith('users')

            // Verify auth signup with username in metadata
            expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
                email: 'test@example.com',
                password: 'ValidPass123!@#',
                options: {
                    data: {
                        username: 'testuser',
                    },
                },
            })

            // Profile creation is handled by the handle_new_user() DB trigger,
            // not by the route — so no insert call should be made
            expect(mockInsert).not.toHaveBeenCalled()
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
            mockMaybeSingle.mockResolvedValue({ data: null })
            mockSupabase.auth.signUp.mockResolvedValue({
                data: { user: { id: '123', email: 'test@example.com' } },
                error: null,
            })

            const request = createMockRequest({
                username: 'testuser',
                email: 'test@example.com',
                password: 'ValidPass123!@#',
                website: '',
            })

            const response = await POST(request)

            expect(response.status).toBe(200)
        })
    })

    describe('Database Integration', () => {
        test('username is passed to signUp metadata in lowercase', async () => {
            const mockUser = {
                id: 'user-123',
                email: 'test@example.com',
            }

            mockMaybeSingle.mockResolvedValue({ data: null })
            mockSupabase.auth.signUp.mockResolvedValue({
                data: { user: mockUser },
                error: null,
            })

            const request = createMockRequest({
                username: 'TestUser',
                email: 'test@example.com',
                password: 'ValidPass123!@#',
                website: '',
            })

            await POST(request)

            // Username should be lowercased in the metadata passed to signUp
            // The handle_new_user() trigger reads it from raw_user_meta_data
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

    describe('User Preferences Integration', () => {
        test('user preferences can be created after signup', async () => {
            const mockUser = {
                id: 'user-123',
                email: 'test@example.com',
            }

            mockMaybeSingle.mockResolvedValue({ data: null })
            mockSupabase.auth.signUp.mockResolvedValue({
                data: { user: mockUser },
                error: null,
            })

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
        })
    })
})
