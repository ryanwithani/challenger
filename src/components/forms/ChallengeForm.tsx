'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '@/src/components/ui/Input'
import { Button } from '@/src/components/ui/Button'
import { Database } from '@/src/types/database.types'

type ChallengeInsert = Database['public']['Tables']['challenges']['Insert']

const challengeSchema = z.object({
  name: z.string().min(1, 'Challenge name is required').max(100),
  description: z.string().max(500).optional(),
  template_type: z.enum(['custom', 'legacy', 'not_so_berry', '100_baby']),
})

type ChallengeFormData = z.infer<typeof challengeSchema>

interface ChallengeFormProps {
  onSubmit: (data: Partial<ChallengeInsert>) => void | Promise<void>
  loading?: boolean
  initialData?: Partial<ChallengeFormData>
}

const challengeTemplates = [
  { 
    value: 'custom', 
    label: 'Custom Challenge',
    description: 'Create your own unique challenge'
  },
  { 
    value: 'legacy', 
    label: 'Legacy Challenge',
    description: '10 generations with specific rules and restrictions'
  },
  { 
    value: 'not_so_berry', 
    label: 'Not So Berry',
    description: 'Colorful legacy with unique goals per generation'
  },
  { 
    value: '100_baby', 
    label: '100 Baby Challenge',
    description: 'Have 100 babies with one matriarch'
  },
]

export function ChallengeForm({ onSubmit, loading, initialData }: ChallengeFormProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>(
    initialData?.template_type || 'custom'
  )

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ChallengeFormData>({
    resolver: zodResolver(challengeSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      template_type: initialData?.template_type || 'custom',
    },
  })

  const templateType = watch('template_type')

  const onFormSubmit = async (data: ChallengeFormData) => {
    await onSubmit(data)
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* Template Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Choose a Template
        </label>
        <div className="grid grid-cols-1 gap-3">
          {challengeTemplates.map((template) => (
            <label
              key={template.value}
              className={`relative flex cursor-pointer rounded-lg border p-4 focus:outline-none ${
                selectedTemplate === template.value
                  ? 'border-sims-green bg-sims-green/5'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                {...register('template_type')}
                value={template.value}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                className="sr-only"
              />
              <div className="flex flex-1">
                <div className="flex flex-col">
                  <span className="block text-sm font-medium text-gray-900">
                    {template.label}
                  </span>
                  <span className="mt-1 flex items-center text-sm text-gray-500">
                    {template.description}
                  </span>
                </div>
              </div>
              {selectedTemplate === template.value && (
                <svg
                  className="h-5 w-5 text-sims-green"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </label>
          ))}
        </div>
      </div>

      {/* Challenge Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Challenge Name
        </label>
        <Input
          id="name"
          type="text"
          {...register('name')}
          placeholder={
            templateType === 'legacy'
              ? 'The Smith Legacy'
              : templateType === 'not_so_berry'
              ? 'My Not So Berry Challenge'
              : templateType === '100_baby'
              ? 'The 100 Baby Challenge'
              : 'My Custom Challenge'
          }
          className={errors.name ? 'border-red-500' : ''}
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
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
          rows={3}
          placeholder="Describe your challenge goals, rules, or story..."
          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-sims-blue focus:border-transparent resize-none"
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          {watch('description')?.length || 0}/500 characters
        </p>
      </div>

      {/* Template-specific information */}
      {templateType !== 'custom' && (
        <div className="rounded-lg bg-blue-50 p-4">
          <h4 className="text-sm font-medium text-blue-900 mb-2">
            Template Information
          </h4>
          <div className="text-sm text-blue-700">
            {templateType === 'legacy' && (
              <ul className="list-disc list-inside space-y-1">
                <li>Play a single family for 10 generations</li>
                <li>Each generation has specific requirements</li>
                <li>Follow succession laws for choosing heirs</li>
                <li>No cheats or mods that give unfair advantages</li>
              </ul>
            )}
            {templateType === 'not_so_berry' && (
              <ul className="list-disc list-inside space-y-1">
                <li>Each generation has a color theme</li>
                <li>Complete specific careers and aspirations</li>
                <li>Follow unique rules for each generation</li>
                <li>Express yourself through colorful builds</li>
              </ul>
            )}
            {templateType === '100_baby' && (
              <ul className="list-disc list-inside space-y-1">
                <li>One matriarch must have 100 babies</li>
                <li>No same partner twice</li>
                <li>Age up babies naturally</li>
                <li>Young adults must move out</li>
              </ul>
            )}
          </div>
        </div>
      )}

      {/* Submit Button */}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Creating Challenge...' : 'Create Challenge'}
      </Button>
    </form>
  )
}