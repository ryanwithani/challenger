'use client'

import { useEffect } from 'react'
import { useFocusManagement } from '@/src/hooks/useFocusManagement'
import { ChecklistCategoryTabs } from './ChecklistCategoryTabs'
import { ChecklistPanel } from './ChecklistPanel'
import { CATALOG_BY_TYPE } from '@/src/data/checklists'
import type { CatalogType } from '@/src/data/checklists/types'
import { cn } from '@/src/lib/utils/cn'
import { TbX } from 'react-icons/tb'

interface ChecklistDetailPanelProps {
  activeCategory: CatalogType
  completions: Set<string>
  onCategoryChange: (category: CatalogType) => void
  onToggle: (itemKey: string) => void
  onClose: () => void
}

export function ChecklistDetailPanel({
  activeCategory,
  completions,
  onCategoryChange,
  onToggle,
  onClose,
}: ChecklistDetailPanelProps) {
  const { containerRef } = useFocusManagement({
    autoFocus: true,
    trapFocus: true,
    restoreFocus: true,
  })

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-20 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="checklist-panel-title"
        ref={containerRef as React.RefObject<HTMLDivElement>}
        className={cn(
          'fixed z-30 bg-white dark:bg-warmGray-900 shadow-xl flex flex-col animate-slide-in-right',
          // Mobile: bottom sheet
          'left-0 right-0 bottom-[72px] h-[75vh] rounded-t-2xl',
          // Desktop: right side panel
          'lg:left-auto lg:right-0 lg:top-0 lg:bottom-0 lg:h-full lg:w-[520px] lg:rounded-none'
        )}
      >
        {/* Mobile drag handle */}
        <div className="lg:hidden flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full bg-warmGray-300 dark:bg-warmGray-600" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2 border-b border-warmGray-100 dark:border-warmGray-800">
          <h2
            id="checklist-panel-title"
            className="font-display text-xl font-semibold text-warmGray-900 dark:text-warmGray-100"
          >
            Checklist
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close checklist"
            className="p-1 rounded text-warmGray-400 hover:text-warmGray-600 dark:hover:text-warmGray-200"
          >
            <TbX className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4">
          <ChecklistCategoryTabs
            activeCategory={activeCategory}
            completions={completions}
            onCategoryChange={onCategoryChange}
          />
          <div className="mt-4">
            <ChecklistPanel
              items={CATALOG_BY_TYPE[activeCategory]}
              completions={completions}
              onToggle={onToggle}
            />
          </div>
        </div>
      </div>
    </>
  )
}
