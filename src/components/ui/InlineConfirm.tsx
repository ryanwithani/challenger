'use client'

import { Button } from '@/src/components/ui/Button'

interface InlineConfirmProps {
  message: string
  onConfirm: () => void
  onCancel: () => void
  confirmLabel?: string
  cancelLabel?: string
}

export function InlineConfirm({
  message,
  onConfirm,
  onCancel,
  confirmLabel = 'Discard',
  cancelLabel = 'Keep editing',
}: InlineConfirmProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg bg-gray-50 dark:bg-warmGray-800 border border-gray-200 dark:border-warmGray-700 px-4 py-2">
      <span className="text-sm text-gray-700 dark:text-warmGray-300 flex-1">{message}</span>
      <Button variant="ghost" size="sm" type="button" onClick={onCancel}>
        {cancelLabel}
      </Button>
      <Button variant="destructive" size="sm" type="button" onClick={onConfirm}>
        {confirmLabel}
      </Button>
    </div>
  )
}
