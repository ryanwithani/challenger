'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { cn } from '@/src/lib/utils/cn'
import { Button } from '@/src/components/ui/Button'
import { Database } from '@/src/types/database.types'
import { SimSortKey } from '@/src/lib/constants'

type Challenge = Database['public']['Tables']['challenges']['Row']

interface FilterValues {
  heirs?: boolean
  hasTraits?: boolean
  challengeId?: string | null
}

interface SimsToolbarProps {
  searchQuery: string
  onSearchChange: (q: string) => void
  sortBy: SimSortKey
  onSortChange: (s: SimSortKey) => void
  heirsOnly: boolean
  hasTraitsOnly: boolean
  challengeIdFilter: string | null
  challenges: Challenge[]
  onFilterChange: (filters: FilterValues) => void
  isBulkMode: boolean
  onToggleBulkMode: () => void
}

const SORT_OPTIONS: { value: SimSortKey; label: string }[] = [
  { value: 'name-asc', label: 'Name (A-Z)' },
  { value: 'name-desc', label: 'Name (Z-A)' },
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'generation-asc', label: 'Generation asc' },
  { value: 'generation-desc', label: 'Generation desc' },
]

const ALL_CHALLENGES_VALUE = '__all__'

function countActiveFilters(
  heirs: boolean,
  hasTraits: boolean,
  challengeId: string | null,
): number {
  let count = 0
  if (heirs) count += 1
  if (hasTraits) count += 1
  if (challengeId !== null) count += 1
  return count
}

const inputClasses = cn(
  'rounded-lg border px-3 py-2 text-sm',
  'border-warmGray-200 dark:border-warmGray-700',
  'bg-white dark:bg-warmGray-800',
  'text-warmGray-900 dark:text-warmGray-100',
  'placeholder:text-warmGray-400 dark:placeholder:text-warmGray-500',
  'focus:outline-none focus:ring-2 focus:ring-brand-400',
)

export default function SimsToolbar({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  heirsOnly,
  hasTraitsOnly,
  challengeIdFilter,
  challenges,
  onFilterChange,
  isBulkMode,
  onToggleBulkMode,
}: SimsToolbarProps) {
  const [filterOpen, setFilterOpen] = useState(false)
  const filterRef = useRef<HTMLDivElement>(null)

  const activeCount = countActiveFilters(heirsOnly, hasTraitsOnly, challengeIdFilter)
  const hasActiveFilters = activeCount > 0

  // Close dropdown on outside click
  useEffect(() => {
    if (!filterOpen) return

    function handleClickOutside(event: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setFilterOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [filterOpen])

  const handleClearFilters = useCallback(() => {
    onFilterChange({ heirs: false, hasTraits: false, challengeId: null })
  }, [onFilterChange])

  return (
    <div
      className="sticky top-0 z-10 flex items-center gap-3 py-3 bg-white/90 dark:bg-warmGray-900/90 backdrop-blur border-b border-warmGray-100 dark:border-warmGray-800 flex-wrap"
    >
      {/* Search */}
      <input
        type="search"
        placeholder="Search by name, career, aspiration..."
        value={searchQuery}
        onChange={e => onSearchChange(e.target.value)}
        className={cn(inputClasses, 'w-full max-w-xs')}
      />

      {/* Sort */}
      <select
        value={sortBy}
        onChange={e => onSortChange(e.target.value as SimSortKey)}
        className={inputClasses}
        aria-label="Sort sims"
      >
        {SORT_OPTIONS.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {/* Filter */}
      <div ref={filterRef} className="relative">
        <button
          type="button"
          onClick={() => setFilterOpen(prev => !prev)}
          className={cn(
            inputClasses,
            'inline-flex items-center gap-1.5 cursor-pointer',
            hasActiveFilters && 'border-brand-400 dark:border-brand-500',
          )}
          aria-expanded={filterOpen}
          aria-haspopup="true"
        >
          Filters
          {hasActiveFilters && (
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-brand-500 text-white text-xs font-medium leading-none">
              {activeCount}
            </span>
          )}
        </button>

        {filterOpen && (
          <div
            className={cn(
              'absolute top-full left-0 mt-1 w-64 rounded-lg border p-4 shadow-lg z-20',
              'border-warmGray-200 dark:border-warmGray-700',
              'bg-white dark:bg-warmGray-800',
            )}
          >
            <div className="space-y-3">
              {/* Heirs only */}
              <label className="flex items-center gap-2 text-sm text-warmGray-700 dark:text-warmGray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={heirsOnly}
                  onChange={e => onFilterChange({ heirs: e.target.checked })}
                  className="rounded border-warmGray-300 dark:border-warmGray-600 text-brand-500 focus:ring-brand-400"
                />
                Heirs only
              </label>

              {/* Has traits */}
              <label className="flex items-center gap-2 text-sm text-warmGray-700 dark:text-warmGray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasTraitsOnly}
                  onChange={e => onFilterChange({ hasTraits: e.target.checked })}
                  className="rounded border-warmGray-300 dark:border-warmGray-600 text-brand-500 focus:ring-brand-400"
                />
                Has traits
              </label>

              {/* Challenge filter */}
              <div className="space-y-1">
                <span className="text-xs font-medium text-warmGray-500 dark:text-warmGray-400">
                  Challenge
                </span>
                <select
                  value={challengeIdFilter ?? ALL_CHALLENGES_VALUE}
                  onChange={e => {
                    const value = e.target.value
                    onFilterChange({
                      challengeId: value === ALL_CHALLENGES_VALUE ? null : value,
                    })
                  }}
                  className={cn(inputClasses, 'w-full')}
                  aria-label="Filter by challenge"
                >
                  <option value={ALL_CHALLENGES_VALUE}>All challenges</option>
                  {challenges.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Clear filters */}
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400 dark:hover:text-brand-300 font-medium"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Bulk mode toggle */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onToggleBulkMode}
      >
        {isBulkMode ? 'Cancel' : 'Select'}
      </Button>
    </div>
  )
}
