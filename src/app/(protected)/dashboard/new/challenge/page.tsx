'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useChallengeStore } from '@/src/lib/store/challengeStore'
import { ChallengeWizard } from '@/src/components/challenge/forms/challenge-wizard/ChallengeWizard'
import { ErrorMessage } from '@/src/components/ui/ErrorMessage'
import { ErrorBoundary } from '@/src/components/ui/ErrorBoundary'

export default function NewChallengePage() {
  const router = useRouter()
  const { createChallenge } = useChallengeStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (data: any) => {
    setLoading(true)
    setError(null)
    
    if (process.env.NODE_ENV !== 'production') {
      console.log('Submitting challenge data:', data)
    }

    try {
      await createChallenge(data)
      router.push('/dashboard')
    } catch (error: any) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Failed to create challenge:', error)
      }
      setError(error.message || 'Failed to create challenge. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ErrorBoundary>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Create New Challenge</h1>
        <div className="card">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
              <div className="flex items-start gap-3">
                <span className="text-2xl">❌</span>
                <div className="flex-1">
                  <p className="text-red-800 font-semibold">Failed to create challenge</p>
                  <p className="text-red-600 text-sm mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}
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