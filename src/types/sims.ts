'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/src/components/ui/Button'
import { Input } from '@/src/components/ui/Input'
import { Textarea } from '@/src/components/ui/Textarea'
import { Card, CardHeader, CardTitle, CardContent } from '@/src/components/ui/Card'
import { PackIcon } from '@/src/components/ui/PackIcon'
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/src/components/ui/Collapsible'
import { Database } from '@/src/types/database.types'
import { useUserPreferencesStore } from '@/src/lib/store/userPreferencesStore'
import { PackDef, PACKS } from '@/src/components/profile/Packs'
import { ErrorMessage } from '../ui/ErrorMessage'
import { FormField } from '../ui/FormField'

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
    description: 'Create your own unique challenge with custom rules',
    icon: '🎯',
    needsConfiguration: false
  },
  {
    value: 'legacy',
    label: 'Legacy Challenge',
    description: '10 generations with specific scoring rules and restrictions',
    icon: '👑',
    needsConfiguration: true
  },
  {
    value: 'not_so_berry',
    label: 'Not So Berry',
    description: 'Colorful legacy with unique goals per generation',
    icon: '🌈',
    needsConfiguration: false
  },
  {
    value: '100_baby',
    label: '100 Baby Challenge',
    description: 'Have 100 babies with one matriarch',
    icon: '👶',
    needsConfiguration: false
  },
]

// ===== LEGACY CONFIGURATION DATA =====
const startingOptions = [
  {
    value: 'regular',
    label: 'Regular Start',
    description: 'Start with $1,800 on 50x50 lot',
    detail: 'Classic Legacy experience with standard starting funds',
    difficulty: 'Easy',
    bonus: 0
  },
  {
    value: 'extreme',
    label: 'Extreme Start',
    description: 'Start with $0 on 64x64 lot in winter',
    detail: 'No starting funds, larger lot, harsh weather conditions',
    difficulty: 'Hard',
    bonus: 1
  },
  {
    value: 'ultra_extreme',
    label: 'Ultra Extreme Start',
    description: 'Start with $0 and $35k debt to repay',
    detail: 'No funds plus significant debt burden to overcome',
    difficulty: 'Expert',
    bonus: 2
  }
]

const legacyRules = {
  genderLaw: [
    { value: 'strict_traditional', label: 'Strict Traditional', desc: 'Heir must be eldest male child' },
    { value: 'traditional', label: 'Traditional', desc: 'Heir must be male (any age)' },
    { value: 'matriarchy', label: 'Matriarchy', desc: 'Heir must be female (any age)' },
    { value: 'patriarchy', label: 'Patriarchy', desc: 'Heir must be male (any age)' },
    { value: 'equality', label: 'Equality', desc: 'Heir can be any gender' },
    { value: 'strict_equality', label: 'Strict Equality', desc: 'Heir must be eldest child regardless of gender' },
  ],
  bloodlineLaw: [
    { value: 'strict_traditional', label: 'Strict Traditional', desc: 'Only natural/science babies eligible' },
    { value: 'traditional', label: 'Traditional', desc: 'Natural/science babies preferred, adopted if no alternatives' },
    { value: 'modern', label: 'Modern', desc: 'All children types eligible' },
    { value: 'foster', label: 'Foster', desc: 'Adopted children preferred' },
    { value: 'strict_foster', label: 'Strict Foster', desc: 'Only adopted children eligible' },
  ],
  heirSelection: [
    { value: 'first_born', label: 'First Born', desc: 'Oldest eligible child inherits' },
    { value: 'last_born', label: 'Last Born', desc: 'Youngest eligible child inherits' },
    { value: 'random', label: 'Random', desc: 'Random eligible child inherits' },
    { value: 'exemplar', label: 'Exemplar', desc: 'Child with highest skills inherits' },
    { value: 'strength', label: 'Strength', desc: 'Child with highest fitness/logic inherits' },
  ],
  speciesRule: [
    { value: 'human_only', label: 'Humans Only', desc: 'No occult sims allowed in family' },
    { value: 'occult_allowed', label: 'Occult Allowed', desc: 'Occult sims are permitted' },
    { value: 'occult_preferred', label: 'Occult Preferred', desc: 'Prefer occult heirs when possible' },
  ],
  lifespan: [
    { value: 'short', label: 'Short Lifespan', desc: 'Fast-paced gameplay' },
    { value: 'normal', label: 'Normal Lifespan', desc: 'Default game setting' },
    { value: 'long', label: 'Long Lifespan', desc: 'Extended gameplay experience' },
  ]
}

