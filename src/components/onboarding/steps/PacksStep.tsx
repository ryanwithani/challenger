'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/src/components/ui/Button'
import { PackIcon } from '@/src/components/sim/PackIcon'
import {
  PACKS,
  PACK_CATEGORY_LABELS,
  getPacksByCategory,
  type PackCategory,
} from '@/src/data/packs'

interface PacksStepProps {
  onBack: () => void
  onNext: (packs: string[]) => void
  onSkip: () => void
  loading?: boolean
}

const STORAGE_KEY = 'onboarding_packs_data'

const CATEGORY_TABS: { key: PackCategory; label: string }[] = [
  { key: 'expansion_pack', label: 'Expansion Packs' },
  { key: 'game_pack', label: 'Game Packs' },
  { key: 'stuff_pack', label: 'Stuff Packs' },
  { key: 'kit', label: 'Kits' },
  { key: 'lto_event', label: 'LTO Events' },
]

export default function PacksStep({ onBack, onNext }: PacksStepProps) {
  const getInitialPacks = (): string[] => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) return JSON.parse(saved)
    } catch {
      // Fall through to default
    }
    return []
  }

  const [selectedPacks, setSelectedPacks] = useState<string[]>(getInitialPacks)
  const [activeCategory, setActiveCategory] = useState<PackCategory>('expansion_pack')

  const selectedSet = new Set(selectedPacks)

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedPacks))
      } catch {
        // Ignore storage errors
      }
    }, 500)
    return () => clearTimeout(timeoutId)
  }, [selectedPacks])

  const togglePack = (acronym: string) => {
    setSelectedPacks((prev) =>
      prev.includes(acronym)
        ? prev.filter((a) => a !== acronym)
        : [...prev, acronym]
    )
  }

  const selectAllInCategory = () => {
    const categoryPacks = getPacksByCategory(activeCategory)
    setSelectedPacks((prev) => {
      const existing = new Set(prev)
      categoryPacks.forEach((p) => existing.add(p.acronym))
      return Array.from(existing)
    })
  }

  const clearCategory = () => {
    const categoryAcronyms = new Set(
      getPacksByCategory(activeCategory).map((p) => p.acronym)
    )
    setSelectedPacks((prev) => prev.filter((a) => !categoryAcronyms.has(a)))
  }

  const handleNext = () => {
    localStorage.removeItem(STORAGE_KEY)
    onNext(selectedPacks)
  }

  const activePacks = getPacksByCategory(activeCategory)
  const activeSelectedCount = activePacks.filter((p) => selectedSet.has(p.acronym)).length

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Stats */}
      <div className="text-center p-4 bg-brand-50 dark:bg-brand-900/30 rounded-lg border border-brand-200 dark:border-brand-800">
        <div className="font-display text-2xl font-bold text-brand-600 dark:text-brand-400">
          {selectedPacks.length}
        </div>
        <div className="text-sm text-gray-600 dark:text-warmGray-300">Packs Selected</div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {CATEGORY_TABS.map((tab) => {
          const catPacks = getPacksByCategory(tab.key)
          const catSelected = catPacks.filter((p) => selectedSet.has(p.acronym)).length
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveCategory(tab.key)}
              className={`flex-shrink-0 px-4 py-3 rounded-xl font-medium transition-all ${
                activeCategory === tab.key
                  ? 'bg-brand-500 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-warmGray-900 text-gray-600 dark:text-warmGray-300 hover:bg-gray-200 dark:hover:bg-warmGray-800'
              }`}
            >
              <div className="font-semibold text-sm">{tab.label}</div>
              <div className="text-xs opacity-80">
                {catSelected}/{catPacks.length} selected
              </div>
            </button>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={selectAllInCategory}
          className="flex-1"
        >
          Select All
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={clearCategory}
          className="flex-1"
        >
          Clear All
        </Button>
      </div>

      {/* Pack Grid */}
      <div className="max-h-[50vh] overflow-y-auto p-1">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {activePacks.map((pack) => {
            const isSelected = selectedSet.has(pack.acronym)
            return (
              <button
                key={pack.acronym}
                type="button"
                role="checkbox"
                aria-checked={isSelected}
                aria-label={pack.name}
                onClick={() => togglePack(pack.acronym)}
                className={`relative group transition-all duration-200 ${
                  isSelected ? 'scale-[1.02]' : 'hover:scale-[1.01]'
                }`}
              >
                <div
                  className={`border-2 rounded-lg p-3 transition-all duration-200 w-full h-full ${
                    isSelected
                      ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 shadow-lg ring-2 ring-brand-200 dark:ring-brand-800'
                      : 'border-brand-100 dark:border-warmGray-700 bg-white dark:bg-warmGray-900 hover:border-brand-200 dark:hover:border-warmGray-600 hover:shadow-md'
                  }`}
                >
                  <div className="flex flex-col items-center justify-center h-full gap-2">
                    <PackIcon
                      name={pack.acronym}
                      size={48}
                      className="w-12 h-12 object-contain flex-shrink-0"
                    />
                    <div className="text-xs font-medium text-gray-900 dark:text-warmGray-100 leading-tight text-center line-clamp-2">
                      {pack.name}
                    </div>
                  </div>
                  {isSelected && (
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-brand-500 rounded-full flex items-center justify-center shadow-lg ring-2 ring-white dark:ring-warmGray-800">
                      <svg
                        className="w-3 h-3 text-white"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button variant="primary" onClick={handleNext}>
          Continue
        </Button>
      </div>
    </div>
  )
}
