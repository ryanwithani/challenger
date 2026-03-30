'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useAuthStore } from '@/src/lib/store/authStore'
import { Button } from '@/src/components/ui/Button'
import { LoginModal } from '@/src/components/auth/LoginModal'
import { PasswordUpdateModal } from '../auth/PasswordUpdateModal'
import { ThemeToggleCompact } from './ThemeToggleCompact'
import { useRouter } from 'next/navigation'
import { CrownIcon } from '../icons/CrownIcon'

export function Navbar() {
  const { user, userProfile, signOut, showPasswordUpdateModal, setShowPasswordUpdateModal } = useAuthStore()
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      alert('Failed to sign out: ' + (error as any).message);
    }
  };

  return (
    <>
      <nav className="bg-white dark:bg-warmGray-900 border-b border-gray-200 dark:border-warmGray-700 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <CrownIcon size={32} className="w-8 h-8" />
              <h1 className="text-xl font-semibold text-brand-500 font-exo2">
                Challenger
              </h1>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {userProfile ? (
              <div className="flex items-center space-x-3">
                <div className="text-sm text-gray-600 dark:text-warmGray-200">
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
                  onClick={() => setIsLoginModalOpen(true)}
                  className="bg-brand-500 hover:bg-brand-600 text-white"
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
        onClose={() => setIsLoginModalOpen(false)}
      />

      <PasswordUpdateModal
        open={showPasswordUpdateModal}
        onClose={() => setShowPasswordUpdateModal(false)}
      />
    </>
  )
}