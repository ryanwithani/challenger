'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useChallengeStore } from '@/src/lib/store/challengeStore'
import { ChallengeWizard } from '@/src/components/forms/ChallengeWizard'

export default function NewChallengePage() {
  const router = useRouter()
  const { createChallenge } = useChallengeStore()
  const [loading, setLoading] = useState(false)

  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (data: any) => {
    setLoading(true)
    setError(null)
    console.log('Submitting challenge data:', data)
    try {
      await createChallenge(data)
      router.push('/dashboard')
    } catch (error: any) {
      console.error('Failed to create challenge:', error)
      setError(error.message || 'Failed to create challenge')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Create New Challenge</h1>
      <div className="card">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}
        <ChallengeWizard onSubmit={handleSubmit} onCancel={() => router.push('/dashboard')} loading={loading} />
      </div>
    </div>
  )
}