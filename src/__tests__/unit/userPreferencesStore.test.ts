import { useUserPreferencesStore } from '@/src/lib/store/userPreferencesStore'
import { createSupabaseBrowserClient } from '@/src/lib/supabase/client'
import { createBrowserSupabaseMock } from '@/src/__tests__/utils/test-helpers'

jest.mock('@/src/lib/supabase/client')

// ---------- Fixtures ----------

const defaultOwnedPacks: string[] = []
const sampleOwnedPacks: string[] = ['GTW', 'S', 'SD']

// Legacy boolean format for migration testing
const legacyBooleanPacks: Record<string, boolean> = {
    base_game: true,
    get_to_work: true,
    seasons: true,
    spa_day: true,
    get_together: false,
    city_living: false,
}

let mockSingle: jest.Mock
let mockInsertSingle: jest.Mock
let mockUpdateSingle: jest.Mock
let mockInsert: jest.Mock
let mockUpdate: jest.Mock
let mockSupabase: any

const initialState = {
    preferences: null,
    loading: false,
}

describe('userPreferencesStore', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        const mock = createBrowserSupabaseMock()
        mockSingle = mock.mockSingle
        mockInsertSingle = mock.mockInsertSingle
        mockUpdateSingle = mock.mockUpdateSingle
        mockInsert = mock.mockInsert
        mockUpdate = mock.mockUpdate
        mockSupabase = mock.supabase
        ;(createSupabaseBrowserClient as jest.Mock).mockReturnValue(mockSupabase)
        useUserPreferencesStore.setState(initialState)
        mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-123' } } })
    })

    describe('fetchPreferences', () => {
        test('sets preferences when found with new array format', async () => {
            const mockPrefs = { id: 'pref-1', user_id: 'user-123', expansion_packs: sampleOwnedPacks }
            mockSingle.mockResolvedValue({ data: mockPrefs, error: null })

            await useUserPreferencesStore.getState().fetchPreferences()

            const state = useUserPreferencesStore.getState()
            expect(state.preferences).toEqual(mockPrefs)
            expect(state.preferences?.expansion_packs).toEqual(['GTW', 'S', 'SD'])
            expect(state.loading).toBe(false)
        })

        test('migrates legacy boolean format to acronym array on fetch', async () => {
            const legacyPrefs = { id: 'pref-1', user_id: 'user-123', expansion_packs: legacyBooleanPacks }
            mockSingle.mockResolvedValue({ data: legacyPrefs, error: null })
            // Migration update call
            mockUpdateSingle.mockResolvedValue({ data: {}, error: null })

            await useUserPreferencesStore.getState().fetchPreferences()

            const state = useUserPreferencesStore.getState()
            // Should have converted the boolean map to acronym array
            const packs = state.preferences?.expansion_packs ?? []
            expect(Array.isArray(packs)).toBe(true)
            expect(packs).toContain('GTW')
            expect(packs).toContain('S')
            expect(packs).toContain('SD')
            expect(packs).not.toContain('GT')  // get_together was false
            expect(packs).not.toContain('CL')  // city_living was false
            // Should have persisted the migration back to DB
            expect(mockUpdate).toHaveBeenCalled()
        })

        test('creates default preferences on PGRST116 (no row found)', async () => {
            const newPrefs = { id: 'pref-new', user_id: 'user-123', expansion_packs: defaultOwnedPacks }
            mockSingle.mockResolvedValue({ data: null, error: { code: 'PGRST116' } })
            mockInsertSingle.mockResolvedValue({ data: newPrefs, error: null })

            await useUserPreferencesStore.getState().fetchPreferences()

            expect(mockInsert).toHaveBeenCalled()
            expect(useUserPreferencesStore.getState().preferences).toEqual(newPrefs)
        })

        test('sets loading to false when user is not authenticated', async () => {
            mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } })

            await useUserPreferencesStore.getState().fetchPreferences()

            expect(useUserPreferencesStore.getState().loading).toBe(false)
            expect(useUserPreferencesStore.getState().preferences).toBeNull()
        })
    })

    describe('updateExpansionPacks', () => {
        test('updates existing preferences with acronym array', async () => {
            const existingPrefs = { id: 'pref-1', user_id: 'user-123', expansion_packs: defaultOwnedPacks }
            useUserPreferencesStore.setState({ preferences: existingPrefs })

            const updatedPacks = ['GTW', 'S', 'CL']
            const updated = { ...existingPrefs, expansion_packs: updatedPacks }
            mockUpdateSingle.mockResolvedValue({ data: updated, error: null })

            await useUserPreferencesStore.getState().updateExpansionPacks(updatedPacks)

            expect(mockUpdate).toHaveBeenCalled()
            expect(useUserPreferencesStore.getState().preferences?.expansion_packs).toEqual(updatedPacks)
        })

        test('throws when user is not authenticated', async () => {
            mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } })

            await expect(
                useUserPreferencesStore.getState().updateExpansionPacks(sampleOwnedPacks)
            ).rejects.toThrow('User not authenticated')
        })

        test('creates preferences when none exist', async () => {
            useUserPreferencesStore.setState({ preferences: null })
            const newPrefs = { id: 'pref-new', user_id: 'user-123', expansion_packs: sampleOwnedPacks }
            mockInsertSingle.mockResolvedValue({ data: newPrefs, error: null })

            await useUserPreferencesStore.getState().updateExpansionPacks(sampleOwnedPacks)

            expect(mockInsert).toHaveBeenCalled()
        })
    })

    describe('createInitialPreferences', () => {
        test('inserts preferences with acronym array and updates store state', async () => {
            const newPrefs = { id: 'pref-1', user_id: 'user-123', expansion_packs: sampleOwnedPacks }
            mockInsertSingle.mockResolvedValue({ data: newPrefs, error: null })

            await useUserPreferencesStore.getState().createInitialPreferences(sampleOwnedPacks)

            expect(useUserPreferencesStore.getState().preferences).toEqual(newPrefs)
            expect(useUserPreferencesStore.getState().preferences?.expansion_packs).toEqual(['GTW', 'S', 'SD'])
        })

        test('throws when Supabase insert fails', async () => {
            mockInsertSingle.mockResolvedValue({ data: null, error: { message: 'Insert failed' } })

            await expect(
                useUserPreferencesStore.getState().createInitialPreferences(defaultOwnedPacks)
            ).rejects.toThrow('Insert failed')
        })

        test('throws when user is not authenticated', async () => {
            mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } })

            await expect(
                useUserPreferencesStore.getState().createInitialPreferences(defaultOwnedPacks)
            ).rejects.toThrow('User not authenticated')
        })
    })
})
