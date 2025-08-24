'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/src/components/ui/Button'
import { Input } from '@/src/components/ui/Input'
import { Database } from '@/src/types/database.types'
import { useUserPreferencesStore } from '@/src/lib/store/userPreferencesStore'
import { ExpansionPacks } from '@/src/components/profile/ExpansionPacks'

type Challenge = Database['public']['Tables']['challenges']['Row']

// ===== SCHEMAS =====
const basicInfoSchema = z.object({
  name: z.string().min(1, 'Challenge name is required').max(100),
  description: z.string().max(500).optional(),
  challenge_type: z.enum(['custom', 'legacy', 'not_so_berry', '100_baby']),
})

const legacyConfigSchema = z.object({
  start_type: z.enum(['regular', 'extreme', 'ultra_extreme']),
  gender_law: z.enum(['strict_traditional', 'traditional', 'matriarchy', 'patriarchy', 'equality', 'strict_equality']),
  bloodline_law: z.enum(['strict_traditional', 'traditional', 'modern', 'foster', 'strict_foster']),
  heir_selection: z.enum(['first_born', 'last_born', 'random', 'exemplar', 'strength']),
  species_rule: z.enum(['human_only', 'occult_allowed', 'occult_preferred']),
  lifespan: z.enum(['short', 'normal', 'long']),
})

const expansionPackSchema = z.object({
  base_game: z.boolean().default(true),
  get_to_work: z.boolean().default(false),
  get_together: z.boolean().default(false),
  city_living: z.boolean().default(false),
  cats_dogs: z.boolean().default(false),
  seasons: z.boolean().default(false),
  get_famous: z.boolean().default(false),
  island_living: z.boolean().default(false),
  discover_university: z.boolean().default(false),
  eco_lifestyle: z.boolean().default(false),
  snowy_escape: z.boolean().default(false),
  cottage_living: z.boolean().default(false),
  high_school_years: z.boolean().default(false),
  growing_together: z.boolean().default(false),
  horse_ranch: z.boolean().default(false),
  for_rent: z.boolean().default(false),
  lovestruck: z.boolean().default(false),
  life_death: z.boolean().default(false),
})

type BasicInfoData = z.infer<typeof basicInfoSchema>
type LegacyConfigData = z.infer<typeof legacyConfigSchema>
type ExpansionPackData = z.infer<typeof expansionPackSchema>

// ===== WIZARD DATA INTERFACE =====
interface WizardData {
  basicInfo?: BasicInfoData
  configuration?: LegacyConfigData | Record<string, any>
  expansionPacks?: ExpansionPackData
}

// ===== CHALLENGE TEMPLATES =====
const challengeTemplates = [
  {
    value: 'custom',
    label: 'Custom Challenge',
    description: 'Create your own unique challenge',
    needsConfiguration: false
  },
  {
    value: 'legacy',
    label: 'Legacy Challenge',
    description: '10 generations with specific rules and restrictions',
    needsConfiguration: true
  },
  {
    value: 'not_so_berry',
    label: 'Not So Berry',
    description: 'Colorful legacy with unique goals per generation',
    needsConfiguration: false
  },
  {
    value: '100_baby',
    label: '100 Baby Challenge',
    description: 'Have 100 babies with one matriarch',
    needsConfiguration: false
  },
]

// ===== STEP 1: BASIC INFO =====
interface BasicInfoStepProps {
  data: BasicInfoData | undefined
  onNext: (data: BasicInfoData) => void
  onCancel: () => void
}

