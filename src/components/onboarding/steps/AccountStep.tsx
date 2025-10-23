'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Input } from '@/src/components/ui/Input'
import { Label } from '@/src/components/ui/Label'
import { Button } from '@/src/components/ui/Button'
import { PasswordInput } from '@/src/components/auth/PasswordInput'
import { PASSWORD_MIN, signUpSchema, usernameSchema, emailSchema, passwordSchema } from '@/src/lib/utils/validators'
import { csrfTokenManager } from '@/src/lib/utils/csrf-client'
import { LoginModal } from '@/src/components/auth/LoginModal'

interface AccountStepProps {
  onSuccess: (accountData: { username: string; email: string; password: string }) => void
  initialData?: { username: string; email: string; password: string }
}

const STORAGE_KEY = 'onboarding_account_data'

export default function AccountStep({ onSuccess, initialData }: AccountStepProps) {
  // Load saved data from localStorage or use initial data
  const getInitialFormData = () => {
    if (initialData) return initialData

    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved) : { username: '', email: '', password: '' }
    } catch {
      return { username: '', email: '', password: '' }
    }
  }

  const [formData, setFormData] = useState(getInitialFormData)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [globalError, setGlobalError] = useState<string | null>(null)
  const [showLoginModal, setShowLoginModal] = useState(false)

  // Optimized auto-save with debouncing and change detection
  useEffect(() => {
    // Only save if form data has meaningful content
    const hasContent = Object.values(formData).some(value => typeof value === 'string' && value.trim() !== '')
    if (!hasContent) return

    const timeoutId = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(formData))
      } catch (error) {
        console.warn('Failed to save form data:', error)
      }
    }, 500) // Debounce auto-save

    return () => clearTimeout(timeoutId)
  }, [formData])

  // Memoized validation schemas to prevent recreation on every render
  const validationSchemas = useMemo(() => ({
    username: usernameSchema,
    email: emailSchema,
    password: passwordSchema
  }), [])

  // Optimized field validation with useCallback
  const validateField = useCallback((name: string, value: string): string | null => {
    try {
      const schema = validationSchemas[name as keyof typeof validationSchemas]
      if (!schema) return null

      const result = schema.safeParse(value)
      if (!result.success) {
        return result.error.errors[0].message
      }
      return null
    } catch (error) {
      console.error('Validation error:', error)
      return 'Validation error occurred'
    }
  }, [validationSchemas])

  // Optimized change handler with useCallback
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev: typeof formData) => ({ ...prev, [name]: value }))

    // Clear field-specific errors when user starts typing
    if (errors[name]) {
      setErrors((prev: Record<string, string>) => {
        const next = { ...prev }
        delete next[name]
        return next
      })
    }
    setGlobalError(null)
  }, [errors])

  // Optimized blur handler with useCallback
  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    const error = validateField(name, value)
    if (error) {
      setErrors((prev: Record<string, string>) => ({ ...prev, [name]: error }))
    }
  }, [validateField])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setGlobalError(null)
    setErrors({})

    // Check honeypot
    const honeypotValue = (e.target as HTMLFormElement).website?.value
    if (honeypotValue && honeypotValue.trim() !== '') {
      console.warn('Honeypot triggered - possible bot submission')
      setGlobalError('Submission blocked - please try again')
      return
    }

    // Client-side validation first
    const newErrors: Record<string, string> = {}
    Object.entries(formData).forEach(([name, value]) => {
      const error = validateField(name as string, value as string)
      if (error) newErrors[name] = error
    })

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setLoading(true)

    try {
      // Get CSRF token and headers
      const headers = await csrfTokenManager.getHeaders()

      // Call signup API directly - server will handle additional validation
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          username: formData.username.trim(),
          email: formData.email.trim(),
          password: formData.password,
          website: '', // Honeypot field - should always be empty
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        // Handle server-side validation errors
        if (result.field && result.error) {
          setErrors({ [result.field]: result.error })
        } else {
          setGlobalError(result.error || 'Failed to create account. Please try again.')
        }
        return
      }

      // Success - clear saved data and proceed
      localStorage.removeItem(STORAGE_KEY)
      onSuccess({
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
      })

    } catch (err: any) {
      console.error('Signup error:', err)
      setGlobalError('Failed to create account. Please check your connection and try again.')
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
          Create your account to start tracking your challenges.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-5">
        <div>
          <input
            type="text"
            name="website"
            style={{
              position: 'absolute',
              left: '-9999px',
              opacity: 0,
              pointerEvents: 'none',
              width: '1px',
              height: '1px'
            }}
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            defaultValue=""
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
          <PasswordInput
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder={`At least ${PASSWORD_MIN} characters`}
            error={errors.password}
            disabled={loading}
            autoComplete="new-password"
            showValidation={true}
          />
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
          {loading ? 'Validating...' : 'Continue'}
        </Button>

        <p className="text-center text-sm text-gray-600 mt-4">
          Already have an account?{' '}
          <button
            type="button"
            onClick={() => setShowLoginModal(true)}
            className="text-brand-600 hover:text-brand-700 font-semibold underline"
          >
            Sign In
          </button>
        </p>
      </form>

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </div>
  )
}