import { create } from 'zustand'
import { createSupabaseBrowserClient } from '@/src/lib/supabase/client'
import { Database } from '@/src/types/database.types'

type Challenge = Database['public']['Tables']['challenges']['Row']
type Sim = Database['public']['Tables']['sims']['Row']
type Goal = Database['public']['Tables']['goals']['Row']
type Progress = Database['public']['Tables']['progress']['Row']

interface ChallengeState {
  challenges: Challenge[]
  currentChallenge: Challenge | null
  sims: Sim[]
  goals: Goal[]
  progress: Progress[]
  loading: boolean
  
  fetchChallenges: () => Promise<void>
  fetchChallenge: (id: string) => Promise<void>
  createChallenge: (challenge: Partial<Challenge>) => Promise<void>
  updateChallenge: (id: string, updates: Partial<Challenge>) => Promise<void>
  deleteChallenge: (id: string) => Promise<void>
  
  addSim: (sim: Partial<Sim>) => Promise<void>
  updateSim: (id: string, updates: Partial<Sim>) => Promise<void>
  deleteSim: (id: string) => Promise<void>
  
  addGoal: (goal: Partial<Goal>) => Promise<void>
  updateGoal: (id: string, updates: Partial<Goal>) => Promise<void>
  deleteGoal: (id: string) => Promise<void>
  
  toggleGoalProgress: (goalId: string, simId?: string) => Promise<void>
  calculatePoints: () => number
}

export const useChallengeStore = create<ChallengeState>((set, get) => ({
  challenges: [],
  currentChallenge: null,
  sims: [],
  goals: [],
  progress: [],
  loading: false,
  
  fetchChallenges: async () => {
    set({ loading: true })
    const supabase = createSupabaseBrowserClient()
    const { data, error } = await supabase
      .from('challenges')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (!error && data) {
      set({ challenges: data, loading: false })
    } else {
      set({ loading: false })
    }
  },
  
  fetchChallenge: async (id: string) => {
    set({ loading: true })
    const supabase = createSupabaseBrowserClient()
    
    // Fetch challenge details
    const { data: challenge } = await supabase
      .from('challenges')
      .select('*')
      .eq('id', id)
      .single()
    
    // Fetch related data
    const { data: sims } = await supabase
      .from('sims')
      .select('*')
      .eq('challenge_id', id)
      .order('generation', { ascending: true })
    
    const { data: goals } = await supabase
      .from('goals')
      .select('*')
      .eq('challenge_id', id)
      .order('order_index', { ascending: true })
    
    const { data: progress } = await supabase
      .from('progress')
      .select('*')
      .in('goal_id', goals?.map((g: Goal) => g.id) || [])
    
    set({
      currentChallenge: challenge,
      sims: sims || [],
      goals: goals || [],
      progress: progress || [],
      loading: false
    })
  },
  
  createChallenge: async (challenge: Partial<Challenge>) => {
    const supabase = createSupabaseBrowserClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) throw new Error('User not authenticated')
    
    const { data, error } = await supabase
      .from('challenges')
      .insert({
        ...challenge,
        user_id: user.id,
        status: 'active',
      })
      .select()
      .single()
    
    if (error) {
      console.error('Supabase error:', error)
      throw new Error(error.message || 'Failed to create challenge')
    }
    
    if (data) {
      set({ challenges: [...get().challenges, data] })
    }
  },
  
  updateChallenge: async (id: string, updates: Partial<Challenge>) => {
    const supabase = createSupabaseBrowserClient()
    const { error } = await supabase
      .from('challenges')
      .update(updates)
      .eq('id', id)
    
    if (!error) {
      set({
        challenges: get().challenges.map(c => 
          c.id === id ? { ...c, ...updates } : c
        )
      })
    }
  },
  
  deleteChallenge: async (id: string) => {
    const supabase = createSupabaseBrowserClient()
    const { error } = await supabase
      .from('challenges')
      .delete()
      .eq('id', id)
    
    if (!error) {
      set({
        challenges: get().challenges.filter(c => c.id !== id)
      })
    }
  },
  
  addSim: async (sim: Partial<Sim>) => {
    const supabase = createSupabaseBrowserClient()
    const { data, error } = await supabase
      .from('sims')
      .insert(sim)
      .select()
      .single()
    
    if (!error && data) {
      set({ sims: [...get().sims, data] })
    }
  },
  
  updateSim: async (id: string, updates: Partial<Sim>) => {
    const supabase = createSupabaseBrowserClient()
    const { error } = await supabase
      .from('sims')
      .update(updates)
      .eq('id', id)
    
    if (!error) {
      set({
        sims: get().sims.map(s => 
          s.id === id ? { ...s, ...updates } : s
        )
      })
    }
  },
  
  deleteSim: async (id: string) => {
    const supabase = createSupabaseBrowserClient()
    const { error } = await supabase
      .from('sims')
      .delete()
      .eq('id', id)
    
    if (!error) {
      set({
        sims: get().sims.filter(s => s.id !== id)
      })
    }
  },
  
  addGoal: async (goal: Partial<Goal>) => {
    const supabase = createSupabaseBrowserClient()
    const { data, error } = await supabase
      .from('goals')
      .insert(goal)
      .select()
      .single()
    
    if (!error && data) {
      set({ goals: [...get().goals, data] })
    }
  },
  
  updateGoal: async (id: string, updates: Partial<Goal>) => {
    const supabase = createSupabaseBrowserClient()
    const { error } = await supabase
      .from('goals')
      .update(updates)
      .eq('id', id)
    
    if (!error) {
      set({
        goals: get().goals.map(g => 
          g.id === id ? { ...g, ...updates } : g
        )
      })
    }
  },
  
  deleteGoal: async (id: string) => {
    const supabase = createSupabaseBrowserClient()
    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', id)
    
    if (!error) {
      set({
        goals: get().goals.filter(g => g.id !== id)
      })
    }
  },
  
  toggleGoalProgress: async (goalId: string, simId?: string) => {
    const supabase = createSupabaseBrowserClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) throw new Error('User not authenticated')
    
    const existingProgress = get().progress.find(p => 
      p.goal_id === goalId && p.user_id === user.id
    )
    
    if (existingProgress) {
      // Remove progress
      const { error } = await supabase
        .from('progress')
        .delete()
        .eq('id', existingProgress.id)
      
      if (!error) {
        set({
          progress: get().progress.filter(p => p.id !== existingProgress.id)
        })
      }
    } else {
      // Add progress
      const { data, error } = await supabase
        .from('progress')
        .insert({
          user_id: user.id,
          goal_id: goalId,
          sim_id: simId,
        })
        .select()
        .single()
      
      if (!error && data) {
        set({ progress: [...get().progress, data] })
      }
    }
  },
  
  calculatePoints: () => {
    const { goals, progress } = get()
    return goals.reduce((total, goal) => {
      const isCompleted = progress.some(p => p.goal_id === goal.id)
      return isCompleted ? total + goal.point_value : total
    }, 0)
  },
}))