// ===== STEP 1: BASIC INFO =====
interface BasicInfoStepProps {
  data: BasicInfoData | undefined
  onNext: (data: BasicInfoData) => void
  onCancel: () => void
}

function BasicInfoStep({ data, onNext, onCancel }: BasicInfoStepProps) {
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
  const description = watch('description')

  const onSubmit = (formData: BasicInfoData) => {
    onNext(formData)
  }

  return (
    <form onSubmit= { handleSubmit(onSubmit) } className = "space-y-6" >
      <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-6" > Choose Your Challenge </h2>

  {/* Template Selection */ }
  <FormField label="Challenge Template" className = "mb-6" >
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4" >
    {
      challengeTemplates.map((template) => (
        <label
                key= { template.value }
                className = {`relative flex cursor-pointer rounded-2xl border-2 p-6 transition-all hover:shadow-md ${templateType === template.value
          ? 'border-brand-500 bg-brand-500/5 shadow-lg'
          : 'border-gray-200 hover:border-gray-300'
          }`}
      >
      <input
                  type="radio"
  {...register('challenge_type') }
  value = { template.value }
  className = "sr-only"
    />
    <div className="flex items-start space-x-4 w-full" >
      <div className="text-3xl" > { template.icon } </div>
        < div className = "flex-1" >
          <div className="font-semibold text-gray-900 mb-1" > { template.label } </div>
            < div className = "text-sm text-gray-600" > { template.description } </div>
              </div>
  {
    templateType === template.value && (
      <svg className="h-6 w-6 text-brand-500 flex-shrink-0" fill = "currentColor" viewBox = "0 0 20 20" >
        <path fillRule="evenodd" d = "M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule = "evenodd" />
          </svg>
                  )
  }
  </div>
    </label>
            ))
}
</div>
  </FormField>

{/* Challenge Name */ }
<FormField label="Challenge Name" error = { errors.name?.message } required className = "mb-4" >
  <Input
            { ...register('name') }
placeholder = {
  templateType === 'legacy'
  ? 'The Smith Legacy'
  : templateType === 'not_so_berry'
    ? 'My Not So Berry Challenge'
    : templateType === '100_baby'
      ? 'The 100 Baby Challenge'
      : 'My Custom Challenge'
            }
          />
  </FormField>

{/* Description */ }
<FormField 
          label="Description (Optional)"
error = { errors.description?.message }
description = {`${description?.length || 0}/500 characters`}
        >
  <Textarea
            { ...register('description') }
rows = { 3}
placeholder = "Describe your challenge goals, rules, or story..."
  />
  </FormField>
  </div>

{/* Navigation */ }
<div className="flex justify-between pt-6" >
  <Button variant="outline" onClick = { onCancel } >
    Cancel
    </Button>
    < Button variant = "primary" >
      Next: { challengeTemplates.find(t => t.value === templateType)?.needsConfiguration ? 'Configuration' : 'Expansion Packs' }
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

export function LegacyConfigurationStep({ challengeType, data, onNext, onBack }: ConfigurationStepProps) {
  if (challengeType === 'legacy') {
    return <LegacyConfigurationStep data={ data as LegacyConfigData } onNext = { onNext } onBack = { onBack } />
  }
  return null
}

export function LegacyConfigurationStep({
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

  const watchedValues = watch()

  const onSubmit = (formData: LegacyConfigData) => {
    onNext(formData)
  }

  return (
    <form onSubmit= { handleSubmit(onSubmit) } className = "space-y-6" >
      <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-6" > Legacy Challenge Configuration </h2>

  {/* Starting Difficulty */ }
  <Card className="mb-6" >
    <CardHeader>
    <CardTitle>Starting Difficulty </CardTitle>
      </CardHeader>
      < CardContent >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" >
      {
        startingOptions.map((option) => (
          <label
                  key= { option.value }
                  className = {`p-4 border-2 rounded-xl cursor-pointer transition-all ${watchedValues.start_type === option.value
            ? 'border-brand-500 bg-brand-500/5'
            : 'border-gray-200 hover:border-gray-300'
            }`}
        >
        <input
                    type="radio"
  {...register('start_type') }
  value = { option.value }
  className = "sr-only"
    />
    <div className="text-center" >
      <div className="font-semibold text-gray-900 mb-1" > { option.label } </div>
        < div className = {`inline-block px-2 py-1 rounded-full text-xs font-medium mb-2 ${option.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
          option.difficulty === 'Hard' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`
}>
  { option.difficulty }
  </div>
  < div className = "text-sm text-gray-600 mb-2" > { option.description } </div>
    < div className = "text-xs text-gray-500" > { option.detail } </div>
{
  option.bonus > 0 && (
    <div className="text-xs text-brand-600 font-medium mt-2" >
      +{ option.bonus } bonus point{ option.bonus > 1 ? 's' : '' }
  </div>
                    )
}
</div>
  </label>
              ))}
</div>
  </CardContent>
  </Card>

{/* Succession Rules */ }
<Card>
  <CardHeader>
  <CardTitle>Succession Rules </CardTitle>
    </CardHeader>
    < CardContent className = "space-y-6" >

      {/* Gender Law */ }
      < Collapsible defaultOpen >
        <CollapsibleTrigger className="text-base font-medium" >
          Gender Law
            </CollapsibleTrigger>
            < CollapsibleContent >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3" >
            {
              legacyRules.genderLaw.map((law) => (
                <label key= { law.value } className = {`p-3 border rounded-xl cursor-pointer transition-all ${watchedValues.gender_law === law.value ? 'border-brand-500 bg-brand-500/5' : 'border-gray-200 hover:border-gray-300'
                  }`} >
              <input
                        type="radio"
{...register('gender_law') }
value = { law.value }
className = "sr-only"
  />
  <div className="font-medium text-gray-900 mb-1" > { law.label } </div>
    < div className = "text-sm text-gray-600" > { law.desc } </div>
      </label>
                  ))}
</div>
  </CollapsibleContent>
  </Collapsible>

{/* Bloodline Law */ }
<Collapsible>
  <CollapsibleTrigger className="text-base font-medium" >
    Bloodline Law
      </CollapsibleTrigger>
      < CollapsibleContent >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3" >
      {
        legacyRules.bloodlineLaw.map((law) => (
          <label key= { law.value } className = {`p-3 border rounded-xl cursor-pointer transition-all ${watchedValues.bloodline_law === law.value ? 'border-brand-500 bg-brand-500/5' : 'border-gray-200 hover:border-gray-300'
            }`} >
        <input
                        type="radio"
{...register('bloodline_law') }
value = { law.value }
className = "sr-only"
  />
  <div className="font-medium text-gray-900 mb-1" > { law.label } </div>
    < div className = "text-sm text-gray-600" > { law.desc } </div>
      </label>
                  ))}
</div>
  </CollapsibleContent>
  </Collapsible>

{/* Heir Selection */ }
<Collapsible>
  <CollapsibleTrigger className="text-base font-medium" >
    Heir Selection Method
      </CollapsibleTrigger>
      < CollapsibleContent >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3" >
      {
        legacyRules.heirSelection.map((method) => (
          <label key= { method.value } className = {`p-3 border rounded-xl cursor-pointer transition-all ${watchedValues.heir_selection === method.value ? 'border-brand-500 bg-brand-500/5' : 'border-gray-200 hover:border-gray-300'
            }`} >
        <input
                        type="radio"
{...register('heir_selection') }
value = { method.value }
className = "sr-only"
  />
  <div className="font-medium text-gray-900 mb-1" > { method.label } </div>
    < div className = "text-sm text-gray-600" > { method.desc } </div>
      </label>
                  ))}
</div>
  </CollapsibleContent>
  </Collapsible>

{/* Species Rule */ }
<Collapsible>
  <CollapsibleTrigger className="text-base font-medium" >
    Species Rule
      </CollapsibleTrigger>
      < CollapsibleContent >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3" >
      {
        legacyRules.speciesRule.map((rule) => (
          <label key= { rule.value } className = {`p-3 border rounded-xl cursor-pointer transition-all ${watchedValues.species_rule === rule.value ? 'border-brand-500 bg-brand-500/5' : 'border-gray-200 hover:border-gray-300'
            }`} >
        <input
                        type="radio"
{...register('species_rule') }
value = { rule.value }
className = "sr-only"
  />
  <div className="font-medium text-gray-900 mb-1" > { rule.label } </div>
    < div className = "text-sm text-gray-600" > { rule.desc } </div>
      </label>
                  ))}
</div>
  </CollapsibleContent>
  </Collapsible>

{/* Lifespan */ }
<Collapsible>
  <CollapsibleTrigger className="text-base font-medium" >
    Lifespan Setting
      </CollapsibleTrigger>
      < CollapsibleContent >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3" >
      {
        legacyRules.lifespan.map((lifespan) => (
          <label key= { lifespan.value } className = {`p-3 border rounded-xl cursor-pointer transition-all ${watchedValues.lifespan === lifespan.value ? 'border-brand-500 bg-brand-500/5' : 'border-gray-200 hover:border-gray-300'
            }`} >
        <input
                        type="radio"
{...register('lifespan') }
value = { lifespan.value }
className = "sr-only"
  />
  <div className="font-medium text-gray-900 mb-1" > { lifespan.label } </div>
    < div className = "text-sm text-gray-600" > { lifespan.desc } </div>
      </label>
                  ))}
</div>
  </CollapsibleContent>
  </Collapsible>

  </CardContent>
  </Card>
  </div>

{/* Navigation */ }
<div className="flex justify-between pt-6" >
  <Button variant="outline" onClick = { onBack } >
    Back
    </Button>
    < Button variant = "primary" >
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

  useEffect(() => {
    fetchPreferences()
  }, [fetchPreferences])

  const {
    register,
    handleSubmit,
    reset,
    watch,
  } = useForm<ExpansionPackData>({
    resolver: zodResolver(expansionPackSchema),
    defaultValues: {
      base_game: true,
      ...data,
    },
  })

  useEffect(() => {
    if (preferences?.expansion_packs && !data) {
      reset({
        ...preferences.expansion_packs,
        base_game: true,
      })
    }
  }, [preferences, data, reset])

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
      await updateExpansionPacks(formData)
      onNext(formData)
    } catch (error) {
      console.error('Failed to save expansion pack preferences:', error)
      onNext(formData)
    }
  }

  if (preferencesLoading) {
    return (
      <div className= "space-y-6" >
      <h2 className="text-xl font-semibold text-gray-900 mb-4" > Your Expansion Packs </h2>
        < div className = "flex items-center justify-center py-12" >
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500" > </div>
            < span className = "ml-3 text-gray-600" > Loading your preferences...</span>
              </div>
              </div>
    )
  }

  return (
    <form onSubmit= { handleSubmit(onSubmit) } className = "space-y-6" >
      <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-6" > Your Expansion Packs </h2>

  {
    isLegacyChallenge && scoringInfo && (
      <Card className="mb-6" >
        <CardHeader>
        <CardTitle className="flex items-center gap-2" >
          <span>📊</span>
                Legacy Challenge Scoring Impact
      </CardTitle>
      </CardHeader>
      < CardContent >
      <p className="text-sm text-gray-600 mb-4" >
        Different expansion packs unlock careers, skills, and collections that contribute to your Legacy Challenge score.
              </p>
          < div className = "grid grid-cols-2 md:grid-cols-4 gap-4" >
            <div className="text-center p-3 bg-gray-50 rounded-xl" >
              <div className="text-2xl font-bold text-gray-900" > { scoringInfo.careers } </div>
                < div className = "text-sm text-gray-600" > Careers Available </div>
                  </div>
                  < div className = "text-center p-3 bg-gray-50 rounded-xl" >
                    <div className="text-2xl font-bold text-gray-900" > { scoringInfo.skills } </div>
                      < div className = "text-sm text-gray-600" > Skills Available </div>
                        </div>
                        < div className = "text-center p-3 bg-gray-50 rounded-xl" >
                          <div className="text-2xl font-bold text-gray-900" > { scoringInfo.collections } </div>
                            < div className = "text-sm text-gray-600" > Collections Available </div>
                              </div>
                              < div className = "text-center p-3 bg-brand-500 text-white rounded-xl" >
                                <div className="text-2xl font-bold" > ~{ scoringInfo.estimatedPoints.total } / 100 </div>
                                  < div className = "text-sm opacity-90" > Est.Max Points </div>
                                    </div>
                                    </div>
                                    </CardContent>
                                    </Card>
        )
  }

  {/* Base Game */ }
  <Card className="mb-6" >
    <CardContent className="p-4" >
      <label className="flex items-center space-x-3" >
        <input
                type="checkbox"
  checked = { true}
  disabled
  className = "h-5 w-5 text-brand-500 border-gray-300 rounded"
    />
    <PackIcon packKey="base_game" size = "md" />
      <div className="flex-1" >
        <span className="font-medium text-gray-900" > The Sims 4(Base Game) </span>
  {
    isLegacyChallenge && (
      <div className="text-sm text-gray-500" >
        23 careers • 15 skills • 13 collections
          </div>
                )
  }
  </div>
    </label>
    </CardContent>
    </Card>

  {/* Expansion Packs */ }
  <Card>
    <CardHeader>
    <CardTitle>Expansion Packs </CardTitle>
      </CardHeader>
      < CardContent >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3" >
      {
        PACKS.map((pack: PackDef) => (
          <label 
                  key= { pack.key } 
                  className = "flex items-center space-x-3 p-3 rounded-xl border hover:bg-gray-50 cursor-pointer transition-colors"
          >
          <input
                    type="checkbox"
                    { ...register(pack.key as keyof ExpansionPackData) }
                    className = "h-5 w-5 text-brand-500 border-gray-300 rounded"
          />
          <PackIcon packKey={ pack.key } size = "md" />
          <div className="flex-1 min-w-0" >
        <div className="flex items-center justify-between" >
        <span className="font-medium text-gray-900" > { pack.name } </span>
        < span className = "text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded" >
        { pack.category }
        </span>
        </div>
        </div>
        </label>
        ))
      }
        </div>
        </CardContent>
        </Card>

  {
    isLegacyChallenge && selectedPacks.length === 0 && (
      <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl" >
        <div className="flex items-start gap-3" >
          <span className="text-amber-500" >⚠️</span>
            < div >
            <p className="font-medium text-amber-800" > Base Game Only </p>
              < p className = "text-sm text-amber-700" >
                You'll be able to earn approximately 60-70 out of 100 possible Legacy Challenge points. 
                  Consider adding expansion packs to unlock more scoring opportunities!
      </p>
      </div>
      </div>
      </div>
        )
  }
  </div>

  {/* Navigation */ }
  <div className="flex justify-between pt-6" >
    <Button variant="outline" onClick = { onBack } >
      Back
      </Button>
      < Button variant = "primary" >
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

function calculateLegacyScoring(selectedPacks: string[]) {
  let totalCareers = 23
  let totalSkills = 15
  let totalCollections = 13

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

  const careerPoints = Math.min(Math.floor(totalCareers / 3), 10)
  const skillPoints = Math.min(Math.floor(totalSkills / 5), 10)
  const collectionPoints = Math.min(Math.floor(totalCollections / 2), 10)
  const knowledgeSubtotal = careerPoints + skillPoints + collectionPoints

  return {
    careers: totalCareers,
    skills: totalSkills,
    collections: totalCollections,
    estimatedPoints: {
      knowledge: Math.min(knowledgeSubtotal, 20),
      total: 60 + Math.min(knowledgeSubtotal, 20)
    }
  }
}

function SummaryStep({ data, onSubmit, onBack, loading }: SummaryStepProps) {
  const template = challengeTemplates.find(t => t.value === data.basicInfo?.challenge_type)
  const isLegacyChallenge = data.basicInfo?.challenge_type === 'legacy'

  const selectedPacks = data.expansionPacks ?
    Object.entries(data.expansionPacks)
      .filter(([key, value]) => key !== 'base_game' && value === true)
      .map(([key]) => key) : []

  const legacyScoring = isLegacyChallenge ? calculateLegacyScoring(selectedPacks) : null

  const handleSubmit = () => {
    onSubmit(data)
  }

  const formatConfigValue = (value: string) => {
    return value.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
  }

  return (
    <div className= "space-y-6" >
    <h2 className="text-xl font-semibold text-gray-900 mb-6" > Review Your Challenge </h2>

  {/* Challenge Details */ }
  <Card>
    <CardHeader>
    <CardTitle className="flex items-center gap-3" >
      <span className="text-2xl" > { template?.icon } </span>
            Challenge Details
    </CardTitle>
    </CardHeader>
    < CardContent >
    <dl className="grid grid-cols-1 md:grid-cols-2 gap-6" >
      <div>
      <dt className="text-sm font-medium text-gray-500" > Template </dt>
        < dd className = "text-lg font-semibold text-gray-900" > { template?.label } </dd>
          </div>
          < div >
          <dt className="text-sm font-medium text-gray-500" > Name </dt>
            < dd className = "text-lg font-semibold text-gray-900" > { data.basicInfo?.name } </dd>
              </div>
  {
    data.basicInfo?.description && (
      <div className="md:col-span-2" >
        <dt className="text-sm font-medium text-gray-500" > Description </dt>
          < dd className = "text-gray-900 mt-1" > { data.basicInfo.description } </dd>
            </div>
            )
  }
  </dl>
    </CardContent>
    </Card>

  {/* Legacy Configuration */ }
  {
    data.configuration && isLegacyChallenge && (
      <Card>
      <CardHeader>
      <CardTitle className="flex items-center gap-3" >
        <span>⚙️</span>
              Legacy Configuration
      </CardTitle>
      </CardHeader>
      < CardContent >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6" >
        <div>
        <dt className="text-sm font-medium text-gray-500 mb-2" > Starting Difficulty </dt>
          < dd className = "flex items-center gap-2" >
            <span className={
      `px-3 py-1 rounded-full text-sm font-medium ${(data.configuration as any).start_type === 'ultra_extreme' ? 'bg-red-100 text-red-800' :
        (data.configuration as any).start_type === 'extreme' ? 'bg-amber-100 text-amber-800' :
          'bg-green-100 text-green-800'
        }`
    }>
      { formatConfigValue((data.configuration as any).start_type || 'regular')
  }
  </span>
  {
    (data.configuration as any).start_type === 'extreme' && (
      <span className="text-xs text-brand-600 font-medium" > +1 bonus point </span>
                  )
  }
  {
    (data.configuration as any).start_type === 'ultra_extreme' && (
      <span className="text-xs text-brand-600 font-medium" > +2 bonus points </span>
                  )
  }
  </dd>
    </div>

    < div >
    <dt className="text-sm font-medium text-gray-500" > Gender Law </dt>
      < dd className = "text-gray-900" > { formatConfigValue((data.configuration as any).gender_law || '')
} </dd>
  </div>

  < div >
  <dt className="text-sm font-medium text-gray-500" > Bloodline Law </dt>
    < dd className = "text-gray-900" > { formatConfigValue((data.configuration as any).bloodline_law || '')}</dd>
      </div>

      < div >
      <dt className="text-sm font-medium text-gray-500" > Heir Selection </dt>
        < dd className = "text-gray-900" > { formatConfigValue((data.configuration as any).heir_selection || '')}</dd>
          </div>

          < div >
          <dt className="text-sm font-medium text-gray-500" > Species Rule </dt>
            < dd className = "text-gray-900" > { formatConfigValue((data.configuration as any).species_rule || '')}</dd>
              </div>

              < div >
              <dt className="text-sm font-medium text-gray-500" > Lifespan </dt>
                < dd className = "text-gray-900" > { formatConfigValue((data.configuration as any).lifespan || '')}</dd>
                  </div>
                  </div>
                  </CardContent>
                  </Card>
      )}

{/* Expansion Packs */ }
{
  data.expansionPacks && (
    <Card>
    <CardHeader>
    <CardTitle className="flex items-center gap-3" >
      <span>📦</span>
              Your Expansion Packs
    </CardTitle>
    </CardHeader>
    < CardContent >
    <div className="flex flex-wrap gap-3 mb-6" >
      <div className="flex items-center gap-2 px-3 py-2 bg-brand-500 text-white rounded-xl" >
        <PackIcon packKey="base_game" size = "sm" />
          <span className="text-sm font-medium" > Base Game </span>
            </div>
  {
    PACKS
      .filter((pack: PackDef) => data.expansionPacks?.[pack.key as keyof ExpansionPackData])
      .map((pack: PackDef) => (
        <div key= { pack.key } className = "flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-xl" >
        <PackIcon packKey={ pack.key } size = "sm" />
        <span className="text-sm font-medium" > { pack.name } </span>
      </div>
      ))
  }
  </div>

  {/* Legacy Scoring */ }
  {
    isLegacyChallenge && legacyScoring && (
      <div className="border-t pt-6" >
        <h4 className="font-medium text-gray-900 mb-4" > Legacy Challenge Scoring Potential </h4>
          < div className = "grid grid-cols-2 md:grid-cols-4 gap-4 mb-4" >
            <div className="text-center p-3 bg-gray-50 rounded-xl" >
              <div className="text-xl font-bold text-gray-900" > { legacyScoring.careers } </div>
                < div className = "text-xs text-gray-500" > Careers Available </div>
                  </div>
                  < div className = "text-center p-3 bg-gray-50 rounded-xl" >
                    <div className="text-xl font-bold text-gray-900" > { legacyScoring.skills } </div>
                      < div className = "text-xs text-gray-500" > Skills Available </div>
                        </div>
                        < div className = "text-center p-3 bg-gray-50 rounded-xl" >
                          <div className="text-xl font-bold text-gray-900" > { legacyScoring.collections } </div>
                            < div className = "text-xs text-gray-500" > Collections Available </div>
                              </div>
                              < div className = "text-center p-3 bg-brand-500 text-white rounded-xl" >
                                <div className="text-xl font-bold" > ~{ legacyScoring.estimatedPoints.total } / 100 </div>
                                  < div className = "text-xs opacity-90" > Est.Max Points </div>
                                    </div>
                                    </div>

                                    < div className = "text-sm text-gray-600 space-y-1" >
                                      <p>
                                      <span className="font-medium" > Knowledge Category: </span> ~{legacyScoring.estimatedPoints.knowledge}/20 points
                                        </p>
                                        < p >
                                        <span className="font-medium" > Other Categories: </span> ~60/80 points(Family, Fortune, Creative, Love, Athletic)
                                          </p>
                                          < p className = "text-xs" >
                                            <span className="font-medium" > Note: </span> Actual scoring depends on gameplay achievements
                                              </p>
                                              </div>
                                              </div>
            )
  }
  </CardContent>
    </Card>
      )
}

{/* Legacy Tips */ }
{
  isLegacyChallenge && (
    <Card className="border-brand-200 bg-brand-50/30" >
      <CardHeader>
      <CardTitle className="flex items-center gap-3 text-brand-700" >
        <span>🎯</span>
              Ready to Begin Your Legacy!
    </CardTitle>
    </CardHeader>
    < CardContent >
    <div className="space-y-2 text-sm text-brand-700" >
      <p><span className="font-medium" > Setup: </span> Follow the starting instructions for your chosen difficulty level</p >
        <p><span className="font-medium" > Tracking: </span> Use the Legacy tracker to monitor your progress across all scoring categories</p >
          <p><span className="font-medium" > Goal: </span> Build a successful family legacy across 10 generations while maximizing your score</p >
            {(data.configuration as any)?.start_type !== 'regular' && (
              <p><span className="font-medium" > Bonus: </span> Complete your chosen difficulty for extra points toward your final score</p >
              )
}
</div>
  </CardContent>
  </Card>
      )}

{/* Navigation */ }
<div className="flex justify-between pt-6" >
  <Button variant="outline" onClick = { onBack } >
    Back
    </Button>
    < Button
onClick = { handleSubmit }
loading = { loading }
loadingText = "Creating Challenge..."
variant = "primary"
  >
  Create Challenge
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

  useEffect(() => {
    fetchPreferences()
  }, [fetchPreferences])

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
  const getCurrentStepIndex = () => steps.findIndex(step => step.step === currentStep)

  const handleBasicInfoNext = (data: BasicInfoData) => {
    setWizardData(prev => ({ ...prev, basicInfo: data }))
    if (!challengeTemplates.find(t => t.value === data.challenge_type)?.needsConfiguration) {
      setCurrentStep(3)
    } else {
      setCurrentStep(2)
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

  const getExpansionPackData = () => {
    if (wizardData.expansionPacks) return wizardData.expansionPacks
    if (preferences?.expansion_packs) return preferences.expansion_packs as ExpansionPackData
    return undefined
  }

  const handleFinalSubmit = async (data: WizardData) => {
    const challengeData: Partial<Challenge> = {
      name: data.basicInfo!.name,
      description: data.basicInfo?.description,
      challenge_type: data.basicInfo!.challenge_type,
      configuration: data.configuration || null,
    }
    await onSubmit(challengeData)
  }

  const goBack = () => {
    const needsConfig = challengeTemplates.find(t => t.value === wizardData.basicInfo?.challenge_type)?.needsConfiguration
    if (currentStep === 3 && !needsConfig) {
      setCurrentStep(1)
    } else if (currentStep === 4 && !needsConfig) {
      setCurrentStep(3)
    } else {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <div className= "space-y-8" >
    {/* Progress Steps */ }
    < nav aria - label="Progress" >
      <ol className="flex items-center justify-between" >
      {
        steps.map((step, stepIdx) => {
          const currentIndex = getCurrentStepIndex()
          const isComplete = stepIdx < currentIndex
          const isCurrent = stepIdx === currentIndex

          return (
            <li key= { step.name } className = "relative flex-1" >
              { stepIdx !== steps.length - 1 && (
                <div className="absolute top-4 left-1/2 w-full h-0.5 bg-gray-200" >
                  <div
                      className={
            `h-full transition-all duration-300 ${isComplete ? 'bg-brand-500 w-full' : 'bg-gray-200 w-0'
              }`
          }
                    />
            </div>
                )
      }

        < div className = "relative flex flex-col items-center" >
          <div className={
    `
                    w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 bg-white z-10
                    ${isComplete
        ? 'border-brand-500 bg-brand-500'
        : isCurrent
          ? 'border-brand-500 bg-white'
          : 'border-gray-300 bg-white'
      }
                  `}>
    {
      isComplete?(
                      <svg className = "w-4 h-4 text-white" viewBox = "0 0 20 20" fill = "currentColor" >
          <path fillRule="evenodd" d = "M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule = "evenodd" />
            </svg>
      ): (
          <span className = {`text-sm font-medium ${isCurrent ?'text-brand-500': 'text-gray-500'
    }`}>
                        {step.number}
                      </span>
                    )}
                  </div>
                  <span className={`mt - 2 text - xs font - medium text - center ${
    isCurrent ? 'text-brand-500' : isComplete ? 'text-gray-700' : 'text-gray-500'
  } `}>
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
          <LegacyConfigurationStep
            challengeType={wizardData.basicInfo?.challenge_type || ''}
            data={wizardData.configuration}
            onNext={handleConfigurationNext}
            onBack={goBack}
          />
        )}

        {currentStep === 3 && (
          <ExpansionStep
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