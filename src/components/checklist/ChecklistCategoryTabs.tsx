'use client'

import { useMemo } from 'react'
import type { CatalogType } from '@/src/data/checklists/types'
import {
  CATALOG_BY_TYPE,
  CHECKLIST_CATEGORIES,
  CATEGORY_LABELS,
} from '@/src/data/checklists'
import { cn } from '@/src/lib/utils/cn'

interface ChecklistCategoryTabsProps {
  activeCategory: CatalogType
  completions: Set<string>
  onCategoryChange: (category: CatalogType) => void
}

export function ChecklistCategoryTabs({
  activeCategory,
  completions,
  onCategoryChange,
}: ChecklistCategoryTabsProps) {
  const counts = useMemo(() => {
    const result: Record<string, number> = {}
    for (const cat of CHECKLIST_CATEGORIES) {
      const prefix = `${cat}:`
      let count = 0
      for (const key of completions) {
        if (key.startsWith(prefix)) count++
      }
      result[cat] = count
    }
    return result
  }, [completions])

  return (
    <div
      className="flex gap-1 overflow-x-auto p-1 bg-cozy-sand dark:bg-warmGray-850 rounded-xl"
      role="tablist"
      aria-label="Checklist categories"
    >
      {CHECKLIST_CATEGORIES.map(cat => {
        const isActive = cat === activeCategory
        const completed = counts[cat] || 0
        const total = CATALOG_BY_TYPE[cat].length

        return (
          <button
            key={cat}
            role="tab"
            aria-selected={isActive}
            onClick={() => onCategoryChange(cat)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all',
              isActive
                ? 'bg-white dark:bg-warmGray-800 shadow-sm text-warmGray-900 dark:text-warmGray-100'
                : 'text-cozy-clay dark:text-warmGray-400 hover:text-warmGray-700 dark:hover:text-warmGray-300'
            )}
          >
            {CATEGORY_LABELS[cat]}
            {completed > 0 && (
              <span
                className={cn(
                  'text-xs px-1.5 py-0.5 rounded-full',
                  isActive
                    ? 'bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400'
                    : 'bg-warmGray-200 dark:bg-warmGray-700 text-warmGray-500 dark:text-warmGray-400'
                )}
              >
                {completed}
              </span>
            )}
            <span className="sr-only">({completed}/{total})</span>
          </button>
        )
      })}
    </div>
  )
}