function BasicInfoStep({ data, onNext, onCancel }: BasicInfoStepProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>(
    data?.challenge_type || 'custom'
  )

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<BasicInfoData>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: {
      name: data?.name || '',
      description: data?.description || '',
      challenge_type: data?.challenge_type || 'custom',
    },
  })

  const templateType = watch('challenge_type')

  const onSubmit = (formData: BasicInfoData) => {
    onNext(formData)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Choose Your Challenge</h2>

        {/* Template Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Choose a Template
          </label>
          <div className="grid grid-cols-1 gap-3">
            {challengeTemplates.map((template) => (
              <label
                key={template.value}
                className={`relative flex cursor-pointer rounded-lg border p-4 focus:outline-none ${selectedTemplate === template.value
                    ? 'border-sims-green bg-sims-green/5'
                    : 'border-gray-200 hover:border-gray-300'
                  }`}
              >
                <input
                  type="radio"
                  {...register('challenge_type')}
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
                  <svg className="h-5 w-5 text-sims-green" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </label>
            ))}
          </div>
        </div>

        {/* Challenge Name */}
        <div className="mb-4">
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
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          Next: {challengeTemplates.find(t => t.value === templateType)?.needsConfiguration ? 'Configuration' : 'Expansion Packs'}
        </Button>
      </div>
    </form>
  )
}

// ===== STEP 2: CONFIGURATION =====
interface ConfigurationStepProps {
  challengeType: string
  data: LegacyConfigData | Record<string, any> | undefined
  onNext: (data: any) => void
  onBack: () => void
}

function ConfigurationStep({ challengeType, data, onNext, onBack }: ConfigurationStepProps) {
  if (challengeType === 'legacy') {
    return <LegacyConfigurationStep data={data as LegacyConfigData} onNext={onNext} onBack={onBack} />
  }

  // For other challenge types that might need configuration in the future
  return null
}

const startingOptions = [
  {
    value: 'regular',
    label: 'Regular Start',
    description: 'Start with $1,800 on 50x50 lot - classic experience'
  },
  {
    value: 'extreme',
    label: 'Extreme Start',
    description: 'Start with $0 on 64x64 lot in winter (+1 bonus point)'
  },
  {
    value: 'ultra_extreme',
    label: 'Ultra Extreme Start',
    description: 'Start with $0 and $35k debt to repay (+2 bonus points)'
  }
]

