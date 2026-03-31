import { create } from 'zustand'
import { createSupabaseBrowserClient } from '@/src/lib/supabase/client'
import { signIn as signInAPI } from '@/src/lib/api/auth'
import { User } from '@supabase/supabase-js'


interface UserProfile {
  id: string
  email: string
  username: string
  display_name: string
  avatar_url: string
}

interface AuthState {
  user: User | null
  userProfile: UserProfile | null
  loading: boolean
  isFetchingProfile: boolean
  profileFetched: boolean
  initialized: boolean
  showPasswordUpdateModal: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  fetchUserProfile: (userId?: string) => Promise<void>
  initialize: () => void
  getAuthErrorMessage: (error: unknown) => string
  requestPasswordReset: (email: string) => Promise<void>
  updatePassword: (password: string) => Promise<void>
  setShowPasswordUpdateModal: (show: boolean) => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  userProfile: null,
  loading: true,
  initialized: false,
  isFetchingProfile: false,
  profileFetched: false,
  showPasswordUpdateModal: false,

  initialize: () => {
    if (get().initialized) return;

    set({ initialized: true });

    const supabase = createSupabaseBrowserClient();

    supabase.auth.onAuthStateChange((event, session) => {
      set({ user: session?.user ?? null, loading: false });

      if (session?.user) {
        // Fire-and-forget — do NOT await inside onAuthStateChange.
        // Awaiting here holds the @supabase/gotrue-js navigator.locks lock,
        // which deadlocks all subsequent Supabase operations (queries, getSession, etc.)
        get().fetchUserProfile(session.user.id);
      } else {
        set({ userProfile: null, profileFetched: false, isFetchingProfile: false });
      }

      if (event === 'PASSWORD_RECOVERY') {
        set({ showPasswordUpdateModal: true });
      }

      if (event === 'SIGNED_OUT') {
        const wizardKeys = [
          'challenge_wizard_progress',
          'challenge_wizard_basic_info',
          'challenge_wizard_config',
          'sim_wizard_progress',
          'sim_wizard_basic_info',
          'sim_wizard_traits',
          'sim_wizard_personality',
        ]
        wizardKeys.forEach(key => localStorage.removeItem(key))
      }
    });
  },

  fetchUserProfile: async (userId?: string) => {
    const state = get()

    if (state.isFetchingProfile) return

    // Use passed userId (from onAuthStateChange session) or fall back to store
    const uid = userId ?? state.user?.id
    if (!uid) {
      set({
        userProfile: null,
        profileFetched: false,
        isFetchingProfile: false
      })
      return
    }

    if (state.profileFetched && state.userProfile?.id === uid) {
      return
    }

    const supabase = createSupabaseBrowserClient()

    set({ isFetchingProfile: true })

    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, username, display_name, avatar_url, email')
        .eq('id', uid)
        .single()

      if (error) {
        throw error
      }

      if (data) {
        set({
          userProfile: data,
          profileFetched: true,
          isFetchingProfile: false
        })
      }
    } catch (error) {
      set({
        isFetchingProfile: false,
        profileFetched: false
      })
    }
  },


  signIn: async (email: string, password: string) => {
    // API route signs in server-side and sets session cookies.
    const result = await signInAPI(email, password)

    // Set user from the API response directly — the browser client
    // won't see the httpOnly session cookies via getSession().
    if (result?.user) {
      set({ user: result.user })
    }
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
    const supabase = createSupabaseBrowserClient();

    const { error } = await supabase.auth.signOut();
    if (error) throw error;

    set({
      user: null,
      userProfile: null,
      profileFetched: false,
      isFetchingProfile: false
    });

    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  },

  getAuthErrorMessage: (error: unknown): string => {
    const message = error instanceof Error ? error.message : String(error)
    switch (message) {
      case 'Invalid login credentials':
        return 'Invalid email or password'
      case 'Email not confirmed':
        return 'If your account exists, a confirmation email has been sent to your email address.'
      default:
        return 'Something went wrong. Please try again.'
    }
  },

  requestPasswordReset: async (email: string) => {
    const response = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || 'Password reset failed')
    }
  },

  updatePassword: async (password: string) => {
    const supabase = createSupabaseBrowserClient()

    const { error } = await supabase.auth.updateUser({ password })
    if (error) throw error
  },

  setShowPasswordUpdateModal: (show: boolean) => {
    set({ showPasswordUpdateModal: show })
  },
}))
