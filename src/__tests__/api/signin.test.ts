/**
 * @jest-environment node
 */
import { POST } from '@/src/app/api/auth/signin/route'
import { NextRequest } from 'next/server'
import { createSupabaseServerClient } from '@/src/lib/supabase/server'

jest.mock('@/src/lib/supabase/server')
jest.mock('@/src/lib/middleware/csrf', () => ({
    withCSRFProtection: (handler: any) => handler,
}))

const mockSignInWithPassword = jest.fn()
const mockSupabase = {
    auth: {
        signInWithPassword: mockSignInWithPassword,
    },
}

function createMockRequest(body: any) {
    return new NextRequest('http://localhost:3000/api/auth/signin', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
    })
}

describe('POST /api/auth/signin', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        ;(createSupabaseServerClient as jest.Mock).mockResolvedValue(mockSupabase)
    })

    describe('Successful sign in', () => {
        test('returns user on valid credentials', async () => {
            const mockUser = { id: 'user-123', email: 'test@example.com' }
            mockSignInWithPassword.mockResolvedValue({
                data: { user: mockUser, session: { access_token: 'tok' } },
                error: null,
            })

            const response = await POST(createMockRequest({ email: 'test@example.com', password: 'ValidPass123!' }))
            const data = await response.json()

            expect(response.status).toBe(200)
            expect(data.success).toBe(true)
            expect(data.user).toEqual(mockUser)
            expect(mockSignInWithPassword).toHaveBeenCalledWith({
                email: 'test@example.com',
                password: 'ValidPass123!',
            })
        })
    })

    describe('Validation errors', () => {
        test('returns 400 when email is missing', async () => {
            const response = await POST(createMockRequest({ password: 'ValidPass123!' }))
            const data = await response.json()

            expect(response.status).toBe(400)
            expect(data.error).toBe('Email and password are required')
        })

        test('returns 400 when password is missing', async () => {
            const response = await POST(createMockRequest({ email: 'test@example.com' }))
            const data = await response.json()

            expect(response.status).toBe(400)
            expect(data.error).toBe('Email and password are required')
        })

        test('returns 400 for email over 254 characters', async () => {
            const longEmail = 'a'.repeat(246) + '@test.com' // 255 chars, over the 254 limit
            const response = await POST(createMockRequest({ email: longEmail, password: 'ValidPass123!' }))
            const data = await response.json()

            expect(response.status).toBe(400)
            expect(data.error).toBe('Email address is too long')
        })

        test('returns 400 for password over 128 characters', async () => {
            const response = await POST(createMockRequest({
                email: 'test@example.com',
                password: 'a'.repeat(129),
            }))
            const data = await response.json()

            expect(response.status).toBe(400)
            expect(data.error).toBe('Password is too long')
        })
    })

    describe('Authentication errors', () => {
        test('returns 401 for invalid credentials', async () => {
            mockSignInWithPassword.mockResolvedValue({
                data: null,
                error: { message: 'Invalid login credentials' },
            })

            const response = await POST(createMockRequest({ email: 'test@example.com', password: 'wrongpass' }))
            const data = await response.json()

            expect(response.status).toBe(401)
            expect(data.error).toBe('Invalid login credentials')
        })

        test('returns 500 on unexpected error', async () => {
            mockSignInWithPassword.mockRejectedValue(new Error('Network failure'))

            const response = await POST(createMockRequest({ email: 'test@example.com', password: 'ValidPass123!' }))
            const data = await response.json()

            expect(response.status).toBe(500)
            expect(data.error).toBe('Sign in failed. Please try again.')
        })
    })
})
