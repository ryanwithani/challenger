'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '@/src/components/ui/Input'
import { Button } from '@/src/components/ui/Button'
import { Database } from '@/src/types/database.types'

type GoalInsert = Database['public']['Tables']['goals']['Insert']

const goalSchema = z.object({
  title: z.string().min(1, 'Goal title is required').max(100),
  description: z.string().max(500).optional(),
  category: z.enum(['career', 'family', 'skills', 'collections', 'aspirations', 'other']),
  point_value: z.number().min(1).max(10),
  is_required: z.boolean(),
})

type GoalFormData = z.infer<typeof goalSchema>

interface GoalFormProps {
  challengeId: string
  onSubmit: (data: GoalInsert) => void | Promise<void>
  initialData?: Partial<GoalFormData>
  nextOrderIndex?: number
}

const categories = [
  { value: 'career', label: 'Career', icon: '💼' },
  { value: 'family', label: 'Family', icon: '👨‍👩‍👧‍👦' },
  { value: 'skills', label: 'Skills', icon: '⭐' },
  { value: 'collections', label: 'Collections', icon: '🏆' },
  { value: 'aspirations', label: 'Aspirations', icon: '🎯' },
  { value: 'other', label: 'Other', icon: '📌' },
]

const suggestionsByCategory = {
  career: [
    'Reach level 10 in career',
    'Complete career aspiration',
    'Earn promotion',
    'Max career performance',
    'Retire with honors',
  ],
  family: [
    'Get married',
    'Have a child',
    'Have twins',
    'Adopt a child',
    'Have 3 children',
    'Become a grandparent',
    'Complete family aspiration',
  ],
  skills: [
    'Max skill level',
    'Learn 3 skills',
    'Master cooking',
    'Learn all skills',
    'Teach skill to child',
  ],
  collections: [
    'Complete collection',
    'Find all crystals',
    'Collect all frogs',
    'Complete postcard collection',
    'Find all fossils',
  ],
  aspirations: [
    'Complete aspiration',
    'Complete childhood aspiration',
    'Complete 2 aspirations',
    'Complete bonus traits',
  ],
  other: [
    'Build dream home',
    'Earn 100,000 simoleons',
    'Befriend 10 Sims',
    'Visit all worlds',
    'Throw gold party',
  ],
}

export function GoalForm({ 
  challengeId, 
  onSubmit, 
  initialData,
  nextOrderIndex = 0 
}: GoalFormProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>(
    initialData?.category || 'other'
  )

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<GoalFormData>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      category: initialData?.category || 'other',
      point_value: initialData?.point_value || 1,
      is_required: initialData?.is_required || false,
    },
  })

  const pointValue = watch('point_value')
  const category = watch('category')

  const onFormSubmit = async (data: GoalFormData) => {
    await onSubmit({
      ...data,
      challenge_id: challengeId,
      order_index: nextOrderIndex,
      // Required fields for GoalInsert that aren't collected in this form
      goal_type: 'binary',
      current_value: 0,
      thresholds: '[]',
      max_points: data.point_value,
      target_value: 1,
    })
  }

  const applySuggestion = (suggestion: string) => {
    setValue('title', suggestion)
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* Category Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Goal Category
        </label>
        <div className="grid grid-cols-3 gap-2">
          {categories.map((cat) => (
            <button
              key={cat.value}
              type="button"
              onClick={() => {
                setSelectedCategory(cat.value)
                setValue('category', cat.value as any)
              }}
              className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-colors ${
                selectedCategory === cat.value
                  ? 'border-brand-600 bg-brand-100'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className="text-2xl mb-1">{cat.icon}</span>
              <span className="text-xs font-medium">{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Goal Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Goal Title
        </label>
        <Input
          id="title"
          type="text"
          {...register('title')}
          placeholder="Enter goal title"
          className={errors.title ? 'border-red-500' : ''}
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
        )}
        
        {/* Suggestions */}
        {category && suggestionsByCategory[category as keyof typeof suggestionsByCategory] && (
          <div className="mt-2">
            <p className="text-xs text-gray-500 mb-1">Suggestions:</p>
            <div className="flex flex-wrap gap-1">
              {suggestionsByCategory[category as keyof typeof suggestionsByCategory].map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => applySuggestion(suggestion)}
                  className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description (Optional)
        </label>
        <textarea
          id="description"
          {...register('description')}
          rows={2}
          placeholder="Add any additional details or requirements..."
          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>

      {/* Point Value */}
      <div>
        <label htmlFor="point_value" className="block text-sm font-medium text-gray-700 mb-1">
          Point Value
        </label>
        <div className="flex items-center space-x-4">
          <input
            id="point_value"
            type="range"
            {...register('point_value', { valueAsNumber: true })}
            min="1"
            max="10"
            className="flex-1"
          />
          <span className="text-2xl font-bold text-brand-600 w-12 text-center">
            {pointValue}
          </span>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Easy</span>
          <span>Medium</span>
          <span>Hard</span>
        </div>
      </div>

      {/* Required Toggle */}
      <div className="bg-yellow-50 rounded-lg p-4">
        <div className="flex items-start">
          <input
            type="checkbox"
            id="is_required"
            {...register('is_required')}
            className="mt-0.5 h-4 w-4 text-accent-500 border-gray-300 rounded focus:ring-accent-500"
          />
          <div className="ml-3">
            <label htmlFor="is_required" className="text-sm font-medium text-gray-900">
              Required Goal
            </label>
            <p className="text-xs text-gray-600 mt-0.5">
              This goal must be completed to finish the challenge
            </p>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <Button type="submit" className="w-full">
        Add Goal
      </Button>
    </form>
  )
}