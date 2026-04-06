'use client'

import { Suspense, useEffect, useState, useCallback, useMemo } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { useChallengeStore } from '@/src/lib/store/challengeStore'
import { SimCard } from '@/src/components/sim/SimCard'
import { GoalCard } from '@/src/components/challenge/GoalCard'
import { PointTracker } from '@/src/components/challenge/PointTracker'
import { Button } from '@/src/components/ui/Button'
import { AddSimModal } from '@/src/components/challenge/AddSimModal'
import { GoalForm } from '@/src/components/forms/GoalForm'
import { Modal } from '@/src/components/sim/SimModal'
import { ChallengeSuccessModal } from '@/src/components/challenge/ChallengeSuccessModal'
import { LegacyTracker } from '@/src/components/challenge/LegacyTracker'
import { Traits } from '@/src/components/sim/TraitsCatalog'
import { ChecklistDetailPanel } from '@/src/components/checklist'
import type { CatalogType } from '@/src/data/checklists/types'
import Link from 'next/link'
import { cn } from '@/src/lib/utils/cn'
import { TbListCheck, TbChevronLeft } from 'react-icons/tb'

export default function ChallengePage() {
  return (
    <Suspense fallback={<div className="text-center py-12"><p className="text-gray-500 dark:text-warmGray-400">Loading challenge...</p></div>}>
      <ChallengePageContent />
    </Suspense>
  )
}

