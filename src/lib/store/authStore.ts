import { create } from 'zustand'
import { createClient } from '@/src/lib/supabase/client'
import { User } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  fetchUser: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  
  signIn: async (email: string, password: string) => {
    const supabase = createClient()
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    set({ user: data.user })
  },
  
  signUp: async (email: string, password: string) => {
    const supabase = createClient()
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    if (error) throw error
    set({ user: data.user })
  },
  
  signOut: async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    set({ user: null })
  },
  
  fetchUser: async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    set({ user, loading: false })
  },
}))