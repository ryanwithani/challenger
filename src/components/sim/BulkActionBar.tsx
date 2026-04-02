'use client'

import { memo, useState } from 'react'
import { Button } from '@/src/components/ui/Button'
import { cn } from '@/src/lib/utils/cn'
import { Database } from '@/src/types/database.types'

type Challenge = Database['public']['Tables']['challenges']['Row']

interface BulkActionBarProps {
  selectedCount: number
  selectedIds: string[]
  challenges: Challenge[]
  onAssign: (challengeId: string) => Promise<void>
  onUnassign: () => Promise<void>
  onDelete: () => Promise<void>
  onDeselect: () => void
}

const CONTAINER_CLASSES =
  'fixed bottom-[72px] lg:bottom-6 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-3 bg-white dark:bg-warmGray-900 rounded-xl shadow-lg border border-warmGray-200 dark:border-warmGray-700 px-4 py-3'

export default memo(function BulkActionBar({
  selectedCount,
  selectedIds: _selectedIds,
  challenges,
  onAssign,
  onUnassign,
  onDelete,
  onDeselect,
}: BulkActionBarProps) {
  const [isAssigning, setIsAssigning] = useState(false)
  const [assignChallengeId, setAssignChallengeId] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  async function handleAssignConfirm(): Promise<void> {
    if (!assignChallengeId) return
    setIsLoading(true)
    try {
      await onAssign(assignChallengeId)
    } finally {
      setIsLoading(false)
      setIsAssigning(false)
      setAssignChallengeId('')
    }
  }

  async function handleUnassign(): Promise<void> {
    setIsLoading(true)
    try {
      await onUnassign()
    } finally {
      setIsLoading(false)
    }
  }

  async function handleDelete(): Promise<void> {
    const plural = selectedCount !== 1 ? 's' : ''
    const confirmed = window.confirm(
      `Delete ${selectedCount} sim${plural}? This cannot be undone.`
    )
    if (!confirmed) return

    setIsLoading(true)
    try {
      await onDelete()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={CONTAINER_CLASSES}>
      <span className="text-sm font-medium text-warmGray-700 dark:text-warmGray-300 whitespace-nowrap">
        {selectedCount} selected
      </span>

      {isAssigning ? (
        <div className="flex items-center gap-2">
          <select
            value={assignChallengeId}
            onChange={(e) => setAssignChallengeId(e.target.value)}
            className={cn(
              'h-8 rounded-lg border border-warmGray-300 dark:border-warmGray-600 bg-white dark:bg-warmGray-800',
              'text-sm text-warmGray-700 dark:text-warmGray-300 px-2'
            )}
          >
            <option value="">Select challenge...</option>
            {challenges.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <Button
            size="sm"
            variant="primary"
            loading={isLoading}
            loadingText="Assigning..."
            disabled={!assignChallengeId}
            onClick={handleAssignConfirm}
          >
            Confirm
          </Button>
          <Button
            size="sm"
            variant="ghost"
            disabled={isLoading}
            onClick={() => {
              setIsAssigning(false)
              setAssignChallengeId('')
            }}
          >
            Cancel
          </Button>
        </div>
      ) : (
        <Button
          size="sm"
          variant="primary"
          disabled={isLoading}
          onClick={() => setIsAssigning(true)}
        >
          Assign to Challenge
        </Button>
      )}

      <Button size="sm" variant="outline" loading={isLoading} loadingText="Unassigning..." onClick={handleUnassign}>
        Unassign
      </Button>
      <Button size="sm" variant="destructive" loading={isLoading} loadingText="Deleting..." onClick={handleDelete}>
        Delete
      </Button>
      <Button size="sm" variant="ghost" disabled={isLoading} onClick={onDeselect}>
        Deselect all
      </Button>
    </div>
  )
})
