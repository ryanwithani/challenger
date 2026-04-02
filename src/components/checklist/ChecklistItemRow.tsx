'use client'

import { memo } from 'react'
import type { ChecklistItem } from '@/src/data/checklists/types'
import { cn } from '@/src/lib/utils/cn'
import { getPackName } from '@/src/data/packs'

interface ChecklistItemRowProps {
  item: ChecklistItem
  completed: boolean
  onToggle: (itemKey: string) => void
}

export const ChecklistItemRow = memo(function ChecklistItemRow({
  item,
  completed,
  onToggle,
}: ChecklistItemRowProps) {
  return (
    <label
      className={cn(
        'flex items-center gap-3 px-4 py-2.5 rounded-lg cursor-pointer transition-colors',
        'hover:bg-warmGray-50 dark:hover:bg-warmGray-800',
        completed && 'bg-warmGray-50/50 dark:bg-warmGray-800/30'
      )}
    >
      <input
        type="checkbox"
        checked={completed}
        onChange={() => onToggle(item.key)}
        className={cn(
          'h-4 w-4 rounded border-warmGray-300 dark:border-warmGray-600',
          'text-brand-500 focus:ring-brand-500 focus:ring-offset-0',
          'dark:bg-warmGray-700'
        )}
      />
      <span
        className={cn(
          'flex-1 text-sm text-warmGray-800 dark:text-warmGray-200',
          completed && 'line-through text-warmGray-400 dark:text-warmGray-500'
        )}
      >
        {item.name}
      </span>
      {item.pack && (
        <span
          className="text-xs px-2 py-0.5 rounded-full bg-warmGray-100 dark:bg-warmGray-700 text-warmGray-500 dark:text-warmGray-400"
          title={getPackName(item.pack)}
        >
          {item.pack}
        </span>
      )}
    </label>
  )
})
