import { useChallengeStore } from '@/src/lib/store/challengeStore'
import { createSupabaseBrowserClient } from '@/src/lib/supabase/client'

jest.mock('@/src/lib/supabase/client')
jest.mock('@/src/components/challenge/GoalsSeeder', () => ({
    seedLegacyChallengeGoals: jest.fn(),
}))
jest.mock('@/src/lib/store/authStore', () => ({
    useAuthStore: {
        getState: () => ({ user: { id: 'user-123' } }),
    },
}))

// ---------- Fixtures ----------

function makeGoal(overrides: Record<string, any> = {}) {
    return {
        id: 'goal-1',
        challenge_id: 'challenge-1',
        title: 'Test Goal',
        goal_type: 'milestone',
        point_value: 10,
        max_points: null,
        current_value: 0,
        target_value: 1,
        thresholds: null,
        category: 'general',
        is_required: false,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
        ...overrides,
    }
}

function makeProgress(overrides: Record<string, any> = {}) {
    return {
        id: 'progress-1',
        goal_id: 'goal-1',
        user_id: 'user-123',
        challenge_id: 'challenge-1',
        sim_id: null,
        completed_at: '2024-01-01',
        completion_details: null,
        ...overrides,
    }
}

// ---------- Supabase mock ----------

const mockSingle = jest.fn()
const mockInsertSelect = jest.fn().mockReturnValue({ single: mockSingle })
const mockInsert = jest.fn().mockReturnValue({ select: mockInsertSelect })
const mockEq = jest.fn().mockResolvedValue({ error: null })
const mockUpdate = jest.fn().mockReturnValue({ eq: mockEq })
const mockDelete = jest.fn().mockReturnValue({ eq: mockEq })
const mockSelectFrom = jest.fn().mockReturnValue({
    eq: jest.fn().mockReturnValue({
        order: jest.fn().mockResolvedValue({ data: [], error: null }),
    }),
    ilike: jest.fn().mockReturnValue({ maybySingle: jest.fn().mockResolvedValue({ data: null }) }),
})

const mockSupabase = {
    auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'user-123' } } }),
    },
    from: jest.fn().mockReturnValue({
        select: mockSelectFrom,
        insert: mockInsert,
        update: mockUpdate,
        delete: mockDelete,
    }),
    rpc: jest.fn().mockResolvedValue({ data: [], error: null }),
}

const initialState = {
    challenges: [],
    currentChallenge: null,
    sims: [],
    goals: [],
    progress: [],
    loading: false,
    challengesLoading: false,
    lastChallengesFetch: null,
    completions: new Set<string>(),
}

