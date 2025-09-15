'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuthStore } from '@/src/lib/store/authStore'
import { Button } from '@/src/components/ui/Button'
import { LoginModal } from '@/src/components/auth/LoginModal'
import { SignUpModal } from '@/src/components/auth/SignUpModal'
import { PasswordResetModal } from '../auth/PasswordResetModal'
import { PasswordUpdateModal } from '../auth/PasswordUpdateModal'

export function Navbar() {
  const { user, signOut, showPasswordUpdateModal, setShowPasswordUpdateModal } = useAuthStore()
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false)

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
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="text-sm text-gray-600">
                  Welcome, {user.email}
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
                  onClick={() => setIsSignUpModalOpen(true)}
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
      <SignUpModal
        isOpen={isSignUpModalOpen}
        onClose={() => setIsSignUpModalOpen(false)}
      />

      <PasswordUpdateModal
        isOpen={showPasswordUpdateModal}
        onClose={() => setShowPasswordUpdateModal(false)}
      />
    </>
  )
}
