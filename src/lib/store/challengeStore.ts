import { create } from 'zustand'
import { createSupabaseBrowserClient } from '@/src/lib/supabase/client'
import { Database } from '@/src/types/database.types'
import { seedLegacyChallengeGoals, LegacyChallengeConfig } from '@/src/components/challenge/GoalsSeeder'
import { useAuthStore } from './authStore'

type Challenge = Database['public']['Tables']['challenges']['Row']
type Sim = Database['public']['Tables']['sims']['Row']
type Goal = Database['public']['Tables']['goals']['Row']
type Progress = Database['public']['Tables']['progress']['Row']

const CACHE_TIMEOUT_MS = 5 * 60 * 1000;
const GOAL_SEED_TIMEOUT_MS = 30_000;

function isPenalty(goal: Goal): boolean {
  return (
    goal.goal_type === 'penalty' ||
    (goal.point_value !== undefined && goal.point_value !== null && goal.point_value < 0) ||
    goal.category === 'penalties' ||
    goal.category === 'penalty'
  )
}

function calculatePointsForGoals(goals: Goal[], progress: Progress[]): number {
  if (goals.length === 0) return 0

  return goals.reduce((total, goal) => {
    if (isPenalty(goal)) {
      if (goal.goal_type === 'counter') {
        const currentValue = goal.current_value || 0
        return total + (currentValue * (goal.point_value || 0))
      }
      const penaltyCount = progress.filter(p => p.goal_id === goal.id).length
      return total + (penaltyCount * (goal.point_value || 0))
    }

    if (goal.goal_type === 'milestone') {
      const isCompleted = progress.some(p => p.goal_id === goal.id)
      return isCompleted ? total + (goal.point_value || 0) : total
    }

    if (goal.goal_type === 'counter') {
      const currentValue = goal.current_value || 0
      const points = currentValue * (goal.point_value || 0)
      const maxPoints = goal.max_points || Infinity
      return total + Math.min(points, maxPoints)
    }

    if (goal.goal_type === 'threshold') {
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
}

interface ChallengeState {
  challenges: Challenge[]
  currentChallenge: Challenge | null
  sims: Sim[]
  goals: Goal[]
  progress: Progress[]
  loading: boolean
  error: string | null
  challengesLoading: boolean // Separate loading state for challenges
  lastChallengesFetch: number | null // Timestamp of last fetch
  completions: Set<string>

  // Checklist methods
  fetchCompletions: (challengeId: string) => Promise<void>
  toggleCompletion: (challengeId: string, itemKey: string) => Promise<void>

  // Challenge methods
  fetchChallenges: (forceRefresh?: boolean) => Promise<void>
  fetchChallenge: (id: string) => Promise<void>
  createChallenge: (challenge: Partial<Challenge>) => Promise<void>
  updateChallenge: (id: string, updates: Partial<Challenge>) => Promise<void>
  deleteChallenge: (id: string) => Promise<void>
  setChallenges: (challenges: Challenge[]) => void

  // Sim methods
  addSim: (sim: Partial<Sim>) => Promise<void>
  updateSim: (id: string, updates: Partial<Sim>) => Promise<void>
  deleteSim: (id: string) => Promise<void>
  linkExistingSim: (simId: string, challengeId: string) => Promise<void>
  getSimAchievements: (simId: string) => Promise<any[]>

  // Goal methods
  addGoal: (goal: Partial<Goal>) => Promise<void>
  updateGoal: (id: string, updates: Partial<Goal>) => Promise<void>
  deleteGoal: (id: string) => Promise<void>

  // Progress and achievement methods
  toggleGoalProgress: (goalId: string, simId?: string) => Promise<void>
  updateGoalValue: (goalId: string, newValue: number) => Promise<void>
  incrementPenalty: (goalId: string, simId?: string) => Promise<void>
  decrementPenalty: (goalId: string) => Promise<void>
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
  hasStartedProgress: () => boolean
  isPenaltyGoal: (goal: Goal) => boolean
  persistPoints: () => Promise<void>
  recalculateAutoGoals: () => Promise<void>
}

export const useChallengeStore = create<ChallengeState>((set, get) => ({
  challenges: [],
  currentChallenge: null,
  sims: [],
  goals: [],
  progress: [],
  loading: false,
  error: null,
  challengesLoading: false,  // Separate loading state for challenges
  lastChallengesFetch: null, // Track when we last fetched challenges
  completions: new Set<string>(),

  fetchChallenges: async (forceRefresh = false) => {
    // Check if we have challenges and if the cache is still valid
    const { challenges, lastChallengesFetch } = get();
    const now = Date.now();
    const cacheValid = lastChallengesFetch && (now - lastChallengesFetch) < CACHE_TIMEOUT_MS;
    
    const { data: { user } } = await createSupabaseBrowserClient().auth.getUser();
    if (!user) {
      set({ challenges: [], loading: false });
      return;
    }
    
    // If we have data and the cache is valid, and we're not forcing a refresh, return immediately
    if (challenges.length > 0 && cacheValid && !forceRefresh) {
      return;
    }
    
    // If we have existing data, don't show loading state (will refresh in background)
    const showLoading = challenges.length === 0;
    
    if (showLoading) {
      set({ challengesLoading: true });
    }
    
    try {
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase
        .from('challenges')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Update the challenges and timestamp
      set({ 
        challenges: data || [],
        challengesLoading: false,
        lastChallengesFetch: now
      });
    } catch (error) {
      set({ challengesLoading: false });
    }
  },

  fetchChallenge: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const supabase = createSupabaseBrowserClient();

      // Fetch challenge, sims, and goals in parallel (all keyed by challenge id)
      const [challengeResult, simsResult, goalsResult] = await Promise.all([
        supabase.from('challenges').select('*').eq('id', id).single(),
        supabase.from('sims').select('*').eq('challenge_id', id).order('generation', { ascending: true }),
        supabase.from('goals').select('*').eq('challenge_id', id).order('order_index', { ascending: true }),
      ]);

      if (challengeResult.error) throw challengeResult.error;

      // Guard empty array — .in() with [] generates invalid SQL in PostgREST
      const goalIds = goalsResult.data?.map((g: Goal) => g.id) || [];
      const { data: progress } = goalIds.length > 0
        ? await supabase.from('progress').select('*').in('goal_id', goalIds)
        : { data: [] as Progress[] };

      set({
        currentChallenge: challengeResult.data,
        sims: simsResult.data || [],
        goals: goalsResult.data || [],
        progress: progress || [],
        loading: false,
        error: null,
      });

      // Load checklist completions and recalculate auto goals (non-blocking)
      get().fetchCompletions(id)
      get().recalculateAutoGoals()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load challenge';
      set({ loading: false, error: message });
    }
  },

  fetchCompletions: async (challengeId: string) => {
    try {
      const supabase = createSupabaseBrowserClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('challenge_completions')
        .select('item_key')
        .eq('challenge_id', challengeId)
        .eq('user_id', user.id)

      if (error) throw error

      set({ completions: new Set((data || []).map((row: { item_key: string }) => row.item_key)) })
    } catch {
      // Non-blocking: completions failure should not surface as a page error
    }
  },

  toggleCompletion: async (challengeId: string, itemKey: string) => {
    const supabase = createSupabaseBrowserClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const prev = new Set(get().completions)
    const wasCompleted = prev.has(itemKey)

    // Optimistic update
    const next = new Set(prev)
    if (wasCompleted) {
      next.delete(itemKey)
    } else {
      next.add(itemKey)
    }
    set({ completions: next })

    try {
      const { data, error } = await supabase.rpc('toggle_completion', {
        p_challenge_id: challengeId,
        p_item_key: itemKey,
        p_user_id: user.id,
      })

      if (error) throw new Error(error.message)

      // Sync goal counter locally
      const catalogType = itemKey.split(':')[0]
      const goalTypeMap: Record<string, string> = {
        skills: 'skills_completed',
        aspirations: 'aspirations_completed',
        careers: 'careers_completed',
        parties: 'parties_hosted',
        deaths: 'deaths_collected',
        traits: 'traits_collected',
        collections: 'collections_completed',
      }
      const goalType = goalTypeMap[catalogType]
      if (goalType) {
        const delta = data?.action === 'completed' ? 1 : -1
        set({
          goals: get().goals.map(g =>
            g.goal_type === goalType
              ? { ...g, current_value: Math.max(0, (g.current_value || 0) + delta) }
              : g
          ),
        })
      }
    } catch (error) {
      // Revert optimistic update
      set({ completions: prev })
      throw error
    }
  },

  createChallenge: async (challenge: Partial<Challenge>) => {
    const supabase = createSupabaseBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('challenges')
      .insert({
        ...challenge,
        user_id: user.id,
        status: 'active',
        points: 0,
        completion_percentage: 0,
      })
      .select()
      .single();

    if (error) {
      throw new Error(error.message || 'Failed to create challenge');
    }

    if (data) {
      set({
        challenges: [...get().challenges, data],
        lastChallengesFetch: Date.now()
      });

      // Seed legacy challenges with predefined goals
      if (data.challenge_type === 'legacy') {
        try {
          const config = data.configuration as LegacyChallengeConfig;
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Goal seeding timeout')), GOAL_SEED_TIMEOUT_MS)
          );

          await Promise.race([
            seedLegacyChallengeGoals(data.id, config, supabase),
            timeoutPromise
          ]);
        } catch {
          // Challenge created successfully; goal seeding is non-critical
        }
      }

      return data;
    }
  },

  updateChallenge: async (id: string, updates: Partial<Challenge>) => {
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase
        .from('challenges')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      // Update in-memory challenges
      const updatedChallenges = get().challenges.map(c =>
        c.id === id ? { ...c, ...updates } : c
      );

      set({
        challenges: updatedChallenges,
        currentChallenge: get().currentChallenge?.id === id
          ? { ...get().currentChallenge!, ...updates }
          : get().currentChallenge,
        lastChallengesFetch: Date.now() // Update timestamp since we modified data
      });
    } catch (error) {
      throw error;
    }
  },

  deleteChallenge: async (id: string) => {
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase
        .from('challenges')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set({
        challenges: get().challenges.filter(c => c.id !== id),
        lastChallengesFetch: Date.now() // Update timestamp since we modified data
      });
    } catch (error) {
      throw error;
    }
  },

  setChallenges: (challenges: Challenge[]) => set({ challenges, loading: false, lastChallengesFetch: Date.now() }),

  addSim: async (sim: Partial<Sim>) => {
    try {
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase
        .from('sims')
        .insert(sim)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        set({ sims: [...get().sims, data] });
        await get().recalculateAutoGoals();
      }
    } catch (error) {
      throw error;
    }
  },

  linkExistingSim: async (simId: string, challengeId: string) => {
    try {
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase
        .from('sims')
        .update({ challenge_id: challengeId })
        .eq('id', simId)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        set({
          sims: get().sims.some(s => s.id === data.id)
            ? get().sims.map(s => s.id === data.id ? data : s)
            : [...get().sims, data],
        });
        await get().recalculateAutoGoals();
      }
    } catch (error) {
      throw error;
    }
  },

  updateSim: async (id: string, updates: Partial<Sim>) => {
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase
        .from('sims')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      set({
        sims: get().sims.map(s =>
          s.id === id ? { ...s, ...updates } : s
        )
      });
      await get().recalculateAutoGoals();
    } catch (error) {
      throw error;
    }
  },

  deleteSim: async (id: string) => {
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase
        .from('sims')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set({
        sims: get().sims.filter(s => s.id !== id)
      });
      await get().recalculateAutoGoals();
    } catch (error) {
      throw error;
    }
  },

  addGoal: async (goal: Partial<Goal>) => {
    try {
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase
        .from('goals')
        .insert(goal)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        set({ goals: [...get().goals, data] });
      }
    } catch (error) {
      throw error;
    }
  },

  updateGoal: async (id: string, updates: Partial<Goal>) => {
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase
        .from('goals')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      set({
        goals: get().goals.map(g =>
          g.id === id ? { ...g, ...updates } : g
        )
      });
    } catch (error) {
      throw error;
    }
  },

  deleteGoal: async (id: string) => {
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set({
        goals: get().goals.filter(g => g.id !== id)
      });
    } catch (error) {
      throw error;
    }
  },

  isPenaltyGoal: (goal: Goal) => isPenalty(goal),

  toggleGoalProgress: async (goalId: string, simId?: string) => {
    try {
      const supabase = createSupabaseBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) throw new Error('User not authenticated');

      const goal = get().goals.find(g => g.id === goalId);
      
      // If this is a penalty goal, don't allow toggling - penalties should only be incremented/decremented
      if (goal && get().isPenaltyGoal(goal)) {
        return;
      }

      // Check if progress already exists
      const existingProgress = get().progress.find(p =>
        p.goal_id === goalId && p.user_id === user.id
      );

      if (existingProgress) {
        // Remove progress
        const { error } = await supabase
          .from('progress')
          .delete()
          .eq('id', existingProgress.id);

        if (error) throw error;

        set({
          progress: get().progress.filter(p => p.id !== existingProgress.id)
        });
      } else {
        // Add progress
        const challengeId = get().currentChallenge?.id;
        if (!challengeId) throw new Error('No active challenge');

        const { data, error } = await supabase
          .from('progress')
          .insert({
            user_id: user.id,
            challenge_id: challengeId,
            goal_id: goalId,
            sim_id: simId,
          })
          .select()
          .single();

        if (error) throw error;

        if (data) {
          set({ progress: [...get().progress, data] });
        }
      }

      await get().persistPoints();
    } catch (error) {
      throw error;
    }
  },

  // Add a new penalty occurrence
  incrementPenalty: async (goalId: string, simId?: string) => {
    try {
      const goal = get().goals.find(g => g.id === goalId);
      
      // Verify this is a penalty goal
      if (!goal || !get().isPenaltyGoal(goal)) {
        return;
      }
      
      const supabase = createSupabaseBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) throw new Error('User not authenticated');

      // For counter-type penalties, we update the counter
      if (goal.goal_type === 'counter') {
        const currentValue = goal.current_value || 0;
        await get().updateGoalValue(goalId, currentValue + 1);
      } else {
        // For non-counter penalties, we add a progress entry
        // Check if this is the first time tracking this penalty
        const existingPenalties = get().progress.filter(p => 
          p.goal_id === goalId && p.user_id === user.id
        );
        
        // Add a new penalty occurrence
        const challengeId = get().currentChallenge?.id;
        if (!challengeId) throw new Error('No active challenge');

        const { data, error } = await supabase
          .from('progress')
          .insert({
            user_id: user.id,
            challenge_id: challengeId,
            goal_id: goalId,
            sim_id: simId,
            // Store the timestamp to track when penalties occurred
            completion_details: JSON.stringify({
              occurred_at: new Date().toISOString(),
              sim_id: simId
            })
          })
          .select()
          .single();

        if (error) throw error;

        if (data) {
          set({ progress: [...get().progress, data] });
        }

        await get().persistPoints();
      }
    } catch (error) {
      throw error;
    }
  },
  
  // Remove the last penalty occurrence
  decrementPenalty: async (goalId: string) => {
    try {
      const goal = get().goals.find(g => g.id === goalId);
      
      // Verify this is a penalty goal
      if (!goal || !get().isPenaltyGoal(goal)) {
        return;
      }
      
      const supabase = createSupabaseBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) throw new Error('User not authenticated');

      // For counter-type penalties, we update the counter
      if (goal.goal_type === 'counter') {
        const currentValue = goal.current_value || 0;
        if (currentValue > 0) {
          await get().updateGoalValue(goalId, currentValue - 1);
        }
      } else {
        // For non-counter penalties, we remove the most recent progress entry
        const penaltyEntries = get().progress.filter(p => 
          p.goal_id === goalId && p.user_id === user.id
        );
        
        if (penaltyEntries.length > 0) {
          // Sort by most recent (assuming we have completion_details with timestamps)
          const sortedEntries = [...penaltyEntries].sort((a, b) => {
            let aDate = new Date(0);
            let bDate = new Date(0);
            
            try {
              if (a.completion_details) {
                const aDetails = JSON.parse(a.completion_details as string);
                if (aDetails.occurred_at) aDate = new Date(aDetails.occurred_at);
              }
              if (b.completion_details) {
                const bDetails = JSON.parse(b.completion_details as string);
                if (bDetails.occurred_at) bDate = new Date(bDetails.occurred_at);
              }
            } catch (e) {
              // If parsing fails, fall back to creation date
              aDate = a.created_at ? new Date(a.created_at) : new Date(0);
              bDate = b.created_at ? new Date(b.created_at) : new Date(0);
            }
            
            return bDate.getTime() - aDate.getTime(); // Most recent first
          });
          
          // Remove the most recent entry
          const mostRecent = sortedEntries[0];
          
          const { error } = await supabase
            .from('progress')
            .delete()
            .eq('id', mostRecent.id);

          if (error) throw error;

          set({
            progress: get().progress.filter(p => p.id !== mostRecent.id)
          });

          await get().persistPoints();
        }
      }
    } catch (error) {
      throw error;
    }
  },

  updateGoalValue: async (goalId: string, newValue: number) => {
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase
        .from('goals')
        .update({ current_value: newValue })
        .eq('id', goalId);

      if (error) throw error;

      set({
        goals: get().goals.map(g =>
          g.id === goalId ? { ...g, current_value: newValue } : g
        )
      });

      await get().persistPoints();
    } catch (error) {
      throw error;
    }
  },

  // Helper method to determine if the challenge has any progress
  hasStartedProgress: () => {
    return get().progress.length > 0;
  },
  
  calculatePoints: () => {
    const { goals, progress } = get()
    return calculatePointsForGoals(goals, progress)
  },

  calculateCategoryPoints: (category: string) => {
    const { goals, progress } = get()
    const categoryGoals = goals.filter(goal => goal.category === category)
    return calculatePointsForGoals(categoryGoals, progress)
  },

  addSimAchievement: async (simId: string, achievement: {
    goal_id: string
    goal_title: string
    method: string
    points_earned: number
    notes?: string
  }) => {
    try {
      const supabase = createSupabaseBrowserClient();

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
        .single();

      if (error) {
        // Don't throw - this is secondary functionality
      }
    } catch (error) {
    }
  },

  getGoalCompletionDetails: (goalId: string) => {
    const { progress } = get();
    const completion = progress.find(p => p.goal_id === goalId);

    if (completion?.completion_details) {
      try {
        return JSON.parse(completion.completion_details as string);
      } catch {
        return null;
      }
    }

    return null;
  },

  // Get all achievements for a sim (for future sim profile)
  getSimAchievements: async (simId: string) => {
    try {
      const supabase = createSupabaseBrowserClient();

      const { data, error } = await supabase
        .from('sim_achievements')
        .select('*')
        .eq('sim_id', simId)
        .order('achieved_at', { ascending: false });

      if (error) {
        return [];
      }

      return data || [];
    } catch (error) {
      return [];
    }
  },

  completeGoalWithDetails: async (goalId: string, simId: string, method: string, notes?: string) => {
    try {
      const supabase = createSupabaseBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) throw new Error('User not authenticated');

      const goal = get().goals.find(g => g.id === goalId);
      
      // If this is a penalty goal, don't allow completing it this way
      if (goal && get().isPenaltyGoal(goal)) {
        return;
      }

      // Get sim details for the completion record
      const sim = get().sims.find(s => s.id === simId);

      // Create completion details object
      const completionDetails = {
        method,
        sim_id: simId,
        sim_name: sim?.name,
        sim_generation: sim?.generation,
        notes,
        completed_at: new Date().toISOString()
      };

      // Check if already completed
      const existingProgress = get().progress.find(p =>
        p.goal_id === goalId && p.user_id === user.id
      );

      if (existingProgress) {
        // Update existing progress with completion details
        const { error } = await supabase
          .from('progress')
          .update({
            sim_id: simId,
            completion_details: JSON.stringify(completionDetails)
          })
          .eq('id', existingProgress.id);

        if (error) throw error;

        set({
          progress: get().progress.map(p =>
            p.id === existingProgress.id
              ? { ...p, sim_id: simId, completion_details: JSON.stringify(completionDetails) }
              : p
          )
        });
      } else {
        // Create new progress entry
        const challengeId = get().currentChallenge?.id;
        if (!challengeId) throw new Error('No active challenge');

        const { data, error } = await supabase
          .from('progress')
          .insert({
            user_id: user.id,
            challenge_id: challengeId,
            goal_id: goalId,
            sim_id: simId,
            completion_details: JSON.stringify(completionDetails)
          })
          .select()
          .single();

        if (error) throw error;

        if (data) {
          set({ progress: [...get().progress, data] });
        }
      }

      // Also add achievement to sim (for future sim profile feature)
      if (goal && sim) {
        await get().addSimAchievement(simId, {
          goal_id: goalId,
          goal_title: goal.title,
          method,
          points_earned: goal.point_value || 0,
          notes
        });
      }

      await get().persistPoints();
    } catch (error) {
      throw error;
    }
  },

  recalculateAutoGoals: async () => {
    const { sims, goals, progress, currentChallenge } = get()
    if (!currentChallenge) return

    const autoGoals = goals.filter(g => (g as Goal & { automation_type?: string | null }).automation_type)
    if (autoGoals.length === 0) return

    const supabase = createSupabaseBrowserClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    let milestoneChanged = false

    for (const goal of autoGoals) {
      const automationType = (goal as Goal & { automation_type: string }).automation_type

      if (automationType === 'generation_ya') {
        const count = new Set(
          sims
            .filter(s => s.age_stage != null && ['young_adult', 'adult', 'elder'].includes(s.age_stage))
            .map(s => s.generation)
        ).size
        if ((goal.current_value ?? 0) !== count) {
          await get().updateGoalValue(goal.id, count)
        }

      } else if (automationType === 'ten_children_per_gen') {
        const childrenByGen = new Map<number, number>()
        for (const s of sims) {
          if (s.relationship_to_heir === 'child' && s.generation != null) {
            childrenByGen.set(s.generation, (childrenByGen.get(s.generation) ?? 0) + 1)
          }
        }
        const maxChildren = childrenByGen.size > 0 ? Math.max(...Array.from(childrenByGen.values())) : 0
        const conditionMet = maxChildren >= 10

        const existingProgress = get().progress.find(p => p.goal_id === goal.id && p.user_id === user.id)
        if (conditionMet && !existingProgress) {
          const { data, error } = await supabase
            .from('progress')
            .insert({ user_id: user.id, challenge_id: currentChallenge.id, goal_id: goal.id })
            .select()
            .single()
          if (!error && data) {
            set({ progress: [...get().progress, data] })
            milestoneChanged = true
          }
        } else if (!conditionMet && existingProgress) {
          const { error } = await supabase.from('progress').delete().eq('id', existingProgress.id)
          if (!error) {
            set({ progress: get().progress.filter(p => p.id !== existingProgress.id) })
            milestoneChanged = true
          }
        }

      } else if (automationType === 'unique_spouse_traits') {
        const spouseTraits = new Set<string>()
        for (const s of sims) {
          if (s.relationship_to_heir === 'spouse' && Array.isArray(s.traits)) {
            for (const t of s.traits as string[]) {
              spouseTraits.add(t)
            }
          }
        }
        const count = spouseTraits.size
        if ((goal.current_value ?? 0) !== count) {
          await get().updateGoalValue(goal.id, count)
        }

      } else if (automationType === 'challenge_complete_gen10') {
        const conditionMet = sims.some(s => s.generation === 10 && s.is_heir === true)

        const existingProgress = get().progress.find(p => p.goal_id === goal.id && p.user_id === user.id)
        if (conditionMet && !existingProgress) {
          const { data, error } = await supabase
            .from('progress')
            .insert({ user_id: user.id, challenge_id: currentChallenge.id, goal_id: goal.id })
            .select()
            .single()
          if (!error && data) {
            set({ progress: [...get().progress, data] })
            milestoneChanged = true
          }
        } else if (!conditionMet && existingProgress) {
          const { error } = await supabase.from('progress').delete().eq('id', existingProgress.id)
          if (!error) {
            set({ progress: get().progress.filter(p => p.id !== existingProgress.id) })
            milestoneChanged = true
          }
        }
      }
    }

    if (milestoneChanged) {
      await get().persistPoints()
    }
  },

  persistPoints: async () => {
    const { currentChallenge } = get();
    if (!currentChallenge) return;

    const points = get().calculatePoints();

    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase
      .from('challenges')
      .update({ total_points: points })
      .eq('id', currentChallenge.id);

    if (error) {
      return;
    }

    set({
      currentChallenge: { ...currentChallenge, total_points: points },
      challenges: get().challenges.map(c =>
        c.id === currentChallenge.id ? { ...c, total_points: points } : c
      )
    });
  },
}))