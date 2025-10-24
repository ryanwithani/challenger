'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuthStore } from '@/src/lib/store/authStore'
import { Button } from '@/src/components/ui/Button'
import { LoginModal } from '@/src/components/auth/LoginModal'
import { PasswordUpdateModal } from '../auth/PasswordUpdateModal'
import { ThemeToggleCompact } from './ThemeToggleCompact'
import { useRouter } from 'next/navigation'

export function Navbar() {
  const { user, userProfile, signOut, showPasswordUpdateModal, setShowPasswordUpdateModal } = useAuthStore()
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const router = useRouter()

  const handleSignOut = async () => {
    console.log('Sign out button clicked');
    try {
      console.log('Calling signOut from authStore...');
      await signOut();
      console.log('SignOut function completed'); // This likely won't execute due to the redirect
    } catch (error) {
      console.error('Error signing out:', error);
      alert('Failed to sign out: ' + (error as any).message);
    }
  };

  return (
    <>
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-sims-purple to-sims-pink rounded-xl flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-sims-purple to-sims-pink text-transparent bg-clip-text">Challenger</h1>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {userProfile ? (
              <div className="flex items-center space-x-3">
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Welcome, {userProfile?.display_name || userProfile?.username || 'User'}
                </div>
                <ThemeToggleCompact />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSignOut}
                  className="border-brand-500 text-brand-500 hover:bg-brand-50/10 dark:border-brand-400 dark:text-brand-400 dark:hover:bg-brand-900/20"
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push('/signup')}
                  className="border-brand-500 text-brand-500 hover:bg-brand-50/10"
                >
                  Sign Up
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    console.log('Opening login modal');
                    setIsLoginModalOpen(true);
                  }}
                  className="bg-gradient-to-r from-brand-500 to-brand-600 hover:opacity-90 text-white"
                >
                  Sign In
                </Button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => {
          console.log('Modal close called');
          setIsLoginModalOpen(false);
        }}
      />

      <PasswordUpdateModal
        open={showPasswordUpdateModal}
        onClose={() => setShowPasswordUpdateModal(false)}
      />
    </>
  )
}