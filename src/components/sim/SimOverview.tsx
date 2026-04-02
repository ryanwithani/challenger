'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { InlineEditable } from '@/src/components/forms/InlineEditable'
import { useSimStore } from '@/src/lib/store/simStore'
import { useChallengeStore } from '@/src/lib/store/challengeStore'
import { Button } from '@/src/components/ui/Button'
import TraitPickerModal, { CatalogTrait as Trait } from '@/src/components/sim/TraitPickerModal'
import { Traits } from '@/src/components/sim/TraitsCatalog'
import { SafeText } from '../ui/SafeText'
import { Database } from '@/src/types/database.types'

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

// ---------- Small icon helpers (kept lightweight & inline with your UI) ----------
function getAgeStageIcon(stage?: string | null) {
  switch (stage) {
    case 'infant': return '🍼'
    case 'toddler': return '🧸'
    case 'child': return '🎒'
    case 'teen': return '🎧'
    case 'young_adult': return '🕶️'
    case 'adult': return '💼'
    case 'elder': return '🧓'
    default: return '👤'
  }
}

function getRelationshipIcon(rel?: string | null) {
  switch (rel) {
    case 'spouse': return '💍'
    case 'child': return '🧒'
    case 'parent': return '🧑‍🍼'
    case 'sibling': return '👫'
    case 'partner': return '❤️'
    case 'roommate': return '🏠'
    case 'other': return '🧩'
    default: return '👪'
  }
}

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
  // dedupe
  return Array.from(new Set(out))
}

