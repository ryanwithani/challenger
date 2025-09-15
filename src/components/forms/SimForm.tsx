'use client'

import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '@/src/components/ui/Input'
import { Button } from '@/src/components/ui/Button'
import { Database } from '@/src/types/database.types'
import { AvatarUpload } from '@/src/components/sim/AvatarUpload'
import { TraitDef, TRAITS } from '../sim/traitsCatalog'
import TraitTile from '../ui/TraitTile'

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

const ID_TO_LABEL = new Map(TRAITS.map(t => [t.id, t.label]));
const LABEL_TO_ID = new Map(TRAITS.map(t => [t.label, t.id]));

const ageStages = [
  { value: 'baby', label: 'Baby' },
  { value: 'toddler', label: 'Toddler' },
  { value: 'child', label: 'Child' },
  { value: 'teen', label: 'Teen' },
  { value: 'young_adult', label: 'Young Adult' },
  { value: 'adult', label: 'Adult' },
  { value: 'elder', label: 'Elder' },
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


  const onFormSubmit = async (data: SimFormData) => {
    const labelsForDb = selectedTraits.map(id => ID_TO_LABEL.get(id) ?? id);

    await onSubmit({
      ...data,
      challenge_id: challengeId,
      traits: labelsForDb,     // ← DB gets labels
      avatar_url: avatarUrl,
    });
  };

  const groupByCategory = (traits: TraitDef[]) =>
    traits.reduce<Record<string, TraitDef[]>>((acc, t) => {
      (acc[t.category] ||= []).push(t);
      return acc;
    }, {});

  const initialIds =
    (initialData?.traits ?? [])
      .map(lbl => LABEL_TO_ID.get(lbl))
      .filter((v): v is string => Boolean(v));  // drop unknowns

  const [selectedTraits, setSelectedTraits] = useState<string[]>(initialIds);
  setValue('traits', initialIds.map(id => ID_TO_LABEL.get(id) ?? '')); // keep RHF in sync with IDs in the form state

  const toggleTrait = (id: string) => {
    const isSelected = selectedTraits.includes(id);
    let next: string[];

    if (isSelected) {
      next = selectedTraits.filter(t => t !== id);         // always allow unselect
    } else if (selectedTraits.length < maxTraits) {
      next = [...selectedTraits, id];                      // add only if under cap
    } else {
      return;                                              // ignore extra clicks
    }

    setSelectedTraits(next);
    setValue('traits', next); // store IDs in the form while editing
  };;

  const traitsByCat = groupByCategory(TRAITS);

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

          <div className="space-y-5 rounded-lg bg-gray-50 p-3 dark:bg-zinc-900/40">
            {Object.entries(groupByCategory(TRAITS)).map(([category, traits]) => (
              <section key={category}>
                <div className="mb-2">
                  <h4 className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                    {category}
                  </h4>
                </div>

                {/* 3 cols in narrow modals; scale up on wider screens */}
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
                  {traits.map((trait) => {
                    const selected = selectedTraits.includes(trait.id);
                    const atCap = !selected && selectedTraits.length >= maxTraits;

                    return (
                      <TraitTile
                        key={trait.id}
                        trait={trait}
                        selected={selected}
                        disabled={atCap}
                        onToggle={toggleTrait}
                      />
                    );
                  })}
                </div>
              </section>
            ))}
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