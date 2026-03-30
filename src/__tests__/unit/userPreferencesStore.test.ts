import { useUserPreferencesStore } from '@/src/lib/store/userPreferencesStore'
import { createSupabaseBrowserClient } from '@/src/lib/supabase/client'
import { createBrowserSupabaseMock } from '@/src/__tests__/utils/test-helpers'
import type { ExpansionPacks } from '@/src/lib/store/userPreferencesStore'

jest.mock('@/src/lib/supabase/client')

// ---------- Fixtures ----------

const defaultExpansionPacks: ExpansionPacks = {
    base_game: true,
    get_to_work: false,
    get_together: false,
    city_living: false,
    cats_dogs: false,
    seasons: false,
    get_famous: false,
    island_living: false,
    discover_university: false,
    eco_lifestyle: false,
    snowy_escape: false,
    cottage_living: false,
    high_school_years: false,
    growing_together: false,
    horse_ranch: false,
    for_rent: false,
    lovestruck: false,
    life_and_death: false,
    enchanted_by_nature: false,
    businesses_and_hobbies: false,
    outdoor_retreat: false,
    spa_day: false,
    strangerville: false,
    dine_out: false,
    vampires: false,
    parenthood: false,
    jungle_adventure: false,
    realm_of_magic: false,
    journey_to_batuu: false,
    dream_home_decorator: false,
    my_wedding_stories: false,
    werewolves: false,
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
        test('sets preferences when found', async () => {
            const mockPrefs = { id: 'pref-1', user_id: 'user-123', expansion_packs: defaultExpansionPacks }
            mockSingle.mockResolvedValue({ data: mockPrefs, error: null })

            await useUserPreferencesStore.getState().fetchPreferences()

            expect(useUserPreferencesStore.getState().preferences).toEqual(mockPrefs)
            expect(useUserPreferencesStore.getState().loading).toBe(false)
        })

        test('creates default preferences on PGRST116 (no row found)', async () => {
            const newPrefs = { id: 'pref-new', user_id: 'user-123', expansion_packs: defaultExpansionPacks }
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
        test('updates existing preferences', async () => {
            const existingPrefs = { id: 'pref-1', user_id: 'user-123', expansion_packs: defaultExpansionPacks }
            useUserPreferencesStore.setState({ preferences: existingPrefs })

            const updated = { ...existingPrefs, expansion_packs: { ...defaultExpansionPacks, seasons: true } }
            mockUpdateSingle.mockResolvedValue({ data: updated, error: null })

            await useUserPreferencesStore.getState().updateExpansionPacks({ ...defaultExpansionPacks, seasons: true })

            expect(mockUpdate).toHaveBeenCalled()
        })

        test('throws when user is not authenticated', async () => {
            mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } })

            await expect(
                useUserPreferencesStore.getState().updateExpansionPacks(defaultExpansionPacks)
            ).rejects.toThrow('User not authenticated')
        })

        test('creates preferences when none exist', async () => {
            useUserPreferencesStore.setState({ preferences: null })
            const newPrefs = { id: 'pref-new', user_id: 'user-123', expansion_packs: defaultExpansionPacks }
            mockInsertSingle.mockResolvedValue({ data: newPrefs, error: null })

            await useUserPreferencesStore.getState().updateExpansionPacks(defaultExpansionPacks)

            expect(mockInsert).toHaveBeenCalled()
        })
    })

    describe('createInitialPreferences', () => {
        test('inserts preferences and updates store state', async () => {
            const newPrefs = { id: 'pref-1', user_id: 'user-123', expansion_packs: defaultExpansionPacks }
            mockInsertSingle.mockResolvedValue({ data: newPrefs, error: null })

            await useUserPreferencesStore.getState().createInitialPreferences(defaultExpansionPacks)

            expect(useUserPreferencesStore.getState().preferences).toEqual(newPrefs)
        })

        test('throws when Supabase insert fails', async () => {
            mockInsertSingle.mockResolvedValue({ data: null, error: { message: 'Insert failed' } })

            await expect(
                useUserPreferencesStore.getState().createInitialPreferences(defaultExpansionPacks)
            ).rejects.toThrow('Insert failed')
        })

        test('throws when user is not authenticated', async () => {
            mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } })

            await expect(
                useUserPreferencesStore.getState().createInitialPreferences(defaultExpansionPacks)
            ).rejects.toThrow('User not authenticated')
        })
    })
})
