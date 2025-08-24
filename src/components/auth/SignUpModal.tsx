'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/src/lib/store/authStore'
import { Input } from '@/src/components/ui/Input'
import { Button } from '@/src/components/ui/Button'
import { PasswordInput } from '@/src/components/auth/PasswordInput'
import { Modal } from '@/src/components/ui/Modal'
import { signUpSchema } from '@/src/lib/utils/validators'

interface SignUpModalProps {
    isOpen: boolean
    onClose: () => void
}

export function SignUpModal({ isOpen, onClose }: SignUpModalProps) {
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
            await signUp(email, password)
            onClose()
            router.push('/dashboard')
        } catch (err: any) {
            setError(err?.message || 'Failed to create account')
        } finally {
            setLoading(false)
        }
    }

    const handleClose = () => {
        setEmail('')
        setPassword('')
        setConfirmPassword('')
        setError('')
        setLoading(false)
        onClose()
    }

    return (
        <Modal isOpen={isOpen} onClose={handleClose}>
            <div className="w-full max-w-md">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create Account</h2>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
                    >
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                        required
                    />

                    <PasswordInput
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        showValidation={true}
                        className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                        placeholder="Password"
                        required
                    />

                    <Input
                        type="password"
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                        required
                    />

                    {error && (
                        <p className="text-red-500 dark:text-red-400 text-sm">{error}</p>
                    )}

                    <Button
                        type="submit"
                        className="w-full bg-sims-green hover:bg-sims-green/90 text-white dark:bg-sims-green dark:hover:bg-sims-green/90"
                        disabled={loading}
                    >
                        {loading ? 'Creating account...' : 'Sign Up'}
                    </Button>
                </form>

                <p className="text-center mt-4 text-sm text-gray-600 dark:text-gray-400">
                    Already have an account?{' '}
                    <Link href="/login" className="text-sims-blue hover:underline dark:text-sims-blue">
                        Sign in
                    </Link>
                </p>
            </div>
        </Modal>
    )
}