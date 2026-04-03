'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/src/lib/store/authStore'
import { Sidebar } from '@/src/components/layout/Sidebar'
import { Navbar } from '@/src/components/layout/Navbar'
import { Footer } from '@/src/components/layout/Footer'

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, loading, initialized, initialize } = useAuthStore()

  // Check if we're on a challenge page (they handle their own styling)
  const isFullPageLayout = pathname?.startsWith('/challenge/')

  useEffect(() => {
    if (!initialized) {
      initialize()
    }
  }, [initialized, initialize])

  useEffect(() => {
    if (initialized && !loading && !user) {
      router.push('/')
    }
  }, [user, loading, initialized, router])

  if (user && !user.email_confirmed_at) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Verify Your Email</h1>
          <p className="text-gray-600">
            Please check your email and click the verification link to continue.
          </p>
        </div>
      </div>
    )
  }

  if (!initialized || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-brand-500 dark:border-brand-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <div className="text-gray-600 dark:text-warmGray-200 mt-4">Loading...</div>
          <div className="text-sm text-gray-400">
            If loading takes more than 10 seconds, please
            <button
              onClick={() => window.location.reload()}
              className="text-brand-500 dark:text-brand-400 hover:underline ml-1">
              refresh the page
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-cozy-cream dark:bg-surface-dark">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-4 lg:p-6 pb-24 lg:pb-6">
          {children}
        </main>
      </div>
    </div>
  )
}