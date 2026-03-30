/**
 * @jest-environment node
 */
import { GET } from '@/src/app/api/csrf-token/route'
import { NextRequest } from 'next/server'
import { generateCSRFToken, setCSRFTokenCookie } from '@/src/lib/utils/csrf'

jest.mock('@/src/lib/utils/csrf')

const MOCK_TOKEN = 'a'.repeat(64)

describe('GET /api/csrf-token', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        ;(generateCSRFToken as jest.Mock).mockReturnValue(MOCK_TOKEN)
        ;(setCSRFTokenCookie as jest.Mock).mockImplementation(() => {})
    })

    test('returns 200 with a token', async () => {
        const request = new NextRequest('http://localhost:3000/api/csrf-token')
        const response = await GET(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.token).toBe(MOCK_TOKEN)
    })

    test('calls generateCSRFToken to produce the token', async () => {
        const request = new NextRequest('http://localhost:3000/api/csrf-token')
        await GET(request)

        expect(generateCSRFToken).toHaveBeenCalledTimes(1)
    })

    test('sets the token in an HTTP-only cookie', async () => {
        const request = new NextRequest('http://localhost:3000/api/csrf-token')
        const response = await GET(request)

        expect(setCSRFTokenCookie).toHaveBeenCalledWith(response, MOCK_TOKEN)
    })

    test('returns 500 when token generation fails', async () => {
        ;(generateCSRFToken as jest.Mock).mockImplementation(() => {
            throw new Error('Crypto failure')
        })

        const request = new NextRequest('http://localhost:3000/api/csrf-token')
        const response = await GET(request)
        const data = await response.json()

        expect(response.status).toBe(500)
        expect(data.error).toBe('Failed to generate CSRF token')
    })
})
