'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useChallengeStore } from '@/src/lib/store/challengeStore'
import { ChallengeTile } from '@/src/components/ui/ChallengeTile'
import { Button } from '@/src/components/ui/Button'

export default function DashboardPage() {
  const { challenges, fetchChallenges, loading } = useChallengeStore()

  useEffect(() => {
    fetchChallenges()
  }, [fetchChallenges])

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Challenges</h1>
        <Link href="/challenge/new">
          <Button>Create New Challenge</Button>
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading challenges...</p>
        </div>
      ) : challenges.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No challenges yet!</p>
          <Link href="/challenge/new">
            <Button>Create Your First Challenge</Button>
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {challenges.map((challenge) => (
            <Link key={challenge.id} href={`/challenge/${challenge.id}`}>
              <ChallengeTile challenge={challenge} />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}