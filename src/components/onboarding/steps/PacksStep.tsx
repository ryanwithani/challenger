'use client'

import { useState } from 'react'
import { Button } from '@/src/components/ui/Button'
import { PackIcon } from '@/src/components/sim/PackIcon'
import { PACKS, type PacksValue } from '@/src/components/profile/Packs'

interface PacksStepProps {
  onBack: () => void
  onNext: (packs: Record<string, boolean>) => void
  onSkip: () => void
  loading?: boolean
}

export default function PacksStep({ onBack, onNext }: PacksStepProps) {
  const [selectedPacks, setSelectedPacks] = useState<Record<string, boolean>>({
    get_to_work: false,
    get_together: false,
    city_living: false,
    cats_and_dogs: false,
    seasons: false,
    get_famous: false,
    island_living: false,
    discover_university: false,
    eco_lifestyle: false,
    snowy_escape: false,
    cottage_living: false,
    high_school_years: false,
    growing_together: false,
    horse_ranch: false,
    for_rent: false,
    lovestruck: false,
    life_and_death: false,
    enchanted_by_nature: false,
    businesses_and_hobbies: false,
    outdoor_retreat: false,
    spa_day: false,
    strangerville: false,
    dine_out: false,
    vampires: false,
    parenthood: false,
    jungle_adventure: false,
    realm_of_magic: false,
    journey_to_batuu: false,
    dream_home_decorator: false,
    my_wedding_stories: false,
    werewolves: false,

  })

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
    onNext(selectedPacks)
  }

  const expansionPacks = PACKS.filter((p: any) => p.category === 'Expansion Pack')
  const gamePacks = PACKS.filter((p: any) => p.category === 'Game Pack')

  const totalSelected = Object.values(selectedPacks).filter(Boolean).length

  return (
  <div className="p-8 md:p-12 space-y-6">
      {/* Stats */}
      <div className="text-center p-4 bg-gradient-to-r from-brand-50 to-purple-50 rounded-2xl border border-brand-200">
        <div className="text-2xl font-bold text-brand-600">{totalSelected}</div>
        <div className="text-sm text-gray-600">Packs Selected</div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setActiveCategory('Expansion Pack')}
          className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all ${
            activeCategory === 'Expansion Pack'
              ? 'bg-brand-500 text-white shadow-md'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
          className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all ${
            activeCategory === 'Game Pack'
              ? 'bg-brand-500 text-white shadow-md'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[400px] overflow-y-auto p-1">
        {(activeCategory === 'Expansion Pack' ? expansionPacks : gamePacks).map((pack) => {
          const isSelected = selectedPacks[pack.key as keyof Record<string, boolean>]
          
          return (
            <button
              key={pack.key}
              type="button"
              onClick={() => togglePack(pack.key as keyof Record<string, boolean>)}
              className={`relative group transition-all ${
                isSelected ? 'scale-[1.02]' : ''
              }`}
            >
              <div className={`border-2 rounded-xl p-3 transition-all ${
                isSelected
                  ? 'border-brand-500 bg-brand-500/5 shadow-lg'
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
              }`}>
                <PackIcon 
                  name={pack.key} 
                  size={96}
                  className="mx-auto mb-2 w-12 h-12 object-contain" 
                />
                <div className="text-xs text-center font-medium text-gray-900 line-clamp-2 min-h-[32px]">
                  {pack.name as string}
                </div>
                {isSelected && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-brand-500 rounded-full flex items-center justify-center shadow-md">
                    <svg className="w-4 h-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            </button>
          )
        })}
      </div>

      {/* Help Text */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Don't worry if you're not sure!</p>
            <p className="text-blue-700">You can always update your expansion packs later in your profile settings. This helps us show you relevant content and challenges.</p>
          </div>
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