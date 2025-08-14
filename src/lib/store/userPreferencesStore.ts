import { create } from 'zustand'
import { createSupabaseBrowserClient } from '@/src/lib/supabase/client'

interface ExpansionPacks {
  base_game: boolean
  get_to_work: boolean
  get_together: boolean
  city_living: boolean
  cats_dogs: boolean
  seasons: boolean
  get_famous: boolean
  island_living: boolean
  discover_university: boolean
  eco_lifestyle: boolean
  snowy_escape: boolean
  cottage_living: boolean
  high_school_years: boolean
  growing_together: boolean
  horse_ranch: boolean
  for_rent: boolean
  lovestruck: boolean
  life_death: boolean
}

interface UserPreferences {
  id?: string
  user_id?: string
  expansion_packs: ExpansionPacks
  created_at?: string
  updated_at?: string
}

interface UserPreferencesState {
  preferences: UserPreferences | null
  loading: boolean
  
  fetchPreferences: () => Promise<void>
  updateExpansionPacks: (expansionPacks: ExpansionPacks) => Promise<void>
  createInitialPreferences: (expansionPacks: ExpansionPacks) => Promise<void>
}

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
  life_death: false,
}

export const useUserPreferencesStore = create<UserPreferencesState>((set, get) => ({
  preferences: null,
  loading: false,
  
  fetchPreferences: async () => {
    set({ loading: true })
    const supabase = createSupabaseBrowserClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      set({ loading: false })
      return
    }
    
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single()
    
    if (data) {
      set({ preferences: data, loading: false })
    } else if (error?.code === 'PGRST116') {
      // No preferences found, create default ones
      await get().createInitialPreferences(defaultExpansionPacks)
    } else {
      set({ loading: false })
    }
  },
  
  createInitialPreferences: async (expansionPacks: ExpansionPacks) => {
    const supabase = createSupabaseBrowserClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) throw new Error('User not authenticated')
    
    const { data, error } = await supabase
      .from('user_preferences')
      .insert({
        user_id: user.id,
        expansion_packs: expansionPacks,
      })
      .select()
      .single()
    
    if (error) {
      console.error('Failed to create user preferences:', error)
      throw new Error(error.message)
    }
    
    set({ preferences: data, loading: false })
  },
  
  updateExpansionPacks: async (expansionPacks: ExpansionPacks) => {
    const supabase = createSupabaseBrowserClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) throw new Error('User not authenticated')
    
    const currentPreferences = get().preferences
    
    if (currentPreferences) {
      // Update existing preferences
      const { data, error } = await supabase
        .from('user_preferences')
        .update({
          expansion_packs: expansionPacks,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .select()
        .single()
      
      if (error) {
        console.error('Failed to update user preferences:', error)
        throw new Error(error.message)
      }
      
      set({ preferences: data })
    } else {
      // Create new preferences
      await get().createInitialPreferences(expansionPacks)
    }
  },
}))