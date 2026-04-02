'use client'

import { useMemo, useState } from 'react'
import type { ChecklistItem } from '@/src/data/checklists/types'
import { ChecklistItemRow } from './ChecklistItemRow'
import { cn } from '@/src/lib/utils/cn'
import { TbChevronDown, TbChevronRight } from 'react-icons/tb'

interface ChecklistPanelProps {
  items: readonly ChecklistItem[]
  completions: Set<string>
  onToggle: (itemKey: string) => void
}

interface SubcategoryGroup {
  name: string
  items: ChecklistItem[]
  completedCount: number
}

export function ChecklistPanel({ items, completions, onToggle }: ChecklistPanelProps) {
  const groups = useMemo(() => {
    const groupMap = new Map<string, ChecklistItem[]>()

    for (const item of items) {
      const existing = groupMap.get(item.category)
      if (existing) {
        existing.push(item)
      } else {
        groupMap.set(item.category, [item])
      }
    }

    const result: SubcategoryGroup[] = []
    for (const [name, groupItems] of groupMap) {
      result.push({
        name,
        items: groupItems,
        completedCount: groupItems.filter(i => completions.has(i.key)).length,
      })
    }

    return result
  }, [items, completions])

  return (
    <div className="space-y-2">
      {groups.map(group => (
        <SubcategorySection
          key={group.name}
          group={group}
          completions={completions}
          onToggle={onToggle}
        />
      ))}
    </div>
  )
}

function SubcategorySection({
  group,
  completions,
  onToggle,
}: {
  group: SubcategoryGroup
  completions: Set<string>
  onToggle: (itemKey: string) => void
}) {
  const allComplete = group.completedCount === group.items.length
  const [expanded, setExpanded] = useState(!allComplete || group.completedCount > 0)

  return (
    <div className="rounded-lg border border-warmGray-100 dark:border-warmGray-800 overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded(prev => !prev)}
        className={cn(
          'flex items-center justify-between w-full px-4 py-3 text-left',
          'hover:bg-warmGray-50 dark:hover:bg-warmGray-800/50 transition-colors'
        )}
      >
        <div className="flex items-center gap-2">
          {expanded
            ? <TbChevronDown className="h-4 w-4 text-warmGray-400" />
            : <TbChevronRight className="h-4 w-4 text-warmGray-400" />
          }
          <span className="font-medium text-sm text-warmGray-800 dark:text-warmGray-200">
            {group.name}
          </span>
        </div>
        <span
          className={cn(
            'text-xs font-medium px-2 py-0.5 rounded-full',
            allComplete
              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
              : 'bg-warmGray-100 dark:bg-warmGray-700 text-warmGray-500 dark:text-warmGray-400'
          )}
        >
          {group.completedCount}/{group.items.length}
        </span>
      </button>
      {expanded && (
        <div className="border-t border-warmGray-100 dark:border-warmGray-800">
          {group.items.map(item => (
            <ChecklistItemRow
              key={item.key}
              item={item}
              completed={completions.has(item.key)}
              onToggle={onToggle}
            />
          ))}
        </div>
      )}
    </div>
  )
}
