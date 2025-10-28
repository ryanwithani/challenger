'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useChallengeStore } from '@/src/lib/store/challengeStore'
import { ChallengeWizard } from '@/src/components/challenge/forms/challenge-wizard/ChallengeWizard'
import { ChallengeSuccessModal } from '@/src/components/challenge/ChallengeSuccessModal'
import { ErrorMessage } from '@/src/components/ui/ErrorMessage'
import { ErrorBoundary } from '@/src/components/ui/ErrorBoundary'

export default function NewChallengePage() {
  const router = useRouter()
  const { createChallenge } = useChallengeStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [createdChallenge, setCreatedChallenge] = useState<{ id: string; name: string } | null>(null)

  const handleSubmit = async (data: any) => {
    console.log('🎯 Challenge page: Starting submission...', data);
    setLoading(true)
    setError(null)
    
    try {
      console.log('🎯 Challenge page: Calling createChallenge...');
      
      // Add a timeout to the entire challenge creation process
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Challenge creation timeout - please try again')), 60000)
      );
      
      const result = await Promise.race([
        createChallenge(data),
        timeoutPromise
      ]);
      
      console.log('🎯 Challenge page: Challenge created successfully:', result);
      
      // Store the created challenge info and show success modal
      setCreatedChallenge({
        id: (result as any)?.id || data.name, // Fallback to name if no ID
        name: data.name
      });
      setShowSuccessModal(true);
      
    } catch (error: any) {
      console.error('❌ Challenge page: Failed to create challenge:', error);
      setError(error.message || 'Failed to create challenge. Please try again.')
    } finally {
      console.log('🎯 Challenge page: Setting loading to false');
      setLoading(false)
    }
  }

  return (
    <ErrorBoundary>
      <div className="max-w-4xl mx-auto w-full"> 
      <h1 className="text-2xl font-bold mb-8">Create a New Challenge</h1>
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
              <div className="flex items-start gap-3">
                <span className="text-xl">❌</span>
                <div className="flex-1">
                  <p className="text-red-800 font-semibold">Failed to create challenge</p>
                  <p className="text-red-600 text-sm mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}
          <div className="bg-white p-8 rounded-2xl shadow-lg dark:bg-gray-800">
            <ChallengeWizard 
              onSubmit={handleSubmit} 
              onCancel={() => router.push('/dashboard')} 
              loading={loading} 
            />
          </div>
      </div>

      {/* Success Modal */}
      {createdChallenge && (
        <ChallengeSuccessModal
          open={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          challengeId={createdChallenge.id}
          challengeName={createdChallenge.name}
        />
      )}
    </ErrorBoundary>
  )
}