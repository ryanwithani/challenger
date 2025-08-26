'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/src/lib/store/authStore'
import { Input } from '@/src/components/ui/Input'
import { Button } from '@/src/components/ui/Button'
import { Modal } from '@/src/components/ui/Modal'

interface PasswordResetModalProps {
    isOpen: boolean
    onClose: () => void
    initialEmail?: string
}

export function PasswordResetModal({ isOpen, onClose, initialEmail = '' }: PasswordResetModalProps) {
    const { requestPasswordReset, getAuthErrorMessage } = useAuthStore()
    const [email, setEmail] = useState(initialEmail)
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        if (initialEmail) {
            setEmail(initialEmail)
        }
    }, [initialEmail])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            await requestPasswordReset(email)
            setSuccess(true)

            // Auto-close after 5 seconds
            setTimeout(() => {
                handleClose()
            }, 5000)

        } catch (err: any) {
            // For security, always show success unless it's a rate limit error
            if (err.message?.includes('Too many')) {
                setError(err.message)
            } else {
                setSuccess(true) // Prevent email enumeration
            }
        } finally {
            setLoading(false)
        }
    }

    const handleClose = () => {
        setEmail('')
        setError('')
        setSuccess(false)
        setLoading(false)
        onClose()
    }

    return (
        <Modal isOpen={isOpen} onClose={handleClose}>
            <div className="w-full max-w-md">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Reset Password
                    </h2>
                </div>

                {!success ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                            Enter your email address and we'll send you a link to reset your password.
                        </p>

                        <Input
                            type="email"
                            placeholder="Email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                            required
                            disabled={loading}
                        />

                        {error && (
                            <p className="text-red-500 dark:text-red-400 text-sm">{error}</p>
                        )}

                        <Button
                            type="submit"
                            className="w-full bg-sims-green hover:bg-sims-green/90 text-white"
                            disabled={loading}
                        >
                            {loading ? 'Sending...' : 'Send Reset Link'}
                        </Button>
                    </form>
                ) : (
                    <div className="text-center space-y-4">
                        <div className="flex justify-center mb-4">
                            <div className="rounded-full bg-green-100 dark:bg-green-900 p-3">
                                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Check your email
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                            We've sent password reset instructions to {email}
                        </p>
                    </div>
                )}
            </div>
        </Modal>
    )
}