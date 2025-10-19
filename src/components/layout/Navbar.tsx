'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuthStore } from '@/src/lib/store/authStore'
import { Button } from '@/src/components/ui/Button'
import { LoginModal } from '@/src/components/auth/LoginModal'
import { PasswordUpdateModal } from '../auth/PasswordUpdateModal'
import { useRouter } from 'next/navigation'

export function Navbar() {
  const { user, userProfile, signOut, showPasswordUpdateModal, setShowPasswordUpdateModal } = useAuthStore()
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const router = useRouter()
  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <>
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">Challenger</h1>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {userProfile ? (
              <div className="flex items-center space-x-3">
                <div className="text-sm text-gray-600">
                  Welcome, {userProfile?.display_name || userProfile?.username || 'User'}
                </div>
                <Link href="/dashboard">
                  <Button variant="outline" size="sm">
                    Dashboard
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSignOut}
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
                >
                  Sign Up
                </Button>
                <Button
                  variant='outline'
                  size="sm"
                  onClick={() => setIsLoginModalOpen(true)}
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
        onClose={
          () => {
            console.log('Modal close called')
            setIsLoginModalOpen(false)
          }
        }
      />

      <PasswordUpdateModal
        isOpen={showPasswordUpdateModal}
        onClose={() => setShowPasswordUpdateModal(false)}
      />
    </>
  )
}
