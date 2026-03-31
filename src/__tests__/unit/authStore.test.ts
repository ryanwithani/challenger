import { useAuthStore } from '@/src/lib/store/authStore'
import { createSupabaseBrowserClient } from '@/src/lib/supabase/client'
import { signIn as signInAPI } from '@/src/lib/api/auth'
import { createBrowserSupabaseMock } from '@/src/__tests__/utils/test-helpers'

jest.mock('@/src/lib/supabase/client')
jest.mock('@/src/lib/api/auth')

// Mock window.location so signOut doesn't error in jsdom
const originalLocation = window.location
beforeAll(() => {
    delete (window as any).location
    ;(window as any).location = { href: '', assign: jest.fn() }
})
afterAll(() => {
    ;(window as any).location = originalLocation
})

let mockSingle: jest.Mock
let mockSupabase: any

const initialState = {
    user: null,
    userProfile: null,
    loading: true,
    initialized: false,
    isFetchingProfile: false,
    profileFetched: false,
    showPasswordUpdateModal: false,
}

describe('authStore', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        const mock = createBrowserSupabaseMock()
        mockSingle = mock.mockSingle
        mockSupabase = mock.supabase
        ;(createSupabaseBrowserClient as jest.Mock).mockReturnValue(mockSupabase)
        useAuthStore.setState(initialState)
    })

    describe('signIn', () => {
        test('sets user state from API response', async () => {
            const mockUser = { id: 'user-123', email: 'test@example.com' }
            ;(signInAPI as jest.Mock).mockResolvedValue({ user: mockUser })

            await useAuthStore.getState().signIn('test@example.com', 'pass')

            expect(useAuthStore.getState().user).toEqual(mockUser)
        })

        test('succeeds without setting user when API returns no user', async () => {
            ;(signInAPI as jest.Mock).mockResolvedValue({})

            await useAuthStore.getState().signIn('test@example.com', 'pass')

            expect(useAuthStore.getState().user).toBeNull()
        })

        test('throws when signInAPI fails', async () => {
            ;(signInAPI as jest.Mock).mockRejectedValue(new Error('Invalid credentials'))

            await expect(
                useAuthStore.getState().signIn('test@example.com', 'wrong')
            ).rejects.toThrow('Invalid credentials')
        })
    })

    describe('signOut', () => {
        test('clears user and profile state', async () => {
            useAuthStore.setState({
                user: { id: 'user-123' } as any,
                userProfile: { id: 'user-123', email: 'test@example.com', username: 'test', display_name: 'Test', avatar_url: '' },
                profileFetched: true,
            })
            mockSupabase.auth.signOut.mockResolvedValue({ error: null })

            await useAuthStore.getState().signOut()

            const state = useAuthStore.getState()
            expect(state.user).toBeNull()
            expect(state.userProfile).toBeNull()
            expect(state.profileFetched).toBe(false)
            expect(state.isFetchingProfile).toBe(false)
        })

        test('throws when Supabase signOut fails', async () => {
            mockSupabase.auth.signOut.mockResolvedValue({ error: { message: 'Sign out failed' } })

            await expect(useAuthStore.getState().signOut()).rejects.toMatchObject({
                message: 'Sign out failed',
            })
        })
    })

    describe('fetchUserProfile', () => {
        test('fetches and sets user profile when userId is passed', async () => {
            const mockProfile = {
                id: 'user-123',
                username: 'testuser',
                email: 'test@example.com',
                display_name: 'Test User',
                avatar_url: '',
            }
            mockSingle.mockResolvedValue({ data: mockProfile, error: null })

            await useAuthStore.getState().fetchUserProfile('user-123')

            expect(useAuthStore.getState().userProfile).toEqual(mockProfile)
            expect(useAuthStore.getState().profileFetched).toBe(true)
            expect(useAuthStore.getState().isFetchingProfile).toBe(false)
        })

        test('falls back to store user.id when no userId passed', async () => {
            const mockProfile = {
                id: 'user-456',
                username: 'storeuser',
                email: 'store@example.com',
                display_name: 'Store User',
                avatar_url: '',
            }
            useAuthStore.setState({ user: { id: 'user-456' } as any })
            mockSingle.mockResolvedValue({ data: mockProfile, error: null })

            await useAuthStore.getState().fetchUserProfile()

            expect(useAuthStore.getState().userProfile).toEqual(mockProfile)
            expect(useAuthStore.getState().profileFetched).toBe(true)
        })

        test('skips fetch when already fetching', async () => {
            useAuthStore.setState({ isFetchingProfile: true })

            await useAuthStore.getState().fetchUserProfile('user-123')

            expect(mockSingle).not.toHaveBeenCalled()
        })

        test('clears profile when no userId and no store user', async () => {
            await useAuthStore.getState().fetchUserProfile()

            expect(useAuthStore.getState().userProfile).toBeNull()
            expect(useAuthStore.getState().isFetchingProfile).toBe(false)
        })

        test('skips DB fetch when profile already loaded for the same user', async () => {
            useAuthStore.setState({
                profileFetched: true,
                userProfile: { id: 'user-123', email: '', username: '', display_name: '', avatar_url: '' },
            })

            await useAuthStore.getState().fetchUserProfile('user-123')

            expect(mockSupabase.from).not.toHaveBeenCalled()
        })

        test('resets isFetchingProfile on Supabase error', async () => {
            mockSingle.mockResolvedValue({ data: null, error: { message: 'DB error' } })

            await useAuthStore.getState().fetchUserProfile('user-123')

            expect(useAuthStore.getState().isFetchingProfile).toBe(false)
            expect(useAuthStore.getState().profileFetched).toBe(false)
        })
    })

    describe('requestPasswordReset', () => {
        test('calls the reset-password API endpoint', async () => {
            global.fetch = jest.fn().mockResolvedValue({
                ok: true,
                json: async () => ({ success: true }),
            } as Response)

            await useAuthStore.getState().requestPasswordReset('test@example.com')

            expect(fetch).toHaveBeenCalledWith(
                '/api/auth/reset-password',
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify({ email: 'test@example.com' }),
                })
            )
        })

        test('throws when the API returns an error', async () => {
            global.fetch = jest.fn().mockResolvedValue({
                ok: false,
                json: async () => ({ error: 'Password reset failed' }),
            } as Response)

            await expect(
                useAuthStore.getState().requestPasswordReset('test@example.com')
            ).rejects.toThrow('Password reset failed')
        })
    })

    describe('updatePassword', () => {
        test('calls Supabase updateUser with the new password', async () => {
            mockSupabase.auth.updateUser.mockResolvedValue({ error: null })
            mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { email: 'test@example.com' } } })

            await useAuthStore.getState().updatePassword('NewPass123!')

            expect(mockSupabase.auth.updateUser).toHaveBeenCalledWith({ password: 'NewPass123!' })
        })

        test('throws when Supabase returns an error', async () => {
            mockSupabase.auth.updateUser.mockResolvedValue({ error: { message: 'Update failed' } })

            await expect(
                useAuthStore.getState().updatePassword('NewPass123!')
            ).rejects.toMatchObject({ message: 'Update failed' })
        })
    })

    describe('setShowPasswordUpdateModal', () => {
        test('sets modal visibility to true', () => {
            useAuthStore.getState().setShowPasswordUpdateModal(true)
            expect(useAuthStore.getState().showPasswordUpdateModal).toBe(true)
        })

        test('sets modal visibility to false', () => {
            useAuthStore.setState({ showPasswordUpdateModal: true })
            useAuthStore.getState().setShowPasswordUpdateModal(false)
            expect(useAuthStore.getState().showPasswordUpdateModal).toBe(false)
        })
    })

    describe('getAuthErrorMessage', () => {
        test('maps Invalid login credentials to user-friendly message', () => {
            const msg = useAuthStore.getState().getAuthErrorMessage(new Error('Invalid login credentials'))
            expect(msg).toBe('Invalid email or password')
        })

        test('maps Email not confirmed', () => {
            const msg = useAuthStore.getState().getAuthErrorMessage(new Error('Email not confirmed'))
            expect(msg).toContain('confirmation email')
        })

        test('returns generic message for unrecognized errors', () => {
            const msg = useAuthStore.getState().getAuthErrorMessage(new Error('Something unknown'))
            expect(msg).toBe('Something went wrong. Please try again.')
        })

        test('handles non-Error values gracefully', () => {
            const msg = useAuthStore.getState().getAuthErrorMessage('plain string error')
            expect(msg).toBe('Something went wrong. Please try again.')
        })
    })
})
