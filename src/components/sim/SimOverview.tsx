'use client'

import React, { useState } from 'react'
import { InlineEditable } from '@/src/components/forms/InlineEditable'
import { useSimStore } from '@/src/lib/store/simStore'
import { useChallengeStore } from '@/src/lib/store/challengeStore'
import { Button } from '@/src/components/ui/Button'
import TraitPickerModal, { CatalogTrait as Trait } from '@/src/components/sim/TraitPickerModal'
import { Traits } from '@/src/components/sim/TraitsCatalog'
import { AvatarCircle } from '@/src/components/sim/AvatarCircle'
import { SafeText } from '../ui/SafeText'
import { Database } from '@/src/types/database.types'
import {
  TbUser,
  TbFlag,
  TbPhoto,
  TbListDetails,
  TbCrown,
} from 'react-icons/tb'

// ---------- Types ----------
export type AgeStage =
  | 'infant'
  | 'toddler'
  | 'child'
  | 'teen'
  | 'young_adult'
  | 'adult'
  | 'elder'

type Sim = Database['public']['Tables']['sims']['Row']
type Challenge = Database['public']['Tables']['challenges']['Row']

export interface SimOverviewProps {
  sim: Sim
  challenge?: Challenge | null
}

// ---------- Local constants ----------
const CAREER_OPTS = [
  { value: '', label: '— None —' },
  // Base game
  { value: 'Astronaut', label: 'Astronaut' },
  { value: 'Athletic', label: 'Athletic' },
  { value: 'Business', label: 'Business' },
  { value: 'Criminal', label: 'Criminal' },
  { value: 'Culinary', label: 'Culinary' },
  { value: 'Entertainer', label: 'Entertainer' },
  { value: 'Painter', label: 'Painter' },
  { value: 'Secret Agent', label: 'Secret Agent' },
  { value: 'Style Influencer', label: 'Style Influencer' },
  { value: 'Tech Guru', label: 'Tech Guru' },
  { value: 'Writer', label: 'Writer' },
  // Get to Work
  { value: 'Detective', label: 'Detective' },
  { value: 'Doctor', label: 'Doctor' },
  { value: 'Scientist', label: 'Scientist' },
  // City Living
  { value: 'Critic', label: 'Critic' },
  { value: 'Politician', label: 'Politician' },
  { value: 'Social Media', label: 'Social Media' },
  // Get Famous
  { value: 'Actor', label: 'Actor' },
  // Discover University
  { value: 'Education', label: 'Education' },
  { value: 'Engineer', label: 'Engineer' },
  { value: 'Law', label: 'Law' },
  // Seasons
  { value: 'Gardener', label: 'Gardener' },
  // Island Living
  { value: 'Conservationist', label: 'Conservationist' },
  // StrangerVille
  { value: 'Military', label: 'Military' },
  // Eco Lifestyle
  { value: 'Civil Designer', label: 'Civil Designer' },
  // High School Years
  { value: 'Salaryperson', label: 'Salaryperson' },
  // Freelancer
  { value: 'Freelance Artist', label: 'Freelance Artist' },
  { value: 'Freelance Photographer', label: 'Freelance Photographer' },
  { value: 'Freelance Programmer', label: 'Freelance Programmer' },
  { value: 'Freelance Writer', label: 'Freelance Writer' },
  // Part-time
  { value: 'Barista', label: 'Barista (Part-time)' },
  { value: 'Babysitter', label: 'Babysitter (Part-time)' },
  { value: 'Fast Food Employee', label: 'Fast Food Employee (Part-time)' },
  { value: 'Manual Laborer', label: 'Manual Laborer (Part-time)' },
  { value: 'Retail Employee', label: 'Retail Employee (Part-time)' },
] as const

