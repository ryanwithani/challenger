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

// Helper to wait for async operations
export function waitForAsync() {
    return new Promise((resolve) => setTimeout(resolve, 0))
}

// ---------- Entity factories ----------

export function createMockFormData(overrides: Record<string, any> = {}) {
    return {
        username: 'testuser123',
        email: 'test@example.com',
        password: 'ValidPass123!@#',
        ...overrides,
    }
}

export function createMockUser(overrides: Record<string, any> = {}) {
    return {
        id: 'user-123',
        email: 'test@example.com',
        user_metadata: { username: 'testuser' },
        created_at: '2024-01-01T00:00:00Z',
        ...overrides,
    }
}

export function createMockUserProfile(overrides: Record<string, any> = {}) {
    return {
        id: 'user-123',
        email: 'test@example.com',
        username: 'testuser',
        display_name: 'Test User',
        avatar_url: '',
        ...overrides,
    }
}

export function createMockChallenge(overrides: Record<string, any> = {}) {
    return {
        id: 'challenge-1',
        user_id: 'user-123',
        title: 'Test Challenge',
        description: null,
        challenge_type: 'legacy',
        status: 'active',
        total_points: 0,
        configuration: {},
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        ...overrides,
    }
}

export function createMockSim(overrides: Record<string, any> = {}) {
    return {
        id: 'sim-1',
        user_id: 'user-123',
        challenge_id: null,
        name: 'Test Sim',
        age_stage: 'young_adult',
        generation: 1,
        is_heir: false,
        relationship_to_heir: null,
        traits: [],
        career: null,
        aspiration: null,
        avatar_url: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        ...overrides,
    }
}

export function createMockGoal(overrides: Record<string, any> = {}) {
    return {
        id: 'goal-1',
        challenge_id: 'challenge-1',
        title: 'Test Goal',
        description: null,
        goal_type: 'milestone',
        point_value: 10,
        max_points: null,
        current_value: 0,
        target_value: 1,
        thresholds: null,
        category: 'general',
        is_required: false,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        ...overrides,
    }
}

export function createMockProgress(overrides: Record<string, any> = {}) {
    return {
        id: 'progress-1',
        goal_id: 'goal-1',
        user_id: 'user-123',
        challenge_id: 'challenge-1',
        sim_id: null,
        completed_at: '2024-01-01T00:00:00Z',
        completion_details: null,
        ...overrides,
    }
}

// ---------- Supabase mock factories ----------

/**
 * Creates a Supabase server client mock for API route tests (node environment).
 * Covers auth operations and the from().select().ilike().maybeSingle() +
 * from().insert() patterns used across auth API routes.
 *
 * Usage:
 *   let mockMaybeSingle: jest.Mock
 *   let mockInsert: jest.Mock
 *   let mockSupabase: any
 *   beforeEach(() => {
 *     const mock = createServerSupabaseMock()
 *     mockMaybeSingle = mock.mockMaybeSingle
 *     mockInsert = mock.mockInsert
 *     mockSupabase = mock.supabase
 *     ;(createSupabaseServerClient as jest.Mock).mockResolvedValue(mockSupabase)
 *   })
 */
export function createServerSupabaseMock() {
    const mockMaybeSingle = jest.fn()
    const mockInsert = jest.fn()

    const supabase = {
        auth: {
            signUp: jest.fn(),
            signInWithPassword: jest.fn(),
            resetPasswordForEmail: jest.fn(),
        },
        from: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
                ilike: jest.fn().mockReturnValue({
                    maybeSingle: mockMaybeSingle,
                }),
            }),
            insert: mockInsert,
        }),
    }

    return { supabase, mockMaybeSingle, mockInsert }
}

/**
 * Creates a Supabase browser client mock for Zustand store tests (jsdom environment).
 * Covers the full query chains used across authStore, simStore, and userPreferencesStore.
 *
 * Usage:
 *   let mockSingle: jest.Mock
 *   let mockSupabase: any
 *   beforeEach(() => {
 *     const mock = createBrowserSupabaseMock()
 *     mockSingle = mock.mockSingle
 *     mockSupabase = mock.supabase
 *     ;(createSupabaseBrowserClient as jest.Mock).mockReturnValue(mockSupabase)
 *   })
 */
export function createBrowserSupabaseMock() {
    const mockSingle = jest.fn()
    const mockInsertSingle = jest.fn()
    const mockUpdateSingle = jest.fn()
    const mockMaybeSingle = jest.fn()
    const mockEqDelete = jest.fn().mockResolvedValue({ error: null })
    const mockOrder = jest.fn().mockResolvedValue({ data: [], error: null })

    const mockInsert = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({ single: mockInsertSingle }),
    })
    const mockUpdateEq = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({ single: mockUpdateSingle }),
    })
    const mockUpdate = jest.fn().mockReturnValue({ eq: mockUpdateEq })

    const supabase = {
        auth: {
            signUp: jest.fn(),
            signInWithPassword: jest.fn(),
            signOut: jest.fn(),
            getUser: jest.fn(),
            getSession: jest.fn(),
            updateUser: jest.fn(),
            resetPasswordForEmail: jest.fn(),
            onAuthStateChange: jest.fn().mockReturnValue({
                data: { subscription: { unsubscribe: jest.fn() } },
            }),
        },
        from: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                    single: mockSingle,
                    maybeSingle: mockMaybeSingle,
                    order: mockOrder,
                }),
                ilike: jest.fn().mockReturnValue({
                    maybeSingle: mockMaybeSingle,
                }),
                order: mockOrder,
            }),
            insert: mockInsert,
            update: mockUpdate,
            delete: jest.fn().mockReturnValue({ eq: mockEqDelete }),
            upsert: jest.fn().mockReturnValue({
                select: jest.fn().mockReturnValue({ single: mockInsertSingle }),
            }),
        }),
        rpc: jest.fn().mockResolvedValue({ data: [], error: null }),
    }

    return {
        supabase,
        mockSingle,
        mockInsertSingle,
        mockUpdateSingle,
        mockMaybeSingle,
        mockEqDelete,
        mockOrder,
        mockInsert,
        mockUpdate,
    }
}

// ---------- Fetch mock helpers ----------

export function createMockFetchResponse(data: any, ok = true, status = 200) {
    return Promise.resolve({
        ok,
        status,
        json: async () => data,
        text: async () => JSON.stringify(data),
        headers: new Headers(),
    } as Response)
}