function ChallengePageContent() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const challengeId = params.id as string

  // Subscribe to store values separately to minimize re-renders
  const currentChallenge = useChallengeStore(state => state.currentChallenge)
  const sims = useChallengeStore(state => state.sims)
  const goals = useChallengeStore(state => state.goals)
  const progress = useChallengeStore(state => state.progress)
  const loading = useChallengeStore(state => state.loading)
  const error = useChallengeStore(state => state.error)

  // Get functions separately and memoize them to prevent re-renders
  const fetchChallenge = useCallback(useChallengeStore.getState().fetchChallenge, [])
  const addGoal = useCallback(useChallengeStore.getState().addGoal, [])
  const updateSim = useCallback(useChallengeStore.getState().updateSim, [])
  const toggleGoalProgress = useCallback(useChallengeStore.getState().toggleGoalProgress, [])
  const updateGoalValue = useCallback(useChallengeStore.getState().updateGoalValue, [])
  const completeGoalWithDetails = useCallback(useChallengeStore.getState().completeGoalWithDetails, [])
  const calculatePoints = useCallback(useChallengeStore.getState().calculatePoints, [])
  const calculateCategoryPoints = useCallback(useChallengeStore.getState().calculateCategoryPoints, [])
  const handleAddSim = useCallback(() => setShowAddSimModal(true), [])
  const handleAddGoal = useCallback(() => setShowGoalForm(true), [])
  const handleToggleGoal = useCallback((goalId: string) => toggleGoalProgress(goalId), [toggleGoalProgress])

  const [showAddSimModal, setShowAddSimModal] = useState(false)
  const [showGoalForm, setShowGoalForm] = useState(false)
  const [showChecklist, setShowChecklist] = useState(false)
  const [checklistCategory, setChecklistCategory] = useState<CatalogType>('skills')
  const [showWelcomeModal, setShowWelcomeModal] = useState(() => searchParams.get('showWelcome') === 'true')

  const completions = useChallengeStore(state => state.completions)
  const toggleCompletion = useCallback(
    (itemKey: string) => useChallengeStore.getState().toggleCompletion(challengeId, itemKey),
    [challengeId]
  )

  // Handle URL parameters for actions
  useEffect(() => {
    const action = searchParams.get('action')
    if (action === 'add-sim') {
      setShowAddSimModal(true)
    }
  }, [searchParams])

  // Clean up ?showWelcome=true from URL once the modal is open
  useEffect(() => {
    if (showWelcomeModal) {
      router.replace(`/challenge/${challengeId}`)
    }
  }, [showWelcomeModal, challengeId, router])



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
  

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 dark:text-red-400">{error}</p>
        <Button onClick={() => fetchChallenge(challengeId)} variant="outline" className="mt-4">
          Retry
        </Button>
      </div>
    )
  }

  if (loading || !currentChallenge) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-warmGray-400">Loading challenge...</p>
      </div>
    )
  }

  // Check if this is a Legacy Challenge
  const isLegacyChallenge = currentChallenge.challenge_type === 'legacy'

  const statusLabel: Record<string, string> = {
    active: 'Active',
    completed: 'Completed',
    paused: 'Paused',
    archived: 'Archived',
  }
  const statusColors: Record<string, string> = {
    active: 'bg-accent-400/25 text-white border border-accent-300/40',
    completed: 'bg-white/20 text-white border border-white/30',
    paused: 'bg-brand-200/30 text-brand-50 border border-brand-200/40',
    archived: 'bg-white/10 text-white/70 border border-white/20',
  }
  const challengeStatus = currentChallenge.status ?? 'active'

  const bannerRounding = isLegacyChallenge ? 'rounded-t-2xl rounded-b-none mb-0' : 'rounded-2xl mb-6'

  const banner = (
    <div className={cn('relative overflow-hidden bg-gradient-to-r from-brand-600 to-brand-400 dark:from-brand-700 dark:to-brand-500 p-4 md:p-5 shadow-sm', bannerRounding)}>
      <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white/10" />
      <div className="absolute -bottom-8 right-6 w-20 h-20 rounded-full bg-white/5" />
      <div className="relative z-10 flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <Link
              href="/dashboard/challenges"
              className="inline-flex items-center gap-0.5 text-white/60 hover:text-white text-xs transition-colors mr-1"
            >
              <TbChevronLeft className="w-3.5 h-3.5" />
              Challenges
            </Link>
            <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', statusColors[challengeStatus] ?? statusColors.active)}>
              {statusLabel[challengeStatus] ?? 'Active'}
            </span>
            {currentChallenge.challenge_type && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-white/15 text-white border border-white/25 capitalize">
                {currentChallenge.challenge_type.replace(/_/g, ' ')}
              </span>
            )}
          </div>
          <h1 className="font-display text-xl md:text-2xl font-bold text-white leading-tight truncate">
            {currentChallenge.name}
          </h1>
          {currentChallenge.description && (
            <p className="mt-0.5 text-xs text-white/70 line-clamp-1">{currentChallenge.description}</p>
          )}
        </div>
        <button
          onClick={() => setShowChecklist(true)}
          className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/15 hover:bg-white/25 text-white border border-white/25 transition-colors self-start"
        >
          <TbListCheck className="w-3.5 h-3.5" />
          Checklist
          {completions.size > 0 && (
            <span className="text-xs bg-white/25 text-white px-1.5 py-0.5 rounded-full">
              {completions.size}
            </span>
          )}
        </button>
      </div>
    </div>
  )

  // If it's a Legacy Challenge, use the LegacyTracker
  if (isLegacyChallenge) {
    return (
      <div className="max-w-6xl mx-auto">
        {banner}

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
        <AddSimModal
          open={showAddSimModal}
          onClose={() => setShowAddSimModal(false)}
          challengeId={challengeId}
        />

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

        <ChallengeSuccessModal
          open={showWelcomeModal}
          onClose={() => setShowWelcomeModal(false)}
          challengeId={challengeId}
          challengeName={currentChallenge.name}
        />

        {showChecklist && (
          <ChecklistDetailPanel
            activeCategory={checklistCategory}
            completions={completions}
            onCategoryChange={setChecklistCategory}
            onToggle={toggleCompletion}
            onClose={() => setShowChecklist(false)}
          />
        )}
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      {banner}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Sims Section */}
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-display font-bold tracking-tight">Sims</h2>
              <Button onClick={handleAddSim} size="sm">
                Add Sim
              </Button>
            </div>

            {sims.length === 0 ? (
              <p className="text-sm text-warmGray-500 dark:text-warmGray-400">No Sims added yet</p>
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
              <h2 className="text-xl font-display font-bold tracking-tight">Goals</h2>
              <Button onClick={handleAddGoal} size="sm">
                Add Goal
              </Button>
            </div>

            {goals.length === 0 ? (
              <p className="text-sm text-warmGray-500 dark:text-warmGray-400">No goals added yet</p>
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
      <AddSimModal
        open={showAddSimModal}
        onClose={() => setShowAddSimModal(false)}
        challengeId={challengeId}
      />

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

      <ChallengeSuccessModal
        open={showWelcomeModal}
        onClose={() => setShowWelcomeModal(false)}
        challengeId={challengeId}
        challengeName={currentChallenge.name}
      />

      {showChecklist && (
        <ChecklistDetailPanel
          activeCategory={checklistCategory}
          completions={completions}
          onCategoryChange={setChecklistCategory}
          onToggle={toggleCompletion}
          onClose={() => setShowChecklist(false)}
        />
      )}
    </div>
  )
}