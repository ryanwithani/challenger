'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useChallengeStore } from '@/src/lib/store/challengeStore'
import { SimCard } from '@/src/components/ui/SimCard'
import { GoalCard } from '@/src/components/ui/GoalCard'
import { PointTracker } from '@/src/components/ui/PointTracker'
import { Button } from '@/src/components/ui/Button'
import { SimForm } from '@/src/components/forms/SimForm'
import { GoalForm } from '@/src/components/forms/GoalForm'
import { Modal } from '@/src/components/ui/Modal'
import { LegacyTracker } from '@/src/components/challenge/LegacyTracker'

export default function ChallengePage() {
  const params = useParams()
  const challengeId = params.id as string
  
  const {
    currentChallenge,
    sims,
    goals,
    progress,
    fetchChallenge,
    addSim,
    addGoal,
    toggleGoalProgress,
    calculatePoints,
    loading
  } = useChallengeStore()

  const [showSimForm, setShowSimForm] = useState(false)
  const [showGoalForm, setShowGoalForm] = useState(false)

  useEffect(() => {
    fetchChallenge(challengeId)
  }, [challengeId, fetchChallenge])

  if (loading || !currentChallenge) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Loading challenge...</p>
      </div>
    )
  }

  // Check if this is a Legacy Challenge
  const isLegacyChallenge = currentChallenge.challenge_type === 'legacy'

  // If it's a Legacy Challenge, use the LegacyTracker
  if (isLegacyChallenge) {
    return (
      <div>
        <LegacyTracker
          challenge={currentChallenge}
          sims={sims}
          goals={goals}
          progress={progress}
          onAddSim={() => setShowSimForm(true)}
          onAddGoal={() => setShowGoalForm(true)}
          onToggleGoal={toggleGoalProgress}
          calculatePoints={calculatePoints}
        />

        {/* Modals */}
        <Modal
          isOpen={showSimForm}
          onClose={() => setShowSimForm(false)}
          title="Add New Sim"
        >
          <SimForm
            challengeId={challengeId}
            onSubmit={async (data) => {
              await addSim(data)
              setShowSimForm(false)
            }}
          />
        </Modal>

        <Modal
          isOpen={showGoalForm}
          onClose={() => setShowGoalForm(false)}
          title="Add New Goal"
        >
          <GoalForm
            challengeId={challengeId}
            onSubmit={async (data) => {
              await addGoal(data)
              setShowGoalForm(false)
            }}
          />
        </Modal>
      </div>
    )
  }


  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{currentChallenge.name}</h1>
        {currentChallenge.description && (
          <p className="text-gray-600 mt-2">{currentChallenge.description}</p>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Sims Section */}
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Sims</h2>
              <Button onClick={() => setShowSimForm(true)} size="sm">
                Add Sim
              </Button>
            </div>
            
            {sims.length === 0 ? (
              <p className="text-gray-500">No Sims added yet</p>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {sims.map((sim) => (
                  <SimCard key={sim.id} sim={sim} />
                ))}
              </div>
            )}
          </section>

          {/* Goals Section */}
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Goals</h2>
              <Button onClick={() => setShowGoalForm(true)} size="sm">
                Add Goal
              </Button>
            </div>
            
            {goals.length === 0 ? (
              <p className="text-gray-500">No goals added yet</p>
            ) : (
              <div className="space-y-4">
                {goals.map((goal) => (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    isCompleted={progress.some(p => p.goal_id === goal.id)}
                    onToggle={() => toggleGoalProgress(goal.id)}
                  />
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <PointTracker
            totalPoints={calculatePoints()}
            possiblePoints={goals.reduce((sum, g) => sum + g.point_value, 0)}
          />
        </div>
      </div>

      {/* Modals */}
      <Modal
        isOpen={showSimForm}
        onClose={() => setShowSimForm(false)}
        title="Add New Sim"
      >
        <SimForm
          challengeId={challengeId}
          onSubmit={async (data) => {
            await addSim(data)
            setShowSimForm(false)
          }}
        />
      </Modal>

      <Modal
        isOpen={showGoalForm}
        onClose={() => setShowGoalForm(false)}
        title="Add New Goal"
      >
        <GoalForm
          challengeId={challengeId}
          onSubmit={async (data) => {
            await addGoal(data)
            setShowGoalForm(false)
          }}
        />
      </Modal>
    </div>
  )
}