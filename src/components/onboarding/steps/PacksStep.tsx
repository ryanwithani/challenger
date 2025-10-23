'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/src/components/ui/Button'
import { PackIcon } from '@/src/components/sim/PackIcon'
import { PACKS, type PacksValue } from '@/src/components/profile/Packs'

interface PacksStepProps {
  onBack: () => void
  onNext: (packs: Record<string, boolean>) => void
  onSkip: () => void
  loading?: boolean
}

const STORAGE_KEY = 'onboarding_packs_data'

export default function PacksStep({ onBack, onNext }: PacksStepProps) {
  // Load saved data from localStorage
  const getInitialPacksData = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        return JSON.parse(saved)
      }
    } catch {
      // Fall through to default
    }

    // Default: all packs as false
    const initial: Record<string, boolean> = {}
    PACKS.forEach(pack => {
      initial[pack.key] = false
    })
    return initial
  }

  const [selectedPacks, setSelectedPacks] = useState<Record<string, boolean>>(getInitialPacksData)

  // Auto-save packs data to localStorage
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedPacks))
      } catch (error) {
        console.warn('Failed to save packs data:', error)
      }
    }, 500) // Debounce auto-save

    return () => clearTimeout(timeoutId)
  }, [selectedPacks])

  const [activeCategory, setActiveCategory] = useState<'Expansion Pack' | 'Game Pack'>('Expansion Pack')

  const togglePack = (key: keyof Record<string, boolean>) => {
    setSelectedPacks(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const selectAll = (category: 'Expansion Pack' | 'Game Pack') => {
    const packsInCategory = PACKS.filter((p: any) => p.category === category)
    setSelectedPacks(prev => {
      const updated = { ...prev }
      packsInCategory.forEach((pack: any) => {
        updated[pack.key] = true
      })
      return updated
    })
  }

  const selectNone = (category: 'Expansion Pack' | 'Game Pack') => {
    const packsInCategory = PACKS.filter((p: any) => p.category === category)
    setSelectedPacks(prev => {
      const updated = { ...prev }
      packsInCategory.forEach((pack: any) => {
        updated[pack.key] = false
      })
      return updated
    })
  }

  const handleNext = () => {
    // Clear saved data and proceed
    localStorage.removeItem(STORAGE_KEY)
    onNext(selectedPacks)
  }

  const expansionPacks = PACKS.filter((p: any) => p.category === 'Expansion Pack')
  const gamePacks = PACKS.filter((p: any) => p.category === 'Game Pack')

  const totalSelected = Object.values(selectedPacks).filter(Boolean).length

  return (
    <div className="p-8 md:p-12 space-y-6">
      {/* Stats */}
      <div className="text-center p-4 bg-gradient-to-r from-brand-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl border border-brand-200 dark:border-gray-600">
        <div className="text-2xl font-bold text-brand-600 dark:text-brand-400">{totalSelected}</div>
        <div className="text-sm text-gray-600 dark:text-gray-400">Packs Selected</div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setActiveCategory('Expansion Pack')}
          className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all ${activeCategory === 'Expansion Pack'
            ? 'bg-brand-500 text-white shadow-md'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
        >
          <div className="font-semibold">Expansion Packs</div>
          <div className="text-xs opacity-80">
            {expansionPacks.filter((p: any) => selectedPacks[p.key]).length}/{expansionPacks.length} selected
          </div>
        </button>
        <button
          type="button"
          onClick={() => setActiveCategory('Game Pack')}
          className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all ${activeCategory === 'Game Pack'
            ? 'bg-brand-500 text-white shadow-md'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
        >
          <div className="font-semibold">Game Packs</div>
          <div className="text-xs opacity-80">
            {gamePacks.filter((p: any) => selectedPacks[p.key]).length}/{gamePacks.length} selected
          </div>
        </button>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => selectAll(activeCategory)}
          className="flex-1"
        >
          Select All
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => selectNone(activeCategory)}
          className="flex-1"
        >
          Clear All
        </Button>
      </div>

      {/* Pack Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {(activeCategory === 'Expansion Pack' ? expansionPacks : gamePacks).map((pack) => {
          const isSelected = selectedPacks[pack.key as keyof Record<string, boolean>]

          return (
            <button
              key={pack.key}
              type="button"
              onClick={() => togglePack(pack.key as keyof Record<string, boolean>)}
              className={`relative group transition-all duration-200 ${isSelected ? 'scale-[1.02]' : 'hover:scale-[1.01]'
                }`}
            >
              <div className={`border-2 rounded-xl p-2 transition-all duration-200 w-full h-full ${isSelected
                ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 shadow-lg ring-2 ring-brand-200 dark:ring-brand-800'
                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md'
                }`}>
                <div className="flex flex-col items-center justify-center h-full">
                  <PackIcon
                    name={pack.key}
                    size={96}
                    className="mx-auto mb-2 w-8 h-8 object-contain flex-shrink-0"
                  />
                  <div className="text-xs font-medium text-gray-900 dark:text-gray-100 leading-tight text-center min-h-[42px] flex items-center">
                    {pack.name as string}
                  </div>
                </div>
                {isSelected && (
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-brand-500 rounded-full flex items-center justify-center shadow-lg ring-2 ring-white dark:ring-gray-800">
                    <svg className="w-3 h-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            </button>
          )
        })}
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