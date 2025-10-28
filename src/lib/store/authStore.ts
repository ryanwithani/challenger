import { create } from 'zustand'
import { createSupabaseBrowserClient } from '@/src/lib/supabase/client'
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
  initialize: () => Promise<void>
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

  initialize: async () => {
    
    if (get().initialized) {
      return;
    }

    const supabase = createSupabaseBrowserClient()

    supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event);
      const user = session?.user ?? null;
      set({ user }); // Update the user in the store

      if (user) {
        // If a user session exists, fetch their associated profile data.
        get().fetchUserProfile();
      } else {
        // If the session is null (user signed out), clear the profile data.
        set({
          userProfile: null,
          profileFetched: false,
          isFetchingProfile: false
        });
      }

      // This event is fired by Supabase after a password reset link is clicked.
      if (event === 'PASSWORD_RECOVERY') {
        set({ showPasswordUpdateModal: true });
      }
    });


     // The listener above only fires on *changes*, not on the initial state.
     const { data: { session } } = await supabase.auth.getSession();
     const user = session?.user ?? null;
     
     set({
      user,
      loading: false,
      initialized: true
    });


    // ✅ REMOVED: Manual profile fetch
    // The listener below will handle it

    // ✅ Single source of truth for profile fetching
    supabase.auth.onAuthStateChange(async (event, session) => {
      set({ user: session?.user ?? null })

      if (session?.user) {
        await get().fetchUserProfile() // ✅ Only place that triggers fetch
      } else {
        set({
          userProfile: null,
          profileFetched: false,  // ✅ Reset cache on logout
          isFetchingProfile: false
        })
      }

      if (event === 'PASSWORD_RECOVERY') {
        set({ showPasswordUpdateModal: true })
      }
    })

    // ✅ NEW: If we have a session on init, manually trigger profile fetch once
    // (because listener only fires on *changes*, not initial state)
    if (user) {
      await get().fetchUserProfile();
    }
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
        // If profile doesn't exist (PGRST116 error), create it
        if (error.code === 'PGRST116' || error.message?.includes('0 rows')) {
          console.log('Profile not found, creating new profile for user:', user.id)

          // Extract username from user metadata or use email prefix
          const username = user.user_metadata?.username || user.email?.split('@')[0] || 'user'

          const { data: newProfile, error: createError } = await supabase
            .from('users')
            .insert({
              id: user.id,
              email: user.email!,
              username: username,
              display_name: username,
              created_at: new Date().toISOString(),
            })
            .select('id, username, display_name, avatar_url, email')
            .single()

          if (createError) {
            console.error('Failed to create profile:', createError)
            throw createError
          }

          set({
            userProfile: newProfile,
            profileFetched: true,
            isFetchingProfile: false
          })
          return
        }

        // For other errors, throw them
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
    console.log('SignIn function called in authStore');
    try {
      const supabase = createSupabaseBrowserClient();
      console.log('Created supabase client');

      console.log('Directly attempting sign in with password...');
      try {
        const authResponse = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        console.log('Raw auth response:', authResponse);
        const { data, error } = authResponse;

        if (error) {
          console.error('Supabase auth returned error:', error);
          throw error;
        }

        if (!data || !data.user) {
          console.error('No user data returned from authentication');
          throw new Error('Authentication failed: No user data returned');
        }

        console.log('Authentication successful for:', data.user.email);
        set({ user: data.user });
        // Don't return anything to match void return type
      } catch (innerError) {
        console.error('Exception during Supabase auth call:', innerError);
        throw innerError;
      }
    } catch (outerError: any) {
      console.error('Outer catch - sign in error in authStore:', outerError);
      throw outerError;
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