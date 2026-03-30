/**
 * @jest-environment node
 */
import { POST } from '@/src/app/api/auth/validate-credentials/route'
import { NextRequest } from 'next/server'
import { createSupabaseServerClient } from '@/src/lib/supabase/server'
import { createSupabaseAdminClient } from '@/src/lib/supabase/admin'
import { createServerSupabaseMock } from '@/src/__tests__/utils/test-helpers'

jest.mock('@/src/lib/supabase/server')
jest.mock('@/src/lib/supabase/admin', () => ({
    createSupabaseAdminClient: jest.fn(),
}))

// Admin client has a unique shape (auth.admin.listUsers) not covered by the shared factory
const mockListUsers = jest.fn()
const mockAdminSupabase = {
    auth: {
        admin: {
            listUsers: mockListUsers,
        },
    },
}

let mockMaybeSingle: jest.Mock

function createMockRequest(body: any) {
    return new NextRequest('http://localhost:3000/api/auth/validate-credentials', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
    })
}

describe('POST /api/auth/validate-credentials', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        const { supabase, mockMaybeSingle: ms } = createServerSupabaseMock()
        mockMaybeSingle = ms
        ;(createSupabaseServerClient as jest.Mock).mockResolvedValue(supabase)
        ;(createSupabaseAdminClient as jest.Mock).mockReturnValue(mockAdminSupabase)
        mockMaybeSingle.mockResolvedValue({ data: null })
        mockListUsers.mockResolvedValue({ data: { users: [] }, error: null })
    })

    describe('Validation guards', () => {
        test('returns 400 when neither username nor email is provided', async () => {
            const response = await POST(createMockRequest({}))
            const data = await response.json()

            expect(response.status).toBe(400)
            expect(data.error).toBe('Username or email is required')
        })
    })

    describe('Username validation', () => {
        test('returns available: true for free username', async () => {
            mockMaybeSingle.mockResolvedValue({ data: null })

            const response = await POST(createMockRequest({ username: 'freeuser' }))
            const data = await response.json()

            expect(data.username.available).toBe(true)
            expect(data.username.error).toBeUndefined()
        })

        test('returns available: false for taken username', async () => {
            mockMaybeSingle.mockResolvedValue({ data: { username: 'takenuser' } })

            const response = await POST(createMockRequest({ username: 'takenuser' }))
            const data = await response.json()

            expect(data.username.available).toBe(false)
            expect(data.username.error).toBe('This username is already taken')
        })

        test('returns available: false for username under 3 chars', async () => {
            const response = await POST(createMockRequest({ username: 'ab' }))
            const data = await response.json()

            expect(data.username.available).toBe(false)
            expect(data.username.error).toContain('3-20 characters')
        })

        test('returns available: false for username over 20 chars', async () => {
            const response = await POST(createMockRequest({ username: 'a'.repeat(21) }))
            const data = await response.json()

            expect(data.username.available).toBe(false)
        })

        test('returns available: false for reserved username', async () => {
            const response = await POST(createMockRequest({ username: 'admin' }))
            const data = await response.json()

            expect(data.username.available).toBe(false)
            expect(data.username.error).toBe('This username is reserved')
        })

        test('returns available: false for username with invalid characters', async () => {
            const response = await POST(createMockRequest({ username: 'user name!' }))
            const data = await response.json()

            expect(data.username.available).toBe(false)
            expect(data.username.error).toContain('letters, numbers')
        })
    })

    describe('Email validation', () => {
        test('returns available: true for free email', async () => {
            mockListUsers.mockResolvedValue({
                data: { users: [{ email: 'other@example.com' }] },
                error: null,
            })

            const response = await POST(createMockRequest({ email: 'free@example.com' }))
            const data = await response.json()

            expect(data.email.available).toBe(true)
        })

        test('returns available: false for taken email', async () => {
            mockListUsers.mockResolvedValue({
                data: { users: [{ email: 'taken@example.com' }] },
                error: null,
            })

            const response = await POST(createMockRequest({ email: 'taken@example.com' }))
            const data = await response.json()

            expect(data.email.available).toBe(false)
            expect(data.email.error).toBe('This email is already registered')
        })

        test('returns available: false for invalid email format', async () => {
            const response = await POST(createMockRequest({ email: 'not-an-email' }))
            const data = await response.json()

            expect(data.email.available).toBe(false)
        })

        test('returns available: false when admin client fails', async () => {
            mockListUsers.mockResolvedValue({ data: null, error: { message: 'Admin error' } })

            const response = await POST(createMockRequest({ email: 'test@example.com' }))
            const data = await response.json()

            expect(data.email.available).toBe(false)
            expect(data.email.error).toBe('Unable to validate email')
        })
    })

    describe('Combined validation', () => {
        test('checks both username and email when both provided', async () => {
            mockMaybeSingle.mockResolvedValue({ data: null })
            mockListUsers.mockResolvedValue({ data: { users: [] }, error: null })

            const response = await POST(createMockRequest({ username: 'newuser', email: 'new@example.com' }))
            const data = await response.json()

            expect(data.username).toBeDefined()
            expect(data.email).toBeDefined()
        })
    })
})
