'use client'

import { useRouter } from 'next/navigation'
import { Modal } from '@/src/components/sim/Modal'
import { Button } from '@/src/components/ui/Button'

interface ChallengeSuccessModalProps {
  open: boolean
  onClose: () => void
  challengeId: string
  challengeName: string
}

export function ChallengeSuccessModal({ 
  open, 
  onClose, 
  challengeId, 
  challengeName 
}: ChallengeSuccessModalProps) {
  const router = useRouter()

  const handleCreateNewSim = () => {
    onClose()
    router.push(`/dashboard/new/sim?challenge=${challengeId}`)
  }

  const handleAddExistingSim = () => {
    onClose()
    router.push(`/challenge/${challengeId}?action=add-sim`)
  }

  const handleViewChallenge = () => {
    onClose()
    router.push(`/challenge/${challengeId}`)
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="🎉 Challenge Created Successfully!"
      className="max-w-md"
    >
      <div className="space-y-6">
        {/* Success Message */}
        <div className="text-center">
          <div className="text-6xl mb-4">🎯</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {challengeName} is ready!
          </h3>
          <p className="text-gray-600">
            Your challenge has been created and is ready to begin. 
            Would you like to add some sims to get started?
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={handleCreateNewSim}
            variant="primary"
            size="lg"
            className="w-full"
          >
            <span className="mr-2">👤</span>
            Create a New Sim
          </Button>
          
          <Button
            onClick={handleAddExistingSim}
            variant="secondary"
            size="lg"
            className="w-full"
          >
            <span className="mr-2">➕</span>
            Add an Existing Sim
          </Button>
          
          <Button
            onClick={handleViewChallenge}
            variant="outline"
            size="md"
            className="w-full"
          >
            <span className="mr-2">👁️</span>
            View Challenge
          </Button>
        </div>

        {/* Skip Option */}
        <div className="text-center">
          <button
            onClick={onClose}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Skip for now
          </button>
        </div>
      </div>
    </Modal>
  )
}
