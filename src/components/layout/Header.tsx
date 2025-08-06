'use client'

import Link from 'next/link'
import { useAuthStore } from '@/src/lib/store/authStore'
import { Button } from '@/src/components/ui/Button'

export function Header() {
  const { user, signOut } = useAuthStore()

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">Sims Challenge Tracker</h1>
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          {user && (
            <div className="flex items-center space-x-3">
              <div className="text-sm text-gray-600">
                Welcome, {user.email}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSignOut}
              >
                Sign Out
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
