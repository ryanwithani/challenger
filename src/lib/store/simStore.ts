import { create } from 'zustand'
import { createSupabaseBrowserClient } from '@/src/lib/supabase/client'
import { Database } from '@/src/types/database.types'

type Sim = Database['public']['Tables']['sims']['Row']
type SimAchievement = Database['public']['Tables']['sim_achievements']['Row']
type SimInsert = Database['public']['Tables']['sims']['Insert']
type SimUpdate = Database['public']['Tables']['sims']['Update']

interface SimState {
    currentSim: Sim | null
    simAchievements: SimAchievement[]
    familyMembers: Sim[]
    loading: boolean
    error: string | null

    // Sim operations
    fetchSim: (id: string) => Promise<void>
    updateSim: (id: string, updates: SimUpdate) => Promise<void>
    deleteSim: (id: string) => Promise<void>

    // Achievement operations
    fetchSimAchievements: (simId: string) => Promise<void>
    addSimAchievement: (achievement: Partial<SimAchievement>) => Promise<void>

    // Family operations
    fetchFamilyMembers: (challengeId: string) => Promise<void>
    fetchAllSims: () => Promise<void>
    updateSimRelationship: (simId: string, relationship: string) => Promise<void>
    makeHeir: (simId: string, challengeId: string) => Promise<void>

    // Utility
    clearError: () => void
    reset: () => void
}

export const useSimStore = create<SimState>((set, get) => ({
    currentSim: null,
    simAchievements: [],
    familyMembers: [],
    loading: false,
    error: null,

    fetchSim: async (id: string) => {
        set({ loading: true, error: null })
        const supabase = createSupabaseBrowserClient()

        try {
            const { data, error } = await supabase
                .from('sims')
                .select('*')
                .eq('id', id)
                .single()

            if (error) throw error

            set({ currentSim: data, loading: false })
        } catch (error: any) {
            set({ error: error.message, loading: false })
        }
    },

    updateSim: async (id: string, updates: SimUpdate) => {
        set({ loading: true, error: null })
        const supabase = createSupabaseBrowserClient()

        try {
            const { data, error } = await supabase
                .from('sims')
                .update(updates)
                .eq('id', id)
                .select()
                .single()

            if (error) throw error

            set({
                currentSim: data,
                familyMembers: get().familyMembers.map(sim =>
                    sim.id === id ? data : sim
                ),
                loading: false
            })
        } catch (error: any) {
            set({ error: error.message, loading: false })
        }
    },

    deleteSim: async (id: string) => {
        set({ loading: true, error: null })
        const supabase = createSupabaseBrowserClient()

        try {
            const { error } = await supabase
                .from('sims')
                .delete()
                .eq('id', id)

            if (error) throw error

            set({
                currentSim: null,
                familyMembers: get().familyMembers.filter(sim => sim.id !== id),
                loading: false
            })
        } catch (error: any) {
            set({ error: error.message, loading: false })
        }
    },

    fetchSimAchievements: async (simId: string) => {
        const supabase = createSupabaseBrowserClient()

        try {
            const { data, error } = await supabase
                .from('sim_achievements')
                .select('*')
                .eq('sim_id', simId)
                .order('achieved_at', { ascending: false })

            if (error) throw error

            set({ simAchievements: data || [] })
        } catch (error: any) {
            set({ error: error.message })
        }
    },

    addSimAchievement: async (achievement: Partial<SimAchievement>) => {
        const supabase = createSupabaseBrowserClient()

        try {
            const { data, error } = await supabase
                .from('sim_achievements')
                .insert(achievement)
                .select()
                .single()

            if (error) throw error

            set({
                simAchievements: [data, ...get().simAchievements]
            })
        } catch (error: any) {
            set({ error: error.message })
        }
    },

    fetchFamilyMembers: async (challengeId: string) => {
        const supabase = createSupabaseBrowserClient()

        try {
            const { data, error } = await supabase
                .from('sims')
                .select('*')
                .eq('challenge_id', challengeId)
                .order('generation', { ascending: true })

            if (error) throw error

            set({ familyMembers: data || [] })
        } catch (error: any) {
            set({ error: error.message })
        }
    },

    fetchAllSims: async () => {
        const supabase = createSupabaseBrowserClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) return

        try {
            // Fetch all sims for user's challenges
            const { data, error } = await supabase
                .from('sims')
                .select(`
          *,
          challenges!inner(user_id)
        `)
                .eq('challenges.user_id', user.id)
                .order('created_at', { ascending: false })

            if (error) throw error

            set({ familyMembers: data || [] })
        } catch (error: any) {
            set({ error: error.message })
        }
    },

    updateSimRelationship: async (simId: string, relationship: string) => {
        const supabase = createSupabaseBrowserClient()

        try {
            const { data, error } = await supabase
                .from('sims')
                .update({ relationship_to_heir: relationship })
                .eq('id', simId)
                .select()
                .single()

            if (error) throw error

            set({
                currentSim: get().currentSim?.id === simId ? data : get().currentSim,
                familyMembers: get().familyMembers.map(sim =>
                    sim.id === simId ? data : sim
                )
            })
        } catch (error: any) {
            set({ error: error.message })
        }
    },

    makeHeir: async (simId: string, challengeId: string) => {
        const supabase = createSupabaseBrowserClient()

        try {
            // First, remove heir status from all sims in the challenge
            await supabase
                .from('sims')
                .update({ is_heir: false })
                .eq('challenge_id', challengeId)

            // Then make the selected sim the heir
            const { data, error } = await supabase
                .from('sims')
                .update({
                    is_heir: true,
                    relationship_to_heir: null // Heirs don't have relationships to themselves
                })
                .eq('id', simId)
                .select()
                .single()

            if (error) throw error

            // Refresh family members to reflect changes
            await get().fetchFamilyMembers(challengeId)

            if (get().currentSim?.id === simId) {
                set({ currentSim: data })
            }
        } catch (error: any) {
            set({ error: error.message })
        }
    },

    clearError: () => set({ error: null }),

    reset: () => set({
        currentSim: null,
        simAchievements: [],
        familyMembers: [],
        loading: false,
        error: null
    })
}))