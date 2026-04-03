'use client'

import Link from 'next/link'
import { useAuthStore } from '@/src/lib/store/authStore'
import { Button } from '@/src/components/ui/Button'
import { PasswordUpdateModal } from '../auth/PasswordUpdateModal'
import { ThemeToggleCompact } from './ThemeToggleCompact'
import { CrownIcon } from '../icons/CrownIcon'

export function Navbar() {
  const { user, userProfile, signOut, showPasswordUpdateModal, setShowPasswordUpdateModal } = useAuthStore()

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      alert('Failed to sign out: ' + (error as any).message);
    }
  };

  return (
    <>
      <nav className="bg-warmGray-900 border-b border-warmGray-800 px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-3">
              <CrownIcon size={36} className="w-9 h-9" />
              <h1 className="text-2xl font-semibold text-brand-500 font-display">
                Challenger
              </h1>
            </Link>
          </div>

          <div className="flex items-center space-x-3">
            <ThemeToggleCompact />
            <Button
              variant="outline"
              size="md"
              onClick={handleSignOut}
              className="border-brand-500 text-brand-500 hover:bg-brand-50/10 dark:border-brand-400 dark:text-brand-400 dark:hover:bg-brand-900/20"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </nav>

      <PasswordUpdateModal
        open={showPasswordUpdateModal}
        onClose={() => setShowPasswordUpdateModal(false)}
      />
    </>
  )
}