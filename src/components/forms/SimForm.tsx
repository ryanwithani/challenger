'use client'

import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '@/src/components/ui/Input'
import { Button } from '@/src/components/ui/Button'
import { Database } from '@/src/types/database.types'
import { AvatarUpload } from '@/src/components/sim/AvatarUpload'

type SimInsert = Database['public']['Tables']['sims']['Insert']

const simSchema = z.object({
  name: z.string().min(1, 'Sim name is required').max(50),
  age_stage: z.enum(['baby', 'toddler', 'child', 'teen', 'young_adult', 'adult', 'elder']),
  generation: z.number().min(1).max(10),
  career: z.string().max(50).optional(),
  aspiration: z.string().max(50).optional(),
  traits: z.array(z.string()).max(5),
  is_heir: z.boolean(),
})

type SimFormData = z.infer<typeof simSchema>

interface SimFormProps {
  challengeId: string
  onSubmit: (data: SimInsert) => void | Promise<void>
  initialData?: Partial<SimFormData & { avatar_url?: string | null, id?: string }>
  currentGeneration?: number
}

const ageStages = [
  { value: 'baby', label: 'Baby' },
  { value: 'toddler', label: 'Toddler' },
  { value: 'child', label: 'Child' },
  { value: 'teen', label: 'Teen' },
  { value: 'young_adult', label: 'Young Adult' },
  { value: 'adult', label: 'Adult' },
  { value: 'elder', label: 'Elder' },
]

const commonTraits = [
  // Emotional
  'Cheerful', 'Gloomy', 'Hot-Headed', 'Romantic', 'Confident',
  // Social
  'Outgoing', 'Loner', 'Mean', 'Good', 'Family-Oriented',
  // Lifestyle
  'Active', 'Lazy', 'Neat', 'Slob', 'Perfectionist',
  // Mental
  'Genius', 'Creative', 'Bookworm', 'Art Lover', 'Music Lover',
  // Hobby
  'Geek', 'Foodie', 'Materialistic', 'Loves Outdoors', 'Cat Lover', 'Dog Lover',
  // Personality
  'Ambitious', 'Childish', 'Clumsy', 'Erratic', 'Goofball',
  'Jealous', 'Kleptomaniac', 'Paranoid', 'Self-Assured', 'Snob',
]

const commonCareers = [
  'Astronaut', 'Athlete', 'Business', 'Criminal', 'Critic',
  'Detective', 'Doctor', 'Entertainer', 'Gardener', 'Painter',
  'Politician', 'Scientist', 'Secret Agent', 'Social Media',
  'Style Influencer', 'Tech Guru', 'Writer', 'Freelancer',
]

const commonAspirations = [
  // Creativity
  'Painter Extraordinaire', 'Musical Genius', 'Bestselling Author', 'Master Actor',
  // Family
  'Successful Lineage', 'Big Happy Family', 'Vampire Family',
  // Fortune
  'Fabulously Wealthy', 'Mansion Baron', 'Renaissance Sim',
  // Love
  'Serial Romantic', 'Soulmate', 'Villainous Valentine',
  // Knowledge
  'Nerd Brain', 'Computer Whiz', 'Master Mixologist',
  // Nature
  'Freelance Botanist', 'The Curator', 'Outdoor Enthusiast',
  // Popularity
  'Friend of the World', 'Party Animal', 'Joke Star',
  // Athletic
  'Bodybuilder', 'Extreme Sports Enthusiast',
]

