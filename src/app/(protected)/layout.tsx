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
          <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <div className="text-2xl text-gray-500">Loading your dashboard...</div>
          <div className="text-sm text-gray-400">
            If loading takes more than 10 seconds, please
            <button
              onClick={() => window.location.reload()}
              className="text-brand-500 hover:underline ml-1">
              refresh the page
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-800"> {/* CHANGE: h-screen to min-h-screen */}
  <Sidebar />
  <div className="flex-1 flex flex-col"> {/* REMOVE: overflow-hidden */}
    <Navbar />
    {/* REMOVE: flex-1 and overflow classes. Let it be a simple container. */}
    <main className="p-6"> 
      {children}
    </main>
  </div>
</div>
  )
}