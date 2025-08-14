import { create } from 'zustand'
import { createSupabaseBrowserClient } from '@/src/lib/supabase/client'
import { User } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  loading: boolean
  initialized: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  fetchUser: () => Promise<void>
  initialize: () => Promise<void>
  getAuthErrorMessage: (error: any) => string
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  initialized: false,

  initialize: async () => {
    const supabase = createSupabaseBrowserClient()
    const { data: { session } } = await supabase.auth.getSession()
    
    set({ 
      user: session?.user ?? null, 
      loading: false,
      initialized: true 
    })
    
    // Listen for auth changes
    supabase.auth.onAuthStateChange((event, session) => {
      set({ user: session?.user ?? null })
    })
  },
  
  signIn: async (email: string, password: string) => {
    // Check if we're rate limited (from localStorage tracking)
    const rateLimitKey = `rate_limit_${email}`
    const attempts = JSON.parse(localStorage.getItem(rateLimitKey) || '[]')
    const now = Date.now()
    const recentAttempts = attempts.filter((time: number) => now - time < 900000) // 15 min
    
    if (recentAttempts.length >= 5) {
      throw new Error('Too many login attempts. Please try again in 15 minutes.')
    }
  
    const supabase = createSupabaseBrowserClient()
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) {
      // Track failed attempt
      recentAttempts.push(now)
      localStorage.setItem(rateLimitKey, JSON.stringify(recentAttempts))
      throw error
    }
    
    // Clear attempts on success
    localStorage.removeItem(rateLimitKey)
    set({ user: data.user })
  },
  
  signUp: async (email: string, password: string) => {
    const supabase = createSupabaseBrowserClient()
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    if (error) throw error
    set({ user: data.user })
  },
  
  signOut: async () => {
    const supabase = createSupabaseBrowserClient()
    await supabase.auth.signOut()
    set({ user: null })
  },
  
  fetchUser: async () => {
    const supabase = createSupabaseBrowserClient()
    const { data: { user } } = await supabase.auth.getUser()
    set({ user, loading: false })
  },

  getAuthErrorMessage: (error: any): string => {
    switch (error.message) {
      case 'Invalid login credentials':
        return 'Invalid email or password'
      case 'Email not confirmed':
        return 'Please check your email and confirm your account'
      default:
        return 'Something went wrong. Please try again.'
    }
  }
}))