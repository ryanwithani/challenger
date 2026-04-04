'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useChallengeStore } from '@/src/lib/store/challengeStore'
import { ChallengeWizard } from '@/src/components/challenge/forms/challenge-wizard/ChallengeWizard'
import { ErrorMessage } from '@/src/components/ui/ErrorMessage'
import { ErrorBoundary } from '@/src/components/ui/ErrorBoundary'
import { toast } from '@/src/lib/store/toastStore'

export default function NewChallengePage() {
  const router = useRouter()
  const { createChallenge } = useChallengeStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (data: any) => {
    setLoading(true)
    setError(null)

    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Challenge creation timeout - please try again')), 60000)
      )

      const result = await Promise.race([
        createChallenge(data),
        timeoutPromise
      ])

      const id = (result as any)?.id
      toast.success('Challenge created successfully!')
      router.push(`/challenge/${id}?showWelcome=true`)

    } catch (error: any) {
      setError(error.message || 'Failed to create challenge. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ErrorBoundary>
      <div className="max-w-4xl mx-auto w-full">
        <h1 className="text-2xl font-bold mb-8">Create a New Challenge</h1>
        {error && <ErrorMessage error={error} className="mb-6" />}
        <div className="bg-white p-8 rounded-2xl shadow-lg dark:bg-warmGray-900">
          <ChallengeWizard
            onSubmit={handleSubmit}
            onCancel={() => router.push('/dashboard')}
            loading={loading}
          />
        </div>
      </div>
    </ErrorBoundary>
  )
}