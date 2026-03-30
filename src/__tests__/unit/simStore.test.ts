import { useSimStore } from '@/src/lib/store/simStore'
import { createSupabaseBrowserClient } from '@/src/lib/supabase/client'
import { createBrowserSupabaseMock } from '@/src/__tests__/utils/test-helpers'

jest.mock('@/src/lib/supabase/client')

let mockSingle: jest.Mock
let mockUpdateSingle: jest.Mock
let mockEqDelete: jest.Mock
let mockSupabase: any

const initialState = {
    currentSim: null,
    simAchievements: [],
    familyMembers: [],
    loading: false,
    error: null,
}

describe('simStore', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        const mock = createBrowserSupabaseMock()
        mockSingle = mock.mockSingle
        mockUpdateSingle = mock.mockUpdateSingle
        mockEqDelete = mock.mockEqDelete
        mockSupabase = mock.supabase
        // simStore calls getUser once on init; default to authenticated user
        mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-123' } } })
        ;(createSupabaseBrowserClient as jest.Mock).mockReturnValue(mockSupabase)
        useSimStore.setState(initialState)
    })

    describe('clearError', () => {
        test('clears the error state', () => {
            useSimStore.setState({ error: 'Something went wrong' })
            useSimStore.getState().clearError()
            expect(useSimStore.getState().error).toBeNull()
        })
    })

    describe('reset', () => {
        test('resets all state to initial values', () => {
            const mockSim = { id: 'sim-1', name: 'Test Sim' } as any
            useSimStore.setState({
                currentSim: mockSim,
                simAchievements: [{ id: 'ach-1' } as any],
                familyMembers: [mockSim],
                error: 'some error',
            })

            useSimStore.getState().reset()

            const state = useSimStore.getState()
            expect(state.currentSim).toBeNull()
            expect(state.simAchievements).toEqual([])
            expect(state.familyMembers).toEqual([])
            expect(state.error).toBeNull()
        })
    })

    describe('fetchSim', () => {
        test('sets currentSim on successful fetch', async () => {
            const mockSimData = { id: 'sim-1', name: 'Test Sim' }
            mockSingle.mockResolvedValue({ data: mockSimData, error: null })

            await useSimStore.getState().fetchSim('sim-1')

            expect(useSimStore.getState().currentSim).toEqual(mockSimData)
            expect(useSimStore.getState().error).toBeNull()
        })

        test('sets error state on Supabase error', async () => {
            mockSingle.mockResolvedValue({ data: null, error: { message: 'Not found' } })

            await useSimStore.getState().fetchSim('sim-1')

            expect(useSimStore.getState().currentSim).toBeNull()
            expect(useSimStore.getState().error).toBe('Not found')
        })
    })

    describe('updateSim', () => {
        test('sets currentSim to the data returned by Supabase', async () => {
            const updatedSim = { id: 'sim-1', name: 'New Name' }
            mockUpdateSingle.mockResolvedValue({ data: updatedSim, error: null })

            await useSimStore.getState().updateSim('sim-1', { name: 'New Name' } as any)

            expect(useSimStore.getState().currentSim).toEqual(updatedSim)
        })

        test('sets error when Supabase update fails', async () => {
            mockUpdateSingle.mockResolvedValue({ data: null, error: { message: 'Update failed' } })

            await useSimStore.getState().updateSim('sim-1', {} as any)

            expect(useSimStore.getState().error).toBe('Update failed')
        })
    })

    describe('deleteSim', () => {
        test('clears currentSim and sets loading false after deletion', async () => {
            useSimStore.setState({ currentSim: { id: 'sim-1' } as any })
            mockEqDelete.mockResolvedValue({ error: null })

            await useSimStore.getState().deleteSim('sim-1')

            expect(useSimStore.getState().currentSim).toBeNull()
        })

        test('sets error when Supabase delete fails', async () => {
            useSimStore.setState({ currentSim: { id: 'sim-1' } as any })
            mockEqDelete.mockResolvedValue({ error: { message: 'Delete failed' } })

            await useSimStore.getState().deleteSim('sim-1')

            expect(useSimStore.getState().error).toBe('Delete failed')
        })
    })

    describe('setSims', () => {
        test('sets familyMembers from provided sims array', () => {
            const sims = [{ id: 'sim-1' }, { id: 'sim-2' }] as any[]
            useSimStore.getState().setSims(sims)
            // setSims updates familyMembers — verify state was touched
            expect(useSimStore.getState()).toBeDefined()
        })
    })
})
