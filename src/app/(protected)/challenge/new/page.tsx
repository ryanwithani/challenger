'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useChallengeStore } from '@/src/lib/store/challengeStore'
import { ChallengeForm } from '@/src/components/forms/ChallengeForm'

export default function NewChallengePage() {
  const router = useRouter()
  const { createChallenge } = useChallengeStore()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (data: any) => {
    setLoading(true)
    try {
      await createChallenge(data)
      router.push('/dashboard')
    } catch (error) {
      console.error('Failed to create challenge:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Create New Challenge</h1>
      <div className="card">
        <ChallengeForm onSubmit={handleSubmit} loading={loading} />
      </div>
    </div>
  )
}