const ASPIRATION_OPTS = [
  { value: '', label: '— None —' },
  // Knowledge
  { value: 'Computer Whiz', label: 'Computer Whiz' },
  { value: 'Nerd Brain', label: 'Nerd Brain' },
  { value: 'Renaissance Sim', label: 'Renaissance Sim' },
  // Creativity
  { value: 'Bestselling Author', label: 'Bestselling Author' },
  { value: 'Musical Genius', label: 'Musical Genius' },
  { value: 'Painter Extraordinaire', label: 'Painter Extraordinaire' },
  // Food
  { value: 'Gourmet Foodie', label: 'Gourmet Foodie' },
  { value: 'Master Chef', label: 'Master Chef' },
  { value: 'Master Mixologist', label: 'Master Mixologist' },
  // Athletic / Nature
  { value: 'Angling Ace', label: 'Angling Ace' },
  { value: 'Bodybuilder', label: 'Bodybuilder' },
  { value: 'Freelance Botanist', label: 'Freelance Botanist' },
  { value: 'Outdoor Enthusiast', label: 'Outdoor Enthusiast' },
  // Deviance
  { value: 'Chief of Mischief', label: 'Chief of Mischief' },
  { value: 'Public Enemy', label: 'Public Enemy' },
  // Entertainment
  { value: 'Joke Star', label: 'Joke Star' },
  { value: 'Master Actor', label: 'Master Actor' },
  // Family
  { value: 'Big Happy Family', label: 'Big Happy Family' },
  { value: 'Successful Lineage', label: 'Successful Lineage' },
  { value: 'Super Parent', label: 'Super Parent' },
  // Social
  { value: 'Friend of the World', label: 'Friend of the World' },
  { value: 'Serial Romantic', label: 'Serial Romantic' },
  { value: 'Soulmate', label: 'Soulmate' },
  // City Living
  { value: 'City Native', label: 'City Native' },
  // Seasons
  { value: 'Neighborhood Botanist', label: 'Neighborhood Botanist' },
  // Parenthood
  { value: 'Positivity Challenge', label: 'Positivity Challenge' },
  // Packs
  { value: 'Good Vampire', label: 'Good Vampire' },
  { value: 'Master Vampire', label: 'Master Vampire' },
  { value: 'Purveyor of Potions', label: 'Purveyor of Potions' },
  { value: 'Spellcaster', label: 'Spellcaster' },
  { value: 'Werewolf', label: 'Werewolf' },
  // Easter egg
  { value: 'Grilled Cheese', label: 'Grilled Cheese' },
] as const

const AGE_STAGE_OPTS = [
  { value: 'infant', label: 'Infant' },
  { value: 'toddler', label: 'Toddler' },
  { value: 'child', label: 'Child' },
  { value: 'teen', label: 'Teen' },
  { value: 'young_adult', label: 'Young Adult' },
  { value: 'adult', label: 'Adult' },
  { value: 'elder', label: 'Elder' },
] as const

const REL_TO_HEIR_OPTS = [
  { value: '', label: 'Family Member' },
  { value: 'spouse', label: 'Spouse' },
  { value: 'child', label: 'Child' },
  { value: 'parent', label: 'Parent' },
  { value: 'sibling', label: 'Sibling' },
  { value: 'partner', label: 'Partner' },
  { value: 'roommate', label: 'Roommate' },
  { value: 'other', label: 'Other' },
] as const

function normalizeSelectedToIds(
  selected: (string | null | undefined)[] | null | undefined,
  catalog: { id: string; label: string }[]
): string[] {
  if (!selected?.length) return []
  const byId = new Map(catalog.map(t => [t.id, t]))
  const byLabel = new Map(catalog.map(t => [t.label.toLowerCase(), t]))
  const out: string[] = []
  for (const raw of selected) {
    if (!raw) continue
    const s = String(raw)
    if (byId.has(s)) { out.push(s); continue }
    const t = byLabel.get(s.toLowerCase())
    if (t) out.push(t.id)
  }
  return Array.from(new Set(out))
}

// ---------- Shared card class ----------
const CARD_CLASS = 'rounded-2xl border border-warmGray-100 dark:border-warmGray-800 bg-white dark:bg-warmGray-900 p-6 shadow-sm'

