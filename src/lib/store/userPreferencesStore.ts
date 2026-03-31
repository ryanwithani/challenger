import { create } from 'zustand'
import { createSupabaseBrowserClient } from '@/src/lib/supabase/client'
import { migrateLegacyPacks } from '@/src/data/packs'

interface UserPreferences {
  id?: string
  user_id?: string
  expansion_packs: string[]
  created_at?: string
  updated_at?: string
}

interface UserPreferencesState {
  preferences: UserPreferences | null
  loading: boolean

  fetchPreferences: () => Promise<void>
  updateExpansionPacks: (ownedPacks: string[]) => Promise<void>
  createInitialPreferences: (ownedPacks: string[]) => Promise<void>
}

/**
 * Detects legacy boolean-map format and converts to acronym array.
 * If the DB row has the old format, it migrates in-place and persists.
 */
function normalizePacksFromDB(
  raw: unknown
): { packs: string[]; needsMigration: boolean } {
  if (Array.isArray(raw)) {
    return { packs: raw, needsMigration: false }
  }
  return { packs: migrateLegacyPacks(raw), needsMigration: true }
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
      const { packs, needsMigration } = normalizePacksFromDB(data.expansion_packs)
      const preferences: UserPreferences = { ...data, expansion_packs: packs }
      set({ preferences, loading: false })

      if (needsMigration) {
        await supabase
          .from('user_preferences')
          .update({ expansion_packs: packs, updated_at: new Date().toISOString() })
          .eq('user_id', user.id)
      }
    } else if (error?.code === 'PGRST116') {
      await get().createInitialPreferences([])
    } else {
      set({ loading: false })
    }
  },

  createInitialPreferences: async (ownedPacks: string[]) => {
    const supabase = createSupabaseBrowserClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('user_preferences')
      .insert({
        user_id: user.id,
        expansion_packs: ownedPacks,
      })
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    set({ preferences: data, loading: false })
  },

  updateExpansionPacks: async (ownedPacks: string[]) => {
    const supabase = createSupabaseBrowserClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('User not authenticated')

    const currentPreferences = get().preferences

    if (currentPreferences) {
      const { data, error } = await supabase
        .from('user_preferences')
        .update({
          expansion_packs: ownedPacks,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) {
        throw new Error(error.message)
      }

      set({ preferences: data })
    } else {
      await get().createInitialPreferences(ownedPacks)
    }
  },
}))
