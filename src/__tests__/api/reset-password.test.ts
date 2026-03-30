/**
 * @jest-environment node
 */
import { POST } from '@/src/app/api/auth/reset-password/route'
import { NextRequest } from 'next/server'
import { createSupabaseServerClient } from '@/src/lib/supabase/server'

jest.mock('@/src/lib/supabase/server')

const mockResetPasswordForEmail = jest.fn()
const mockSupabase = {
    auth: {
        resetPasswordForEmail: mockResetPasswordForEmail,
    },
}

function createMockRequest(body: any) {
    return new NextRequest('http://localhost:3000/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
    })
}

describe('POST /api/auth/reset-password', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        ;(createSupabaseServerClient as jest.Mock).mockResolvedValue(mockSupabase)
        mockResetPasswordForEmail.mockResolvedValue({ error: null })
    })

    describe('Successful request', () => {
        test('returns 200 for valid email', async () => {
            const response = await POST(createMockRequest({ email: 'test@example.com' }))
            const data = await response.json()

            expect(response.status).toBe(200)
            expect(data.success).toBe(true)
            expect(data.message).toContain('If an account exists')
        })

        test('calls Supabase with redirect URL', async () => {
            await POST(createMockRequest({ email: 'test@example.com' }))

            expect(mockResetPasswordForEmail).toHaveBeenCalledWith(
                'test@example.com',
                expect.objectContaining({ redirectTo: expect.any(String) })
            )
        })

        test('returns 200 even when Supabase returns an error (enumeration protection)', async () => {
            mockResetPasswordForEmail.mockResolvedValue({ error: { message: 'User not found' } })

            const response = await POST(createMockRequest({ email: 'nonexistent@example.com' }))
            const data = await response.json()

            expect(response.status).toBe(200)
            expect(data.success).toBe(true)
        })
    })

    describe('Validation errors', () => {
        test('returns 400 when email is missing', async () => {
            const response = await POST(createMockRequest({}))
            const data = await response.json()

            expect(response.status).toBe(400)
            expect(data.error).toBe('Email is required')
        })

        test('returns 400 for email over 254 characters', async () => {
            const longEmail = 'a'.repeat(246) + '@test.com' // 255 chars, over the 254 limit
            const response = await POST(createMockRequest({ email: longEmail }))
            const data = await response.json()

            expect(response.status).toBe(400)
            expect(data.error).toBe('Email address is too long')
        })

        test('returns 400 for invalid email format', async () => {
            const response = await POST(createMockRequest({ email: 'not-an-email' }))
            const data = await response.json()

            expect(response.status).toBe(400)
            expect(data.error).toBe('Invalid email format')
        })
    })

    describe('Server errors', () => {
        test('returns 500 on unexpected error', async () => {
            mockResetPasswordForEmail.mockRejectedValue(new Error('Unexpected'))

            const response = await POST(createMockRequest({ email: 'test@example.com' }))
            const data = await response.json()

            expect(response.status).toBe(500)
        })
    })
})
