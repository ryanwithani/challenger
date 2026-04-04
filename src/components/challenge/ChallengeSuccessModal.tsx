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

  return (
    <Modal
      open={open}
      onClose={onClose}
      title=""
      className="max-w-md"
    >
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {challengeName} is ready!
          </h3>
          <p className="text-gray-600">
            Your challenge has been created and is ready to begin.
            Would you like to add some sims to get started?
          </p>
        </div>

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
        </div>
      </div>
    </Modal>
  )
}
