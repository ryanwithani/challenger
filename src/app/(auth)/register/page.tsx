'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/src/lib/store/authStore'
import { Input } from '@/src/components/ui/Input'
import { Button } from '@/src/components/ui/Button'

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

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      await signUp(email, password)
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Failed to create account')
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
        
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
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