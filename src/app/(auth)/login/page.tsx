'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/src/lib/store/authStore'
import { Input } from '@/src/components/ui/Input'
import { Button } from '@/src/components/ui/Button'
import { PasswordInput } from '@/src/components/auth/PasswordInput'
import { signInSchema } from '@/src/lib/utils/validators'

export default function LoginPage() {
  const router = useRouter()
  const { signIn, getAuthErrorMessage } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const validation = signInSchema.safeParse({ email, password })
    if (!validation.success) {
      setError(validation.error.errors.map(e => e.message).join(', '))
      return
    }
    
    setLoading(true)
    try {
      await signIn(email, password)
      router.push('/dashboard')
    } catch (err: any) {
      const friendlyMessage = getAuthErrorMessage(err)
      setError(friendlyMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <h1 className="text-2xl font-bold text-center mb-6">Sign In</h1>
      
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
          {loading ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>
      
      <p className="text-center mt-4 text-sm text-gray-600">
        Don't have an account?{' '}
        <Link href="/register" className="text-sims-blue hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  )
}
