'use client'

import { useState } from 'react'
import { Input } from '@/src/components/ui/Input'
import { Label } from '@/src/components/ui/Label'
import { Button } from '@/src/components/ui/Button'
import { createSupabaseBrowserClient } from '@/src/lib/supabase/client'
import { PASSWORD_MIN } from '@/src/lib/utils/validators'

interface AccountStepProps {
  onSuccess: () => void
}

export default function AccountStep({ onSuccess }: AccountStepProps) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [globalError, setGlobalError] = useState<string | null>(null)
  const [passwordStrength, setPasswordStrength] = useState<{ label: string, color: string, textColor: string }>({ label: 'Weak', color: 'bg-orange-500', textColor: 'text-orange-600' })

  const validateField = (name: string, value: string): string | null => {
    switch (name) {
      case 'username':
        const sanitized = value.trim()
        if (!value.trim()) return 'Username is required'
        if (sanitized.length < 3) return 'Username must be at least 3 characters'
        if (sanitized.length > 20) return 'Username must be less than 20 characters'
        if (!/^[a-z0-9_-]+$/.test(sanitized.toLowerCase())) {
          return 'Username can only contain lowercase letters, numbers, - and _'
        }
        const reserved = ['admin', 'root', 'system', 'mod', 'moderator', 'support', 'help']
        if (reserved.includes(sanitized)) {
          return 'This username is reserved'
        }
        return null

      case 'email':
        if (!value.trim()) return 'Email is required'
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please enter a valid email'
        return null

      case 'password':
        if (!value) return 'Password is required'
        if (value.length < PASSWORD_MIN) return `Password must be at least ${PASSWORD_MIN} characters`
        return null

      default:
        return null
    }
  }

  const getPasswordStrength = (password: string) => {
    // Check for common weak patterns first
    const commonPatterns = /(password|1234|qwerty|abc123|admin|letmein)/i
    const hasSpaces = /\s/.test(password)

    if (commonPatterns.test(password)) {
      return { label: 'Very Weak', color: 'bg-red-600', textColor: 'text-red-700' }
    }

    if (hasSpaces) {
      return { label: 'Invalid', color: 'bg-red-500', textColor: 'text-red-600' }
    }

    // Length requirements (NIST 2024 standards)
    if (password.length < PASSWORD_MIN) {
      return { label: 'Too Short', color: 'bg-red-500', textColor: 'text-red-600' }
    }

    // Check complexity criteria
    const hasLower = /[a-z]/.test(password)
    const hasUpper = /[A-Z]/.test(password)
    const hasNumber = /[0-9]/.test(password)
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password)

    const complexityScore = [hasLower, hasUpper, hasNumber, hasSpecial].filter(Boolean).length

    // Length bonus for longer passwords
    const lengthBonus = password.length >= 12 ? 1 : 0
    const totalScore = complexityScore + lengthBonus

    // Determine strength based on modern standards
    if (totalScore >= 5) {
      return { label: 'Very Strong', color: 'bg-green-600', textColor: 'text-green-700' }
    } else if (totalScore >= 4) {
      return { label: 'Strong', color: 'bg-green-500', textColor: 'text-green-600' }
    } else if (totalScore >= 3) {
      return { label: 'Good', color: 'bg-yellow-500', textColor: 'text-yellow-600' }
    } else if (totalScore >= 2) {
      return { label: 'Fair', color: 'bg-orange-500', textColor: 'text-orange-600' }
    } else {
      return { label: 'Weak', color: 'bg-red-500', textColor: 'text-red-600' }
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))

    // Update password strength in real-time
    if (name === 'password') {
      const strength = getPasswordStrength(value)
      setPasswordStrength(strength)
    }

    if (errors[name]) {
      setErrors(prev => {
        const next = { ...prev }
        delete next[name]
        return next
      })
    }
    setGlobalError(null)
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    const error = validateField(name, value)
    if (error) {
      setErrors(prev => ({ ...prev, [name]: error }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setGlobalError(null)

    // Check honeypot first - if filled, it's likely a bot
    const honeypotValue = (e.target as HTMLFormElement).website?.value
    if (honeypotValue) {
      setGlobalError('Submission blocked - please try again')
      return // Prevent form submission
    }

    const newErrors: Record<string, string> = {}
    Object.entries(formData).forEach(([name, value]) => {
      const error = validateField(name, value)
      if (error) newErrors[name] = error
    })

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setLoading(true)

    try {
      const supabase = createSupabaseBrowserClient()

      // Check if username is already taken
      const { data: _rpcData, error: _rpcError } = await supabase.rpc('create_user_with_username', {
        p_username: formData.username,
        p_email: formData.email,
        p_password: formData.password,
      })

      // Create account - trigger will handle user profile creation
      const { error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            username: formData.username,
          },
        },
      })

      if (signUpError?.code === '23505') {
        setErrors({ username: 'This username is already taken' })
      }

      // SUCCESS - trigger created the profile automatically
      onSuccess()

    } catch (err: any) {
      console.error('Account creation error:', err)

      if (err.message?.toLowerCase().includes('already registered')) {
        setGlobalError('This email is already registered. Please sign in instead.')
      } else if (err.message?.toLowerCase().includes('invalid email')) {
        setErrors({ email: 'Please enter a valid email address' })
      } else if (err.message?.toLowerCase().includes('password')) {
        setErrors({ password: `Password must be at least ${PASSWORD_MIN} characters` })
      } else {
        setGlobalError(err.message || 'Failed to create account. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 md:p-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome to Challenger!
        </h1>
        <p className="text-gray-600">
          Create your account to start tracking your Sims 4 challenges
        </p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-5">
        <div>
          <input
            type="text"
            name="website"
            style={{ position: 'absolute', left: '-9999px' }}
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            onChange={(e) => {
              // Remove the onChange handler - we'll check on submit instead
            }}
          />
          <Label htmlFor="username" className="text-sm font-semibold text-gray-700 mb-1.5">
            Username
          </Label>
          <Input
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="SimFan_92"
            className={errors.username ? 'border-red-500' : ''}
            disabled={loading}
            autoComplete="username"
          />
          {errors.username && (
            <p className="mt-1.5 text-sm text-red-600">{errors.username}</p>
          )}
        </div>

        <div>
          <Label htmlFor="email" className="text-sm font-semibold text-gray-700 mb-1.5">
            Email Address
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="you@example.com"
            className={errors.email ? 'border-red-500' : ''}
            disabled={loading}
            autoComplete="email"
          />
          {errors.email && (
            <p className="mt-1.5 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        <div>
          <Label htmlFor="password" className="text-sm font-semibold text-gray-700 mb-1.5">
            Password
          </Label>
          <Input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder={`At least ${PASSWORD_MIN} characters`}
            className={errors.password ? 'border-red-500' : ''}
            disabled={loading}
            autoComplete="new-password"
          />
          {errors.password && (
            <p className="mt-1.5 text-sm text-red-600">{errors.password}</p>
          )}
          {formData.password && (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                <div className={`h-1.5 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                  style={{
                    width: passwordStrength.label === 'Very Weak' ? '10%' :
                      passwordStrength.label === 'Invalid' ? '10%' :
                        passwordStrength.label === 'Too Short' ? '20%' :
                          passwordStrength.label === 'Weak' ? '30%' :
                            passwordStrength.label === 'Fair' ? '50%' :
                              passwordStrength.label === 'Good' ? '70%' :
                                passwordStrength.label === 'Strong' ? '85%' : '100%'
                  }}></div>
              </div>
              <span className={`text-xs font-medium ${passwordStrength.textColor}`}>
                {passwordStrength.label}
              </span>
            </div>
          )}
        </div>

        {globalError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm text-red-800">{globalError}</p>
          </div>
        )}

        <Button
          type="submit"
          disabled={loading}
          className="w-full mt-6"
          size="lg"
        >
          {loading ? 'Creating Account...' : 'Create Account'}
        </Button>

        <p className="text-center text-sm text-gray-600 mt-4">
          Already have an account?{' '}
          <a href="/login" className="text-brand-600 hover:text-brand-700 font-semibold">
            Sign In
          </a>
        </p>
      </form>
    </div>
  )
}