export function SimForm({
  challengeId,
  onSubmit,
  initialData,
  currentGeneration = 1
}: SimFormProps) {
  const [selectedTraits, setSelectedTraits] = useState<string[]>(
    initialData?.traits || []
  )
  const [showAllTraits, setShowAllTraits] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialData?.avatar_url || null)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    watch,
  } = useForm<SimFormData>({
    resolver: zodResolver(simSchema),
    defaultValues: {
      name: initialData?.name || '',
      age_stage: initialData?.age_stage || 'young_adult',
      generation: initialData?.generation || currentGeneration,
      career: initialData?.career || '',
      aspiration: initialData?.aspiration || '',
      traits: initialData?.traits || [],
      is_heir: initialData?.is_heir || false,
    },
  })

  const ageStage = watch('age_stage')
  const maxTraits = ageStage === 'baby' ? 0 : ageStage === 'toddler' ? 1 : ageStage === 'child' ? 1 : 3

  const toggleTrait = (trait: string) => {
    const newTraits = selectedTraits.includes(trait)
      ? selectedTraits.filter(t => t !== trait)
      : selectedTraits.length < maxTraits
        ? [...selectedTraits, trait]
        : selectedTraits

    setSelectedTraits(newTraits)
    setValue('traits', newTraits)
  }

  const onFormSubmit = async (data: SimFormData) => {
    await onSubmit({
      ...data,
      challenge_id: challengeId,
      traits: selectedTraits,
      avatar_url: avatarUrl,
    })
  }

  const displayedTraits = showAllTraits ? commonTraits : commonTraits.slice(0, 15)

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Sim Name
          </label>
          <Input
            id="name"
            type="text"
            {...register('name')}
            placeholder="Enter Sim's name"
            className={errors.name ? 'border-red-500' : ''}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        {/* Avatar Upload - Only show if editing existing sim */}
        {initialData?.id && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sim Avatar
            </label>
            <AvatarUpload
              simId={initialData.id}
              currentAvatarUrl={avatarUrl}
              onAvatarUpdate={setAvatarUrl}
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="age_stage" className="block text-sm font-medium text-gray-700 mb-1">
              Age Stage
            </label>
            <select
              id="age_stage"
              {...register('age_stage')}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-sims-blue"
            >
              {ageStages.map((age) => (
                <option key={age.value} value={age.value}>
                  {age.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="generation" className="block text-sm font-medium text-gray-700 mb-1">
              Generation
            </label>
            <Input
              id="generation"
              type="number"
              {...register('generation', { valueAsNumber: true })}
              min="1"
              max="10"
              className={errors.generation ? 'border-red-500' : ''}
            />
            {errors.generation && (
              <p className="mt-1 text-sm text-red-600">{errors.generation.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Career and Aspiration */}
      {ageStage !== 'baby' && ageStage !== 'toddler' && ageStage !== 'child' && (
        <div className="space-y-4">
          <div>
            <label htmlFor="career" className="block text-sm font-medium text-gray-700 mb-1">
              Career (Optional)
            </label>
            <Controller
              name="career"
              control={control}
              render={({ field }) => (
                <>
                  <Input
                    {...field}
                    id="career"
                    type="text"
                    placeholder="Choose or type a career"
                    list="career-options"
                  />
                  <datalist id="career-options">
                    {commonCareers.map((career) => (
                      <option key={career} value={career} />
                    ))}
                  </datalist>
                </>
              )}
            />
          </div>

          <div>
            <label htmlFor="aspiration" className="block text-sm font-medium text-gray-700 mb-1">
              Aspiration (Optional)
            </label>
            <Controller
              name="aspiration"
              control={control}
              render={({ field }) => (
                <>
                  <Input
                    {...field}
                    id="aspiration"
                    type="text"
                    placeholder="Choose or type an aspiration"
                    list="aspiration-options"
                  />
                  <datalist id="aspiration-options">
                    {commonAspirations.map((aspiration) => (
                      <option key={aspiration} value={aspiration} />
                    ))}
                  </datalist>
                </>
              )}
            />
          </div>
        </div>
      )}

      {/* Traits */}
      {maxTraits > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Traits (Select up to {maxTraits})
          </label>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="grid grid-cols-3 gap-2">
              {displayedTraits.map((trait) => (
                <button
                  key={trait}
                  type="button"
                  onClick={() => toggleTrait(trait)}
                  className={`px-3 py-1.5 text-sm rounded-full transition-colors ${selectedTraits.includes(trait)
                    ? 'bg-sims-purple text-white'
                    : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-300'
                    }`}
                  disabled={!selectedTraits.includes(trait) && selectedTraits.length >= maxTraits}
                >
                  {trait}
                </button>
              ))}
            </div>
            {!showAllTraits && commonTraits.length > 15 && (
              <button
                type="button"
                onClick={() => setShowAllTraits(true)}
                className="mt-3 text-sm text-sims-blue hover:underline"
              >
                Show all traits ({commonTraits.length})
              </button>
            )}
            {showAllTraits && (
              <button
                type="button"
                onClick={() => setShowAllTraits(false)}
                className="mt-3 text-sm text-sims-blue hover:underline"
              >
                Show fewer traits
              </button>
            )}
          </div>
          <p className="mt-1 text-xs text-gray-500">
            {selectedTraits.length}/{maxTraits} traits selected
          </p>
        </div>
      )}

      {/* Heir Status */}
      <div className="flex items-center">
        <input
          type="checkbox"
          id="is_heir"
          {...register('is_heir')}
          className="h-4 w-4 text-sims-green border-gray-300 rounded focus:ring-sims-green"
        />
        <label htmlFor="is_heir" className="ml-2 text-sm text-gray-700">
          This Sim is the heir for their generation
        </label>
      </div>

      {/* Note about avatar upload for new sims */}
      {!initialData?.id && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-700">
            💡 <strong>Tip:</strong> You can add an avatar after creating the sim by editing their profile.
          </p>
        </div>
      )}

      {/* Submit Button */}
      <Button type="submit" className="w-full">
        {initialData?.id ? 'Update Sim' : 'Add Sim'}
      </Button>
    </form>
  )
}