describe('challengeStore', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        ;(createSupabaseBrowserClient as jest.Mock).mockReturnValue(mockSupabase)
        useChallengeStore.setState(initialState)
    })

    // ---- calculatePoints ----

    describe('calculatePoints', () => {
        test('returns 0 when there are no goals', () => {
            useChallengeStore.setState({ goals: [], progress: [] })
            expect(useChallengeStore.getState().calculatePoints()).toBe(0)
        })

        test('milestone goal: returns full points when completed', () => {
            const goal = makeGoal({ id: 'g1', goal_type: 'milestone', point_value: 10 })
            const progress = makeProgress({ goal_id: 'g1' })
            useChallengeStore.setState({ goals: [goal as any], progress: [progress as any] })

            expect(useChallengeStore.getState().calculatePoints()).toBe(10)
        })

        test('milestone goal: returns 0 when not completed', () => {
            const goal = makeGoal({ id: 'g1', goal_type: 'milestone', point_value: 10 })
            useChallengeStore.setState({ goals: [goal as any], progress: [] })

            expect(useChallengeStore.getState().calculatePoints()).toBe(0)
        })

        test('counter goal: multiplies current_value by point_value', () => {
            const goal = makeGoal({ id: 'g1', goal_type: 'counter', point_value: 5, current_value: 4, max_points: null })
            useChallengeStore.setState({ goals: [goal as any], progress: [] })

            expect(useChallengeStore.getState().calculatePoints()).toBe(20)
        })

        test('counter goal: caps at max_points', () => {
            const goal = makeGoal({ id: 'g1', goal_type: 'counter', point_value: 5, current_value: 10, max_points: 25 })
            useChallengeStore.setState({ goals: [goal as any], progress: [] })

            expect(useChallengeStore.getState().calculatePoints()).toBe(25)
        })

        test('threshold goal: awards points for highest met threshold', () => {
            const thresholds = JSON.stringify([
                { value: 10, points: 5 },
                { value: 20, points: 10 },
                { value: 30, points: 15 },
            ])
            const goal = makeGoal({ id: 'g1', goal_type: 'threshold', thresholds, current_value: 25 })
            useChallengeStore.setState({ goals: [goal as any], progress: [] })

            expect(useChallengeStore.getState().calculatePoints()).toBe(10)
        })

        test('threshold goal: returns 0 when no threshold is met', () => {
            const thresholds = JSON.stringify([{ value: 10, points: 5 }])
            const goal = makeGoal({ id: 'g1', goal_type: 'threshold', thresholds, current_value: 5 })
            useChallengeStore.setState({ goals: [goal as any], progress: [] })

            expect(useChallengeStore.getState().calculatePoints()).toBe(0)
        })

        test('penalty goal (occurrence): subtracts for each progress entry', () => {
            const goal = makeGoal({ id: 'g1', goal_type: 'penalty', point_value: -5 })
            const progress = [
                makeProgress({ id: 'p1', goal_id: 'g1' }),
                makeProgress({ id: 'p2', goal_id: 'g1' }),
            ]
            useChallengeStore.setState({ goals: [goal as any], progress: progress as any[] })

            expect(useChallengeStore.getState().calculatePoints()).toBe(-10)
        })

        test('penalty goal (counter type): multiplies current_value by point_value', () => {
            const goal = makeGoal({ id: 'g1', goal_type: 'counter', point_value: -3, current_value: 4, category: 'penalties' })
            useChallengeStore.setState({ goals: [goal as any], progress: [] })

            expect(useChallengeStore.getState().calculatePoints()).toBe(-12)
        })

        test('sums across multiple goals of different types', () => {
            const goals = [
                makeGoal({ id: 'g1', goal_type: 'milestone', point_value: 10 }),
                makeGoal({ id: 'g2', goal_type: 'counter', point_value: 5, current_value: 3, max_points: null }),
                makeGoal({ id: 'g3', goal_type: 'penalty', point_value: -2 }),
            ]
            const progress = [
                makeProgress({ id: 'p1', goal_id: 'g1' }), // milestone completed
                makeProgress({ id: 'p2', goal_id: 'g3' }), // 1 penalty occurrence
            ]
            useChallengeStore.setState({ goals: goals as any[], progress: progress as any[] })

            // 10 (milestone) + 15 (counter) + (-2) (penalty) = 23
            expect(useChallengeStore.getState().calculatePoints()).toBe(23)
        })
    })

    // ---- calculateCategoryPoints — family ----

    function makeFamilyGenerationGoal(overrides: Record<string, any> = {}) {
        return makeGoal({
            id: 'family-gen-ya',
            title: 'Generations Reaching Young Adult',
            goal_type: 'counter',
            point_value: 1,
            max_points: 10,
            current_value: 0,
            category: 'family',
            ...overrides,
        })
    }

    function makeFamilyTenChildrenGoal(overrides: Record<string, any> = {}) {
        return makeGoal({
            id: 'family-ten-children',
            title: '10 Children in Single Generation',
            goal_type: 'milestone',
            point_value: 1,
            category: 'family',
            ...overrides,
        })
    }

    describe('calculateCategoryPoints — family', () => {
        describe('Generations Reaching Young Adult (counter)', () => {
            test('returns 0 when no generations have reached YA', () => {
                const goal = makeFamilyGenerationGoal({ current_value: 0 })
                useChallengeStore.setState({ goals: [goal as any], progress: [] })
                expect(useChallengeStore.getState().calculateCategoryPoints('family')).toBe(0)
            })

            test('returns 1 point per generation that reached YA', () => {
                const goal = makeFamilyGenerationGoal({ current_value: 3 })
                useChallengeStore.setState({ goals: [goal as any], progress: [] })
                expect(useChallengeStore.getState().calculateCategoryPoints('family')).toBe(3)
            })

            test('caps at max_points (10) even if current_value exceeds it', () => {
                const goal = makeFamilyGenerationGoal({ current_value: 15 })
                useChallengeStore.setState({ goals: [goal as any], progress: [] })
                expect(useChallengeStore.getState().calculateCategoryPoints('family')).toBe(10)
            })

            test('returns exactly 10 when all 10 generations reached YA', () => {
                const goal = makeFamilyGenerationGoal({ current_value: 10 })
                useChallengeStore.setState({ goals: [goal as any], progress: [] })
                expect(useChallengeStore.getState().calculateCategoryPoints('family')).toBe(10)
            })
        })
    })

    // ---- isPenaltyGoal ----

    describe('isPenaltyGoal', () => {
        test('returns true for goal_type === "penalty"', () => {
            const goal = makeGoal({ goal_type: 'penalty' })
            expect(useChallengeStore.getState().isPenaltyGoal(goal as any)).toBe(true)
        })

        test('returns true for negative point_value', () => {
            const goal = makeGoal({ goal_type: 'milestone', point_value: -5 })
            expect(useChallengeStore.getState().isPenaltyGoal(goal as any)).toBe(true)
        })

        test('returns true for category "penalties"', () => {
            const goal = makeGoal({ goal_type: 'milestone', point_value: 10, category: 'penalties' })
            expect(useChallengeStore.getState().isPenaltyGoal(goal as any)).toBe(true)
        })

        test('returns false for a regular milestone goal', () => {
            const goal = makeGoal({ goal_type: 'milestone', point_value: 10, category: 'general' })
            expect(useChallengeStore.getState().isPenaltyGoal(goal as any)).toBe(false)
        })
    })

    // ---- hasStartedProgress ----

    describe('hasStartedProgress', () => {
        test('returns false when there is no progress', () => {
            useChallengeStore.setState({ progress: [] })
            expect(useChallengeStore.getState().hasStartedProgress()).toBe(false)
        })

        test('returns true when there is at least one progress entry', () => {
            useChallengeStore.setState({ progress: [makeProgress() as any] })
            expect(useChallengeStore.getState().hasStartedProgress()).toBe(true)
        })
    })

    // ---- setChallenges ----

    describe('setChallenges', () => {
        test('updates challenges and sets lastChallengesFetch timestamp', () => {
            const challenges = [{ id: 'c1', title: 'Challenge 1' }] as any[]
            const before = Date.now()

            useChallengeStore.getState().setChallenges(challenges)

            const state = useChallengeStore.getState()
            expect(state.challenges).toEqual(challenges)
            expect(state.lastChallengesFetch).toBeGreaterThanOrEqual(before)
        })
    })

    // ---- deleteChallenge ----

    describe('deleteChallenge', () => {
        test('removes the challenge from state after deletion', async () => {
            useChallengeStore.setState({
                challenges: [
                    { id: 'c1', title: 'Keep' } as any,
                    { id: 'c2', title: 'Delete' } as any,
                ],
            })
            mockEq.mockResolvedValue({ error: null })

            await useChallengeStore.getState().deleteChallenge('c2')

            const state = useChallengeStore.getState()
            expect(state.challenges).toHaveLength(1)
            expect(state.challenges[0].id).toBe('c1')
        })

        test('throws when Supabase returns an error', async () => {
            useChallengeStore.setState({ challenges: [{ id: 'c1' } as any] })
            mockEq.mockResolvedValue({ error: { message: 'Delete failed' } })

            await expect(useChallengeStore.getState().deleteChallenge('c1')).rejects.toMatchObject({
                message: 'Delete failed',
            })
        })
    })

    // ---- completions ----

    describe('completions', () => {
        test('fetchCompletions populates completions set from DB data', async () => {
            mockSupabase.from.mockReturnValueOnce({
                select: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        eq: jest.fn().mockResolvedValue({
                            data: [
                                { item_key: 'skills:Cooking' },
                                { item_key: 'deaths:Fire' },
                            ],
                            error: null,
                        }),
                    }),
                }),
            })

            await useChallengeStore.getState().fetchCompletions('challenge-1')

            const completions = useChallengeStore.getState().completions
            expect(completions.has('skills:Cooking')).toBe(true)
            expect(completions.has('deaths:Fire')).toBe(true)
            expect(completions.size).toBe(2)
        })

        test('toggleCompletion adds item key optimistically and calls RPC', async () => {
            useChallengeStore.setState({
                completions: new Set<string>(),
                currentChallenge: { id: 'challenge-1' } as any,
                goals: [makeGoal({ goal_type: 'counter', current_value: 0 })],
            })

            mockSupabase.rpc.mockResolvedValueOnce({
                data: { action: 'completed' },
                error: null,
            })

            await useChallengeStore.getState().toggleCompletion('challenge-1', 'skills:Cooking')

            expect(useChallengeStore.getState().completions.has('skills:Cooking')).toBe(true)
            expect(mockSupabase.rpc).toHaveBeenCalledWith('toggle_completion', {
                p_challenge_id: 'challenge-1',
                p_item_key: 'skills:Cooking',
                p_user_id: 'user-123',
            })
        })

        test('toggleCompletion removes item key when already completed', async () => {
            useChallengeStore.setState({
                completions: new Set<string>(['skills:Cooking']),
                currentChallenge: { id: 'challenge-1' } as any,
                goals: [],
            })

            mockSupabase.rpc.mockResolvedValueOnce({
                data: { action: 'uncompleted' },
                error: null,
            })

            await useChallengeStore.getState().toggleCompletion('challenge-1', 'skills:Cooking')

            expect(useChallengeStore.getState().completions.has('skills:Cooking')).toBe(false)
        })

        test('toggleCompletion reverts optimistic update on RPC error', async () => {
            useChallengeStore.setState({
                completions: new Set<string>(),
                currentChallenge: { id: 'challenge-1' } as any,
                goals: [],
            })

            mockSupabase.rpc.mockResolvedValueOnce({
                data: null,
                error: { message: 'RPC failed' },
            })

            await expect(
                useChallengeStore.getState().toggleCompletion('challenge-1', 'skills:Cooking')
            ).rejects.toThrow('RPC failed')

            expect(useChallengeStore.getState().completions.has('skills:Cooking')).toBe(false)
        })
    })
})
