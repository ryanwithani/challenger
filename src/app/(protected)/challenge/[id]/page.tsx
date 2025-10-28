'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { useChallengeStore } from '@/src/lib/store/challengeStore'
import { SimCard } from '@/src/components/sim/SimCard'
import { GoalCard } from '@/src/components/challenge/GoalCard'
import { PointTracker } from '@/src/components/challenge/PointTracker'
import { Button } from '@/src/components/ui/Button'
import { SimForm } from '@/src/components/forms/SimForm'
import { GoalForm } from '@/src/components/forms/GoalForm'
import { Modal } from '@/src/components/sim/SimModal'
import { LegacyTracker } from '@/src/components/challenge/LegacyTracker'
import { Traits } from '@/src/components/sim/TraitsCatalog'

export default function ChallengePage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const challengeId = params.id as string

  // Subscribe to store values separately to minimize re-renders
  const currentChallenge = useChallengeStore(state => state.currentChallenge)
  const sims = useChallengeStore(state => state.sims)
  const goals = useChallengeStore(state => state.goals)
  const progress = useChallengeStore(state => state.progress)
  const loading = useChallengeStore(state => state.loading)
  
  // Get functions separately and memoize them to prevent re-renders
  const fetchChallenge = useCallback(useChallengeStore.getState().fetchChallenge, [])
  const addSim = useCallback(useChallengeStore.getState().addSim, [])
  const addGoal = useCallback(useChallengeStore.getState().addGoal, [])
  const updateSim = useCallback(useChallengeStore.getState().updateSim, [])
  const toggleGoalProgress = useCallback(useChallengeStore.getState().toggleGoalProgress, [])
  const updateGoalValue = useCallback(useChallengeStore.getState().updateGoalValue, [])
  const completeGoalWithDetails = useCallback(useChallengeStore.getState().completeGoalWithDetails, [])
  const calculatePoints = useCallback(useChallengeStore.getState().calculatePoints, [])
  const calculateCategoryPoints = useCallback(useChallengeStore.getState().calculateCategoryPoints, [])
  const handleAddSim = useCallback(() => setShowSimForm(true), [])
  const handleAddGoal = useCallback(() => setShowGoalForm(true), [])
  const handleToggleGoal = useCallback((goalId: string) => toggleGoalProgress(goalId), [toggleGoalProgress])

  const [showSimForm, setShowSimForm] = useState(false)
  const [showGoalForm, setShowGoalForm] = useState(false)

  // Handle URL parameters for actions
  useEffect(() => {
    const action = searchParams.get('action')
    if (action === 'add-sim') {
      setShowSimForm(true)
    }
  }, [searchParams])



  // Removed debugging - multiple renders in dev mode are normal

  // Functions are now stable, no need to memoize them

  // Memoize arrays to prevent unnecessary re-renders when content is the same
  const simsIds = useMemo(() => sims.map(s => s.id).join(','), [sims])
  const goalsIds = useMemo(() => goals.map(g => g.id).join(','), [goals])
  const progressIds = useMemo(() => progress.map(p => p.id).join(','), [progress])
  
  const memoizedSims = useMemo(() => sims, [simsIds])
  const memoizedGoals = useMemo(() => goals, [goalsIds])
  const memoizedProgress = useMemo(() => progress, [progressIds])

  // FIXED: Removed fetchChallenge from dependencies to prevent infinite loop
  useEffect(() => {
    fetchChallenge(challengeId)
  }, [challengeId])

  // Helper function to update sim as heir
  const updateSimAsHeir = useCallback(async (simId: string) => {
    // Read latest sims inside the callback so we don't need `sims` in deps
    const { sims: currentSims, updateSim } = useChallengeStore.getState()
    await Promise.all(
      currentSims.map(sim => {
        if (sim.id === simId) return updateSim(sim.id, { is_heir: true })
        if (sim.is_heir)   return updateSim(sim.id, { is_heir: false })
        return Promise.resolve()
      })
    )
  }, [])
  

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
          sims={memoizedSims}
          goals={memoizedGoals}
          progress={memoizedProgress}
          onAddSim={handleAddSim}
          onToggleGoal={handleToggleGoal}
          onUpdateGoalValue={updateGoalValue}
          onCompleteGoalWithDetails={completeGoalWithDetails}
          calculatePoints={calculatePoints}
          calculateCategoryPoints={calculateCategoryPoints}
          onSelectHeir={updateSimAsHeir}
        />

        {/* Modals */}
        <Modal
          open={showSimForm}
          onClose={() => setShowSimForm(false)}
          title="Add New Sim"
        >
          <SimForm
            onSubmit={async (data) => {
              await addSim({ 
                ...data, 
                challenge_id: challengeId,
                career: data.career ? String(data.career) : null
              })
              setShowSimForm(false)
            }}
          />
        </Modal>

        <Modal
          open={showGoalForm}
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
              <Button onClick={handleAddSim} size="sm">
                Add Sim
              </Button>
            </div>

            {sims.length === 0 ? (
              <p className="text-gray-500">No Sims added yet</p>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {sims.map((sim) => (
                  <SimCard key={sim.id} sim={sim} traitCatalog={Traits} />
                ))}
              </div>
            )}
          </section>

          {/* Goals Section */}
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Goals</h2>
              <Button onClick={handleAddGoal} size="sm">
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
                    onToggle={() => handleToggleGoal(goal.id)}
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
            possiblePoints={goals.reduce((sum, g) => sum + (g.point_value || 0), 0)}
          />
        </div>
      </div>

      {/* Modals */}
      <Modal
        open={showSimForm}
        onClose={() => setShowSimForm(false)}
        title="Add New Sim"
      >
        <SimForm
          onSubmit={async (data) => {
            await addSim({ 
              ...data, 
              challenge_id: challengeId,
              career: data.career ? String(data.career) : null
            })
            setShowSimForm(false)
          }}
        />
      </Modal>

      <Modal
        open={showGoalForm}
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