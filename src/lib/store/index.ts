import { useAuthStore } from './authStore'
import { useChallengeStore } from './challengeStore'

// Export all stores
export { useAuthStore, useChallengeStore }

// Optional: Create a root store hook if you need to access multiple stores
export const useStore = () => {
  const auth = useAuthStore()
  const challenges = useChallengeStore()
  
  return {
    auth,
    challenges,
  }
}

// Optional: Store selectors for common use cases
export const useUser = () => useAuthStore((state) => state.user)
export const useIsAuthenticated = () => useAuthStore((state) => !!state.user)
export const useChallenges = () => useChallengeStore((state) => state.challenges)
export const useCurrentChallenge = () => useChallengeStore((state) => state.currentChallenge)
export const useTotalPoints = () => useChallengeStore((state) => state.calculatePoints())

// Optional: Combined selectors
export const useUserChallenges = () => {
  const user = useUser()
  const challenges = useChallenges()
  
  return {
    user,
    challenges,
    hasChallenges: challenges.length > 0,
    challengeCount: challenges.length,
  }
}

// Reset all stores (useful for logout)
export const resetAllStores = () => {
  useAuthStore.setState({ user: null, loading: false })
  useChallengeStore.setState({
    challenges: [],
    currentChallenge: null,
    sims: [],
    goals: [],
    progress: [],
    loading: false,
  })
}