'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { AuthInitializer } from '../components/auth/AuthInitializer'
import { CrownIcon } from '@/src/components/icons/CrownIcon'
import { useAuthStore } from '@/src/lib/store/authStore'
import { Input } from '@/src/components/ui/Input'
import { Button } from '@/src/components/ui/Button'
import { PasswordInput } from '@/src/components/auth/PasswordInput'
import { PasswordResetModal } from '@/src/components/auth/PasswordResetModal'

export default function LandingPage() {
  const router = useRouter()
  const { signIn } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showResetModal, setShowResetModal] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await signIn(email, password)
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Failed to sign in')
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = () => {
    setShowResetModal(true)
  }

  return (
    <div className="min-h-screen bg-cozy-cream dark:bg-surface-dark flex flex-col">
      <AuthInitializer />
      <main className="container mx-auto px-4 flex-1 flex flex-col items-center justify-center">
        {/* Header Section */}
        <div className="flex flex-col items-center justify-center mb-12">
          <div className="flex items-center space-x-3 mb-4">
            <CrownIcon size={64} className="w-16 h-16" />
            <h1 className="text-5xl font-bold text-brand-500 font-exo2 leading-normal">
              Challenger
            </h1>
          </div>
        </div>

        {/* Main Content Section - Three Column Layout */}
        <div className="flex flex-col lg:flex-row items-center justify-center gap-8 max-w-6xl mx-auto w-full">
          {/* Left: Mascot Image */}
          <div className="flex-shrink-0">
            <Image
              src="/mascot/pointing.png"
              alt="Challenger Mascot"
              width={300}
              height={300}
              className="object-contain"
            />
          </div>

          {/* Center: Blurb Text */}
          <div className="flex-1 max-w-md text-center lg:text-left">
            <p className="text-lg text-gray-700 dark:text-warmGray-200 leading-relaxed">
              Track your legacy challenge across 10 generations with built-in scoring, family trees, and goal management.
            </p>
          </div>

          {/* Right: Sign-In Form */}
          <div className="flex-shrink-0 w-full max-w-md">
            <div className="bg-white dark:bg-surface-dark rounded-3xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-brand-500 dark:text-brand-400 mb-6">
                Sign In
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full"
                  required
                />

                <PasswordInput
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full"
                  placeholder="Password"
                  required
                />

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-sm text-brand-500 hover:text-brand-600 dark:hover:text-brand-400"
                  >
                    Forgot password?
                  </button>
                </div>

                {error && (
                  <p className="text-red-500 text-sm">{error}</p>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  disabled={loading}
                  loading={loading}
                  loadingText="Signing in..."
                >
                  Sign In
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600 dark:text-warmGray-300">
                  Don't have an account?{' '}
                  <Link
                    href="/signup"
                    className="text-brand-500 hover:text-brand-600 dark:text-brand-400 dark:hover:text-brand-300 font-semibold underline"
                  >
                    Sign up
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <PasswordResetModal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        initialEmail={email}
      />
    </div>
  )
}