function LegacyConfigurationStep({
  data,
  onNext,
  onBack
}: {
  data: LegacyConfigData | undefined
  onNext: (data: LegacyConfigData) => void
  onBack: () => void
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<LegacyConfigData>({
    resolver: zodResolver(legacyConfigSchema),
    defaultValues: {
      start_type: data?.start_type || 'regular',
      gender_law: data?.gender_law || 'traditional',
      bloodline_law: data?.bloodline_law || 'strict_traditional',
      heir_selection: data?.heir_selection || 'first_born',
      species_rule: data?.species_rule || 'human_only',
      lifespan: data?.lifespan || 'normal',
    },
  })

  const onSubmit = (formData: LegacyConfigData) => {
    onNext(formData)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Legacy Challenge Configuration</h2>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Starting Difficulty
          </label>
          <div className="space-y-3">
            {startingOptions.map((option) => (
              <label
                key={option.value}
                className={`relative flex cursor-pointer rounded-lg border p-4 focus:outline-none ${watch('start_type') === option.value
                    ? 'border-sims-green bg-sims-green/5'
                    : 'border-gray-200 hover:border-gray-300'
                  }`}
              >
                <input
                  type="radio"
                  {...register('start_type')}
                  value={option.value}
                  onChange={(e) => setValue('start_type', e.target.value as 'regular' | 'extreme' | 'ultra_extreme')}
                  className="sr-only"
                />
                <div className="flex flex-1">
                  <div className="flex flex-col">
                    <span className="block text-sm font-medium text-gray-900">
                      {option.label}
                    </span>
                    <span className="mt-1 flex items-center text-sm text-gray-500">
                      {option.description}
                    </span>
                  </div>
                </div>
                {watch('start_type') === option.value && (
                  <svg className="h-5 w-5 text-sims-green" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </label>
            ))}
          </div>
        </div>

        {/* Succession Law */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Succession Law
          </label>
          <div className="space-y-2">
            {[
              { value: 'strict_traditional', label: 'Strict Traditional', desc: 'Heir must be eldest male' },
              { value: 'traditional', label: 'Traditional', desc: 'Heir must be male (any age)' },
              { value: 'matriarchy', label: 'Matriarchy', desc: 'Heir must be female (any age)' },
              { value: 'patriarchy', label: 'Patriarchy', desc: 'Heir must be male (any age)' },
              { value: 'equality', label: 'Equality', desc: 'Heir can be any gender' },
              { value: 'strict_equality', label: 'Strict Equality', desc: 'Heir must be eldest child regardless of gender' },
            ].map((law) => (
              <label key={law.value} className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="radio"
                  {...register('gender_law')}
                  value={law.value}
                  className="mt-1 h-4 w-4 text-sims-green focus:ring-sims-green border-gray-300"
                />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">{law.label}</div>
                  <div className="text-xs text-gray-500">{law.desc}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Bloodline Law */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Bloodline Law
          </label>
          <div className="space-y-2">
            {[
              { value: 'strict_traditional', label: 'Strict Traditional', desc: 'Child must be naturally born or be a science baby from their previous generation parents. Adopted children never allowed' },
              { value: 'traditional', label: 'Traditional', desc: 'Child must be naturally born or be a science baby from their previous generation parents. Adopted children allowed if no living naturally born or science children' },
              { value: 'modern', label: 'Modern', desc: 'Naturally born/science baby and adopted children are eligible to be named heir.' },
              { value: 'foster', label: 'Foster', desc: 'Children who are adopted are eligible to be named heir. Naturally born/Science baby children are not eligible to be named heir unless there are no adopted children' },
              { value: 'strict_foster', label: 'Strict Foster', desc: 'Only Children who are adopted are eligible for the title of heir. Naturally born/Science baby children may never be heir.' },
            ].map((law) => (
              <label key={law.value} className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="radio"
                  {...register('bloodline_law')}
                  value={law.value}
                  className="mt-1 h-4 w-4 text-sims-green focus:ring-sims-green border-gray-300"
                />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">{law.label}</div>
                  <div className="text-xs text-gray-500">{law.desc}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Heir Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Heir Selection Method
          </label>
          <div className="space-y-2">
            {[
              { value: 'first_born', label: 'First Born', desc: 'Oldest eligible child' },
              { value: 'last_born', label: 'Last Born', desc: 'Youngest eligible child' },
              { value: 'random', label: 'Random', desc: 'Random eligible child' },
              { value: 'exemplar', label: 'Exemplar', desc: 'Child with highest skills' },
              { value: 'strength', label: 'Strength', desc: 'Child with highest fitness/logic' },
            ].map((method) => (
              <label key={method.value} className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="radio"
                  {...register('heir_selection')}
                  value={method.value}
                  className="mt-1 h-4 w-4 text-sims-green focus:ring-sims-green border-gray-300"
                />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">{method.label}</div>
                  <div className="text-xs text-gray-500">{method.desc}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Species Rule */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Species Rule
          </label>
          <div className="space-y-2">
            {[
              { value: 'human_only', label: 'Humans Only', desc: 'No occult sims allowed' },
              { value: 'occult_allowed', label: 'Occult Allowed', desc: 'Occult sims are permitted' },
              { value: 'occult_preferred', label: 'Occult Preferred', desc: 'Prefer occult heirs when possible' },
            ].map((rule) => (
              <label key={rule.value} className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="radio"
                  {...register('species_rule')}
                  value={rule.value}
                  className="mt-1 h-4 w-4 text-sims-green focus:ring-sims-green border-gray-300"
                />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">{rule.label}</div>
                  <div className="text-xs text-gray-500">{rule.desc}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Lifespan */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Lifespan Setting
          </label>
          <div className="space-y-2">
            {[
              { value: 'short', label: 'Short', desc: 'Fast-paced gameplay' },
              { value: 'normal', label: 'Normal', desc: 'Default game setting' },
              { value: 'long', label: 'Long', desc: 'Extended gameplay' },
            ].map((lifespan) => (
              <label key={lifespan.value} className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="radio"
                  {...register('lifespan')}
                  value={lifespan.value}
                  className="mt-1 h-4 w-4 text-sims-green focus:ring-sims-green border-gray-300"
                />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">{lifespan.label}</div>
                  <div className="text-xs text-gray-500">{lifespan.desc}</div>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button type="submit">
          Next: Expansion Packs
        </Button>
      </div>
    </form>
  )
}

// ===== STEP 3: EXPANSION PACKS =====
interface ExpansionPackStepProps {
  data: ExpansionPackData | undefined
  onNext: (data: ExpansionPackData) => void
  onBack: () => void
  isLegacyChallenge?: boolean
}

export function ExpansionPackStep({
  data,
  onNext,
  onBack,
  isLegacyChallenge = false
}: ExpansionPackStepProps) {
  const { preferences, loading: preferencesLoading, fetchPreferences, updateExpansionPacks } = useUserPreferencesStore()
  const [selectedPacks, setSelectedPacks] = useState<string[]>([])

  // Load user preferences on mount
  useEffect(() => {
    fetchPreferences()
  }, [fetchPreferences])

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<ExpansionPackData>({
    resolver: zodResolver(expansionPackSchema),
    defaultValues: {
      base_game: true,
      ...data,
    },
  })

  // Update form when preferences load
  useEffect(() => {
    if (preferences?.expansion_packs && !data) {
      reset({
        ...preferences.expansion_packs,
        base_game: true,
      })
    }
  }, [preferences, data, reset])

  // Track selected packs for scoring calculation
  const watchedValues = watch()
  useEffect(() => {
    const selected = Object.entries(watchedValues)
      .filter(([key, value]) => key !== 'base_game' && value === true)
      .map(([key]) => key)
    setSelectedPacks(selected)
  }, [watchedValues])

  const scoringInfo = isLegacyChallenge ? calculateLegacyScoring(selectedPacks) : null

  const onSubmit = async (formData: ExpansionPackData) => {
    try {
      // Save expansion pack preferences to user preferences
      await updateExpansionPacks(formData)
      onNext(formData)
    } catch (error) {
      console.error('Failed to save expansion pack preferences:', error)
      // Still proceed with the wizard even if preferences save fails
      onNext(formData)
    }
  }

  if (preferencesLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Expansion Packs</h2>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sims-green"></div>
            <span className="ml-3 text-gray-600">Loading your preferences...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Expansion Packs</h2>

        {isLegacyChallenge && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-sm font-medium text-blue-900 mb-2">Legacy Challenge Scoring</h3>
            <p className="text-sm text-blue-700 mb-3">
              Different expansion packs unlock careers, skills, and collections that contribute to your Legacy Challenge score.
            </p>
            {scoringInfo && (
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="bg-white rounded px-3 py-2">
                  <div className="font-medium text-gray-900">Careers Available</div>
                  <div className="text-gray-600">{scoringInfo.careers} total</div>
                </div>
                <div className="bg-white rounded px-3 py-2">
                  <div className="font-medium text-gray-900">Skills Available</div>
                  <div className="text-gray-600">{scoringInfo.skills} total</div>
                </div>
                <div className="bg-white rounded px-3 py-2">
                  <div className="font-medium text-gray-900">Collections Available</div>
                  <div className="text-gray-600">{scoringInfo.collections} total</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Base Game (Always Selected) */}
        <div className="mb-6">
          <label className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <input
              type="checkbox"
              checked={true}
              disabled
              className="h-4 w-4 text-sims-green focus:ring-sims-green border-gray-300 rounded"
            />
            <div className="flex-1">
              <span className="text-sm font-medium text-gray-900">The Sims 4 (Base Game)</span>
              {isLegacyChallenge && (
                <div className="text-xs text-gray-500 mt-1">
                  23 careers • 15 skills • 13 collections
                </div>
              )}
            </div>
          </label>
        </div>

        {/* Expansion Packs */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-700">Expansion Packs</h3>
          <div className="space-y-2">
            {ExpansionPacks.map((pack) => (
              <label key={pack.key} className="flex items-start space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  {...register(pack.key as keyof ExpansionPackData)}
                  className="mt-1 h-4 w-4 text-sims-green focus:ring-sims-green border-gray-300 rounded"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">{pack.name}</span>
                    <span className="text-xs text-gray-500">{pack.category}</span>
                  </div>

                  {isLegacyChallenge && (
                    <div className="mt-2 text-xs text-gray-600">
                      <div className="grid grid-cols-1 gap-1">
                        <div><span className="font-medium">Careers:</span> {pack.legacyImpact.careers.join(', ')}</div>
                        <div><span className="font-medium">Skills:</span> {pack.legacyImpact.skills.join(', ')}</div>
                        <div><span className="font-medium">Collections:</span> {pack.legacyImpact.collections.join(', ')}</div>
                        <div className="text-sims-green font-medium">{pack.legacyImpact.points}</div>
                      </div>
                    </div>
                  )}
                </div>
              </label>
            ))}
          </div>
        </div>

        {isLegacyChallenge && selectedPacks.length === 0 && (
          <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
            <p className="text-sm text-yellow-800">
              <span className="font-medium">Base game only:</span> You'll be able to earn approximately 60-70 out of 100 possible Legacy Challenge points.
              Consider adding expansion packs to unlock more scoring opportunities!
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button type="submit">
          Next: Review
        </Button>
      </div>
    </form>
  )
}

// ===== STEP 4: SUMMARY =====
interface SummaryStepProps {
  data: WizardData
  onSubmit: (data: WizardData) => void | Promise<void>
  onBack: () => void
  loading?: boolean
}

// ===== LEGACY SCORING CALCULATION =====
function calculateLegacyScoring(selectedPacks: string[]) {
  let totalCareers = 23 // Base game careers
  let totalSkills = 15 // Base game skills  
  let totalCollections = 13 // Base game collections

  // Add expansion pack content
  const packContributions = {
    get_to_work: { careers: 3, skills: 2, collections: 3 },
    get_together: { careers: 0, skills: 2, collections: 0 },
    city_living: { careers: 6, skills: 1, collections: 2 },
    cats_dogs: { careers: 2, skills: 1, collections: 2 },
    seasons: { careers: 0, skills: 1, collections: 1 },
    get_famous: { careers: 2, skills: 2, collections: 0 },
    island_living: { careers: 2, skills: 0, collections: 2 },
    discover_university: { careers: 6, skills: 2, collections: 1 },
    eco_lifestyle: { careers: 2, skills: 2, collections: 2 },
    snowy_escape: { careers: 2, skills: 3, collections: 1 },
    cottage_living: { careers: 0, skills: 1, collections: 2 },
    high_school_years: { careers: 0, skills: 0, collections: 1 },
    growing_together: { careers: 0, skills: 0, collections: 0 },
    horse_ranch: { careers: 0, skills: 2, collections: 1 },
    for_rent: { careers: 0, skills: 0, collections: 0 },
    lovestruck: { careers: 0, skills: 0, collections: 0 },
    life_death: { careers: 2, skills: 1, collections: 1 }
  }

  selectedPacks.forEach(packKey => {
    const contribution = packContributions[packKey as keyof typeof packContributions]
    if (contribution) {
      totalCareers += contribution.careers
      totalSkills += contribution.skills
      totalCollections += contribution.collections
    }
  })

  // Calculate potential points based on Legacy Challenge scoring
  const careerPoints = Math.min(Math.floor(totalCareers / 3), 10) // ~3 careers per point, max 10
  const skillPoints = Math.min(Math.floor(totalSkills / 5), 10) // ~5 skills per point, max 10  
  const collectionPoints = Math.min(Math.floor(totalCollections / 2), 10) // ~2 collections per point, max 10
  const knowledgeSubtotal = careerPoints + skillPoints + collectionPoints

  return {
    careers: totalCareers,
    skills: totalSkills,
    collections: totalCollections,
    estimatedPoints: {
      knowledge: Math.min(knowledgeSubtotal, 20), // Knowledge category max 20 points
      total: 60 + Math.min(knowledgeSubtotal, 20) // Base 60 + knowledge category
    }
  }
}

function SummaryStep({ data, onSubmit, onBack, loading }: SummaryStepProps) {
  const template = challengeTemplates.find(t => t.value === data.basicInfo?.challenge_type)
  const isLegacyChallenge = data.basicInfo?.challenge_type === 'legacy'

  // Calculate Legacy scoring if applicable
  const selectedPacks = data.expansionPacks ?
    Object.entries(data.expansionPacks)
      .filter(([key, value]) => key !== 'base_game' && value === true)
      .map(([key]) => key) : []

  const legacyScoring = isLegacyChallenge ? calculateLegacyScoring(selectedPacks) : null

  const handleSubmit = () => {
    onSubmit(data)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Review Your Challenge</h2>

        {/* Basic Info Summary */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Challenge Details</h3>
          <div className="space-y-2">
            <div><span className="font-medium">Template:</span> {template?.label}</div>
            <div><span className="font-medium">Name:</span> {data.basicInfo?.name}</div>
            {data.basicInfo?.description && (
              <div><span className="font-medium">Description:</span> {data.basicInfo.description}</div>
            )}
          </div>
        </div>

        {/* Legacy Configuration Summary */}
        {data.configuration && isLegacyChallenge && (
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Legacy Configuration</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="mb-2">
                  <span className="font-medium">Starting Difficulty:</span>{' '}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${(data.configuration as any).start_type === 'ultra_extreme' ? 'bg-red-100 text-red-800' :
                      (data.configuration as any).start_type === 'extreme' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                    }`}>
                    {((data.configuration as any).start_type || 'regular').replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                  </span>
                  {(data.configuration as any).start_type === 'extreme' && (
                    <span className="ml-2 text-xs text-blue-600">+1 bonus point</span>
                  )}
                  {(data.configuration as any).start_type === 'ultra_extreme' && (
                    <span className="ml-2 text-xs text-blue-600">+2 bonus points</span>
                  )}
                </div>
              </div>
              <div>
                <div><span className="font-medium">Gender Law:</span> {((data.configuration as any).gender_law || '').replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}</div>
                <div><span className="font-medium">Bloodline Law:</span> {((data.configuration as any).bloodline_law || '').replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}</div>
                <div><span className="font-medium">Heir Selection:</span> {((data.configuration as any).heir_selection || '').replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}</div>
                <div><span className="font-medium">Species Rule:</span> {((data.configuration as any).species_rule || '').replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}</div>
              </div>
            </div>
          </div>
        )}

        {/* Expansion Packs Summary */}
        {data.expansionPacks && (
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Your Expansion Packs</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-sims-green text-white">
                Base Game
              </span>
              {ExpansionPacks
                .filter(pack => data.expansionPacks?.[pack.key as keyof ExpansionPackData])
                .map(pack => (
                  <span key={pack.key} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {pack.name}
                  </span>
                ))}
            </div>

            {/* Legacy Scoring Impact */}
            {isLegacyChallenge && legacyScoring && (
              <div className="border-t border-gray-200 pt-3">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Legacy Challenge Scoring Potential</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                  <div className="text-center p-3 bg-white rounded border">
                    <div className="text-lg font-semibold text-gray-900">{legacyScoring.careers}</div>
                    <div className="text-xs text-gray-500">Careers Available</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded border">
                    <div className="text-lg font-semibold text-gray-900">{legacyScoring.skills}</div>
                    <div className="text-xs text-gray-500">Skills Available</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded border">
                    <div className="text-lg font-semibold text-gray-900">{legacyScoring.collections}</div>
                    <div className="text-xs text-gray-500">Collections Available</div>
                  </div>
                  <div className="text-center p-3 bg-sims-green text-white rounded">
                    <div className="text-lg font-semibold">~{legacyScoring.estimatedPoints.total}/100</div>
                    <div className="text-xs opacity-90">Est. Max Points</div>
                  </div>
                </div>

                <div className="text-xs text-gray-600">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <div>
                      <span className="font-medium">Knowledge Category:</span> ~{legacyScoring.estimatedPoints.knowledge}/20 points
                    </div>
                    <div>
                      <span className="font-medium">Other Categories:</span> ~60/80 points (Family, Fortune, Creative, Love, Athletic)
                    </div>
                    <div>
                      <span className="font-medium">Note:</span> Actual scoring depends on gameplay achievements
                    </div>
                  </div>
                </div>

                {selectedPacks.length === 0 && (
                  <div className="mt-3 p-3 bg-yellow-50 rounded border border-yellow-200">
                    <p className="text-sm text-yellow-800">
                      <span className="font-medium">Base game only:</span> You'll have access to limited scoring opportunities.
                      Consider expansion packs to unlock more careers, skills, and collections!
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Legacy Challenge Tips */}
        {isLegacyChallenge && (
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-blue-900 mb-2">Ready to Begin Your Legacy!</h3>
            <div className="text-sm text-blue-700 space-y-1">
              <p><span className="font-medium">Setup:</span> Follow the starting instructions for your chosen difficulty level</p>
              <p><span className="font-medium">Tracking:</span> Use the Legacy tracker to monitor your progress across all 6 scoring categories</p>
              <p><span className="font-medium">Goal:</span> Build a successful family legacy across 10 generations while maximizing your score</p>
              {(data.configuration as any)?.start_type !== 'regular' && (
                <p><span className="font-medium">Bonus:</span> Complete your chosen difficulty for extra points toward your final score</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? 'Creating Challenge...' : 'Create Challenge'}
        </Button>
      </div>
    </div>
  )
}

// ===== MAIN WIZARD COMPONENT =====
interface ChallengeWizardProps {
  onSubmit: (data: Partial<Challenge>) => void | Promise<void>
  onCancel: () => void
  loading?: boolean
}

export function ChallengeWizard({ onSubmit, onCancel, loading }: ChallengeWizardProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [wizardData, setWizardData] = useState<WizardData>({})
  const { preferences, fetchPreferences } = useUserPreferencesStore()

  // Load user preferences when wizard mounts
  useEffect(() => {
    fetchPreferences()
  }, [fetchPreferences])

  // Determine which steps to show based on challenge type
  const getSteps = () => {
    const template = challengeTemplates.find(t => t.value === wizardData.basicInfo?.challenge_type)
    const needsConfig = template?.needsConfiguration || false

    if (needsConfig) {
      return [
        { number: 1, name: 'Challenge Details', step: 1 },
        { number: 2, name: 'Configuration', step: 2 },
        { number: 3, name: 'Expansion Packs', step: 3 },
        { number: 4, name: 'Review', step: 4 },
      ]
    } else {
      return [
        { number: 1, name: 'Challenge Details', step: 1 },
        { number: 2, name: 'Expansion Packs', step: 3 },
        { number: 3, name: 'Review', step: 4 },
      ]
    }
  }

  const steps = getSteps()

  const getCurrentStepInfo = () => {
    return steps.find(step => step.step === currentStep) || steps[0]
  }

  const getCurrentStepIndex = () => {
    return steps.findIndex(step => step.step === currentStep)
  }

  // Determine if configuration step should be skipped
  const needsConfiguration = () => {
    const template = challengeTemplates.find(t => t.value === wizardData.basicInfo?.challenge_type)
    return template?.needsConfiguration || false
  }

  const handleBasicInfoNext = (data: BasicInfoData) => {
    setWizardData(prev => ({ ...prev, basicInfo: data }))

    // Skip configuration step if not needed
    if (!challengeTemplates.find(t => t.value === data.challenge_type)?.needsConfiguration) {
      setCurrentStep(3) // Go directly to expansion packs
    } else {
      setCurrentStep(2) // Go to configuration
    }
  }

  const handleConfigurationNext = (data: any) => {
    setWizardData(prev => ({ ...prev, configuration: data }))
    setCurrentStep(3)
  }

  const handleExpansionPackNext = (data: ExpansionPackData) => {
    setWizardData(prev => ({ ...prev, expansionPacks: data }))
    setCurrentStep(4)
  }

  // Auto-populate expansion pack data from user preferences if not already set
  const getExpansionPackData = () => {
    if (wizardData.expansionPacks) {
      return wizardData.expansionPacks
    }

    if (preferences?.expansion_packs) {
      return preferences.expansion_packs as ExpansionPackData
    }

    return undefined
  }

  const handleFinalSubmit = async (data: WizardData) => {
    // Transform wizard data into challenge format
    const challengeData: Partial<Challenge> = {
      name: data.basicInfo!.name,
      description: data.basicInfo?.description,
      challenge_type: data.basicInfo!.challenge_type,
      configuration: data.configuration || null,
    }

    await onSubmit(challengeData)
  }

  const goBack = () => {
    if (currentStep === 3 && !needsConfiguration()) {
      setCurrentStep(1) // Skip configuration step when going back
    } else if (currentStep === 4 && !needsConfiguration()) {
      setCurrentStep(3) // From review to expansion packs if no config
    } else {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <div className="space-y-8">
      {/* Progress Steps */}
      <nav aria-label="Progress">
        <ol className="flex items-center justify-between">
          {steps.map((step, stepIdx) => {
            const currentIndex = getCurrentStepIndex()
            const isComplete = stepIdx < currentIndex
            const isCurrent = stepIdx === currentIndex

            return (
              <li key={step.name} className="relative flex-1">
                {/* Connector line */}
                {stepIdx !== steps.length - 1 && (
                  <div className="absolute top-4 left-1/2 w-full h-0.5 bg-gray-200">
                    <div
                      className={`h-full transition-all duration-300 ${isComplete ? 'bg-sims-green w-full' : 'bg-gray-200 w-0'
                        }`}
                    />
                  </div>
                )}

                {/* Step circle and label */}
                <div className="relative flex flex-col items-center">
                  <div className={`
                    w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 bg-white z-10
                    ${isComplete
                      ? 'border-sims-green bg-sims-green'
                      : isCurrent
                        ? 'border-sims-green bg-white'
                        : 'border-gray-300 bg-white'
                    }
                  `}>
                    {isComplete ? (
                      <svg className="w-4 h-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <span className={`text-sm font-medium ${isCurrent ? 'text-sims-green' : 'text-gray-500'
                        }`}>
                        {step.number}
                      </span>
                    )}
                  </div>
                  <span className={`mt-2 text-xs font-medium text-center ${isCurrent ? 'text-sims-green' : isComplete ? 'text-gray-700' : 'text-gray-500'
                    }`}>
                    {step.name}
                  </span>
                </div>
              </li>
            )
          })}
        </ol>
      </nav>

      {/* Step Content */}
      <div className="mt-8">
        {currentStep === 1 && (
          <BasicInfoStep
            data={wizardData.basicInfo}
            onNext={handleBasicInfoNext}
            onCancel={onCancel}
          />
        )}

        {currentStep === 2 && (
          <ConfigurationStep
            challengeType={wizardData.basicInfo?.challenge_type || ''}
            data={wizardData.configuration}
            onNext={handleConfigurationNext}
            onBack={goBack}
          />
        )}

        {currentStep === 3 && (
          <ExpansionPackStep
            data={getExpansionPackData()}
            onNext={handleExpansionPackNext}
            onBack={goBack}
            isLegacyChallenge={wizardData.basicInfo?.challenge_type === 'legacy'}
          />
        )}

        {currentStep === 4 && (
          <SummaryStep
            data={wizardData}
            onSubmit={handleFinalSubmit}
            onBack={goBack}
            loading={loading}
          />
        )}
      </div>
    </div>
  )
}