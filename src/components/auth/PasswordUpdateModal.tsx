'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/src/lib/store/authStore'
import { Button } from '@/src/components/ui/Button'
import { PasswordInput } from '@/src/components/auth/PasswordInput'
import { Modal } from '@/src/components/ui/Modal'

interface PasswordUpdateModalProps {
    isOpen: boolean
    onClose: () => void
}

export function PasswordUpdateModal({ isOpen, onClose }: PasswordUpdateModalProps) {
    const router = useRouter()
    const { updatePassword } = useAuthStore()
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (password.length < 8) {
            setError('Password must be at least 8 characters')
            return
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match')
            return
        }

        setLoading(true)

        try {
            await updatePassword(password)
            setSuccess(true)

            setTimeout(() => {
                onClose()
                router.push('/dashboard')
            }, 2000)

        } catch (err: any) {
            setError(err.message || 'Failed to reset password')
        } finally {
            setLoading(false)
        }
    }

    const handleClose = () => {
        if (!loading && !success) {
            setPassword('')
            setConfirmPassword('')
            setError('')
            onClose()
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={handleClose}>
            <div className="w-full max-w-md">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Set New Password
                    </h2>
                </div>

                {!success ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <PasswordInput
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            showValidation={true}
                            className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                            placeholder="New Password"
                            required
                            disabled={loading}
                        />

                        <PasswordInput
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            showValidation={false}
                            className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                            placeholder="Confirm New Password"
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
                            {loading ? 'Updating...' : 'Reset Password'}
                        </Button>
                    </form>
                ) : (
                    <div className="text-center">
                        <div className="rounded-full bg-green-100 dark:bg-green-900 p-3 mx-auto w-fit mb-4">
                            <svg className="w-12 h-12 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            Password Updated!
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            Redirecting to dashboard...
                        </p>
                    </div>
                )}
            </div>
        </Modal>
    )
}