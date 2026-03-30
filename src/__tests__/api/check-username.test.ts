/**
 * @jest-environment node
 */
import { POST } from '@/src/app/api/auth/check-username/route'
import { NextRequest } from 'next/server'
import { createSupabaseServerClient } from '@/src/lib/supabase/server'
import { createServerSupabaseMock } from '@/src/__tests__/utils/test-helpers'

jest.mock('@/src/lib/supabase/server')

let mockMaybeSingle: jest.Mock

function createMockRequest(body: any) {
    return new NextRequest('http://localhost:3000/api/auth/check-username', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
    })
}

describe('POST /api/auth/check-username', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        const { supabase, mockMaybeSingle: ms } = createServerSupabaseMock()
        mockMaybeSingle = ms
        ;(createSupabaseServerClient as jest.Mock).mockResolvedValue(supabase)
    })

    describe('Available username', () => {
        test('returns available: true when username is free', async () => {
            mockMaybeSingle.mockResolvedValue({ data: null })

            const response = await POST(createMockRequest({ username: 'newuser' }))
            const data = await response.json()

            expect(response.status).toBe(200)
            expect(data.available).toBe(true)
            expect(data.taken).toBe(false)
        })
    })

    describe('Taken username', () => {
        test('returns available: false when username exists', async () => {
            mockMaybeSingle.mockResolvedValue({ data: { username: 'existinguser' } })

            const response = await POST(createMockRequest({ username: 'existinguser' }))
            const data = await response.json()

            expect(response.status).toBe(200)
            expect(data.available).toBe(false)
            expect(data.taken).toBe(true)
        })
    })

    describe('Validation errors', () => {
        test('returns available: false for missing username', async () => {
            const response = await POST(createMockRequest({}))
            const data = await response.json()

            expect(response.status).toBe(200)
            expect(data.available).toBe(false)
            expect(data.error).toBe('Invalid username')
        })

        test('returns available: false for username under 3 characters', async () => {
            const response = await POST(createMockRequest({ username: 'ab' }))
            const data = await response.json()

            expect(response.status).toBe(200)
            expect(data.available).toBe(false)
            expect(data.error).toBe('Invalid username')
        })
    })

    describe('Error handling', () => {
        test('returns available: false on Supabase error', async () => {
            mockMaybeSingle.mockRejectedValue(new Error('DB failure'))

            const response = await POST(createMockRequest({ username: 'testuser' }))
            const data = await response.json()

            expect(data.available).toBe(false)
            expect(data.error).toBe('Check failed')
        })
    })
})