// ---------- Component ----------
export default function SimOverview({ sim, challenge }: SimOverviewProps) {
  const { assignToChallenge } = useSimStore()
  const updateSim = useSimStore(s => s.updateSim)
  const storeChallenge = useChallengeStore(s => s.challenges.find(c => c.id === sim.challenge_id) ?? null)

  const [traitModalOpen, setTraitModalOpen] = useState(false)
  const isLinked = Boolean(sim.challenge_id)
  const challengeState = challenge ?? storeChallenge

  // Helper: create the link (used by the CTA button when not linked)
  async function handleLink() {
    if (!challengeState?.id) return
    await assignToChallenge(sim.id, challengeState.id)
  }

  // Save helpers
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
        <section className="bg-white rounded-2xl border-2 border-gray-100 p-6 shadow-lg hover:shadow-xl transition-all duration-300">
          <header className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              🧑 Personal Details
            </h3>
            {sim.is_heir ? (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                👑 Current Heir
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                Family
              </span>
            )}
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <InlineEditable
              id="sim-name"
              label="Name"
              value={sim.name}
              placeholder="Enter a name"
              validate={(v) => (!v || v.trim().length === 0 ? 'Name is required' : null)}
              onSave={(v) => saveSimField('name')(v as string)}
            />

            {/* Age Stage */}
            <InlineEditable
              id="sim-age-stage"
              label="Age Stage"
              type="select"
              value={sim.age_stage ?? 'young_adult'}
              options={[...AGE_STAGE_OPTS]}
              format={(v) => {
                const opt = AGE_STAGE_OPTS.find(o => o.value === v)
                return (
                  <span className="flex items-center">
                    <span className="mr-2">{getAgeStageIcon(String(v))}</span>
                    {opt?.label ?? '—'}
                  </span>
                )
              }}
              onSave={(v) => saveSimField('age_stage')(v as string | null)}
            />

            {/* Career */}
            <InlineEditable
              id="sim-career"
              label="Career"
              value={sim.career ?? ''}
              placeholder="Type a career"
              maxLength={120}
              onSave={(v) => saveSimField('career')(v.trim() as string | null)}
            />

            {/* Aspiration */}
            <InlineEditable
              id="sim-aspiration"
              label="Aspiration"
              value={sim.aspiration ?? ''}
              placeholder="Type an aspiration"
              maxLength={120}
              onSave={(v) => saveSimField('aspiration')(v.trim() as string | null)}
            />
          </div>

          {/* Traits (example: read-only badges here; keep your existing editor elsewhere) */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="block text-sm font-medium text-gray-700">Traits</span>
              <button
                type="button"
                onClick={() => setTraitModalOpen(true)}
                className="text-sm text-indigo-600 hover:underline"
              >
                Edit traits
              </button>
            </div>

            {(!sim.traits || (sim.traits as string[]).length === 0) ? (
              <p className="text-sm text-gray-500">No traits selected.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {(sim.traits as string[]).map((traitId: string) => {
                  const t = (Traits as unknown as Trait[]).find(tt => tt.id === traitId)
                  return (
                    <span key={traitId} className="inline-flex items-center rounded-full border border-gray-300 px-2 py-0.5 text-xs text-gray-700">
                      {t?.icon ? <span className="mr-1">{t.icon}</span> : null}
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
            initialSelected={initialIds}                // ✅ now guaranteed IDs
            catalog={Traits}
            simAgeStage={(sim.age_stage ?? 'young_adult') as AgeStage}
            // ownedPacks={undefined} // omit if you don't want pack gating
            maxSelectable={3}                           // or remove if you don't want a cap
            onSave={async (nextIds) => {
              await updateSim(sim.id, { traits: nextIds as any }) // ✅ always store IDs
            }}
          />

        </section>

        {/* Challenge / Context Card */}
        <section className="bg-white rounded-2xl border-2 border-gray-100 p-6 shadow-lg hover:shadow-xl transition-all">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">🏁 Challenge</h3>

          {!challengeState ? (
            <p className="text-gray-500">This Sim is not in a challenge context.</p>
          ) : !isLinked ? (
            <div className="space-y-3">
              <p className="text-gray-500">This Sim isn't linked to "<SafeText>{challengeState.name}</SafeText>".</p>
              <button
                type="button"
                onClick={handleLink}
                className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                Link to Challenge
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {/* Generation */}
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

              {/* Heir */}
              <InlineEditable
                id="cs-is-heir"
                label="Heir"
                type="checkbox"
                value={!!sim.is_heir}
                format={(v) => (v ? '👑 Current Heir' : '—')}
                onSave={(v) => saveChallengeField('is_heir')(v as boolean)}
              />

              {/* Relationship to Heir (only if not heir) */}
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

              {/* Challenge title */}
              <div className="pt-2 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">Challenge:</span>
                  <span className="font-medium"><SafeText>{challengeState.name}</SafeText></span>
                </div>
              </div>
            </div>
          )}
        </section>


        {/* you can keep/add other cards (skills, relationships, achievements) here */}
      </div>

      {/* Right: Sidebar */}
      <aside className="space-y-6">
        {/* Avatar Card */}
        <section className="bg-white rounded-2xl border-2 border-gray-100 p-6 shadow-lg hover:shadow-xl transition-all duration-300">
          <h3 className="text-lg font-semibold mb-4">Avatar</h3>
          <div className="flex items-center gap-4">
            <div className="relative h-20 w-20 rounded-full overflow-hidden border">
              {sim.avatar_url ? (
                <Image
                  src={sim.avatar_url}
                  alt={`${sim.name} avatar`}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-gray-100 text-2xl">
                  {sim.name?.charAt(0)?.toUpperCase() ?? 'S'}
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="text-sm text-gray-600">Age Stage</div>
              <div className="text-base font-medium">
                <span className="mr-2">{getAgeStageIcon(sim.age_stage ?? undefined)}</span>
                {
                  AGE_STAGE_OPTS.find(o => o.value === (sim.age_stage ?? 'young_adult'))?.label
                }
              </div>
              {typeof sim.generation === 'number' && (
                <div className="text-sm text-gray-600 mt-1">Generation {sim.generation}</div>
              )}
            </div>
          </div>

          {/* quick actions (optional) */}
          <div className="mt-4 flex gap-2">
            <Button>View Family</Button>
            <Button>Open Gallery</Button>
          </div>
        </section>

        {/* Quick Stats / Flags */}
        <section className="bg-white rounded-2xl border-2 border-gray-100 p-6 shadow-lg hover:shadow-xl transition-all duration-300">
          <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center justify-between">
              <span>Heir</span>
              <span>{sim.is_heir ? '👑 Yes' : '—'}</span>
            </li>
            <li className="flex items-center justify-between">
              <span>Relationship to Heir</span>
              <span className="flex items-center gap-1">
                {getRelationshipIcon(sim.relationship_to_heir ?? undefined)}
                {REL_TO_HEIR_OPTS.find(o => o.value === (sim.relationship_to_heir ?? ''))?.label ?? '—'}
              </span>
            </li>
            <li className="flex items-center justify-between">
              <span>Career</span>
              <span>{sim.career || '—'}</span>
            </li>
            <li className="flex items-center justify-between">
              <span>Aspiration</span>
              <span>{sim.aspiration || '—'}</span>
            </li>
          </ul>
        </section>
      </aside>
    </div>
  )
}
