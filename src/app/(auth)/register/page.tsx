'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/src/lib/store/authStore'
import { Input } from '@/src/components/ui/Input'
import { Button } from '@/src/components/ui/Button'
import { PasswordInput } from '@/src/components/auth/PasswordInput'
import { signUpSchema } from '@/src/lib/utils/validators'

export default function RegisterPage() {
  const router = useRouter()
  const { signUp } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const parsed = signUpSchema.safeParse({ email, password, confirmPassword })
    if (!parsed.success) {
      const { formErrors, fieldErrors } = parsed.error.flatten()
      setError(formErrors[0] || fieldErrors.password?.[0] || fieldErrors.email?.[0] || "Please fix the errors and try again.")
      return
    }

    setLoading(true)

    try {
      try {
        await signUp(email, password)
        router.push('/dashboard')
      } catch (err: any) {
        setError(err?.message || 'Failed to create account')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <h1 className="text-2xl font-bold text-center mb-6">Create Account</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        
        <PasswordInput
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          showValidation={true}
          required
        />
        
        <Input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        
        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}
        
        <Button
          type="submit"
          className="w-full"
          disabled={loading}
        >
          {loading ? 'Creating account...' : 'Sign Up'}
        </Button>
      </form>
      
      <p className="text-center mt-4 text-sm text-gray-600">
        Already have an account?{' '}
        <Link href="/login" className="text-sims-blue hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}