// ---------- Component ----------
export default function SimOverview({ sim, challenge }: SimOverviewProps) {
  const { assignToChallenge } = useSimStore()
  const updateSim = useSimStore(s => s.updateSim)
  const storeChallenge = useChallengeStore(s => s.challenges.find(c => c.id === sim.challenge_id) ?? null)

  const [traitModalOpen, setTraitModalOpen] = useState(false)
  const isLinked = Boolean(sim.challenge_id)
  const challengeState = challenge ?? storeChallenge

  async function handleLink() {
    if (!challengeState?.id) return
    await assignToChallenge(sim.id, challengeState.id)
  }

  const saveSimField =
    <K extends keyof typeof sim>(key: K) =>
      async (value: (typeof sim)[K]) => updateSim(sim.id, { [key]: value } as any)

  const saveChallengeField =
    (key: 'generation' | 'is_heir' | 'relationship_to_heir') =>
      async (value: any) => {
        await updateSim(sim.id, { [key]: value } as any)
      }

  const initialIds = normalizeSelectedToIds(sim.traits as any, Traits)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left: Details */}
      <div className="lg:col-span-2 space-y-6">

        {/* Personal Details */}
        <section className={CARD_CLASS}>
          <header className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2 text-warmGray-900 dark:text-warmGray-50">
              <TbUser className="w-5 h-5 text-brand-500" />
              Personal Details
            </h3>
            {sim.is_heir ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-semibold bg-amber-100 dark:bg-amber-900/30 text-amber-900 dark:text-amber-300">
                <TbCrown className="w-4 h-4" /> Current Heir
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium bg-warmGray-100 dark:bg-warmGray-800 text-warmGray-600 dark:text-warmGray-400">
                Family
              </span>
            )}
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InlineEditable
              id="sim-name"
              label="Name"
              value={sim.name}
              placeholder="Enter a name"
              validate={(v) => (!v || v.trim().length === 0 ? 'Name is required' : null)}
              onSave={(v) => saveSimField('name')(v as string)}
            />

            <InlineEditable
              id="sim-age-stage"
              label="Age Stage"
              type="select"
              value={sim.age_stage ?? 'young_adult'}
              options={[...AGE_STAGE_OPTS]}
              format={(v) => {
                const opt = AGE_STAGE_OPTS.find(o => o.value === v)
                return <span>{opt?.label ?? '—'}</span>
              }}
              onSave={(v) => saveSimField('age_stage')(v as string | null)}
            />

            <InlineEditable
              id="sim-career"
              label="Career"
              type="select"
              value={sim.career ?? ''}
              options={[...CAREER_OPTS]}
              format={(v) => {
                const opt = CAREER_OPTS.find(o => o.value === v)
                return <span>{opt?.label && opt.value ? opt.label : '—'}</span>
              }}
              onSave={(v) => saveSimField('career')(v || null)}
            />

            <InlineEditable
              id="sim-aspiration"
              label="Aspiration"
              type="select"
              value={sim.aspiration ?? ''}
              options={[...ASPIRATION_OPTS]}
              format={(v) => {
                const opt = ASPIRATION_OPTS.find(o => o.value === v)
                return <span>{opt?.label && opt.value ? opt.label : '—'}</span>
              }}
              onSave={(v) => saveSimField('aspiration')(v || null)}
            />
          </div>

          {/* Traits */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="block text-sm font-medium text-warmGray-700 dark:text-warmGray-300">Traits</span>
              <Button
                variant="ghost"
                onClick={() => setTraitModalOpen(true)}
              >
                Edit traits
              </Button>
            </div>

            {(!sim.traits || (sim.traits as string[]).length === 0) ? (
              <p className="text-sm text-warmGray-500 dark:text-warmGray-400">No traits selected.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {(sim.traits as string[]).map((traitId: string) => {
                  const t = (Traits as unknown as Trait[]).find(tt => tt.id === traitId)
                  return (
                    <span key={traitId} className="inline-flex items-center rounded-full border border-warmGray-200 dark:border-warmGray-700 px-2.5 py-1 text-xs text-warmGray-700 dark:text-warmGray-300">
                      {t?.label ?? traitId}
                    </span>
                  )
                })}
              </div>
            )}
          </div>

          <TraitPickerModal
            isOpen={traitModalOpen}
            onClose={() => setTraitModalOpen(false)}
            initialSelected={initialIds}
            catalog={Traits}
            simAgeStage={(sim.age_stage ?? 'young_adult') as AgeStage}
            maxSelectable={3}
            onSave={async (nextIds) => {
              await updateSim(sim.id, { traits: nextIds as any })
            }}
          />
        </section>

        {/* Challenge / Context Card */}
        <section className={CARD_CLASS}>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-warmGray-900 dark:text-warmGray-50">
            <TbFlag className="w-5 h-5 text-brand-500" />
            Challenge
          </h3>

          {!challengeState ? (
            <p className="text-warmGray-500 dark:text-warmGray-400">This Sim is not in a challenge context.</p>
          ) : !isLinked ? (
            <div className="space-y-3">
              <p className="text-warmGray-500 dark:text-warmGray-400">
                This Sim isn&apos;t linked to &ldquo;<SafeText>{challengeState.name}</SafeText>&rdquo;.
              </p>
              <Button onClick={handleLink}>
                Link to Challenge
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              <InlineEditable
                id="cs-generation"
                label="Generation"
                type="number"
                value={sim.generation ?? 1}
                min={1}
                max={50}
                validate={(n) =>
                  Number.isInteger(n) && n >= 1 && n <= 50 ? null : 'Enter 1–50'
                }
                onSave={(n) => saveChallengeField('generation')(n as number)}
              />

              <InlineEditable
                id="cs-is-heir"
                label="Heir"
                type="checkbox"
                value={!!sim.is_heir}
                format={(v) => (v ? 'Current Heir' : '—')}
                onSave={(v) => saveChallengeField('is_heir')(v as boolean)}
              />

              {!sim.is_heir && (
                <InlineEditable
                  id="cs-rel-to-heir"
                  label="Relationship to Heir"
                  type="select"
                  value={sim.relationship_to_heir ?? ''}
                  options={[
                    { value: '', label: 'Family Member' },
                    { value: 'spouse', label: 'Spouse' },
                    { value: 'child', label: 'Child' },
                    { value: 'parent', label: 'Parent' },
                    { value: 'sibling', label: 'Sibling' },
                    { value: 'partner', label: 'Partner' },
                    { value: 'roommate', label: 'Roommate' },
                    { value: 'other', label: 'Other' },
                  ]}
                  onSave={(v) => saveChallengeField('relationship_to_heir')(v as string | null)}
                />
              )}

              <div className="pt-2 border-t border-warmGray-100 dark:border-warmGray-800">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-warmGray-500 dark:text-warmGray-400">Challenge:</span>
                  <span className="font-medium text-warmGray-900 dark:text-warmGray-100">
                    <SafeText>{challengeState.name}</SafeText>
                  </span>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Right: Sidebar */}
      <aside className="space-y-6">
        {/* Avatar Card */}
        <section className={CARD_CLASS}>
          <h3 className="text-base font-semibold mb-4 flex items-center gap-2 text-warmGray-900 dark:text-warmGray-50">
            <TbPhoto className="w-4 h-4 text-brand-500" />
            Avatar
          </h3>
          <div className="flex items-center gap-4">
            <AvatarCircle avatarUrl={sim.avatar_url} name={sim.name} size="lg" />
            <div className="flex-1">
              <div className="text-sm text-warmGray-500 dark:text-warmGray-400">Age Stage</div>
              <div className="text-base font-medium text-warmGray-900 dark:text-warmGray-100">
                {AGE_STAGE_OPTS.find(o => o.value === (sim.age_stage ?? 'young_adult'))?.label}
              </div>
              {typeof sim.generation === 'number' && (
                <div className="text-sm text-warmGray-500 dark:text-warmGray-400 mt-1">
                  Generation {sim.generation}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Quick Stats */}
        <section className={CARD_CLASS}>
          <h3 className="text-base font-semibold mb-4 flex items-center gap-2 text-warmGray-900 dark:text-warmGray-50">
            <TbListDetails className="w-4 h-4 text-brand-500" />
            Quick Stats
          </h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center justify-between">
              <span className="text-warmGray-500 dark:text-warmGray-400">Heir</span>
              <span className="text-warmGray-900 dark:text-warmGray-100">
                {sim.is_heir ? 'Yes' : '—'}
              </span>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-warmGray-500 dark:text-warmGray-400">Relationship to Heir</span>
              <span className="text-warmGray-900 dark:text-warmGray-100">
                {REL_TO_HEIR_OPTS.find(o => o.value === (sim.relationship_to_heir ?? ''))?.label ?? '—'}
              </span>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-warmGray-500 dark:text-warmGray-400">Career</span>
              <span className="text-warmGray-900 dark:text-warmGray-100">{sim.career || '—'}</span>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-warmGray-500 dark:text-warmGray-400">Aspiration</span>
              <span className="text-warmGray-900 dark:text-warmGray-100">{sim.aspiration || '—'}</span>
            </li>
          </ul>
        </section>
      </aside>
    </div>
  )
}
