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
  showPasswordUpdateModal: boolean // ADD THIS
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  fetchUserProfile: () => Promise<void>
  initialize: () => void
  getAuthErrorMessage: (error: any) => string
  requestPasswordReset: (email: string) => Promise<void> // ADD THIS
  updatePassword: (password: string) => Promise<void> // ADD THIS
  setShowPasswordUpdateModal: (show: boolean) => void // ADD THIS
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  userProfile: null,
  loading: true,
  initialized: false,
  isFetchingProfile: false,
  profileFetched: false,
  showPasswordUpdateModal: false, // ADD THIS

  initialize: () => {
    if (get().initialized) return;

    set({ initialized: true });

    const supabase = createSupabaseBrowserClient();

    supabase.auth.onAuthStateChange(async (event, session) => {
      set({ user: session?.user ?? null, loading: false });

      if (session?.user) {
        await get().fetchUserProfile();
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

  fetchUserProfile: async () => {
    const state = get()

    // ✅ GUARD 1: Don't fetch if already fetching
    if (state.isFetchingProfile) {
      console.log('⚠️ Profile fetch already in progress, skipping')
      return
    }

    const supabase = createSupabaseBrowserClient()
    const { data: { user } } = await supabase.auth.getUser()

    // ✅ GUARD 2: No user means clear profile and exit
    if (!user) {
      set({
        userProfile: null,
        profileFetched: false,
        isFetchingProfile: false
      })
      return
    }

    // ✅ GUARD 3: Already have profile for this user? Skip fetch.
    if (state.profileFetched && state.userProfile?.id === user.id) {
      console.log('✓ Profile already loaded for this user')
      return
    }

    // ✅ Mark as fetching to prevent concurrent calls
    set({ isFetchingProfile: true })

    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, username, display_name, avatar_url, email')
        .eq('id', user.id)
        .single()

      if (error) {
        throw error
      }

      if (data) {
        set({
          userProfile: data,
          profileFetched: true,  // ✅ Mark as successfully fetched
          isFetchingProfile: false
        })
      }
    } catch (error) {
      console.error('Failed to fetch/create profile:', error)
      set({
        isFetchingProfile: false,
        profileFetched: false
      })
    }
  },


  signIn: async (email: string, password: string) => {
    // Goes through the API route, which applies rate limiting and CSRF protection
    await signInAPI(email, password)

    // The API route signs in server-side and sets session cookies.
    // Call getSession() so the browser client picks up those cookies.
    const supabase = createSupabaseBrowserClient()
    const { data: { session }, error } = await supabase.auth.getSession()

    if (error || !session?.user) {
      throw new Error('Authentication failed: No session returned')
    }

    set({ user: session.user })
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
    try {
      console.log('Signing out user...');
      const supabase = createSupabaseBrowserClient();

      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error during sign out:', error);
        throw error;
      }

      console.log('Sign out successful, clearing user state');

      // Clear all user state
      set({
        user: null,
        userProfile: null,
        profileFetched: false,
        isFetchingProfile: false
      });

      // Force a redirect to home page instead of /login
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }

      console.log('User state cleared');
    } catch (error) {
      console.error('Caught error during sign out:', error);
      throw error;
    }
  },

  getAuthErrorMessage: (error: any): string => {
    switch (error.message) {
      case 'Invalid login credentials':
        return 'Invalid email or password'
      case 'Email not confirmed':
        return 'If your account exists, a confirmation email has been sent to your email address.'
      default:
        return 'Something went wrong. Please try again.'
    }
  },

  // ADD THIS: Request password reset
  requestPasswordReset: async (email: string) => {
    // Remove client-side rate limiting code
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