import { useSimStore } from '@/src/lib/store/simStore'
import { createSupabaseBrowserClient } from '@/src/lib/supabase/client'
import { createBrowserSupabaseMock } from '@/src/__tests__/utils/test-helpers'

jest.mock('@/src/lib/supabase/client')

let mockSingle: jest.Mock
let mockUpdateSingle: jest.Mock
let mockEqDelete: jest.Mock
let mockOrder: jest.Mock
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
        mockOrder = mock.mockOrder
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
            expect(useSimStore.getState().familyMembers).toEqual(sims)
        })
    })

    describe('fetchAllSims', () => {
        test('fetches sims by user_id via select query', async () => {
            const mockSims = [
                { id: 'sim-1', name: 'Sim A', user_id: 'user-123', challenge_id: null },
                { id: 'sim-2', name: 'Sim B', user_id: 'user-123', challenge_id: 'ch-1' },
            ]
            mockOrder.mockResolvedValue({ data: mockSims, error: null })

            await useSimStore.getState().fetchAllSims()

            expect(useSimStore.getState().familyMembers).toEqual(mockSims)
            expect(useSimStore.getState().loading).toBe(false)
        })

        test('sets empty array when user is not authenticated', async () => {
            mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } })

            await useSimStore.getState().fetchAllSims()

            expect(useSimStore.getState().familyMembers).toEqual([])
        })

        test('sets error on fetch failure', async () => {
            mockOrder.mockResolvedValue({ data: null, error: { message: 'Fetch failed' } })

            await useSimStore.getState().fetchAllSims()

            expect(useSimStore.getState().error).toBe('Fetch failed')
        })
    })

    describe('assignToChallenge', () => {
        test('updates sim challenge_id', async () => {
            const updatedSim = { id: 'sim-1', name: 'Test', challenge_id: 'ch-1', user_id: 'user-123' }
            mockUpdateSingle.mockResolvedValue({ data: updatedSim, error: null })

            await useSimStore.getState().assignToChallenge('sim-1', 'ch-1')

            expect(useSimStore.getState().currentSim).toEqual(updatedSim)
            expect(useSimStore.getState().loading).toBe(false)
        })

        test('updates familyMembers list when sim is assigned', async () => {
            const existingSim = { id: 'sim-1', name: 'Test', challenge_id: null, user_id: 'user-123' }
            const updatedSim = { id: 'sim-1', name: 'Test', challenge_id: 'ch-1', user_id: 'user-123' }
            useSimStore.setState({ familyMembers: [existingSim] as any[] })
            mockUpdateSingle.mockResolvedValue({ data: updatedSim, error: null })

            await useSimStore.getState().assignToChallenge('sim-1', 'ch-1')

            expect(useSimStore.getState().familyMembers).toEqual([updatedSim])
        })

        test('sets error when assign fails', async () => {
            mockUpdateSingle.mockResolvedValue({ data: null, error: { message: 'Assign failed' } })

            await useSimStore.getState().assignToChallenge('sim-1', 'ch-1')

            expect(useSimStore.getState().error).toBe('Assign failed')
            expect(useSimStore.getState().loading).toBe(false)
        })
    })

    describe('unassignFromChallenge', () => {
        test('sets sim challenge_id to null', async () => {
            const updatedSim = { id: 'sim-1', name: 'Test', challenge_id: null, user_id: 'user-123' }
            mockUpdateSingle.mockResolvedValue({ data: updatedSim, error: null })

            await useSimStore.getState().unassignFromChallenge('sim-1')

            expect(useSimStore.getState().currentSim).toEqual(updatedSim)
            expect(useSimStore.getState().loading).toBe(false)
        })

        test('updates familyMembers list when sim is unassigned', async () => {
            const existingSim = { id: 'sim-1', name: 'Test', challenge_id: 'ch-1', user_id: 'user-123' }
            const updatedSim = { id: 'sim-1', name: 'Test', challenge_id: null, user_id: 'user-123' }
            useSimStore.setState({ familyMembers: [existingSim] as any[] })
            mockUpdateSingle.mockResolvedValue({ data: updatedSim, error: null })

            await useSimStore.getState().unassignFromChallenge('sim-1')

            expect(useSimStore.getState().familyMembers).toEqual([updatedSim])
        })

        test('sets error when unassign fails', async () => {
            mockUpdateSingle.mockResolvedValue({ data: null, error: { message: 'Unassign failed' } })

            await useSimStore.getState().unassignFromChallenge('sim-1')

            expect(useSimStore.getState().error).toBe('Unassign failed')
            expect(useSimStore.getState().loading).toBe(false)
        })
    })
})
