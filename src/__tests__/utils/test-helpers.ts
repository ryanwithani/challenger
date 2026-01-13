import { render, RenderOptions } from '@testing-library/react'
import { ReactElement } from 'react'

// Custom render function that includes providers
export function customRender(
    ui: ReactElement,
    options?: Omit<RenderOptions, 'wrapper'>
) {
    return render(ui, { ...options })
}

// Re-export everything
export * from '@testing-library/react'

// Helper to create mock form data
export function createMockFormData(overrides = {}) {
    return {
        username: 'testuser123',
        email: 'test@example.com',
        password: 'ValidPass123!@#',
        ...overrides,
    }
}

// Helper to wait for async operations
export function waitForAsync() {
    return new Promise((resolve) => setTimeout(resolve, 0))
}

// Mock Supabase client
export const mockSupabaseClient = {
    auth: {
        signUp: jest.fn(),
        signIn: jest.fn(),
        signOut: jest.fn(),
        getUser: jest.fn(),
    },
    from: jest.fn(() => ({
        select: jest.fn(() => ({
            eq: jest.fn(() => ({
                maybeSingle: jest.fn(),
                single: jest.fn(),
            })),
            ilike: jest.fn(() => ({
                maybeSingle: jest.fn(),
            })),
        })),
        insert: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    })),
}

// Mock fetch response
export function createMockFetchResponse(data: any, ok = true, status = 200) {
    return Promise.resolve({
        ok,
        status,
        json: async () => data,
        text: async () => JSON.stringify(data),
        headers: new Headers(),
    } as Response)
}

