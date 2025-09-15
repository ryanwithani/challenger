import { create } from 'zustand'
import { createSupabaseBrowserClient } from '@/src/lib/supabase/client'
import { User } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  loading: boolean
  initialized: boolean
  showPasswordUpdateModal: boolean // ADD THIS
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  fetchUser: () => Promise<void>
  initialize: () => Promise<void>
  getAuthErrorMessage: (error: any) => string
  requestPasswordReset: (email: string) => Promise<void> // ADD THIS
  updatePassword: (password: string) => Promise<void> // ADD THIS
  setShowPasswordUpdateModal: (show: boolean) => void // ADD THIS
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: true,
  initialized: false,
  showPasswordUpdateModal: false, // ADD THIS

  initialize: async () => {
    console.log('🔵 Initialize called')
    const supabase = createSupabaseBrowserClient()

    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const code = urlParams.get('code')
      console.log('🔵 Code from URL:', code)


      if (code) {
        console.log('🟢 Attempting code exchange...')
        const { data, error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error && data.session) {
          console.log('🟢 Session established! Setting modal to true')
          set({
            user: data.session.user,
            showPasswordUpdateModal: true,
            loading: false,
            initialized: true
          })
          console.log('🟢 State after set:', get().showPasswordUpdateModal)
          window.history.replaceState({}, document.title, '/')
          return // Important: return early
        }
      }
    }

    const { data: { session } } = await supabase.auth.getSession()

    set({
      user: session?.user ?? null,
      loading: false,
      initialized: true
    })

    // Listen for auth changes
    supabase.auth.onAuthStateChange((event, session) => {
      set({ user: session?.user ?? null })

      // ADD THIS: Handle password recovery event
      if (event === 'PASSWORD_RECOVERY') {
        set({ showPasswordUpdateModal: true })
      }
    })

    // ADD THIS: Check if we're coming from a password reset link

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
  },

  // ADD THIS: Request password reset
  requestPasswordReset: async (email: string) => {
    // Use localStorage for rate limiting (consistent with your signIn method)
    const rateLimitKey = `reset_request_${email}`
    const attempts = JSON.parse(localStorage.getItem(rateLimitKey) || '[]')
    const now = Date.now()
    const recentAttempts = attempts.filter((time: number) => now - time < 7200000) // 1 hour

    if (recentAttempts.length >= 3) {
      throw new Error('Too many reset attempts. Please try again in an hour.')
    }

    const supabase = createSupabaseBrowserClient()

    const { error } = await supabase.auth.resetPasswordForEmail(email)

    if (error) throw error

    // Track successful attempt
    recentAttempts.push(now)
    localStorage.setItem(rateLimitKey, JSON.stringify(recentAttempts))
  },

  // ADD THIS: Update password after reset
  updatePassword: async (password: string) => {
    const supabase = createSupabaseBrowserClient()

    const { error } = await supabase.auth.updateUser({ password })
    if (error) throw error

    // Clear any rate limits for this user
    const { data: { user } } = await supabase.auth.getUser()
    if (user?.email) {
      localStorage.removeItem(`rate_limit_${user.email}`)
      localStorage.removeItem(`reset_request_${user.email}`)
    }
  },

  // ADD THIS: Control password update modal
  setShowPasswordUpdateModal: (show: boolean) => {
    set({ showPasswordUpdateModal: show })
  },
}))