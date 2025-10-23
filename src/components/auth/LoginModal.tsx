'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/src/lib/store/authStore'
import { Input } from '@/src/components/ui/Input'
import { Button } from '@/src/components/ui/Button'
import { PasswordInput } from '@/src/components/auth/PasswordInput'
import { PasswordResetModal } from '@/src/components/auth/PasswordResetModal'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const router = useRouter()
  const { signIn } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showResetModal, setShowResetModal] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login form submitted with email:', email);
    setError('');
    setLoading(true);

    try {
      console.log('Attempting to sign in...');
      await signIn(email, password);
      console.log('Sign in successful!');
      onClose();
      router.push('/dashboard');
    } catch (err: any) {
      console.error('Sign in error details:', err);
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('')
    setPassword('')
    setError('')
    setLoading(false)
    onClose()
  }

  const handleForgotPassword = () => {
    handleClose()
    setShowResetModal(true)
  }

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-3xl shadow-xl w-full max-w-md p-8 relative">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-brand-500">Sign In</h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

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
                className="text-sm text-brand-500 hover:text-purple-600"
              >
                Forgot password?
              </button>
            </div>

            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}

            <Button
              type="submit"
              variant="gradient"
              className="w-full"
              disabled={loading}
              loading={loading}
              loadingText="Signing in..."
            >
              Sign In
            </Button>
          </form>
        </div>
      </div>

      <PasswordResetModal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        initialEmail={email}
      />
    </>
  )
}