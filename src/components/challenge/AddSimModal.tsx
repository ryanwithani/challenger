'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Modal } from '@/src/components/sim/SimModal'
import { Button } from '@/src/components/ui/Button'
import { useChallengeStore } from '@/src/lib/store/challengeStore'
import { createSupabaseBrowserClient } from '@/src/lib/supabase/client'
import { useAuthStore } from '@/src/lib/store/authStore'
import { toast } from '@/src/lib/store/toastStore'

interface AddSimModalProps {
  open: boolean
  onClose: () => void
  challengeId: string
}

interface SimOption {
  id: string
  name: string
  challenge_id: string | null
  challengeName?: string
}

type View = 'choice' | 'link'

export function AddSimModal({ open, onClose, challengeId }: AddSimModalProps) {
  const router = useRouter()
  const { user } = useAuthStore()
  const sims = useChallengeStore(state => state.sims)
  const linkExistingSim = useChallengeStore(state => state.linkExistingSim)

  const [view, setView] = useState<View>('choice')
  const [simOptions, setSimOptions] = useState<SimOption[]>([])
  const [selectedSimId, setSelectedSimId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [linking, setLinking] = useState(false)

  const currentSimIds = sims.map(s => s.id)
  const selectedSim = simOptions.find(s => s.id === selectedSimId)

  const fetchSims = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setFetchError(null)

    try {
      const supabase = createSupabaseBrowserClient()

      const { data: allSims, error: simsError } = await supabase
        .from('sims')
        .select('id, name, challenge_id')
        .eq('user_id', user.id)

      if (simsError) throw simsError

      // Fetch challenge names for sims linked to other challenges
      const otherChallengeIds = Array.from(
        new Set(
          (allSims || [])
            .filter((s: any) => s.challenge_id && s.challenge_id !== challengeId)
            .map((s: any) => s.challenge_id as string)
        )
      )

      let challengeNames: Record<string, string> = {}
      if (otherChallengeIds.length > 0) {
        const { data: challenges } = await supabase
          .from('challenges')
          .select('id, name')
          .in('id', otherChallengeIds)

        if (challenges) {
          challengeNames = Object.fromEntries(
            (challenges as Array<{ id: string; name: string }>).map((c: { id: string; name: string }) => [c.id, c.name])
          )
        }
      }

      const options: SimOption[] = (allSims || [])
        .filter((s: any) => !currentSimIds.includes(s.id))
        .map((s: any) => ({
          ...s,
          challengeName: s.challenge_id ? challengeNames[s.challenge_id] : undefined,
        }))

      setSimOptions(options)
    } catch {
      setFetchError('Failed to load sims. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [user, challengeId, currentSimIds])

  useEffect(() => {
    if (open && view === 'link') {
      fetchSims()
    }
  }, [open, view, fetchSims])

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setView('choice')
      setSelectedSimId(null)
      setSimOptions([])
      setFetchError(null)
    }
  }, [open])

  function handleCreateNew() {
    onClose()
    router.push(`/dashboard/new/sim?challenge=${challengeId}`)
  }

  async function handleConfirmLink() {
    if (!selectedSimId) return
    setLinking(true)
    try {
      await linkExistingSim(selectedSimId, challengeId)
      onClose()
    } catch {
      toast.error('Failed to link sim. Please try again.')
    } finally {
      setLinking(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Add Sim">
      {view === 'choice' && (
        <div className="space-y-3">
          <p className="text-sm text-warmGray-600 dark:text-warmGray-400 mb-4">
            How would you like to add a sim to this challenge?
          </p>
          <Button variant="outline" className="w-full justify-start" onClick={handleCreateNew}>
            Create New Sim
          </Button>
          <Button variant="outline" className="w-full justify-start" onClick={() => setView('link')}>
            Link Existing Sim
          </Button>
        </div>
      )}

      {view === 'link' && (
        <div className="space-y-4">
          {loading && (
            <p className="text-sm text-warmGray-500 dark:text-warmGray-400">Loading sims...</p>
          )}

          {fetchError && (
            <div className="space-y-2">
              <p className="text-sm text-red-600 dark:text-red-400">{fetchError}</p>
              <Button size="sm" variant="outline" onClick={fetchSims}>
                Retry
              </Button>
            </div>
          )}

          {!loading && !fetchError && simOptions.length === 0 && (
            <div className="text-center py-4 space-y-3">
              <p className="text-sm text-warmGray-500 dark:text-warmGray-400">
                You don't have any sims yet.
              </p>
              <Button size="sm" onClick={handleCreateNew}>
                Create a Sim
              </Button>
            </div>
          )}

          {!loading && !fetchError && simOptions.length > 0 && (
            <>
              <select
                className="w-full rounded-lg border border-gray-300 dark:border-warmGray-600 bg-white dark:bg-warmGray-800 text-warmGray-900 dark:text-warmGray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                value={selectedSimId || ''}
                onChange={(e) => setSelectedSimId(e.target.value || null)}
              >
                <option value="">Select a sim...</option>
                {simOptions.map(sim => (
                  <option key={sim.id} value={sim.id}>
                    {sim.name}{sim.challengeName ? ` (${sim.challengeName})` : ''}
                  </option>
                ))}
              </select>

              {selectedSim?.challengeName && (
                <p className="text-sm text-amber-600 dark:text-amber-400">
                  This sim is currently in {selectedSim.challengeName}. Linking it here will remove it from that challenge.
                </p>
              )}

              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  className="text-sm text-brand-500 hover:text-brand-600 dark:hover:text-brand-400"
                  onClick={() => { setView('choice'); setSelectedSimId(null) }}
                >
                  Back
                </button>
                <Button
                  size="sm"
                  onClick={handleConfirmLink}
                  disabled={!selectedSimId || linking}
                >
                  {linking ? 'Linking...' : 'Confirm'}
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </Modal>
  )
}
