import { create } from 'zustand'
import { createSupabaseBrowserClient } from '@/src/lib/supabase/client'
import { Database } from '@/src/types/database.types'
import { seedLegacyChallengeGoals, LegacyChallengeConfig } from '@/src/components/challenge/GoalsSeeder'

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

  // Challenge methods
  fetchChallenges: () => Promise<void>
  fetchChallenge: (id: string) => Promise<void>
  createChallenge: (challenge: Partial<Challenge>) => Promise<void>
  updateChallenge: (id: string, updates: Partial<Challenge>) => Promise<void>
  deleteChallenge: (id: string) => Promise<void>

  // Sim methods
  addSim: (sim: Partial<Sim>) => Promise<void>
  updateSim: (id: string, updates: Partial<Sim>) => Promise<void>
  deleteSim: (id: string) => Promise<void>
  getSimAchievements: (simId: string) => Promise<any[]>

  // Goal methods
  addGoal: (goal: Partial<Goal>) => Promise<void>
  updateGoal: (id: string, updates: Partial<Goal>) => Promise<void>
  deleteGoal: (id: string) => Promise<void>

  // Progress and achievement methods
  toggleGoalProgress: (goalId: string, simId?: string) => Promise<void>
  updateGoalValue: (goalId: string, newValue: number) => Promise<void>
  addSimAchievement: (simId: string, achievement: {
    goal_id: string
    goal_title: string
    method: string
    points_earned: number
    notes?: string
  }) => Promise<void>
  completeGoalWithDetails: (goalId: string, simId: string, method: string, notes?: string) => Promise<void>
  getGoalCompletionDetails: (goalId: string) => any

  // Calculation methods
  calculatePoints: () => number
  calculateCategoryPoints: (category: string) => number
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
    try {
      const supabase = createSupabaseBrowserClient()
      const { data, error } = await supabase
        .from('challenges')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      set({ challenges: data || [], loading: false })
    } catch (error) {
      console.error('Error fetching challenges:', error)
      set({ loading: false })
    }
  },

  fetchChallenge: async (id: string) => {
    set({ loading: true })
    try {
      const supabase = createSupabaseBrowserClient()

      // Fetch challenge details
      const { data: challenge, error: challengeError } = await supabase
        .from('challenges')
        .select('*')
        .eq('id', id)
        .single()

      if (challengeError) throw challengeError

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
    } catch (error) {
      console.error('Error fetching challenge:', error)
      set({ loading: false })
    }
  },

  createChallenge: async (challenge: Partial<Challenge>) => {
    try {
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

        // If this is a Legacy Challenge, seed it with predefined goals
        if (data.challenge_type === 'legacy') {
          try {
            const config = data.configuration as LegacyChallengeConfig
            await seedLegacyChallengeGoals(data.id, config, supabase)
            console.log('Legacy Challenge goals seeded successfully')
          } catch (seedError) {
            console.error('Failed to seed Legacy Challenge goals:', seedError)
            // Don't throw here - challenge was created successfully, just goals failed
          }
        }
      }
    } catch (error) {
      console.error('Error creating challenge:', error)
      throw error
    }
  },

  updateChallenge: async (id: string, updates: Partial<Challenge>) => {
    try {
      const supabase = createSupabaseBrowserClient()
      const { error } = await supabase
        .from('challenges')
        .update(updates)
        .eq('id', id)

      if (error) throw error

      set({
        challenges: get().challenges.map(c =>
          c.id === id ? { ...c, ...updates } : c
        ),
        currentChallenge: get().currentChallenge?.id === id
          ? { ...get().currentChallenge!, ...updates }
          : get().currentChallenge
      })
    } catch (error) {
      console.error('Error updating challenge:', error)
      throw error
    }
  },

  deleteChallenge: async (id: string) => {
    try {
      const supabase = createSupabaseBrowserClient()
      const { error } = await supabase
        .from('challenges')
        .delete()
        .eq('id', id)

      if (error) throw error

      set({
        challenges: get().challenges.filter(c => c.id !== id)
      })
    } catch (error) {
      console.error('Error deleting challenge:', error)
      throw error
    }
  },

  addSim: async (sim: Partial<Sim>) => {
    try {
      const supabase = createSupabaseBrowserClient()
      const { data, error } = await supabase
        .from('sims')
        .insert(sim)
        .select()
        .single()

      if (error) throw error

      if (data) {
        set({ sims: [...get().sims, data] })
      }
    } catch (error) {
      console.error('Error adding sim:', error)
      throw error
    }
  },

  updateSim: async (id: string, updates: Partial<Sim>) => {
    try {
      const supabase = createSupabaseBrowserClient()
      const { error } = await supabase
        .from('sims')
        .update(updates)
        .eq('id', id)

      if (error) throw error

      set({
        sims: get().sims.map(s =>
          s.id === id ? { ...s, ...updates } : s
        )
      })
    } catch (error) {
      console.error('Error updating sim:', error)
      throw error
    }
  },

  deleteSim: async (id: string) => {
    try {
      const supabase = createSupabaseBrowserClient()
      const { error } = await supabase
        .from('sims')
        .delete()
        .eq('id', id)

      if (error) throw error

      set({
        sims: get().sims.filter(s => s.id !== id)
      })
    } catch (error) {
      console.error('Error deleting sim:', error)
      throw error
    }
  },

  addGoal: async (goal: Partial<Goal>) => {
    try {
      const supabase = createSupabaseBrowserClient()
      const { data, error } = await supabase
        .from('goals')
        .insert(goal)
        .select()
        .single()

      if (error) throw error

      if (data) {
        set({ goals: [...get().goals, data] })
      }
    } catch (error) {
      console.error('Error adding goal:', error)
      throw error
    }
  },

  updateGoal: async (id: string, updates: Partial<Goal>) => {
    try {
      const supabase = createSupabaseBrowserClient()
      const { error } = await supabase
        .from('goals')
        .update(updates)
        .eq('id', id)

      if (error) throw error

      set({
        goals: get().goals.map(g =>
          g.id === id ? { ...g, ...updates } : g
        )
      })
    } catch (error) {
      console.error('Error updating goal:', error)
      throw error
    }
  },

  deleteGoal: async (id: string) => {
    try {
      const supabase = createSupabaseBrowserClient()
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', id)

      if (error) throw error

      set({
        goals: get().goals.filter(g => g.id !== id)
      })
    } catch (error) {
      console.error('Error deleting goal:', error)
      throw error
    }
  },

  toggleGoalProgress: async (goalId: string, simId?: string) => {
    try {
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

        if (error) throw error

        set({
          progress: get().progress.filter(p => p.id !== existingProgress.id)
        })
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

        if (error) throw error

        if (data) {
          set({ progress: [...get().progress, data] })
        }
      }
    } catch (error) {
      console.error('Error toggling goal progress:', error)
      throw error
    }
  },

  updateGoalValue: async (goalId: string, newValue: number) => {
    try {
      const supabase = createSupabaseBrowserClient()
      const { error } = await supabase
        .from('goals')
        .update({ current_value: newValue })
        .eq('id', goalId)

      if (error) throw error

      set({
        goals: get().goals.map(g =>
          g.id === goalId ? { ...g, current_value: newValue } : g
        )
      })
    } catch (error) {
      console.error('Error updating goal value:', error)
      throw error
    }
  },

  calculatePoints: () => {
    const { goals, progress } = get()

    return goals.reduce((total, goal) => {
      // Handle different goal types
      if (goal.goal_type === 'milestone') {
        // Milestone goals: completed = full points
        const isCompleted = progress.some(p => p.goal_id === goal.id)
        return isCompleted ? total + (goal.point_value || 0) : total
      }
      else if (goal.goal_type === 'counter') {
        // Counter goals: current_value * point_value, capped at max_points
        const currentValue = goal.current_value || 0
        const points = currentValue * (goal.point_value || 0)
        const maxPoints = goal.max_points || Infinity
        return total + Math.min(points, maxPoints)
      }
      else if (goal.goal_type === 'threshold') {
        // Threshold goals: check which threshold is met
        const currentValue = goal.current_value || 0
        const thresholds = goal.thresholds ? JSON.parse(goal.thresholds) : []

        let points = 0
        for (const threshold of thresholds) {
          if (currentValue >= threshold.value) {
            points = threshold.points
          } else {
            break
          }
        }
        return total + points
      }

      // Fallback for legacy goals without types
      const isCompleted = progress.some(p => p.goal_id === goal.id)
      return isCompleted ? total + (goal.point_value || 0) : total
    }, 0)
  },

  calculateCategoryPoints: (category: string) => {
    const { goals, progress } = get()
    const categoryGoals = goals.filter(goal => goal.category === category)

    return categoryGoals.reduce((total, goal) => {
      if (goal.goal_type === 'milestone') {
        const isCompleted = progress.some(p => p.goal_id === goal.id)
        return isCompleted ? total + (goal.point_value || 0) : total
      }
      else if (goal.goal_type === 'counter') {
        const currentValue = goal.current_value || 0
        const points = currentValue * (goal.point_value || 0)
        const maxPoints = goal.max_points || Infinity
        return total + Math.min(points, maxPoints)
      }
      else if (goal.goal_type === 'threshold') {
        const currentValue = goal.current_value || 0
        const thresholds = goal.thresholds ? JSON.parse(goal.thresholds) : []

        let points = 0
        for (const threshold of thresholds) {
          if (currentValue >= threshold.value) {
            points = threshold.points
          } else {
            break
          }
        }
        return total + points
      }

      const isCompleted = progress.some(p => p.goal_id === goal.id)
      return isCompleted ? total + (goal.point_value || 0) : total
    }, 0)
  },

  addSimAchievement: async (simId: string, achievement: {
    goal_id: string
    goal_title: string
    method: string
    points_earned: number
    notes?: string
  }) => {
    try {
      const supabase = createSupabaseBrowserClient()

      // You'll need to create a sim_achievements table for this
      const { data, error } = await supabase
        .from('sim_achievements')
        .insert({
          sim_id: simId,
          goal_id: achievement.goal_id,
          goal_title: achievement.goal_title,
          completion_method: achievement.method,
          points_earned: achievement.points_earned,
          notes: achievement.notes,
          achieved_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        console.error('Error adding sim achievement:', error)
        // Don't throw - this is secondary functionality
      }
    } catch (error) {
      console.error('Error in addSimAchievement:', error)
    }
  },

  getGoalCompletionDetails: (goalId: string) => {
    const { progress } = get()
    const completion = progress.find(p => p.goal_id === goalId)

    if (completion?.completion_details) {
      try {
        return JSON.parse(completion.completion_details as string)
      } catch {
        return null
      }
    }

    return null
  },

  // Get all achievements for a sim (for future sim profile)
  getSimAchievements: async (simId: string) => {
    try {
      const supabase = createSupabaseBrowserClient()

      const { data, error } = await supabase
        .from('sim_achievements')
        .select('*')
        .eq('sim_id', simId)
        .order('achieved_at', { ascending: false })

      if (error) {
        console.error('Error fetching sim achievements:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in getSimAchievements:', error)
      return []
    }
  },

  completeGoalWithDetails: async (goalId: string, simId: string, method: string, notes?: string) => {
    try {
      const supabase = createSupabaseBrowserClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) throw new Error('User not authenticated')

      // Get sim details for the completion record
      const sim = get().sims.find(s => s.id === simId)

      // Create completion details object
      const completionDetails = {
        method,
        sim_id: simId,
        sim_name: sim?.name,
        sim_generation: sim?.generation,
        notes,
        completed_at: new Date().toISOString()
      }

      // Check if already completed
      const existingProgress = get().progress.find(p =>
        p.goal_id === goalId && p.user_id === user.id
      )

      if (existingProgress) {
        // Update existing progress with completion details
        const { error } = await supabase
          .from('progress')
          .update({
            sim_id: simId,
            completion_details: JSON.stringify(completionDetails)
          })
          .eq('id', existingProgress.id)

        if (error) throw error

        set({
          progress: get().progress.map(p =>
            p.id === existingProgress.id
              ? { ...p, sim_id: simId, completion_details: JSON.stringify(completionDetails) }
              : p
          )
        })
      } else {
        // Create new progress entry
        const { data, error } = await supabase
          .from('progress')
          .insert({
            user_id: user.id,
            goal_id: goalId,
            sim_id: simId,
            completion_details: JSON.stringify(completionDetails)
          })
          .select()
          .single()

        if (error) throw error

        if (data) {
          set({ progress: [...get().progress, data] })
        }
      }

      // Also add achievement to sim (for future sim profile feature)
      const goal = get().goals.find(g => g.id === goalId)
      if (goal && sim) {
        await get().addSimAchievement(simId, {
          goal_id: goalId,
          goal_title: goal.title,
          method,
          points_earned: goal.point_value || 0,
          notes
        })
      }
    } catch (error) {
      console.error('Error completing goal with details:', error)
      throw error
    }
  },
}))