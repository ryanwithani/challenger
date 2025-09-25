// src/types/sims.ts
export type RelationshipToHeir =
  | 'spouse' | 'child' | 'parent' | 'sibling' | 'partner' | 'roommate' | 'other'

export interface Sim {
  id: string
  name: string
  avatar_url?: string | null
  age_stage?: 'baby' | 'toddler' | 'child' | 'teen' | 'young_adult' | 'adult' | 'elder' | null
  career?: string | null
  aspiration?: string | null
  traits?: string[] | null
}

export interface Challenge {
  id: string
  title: string
  rules_url?: string | null
  generation_goal?: string | null
}

export interface ChallengeSim {
  id: string
  challenge_id: string
  sim_id: string
  generation: number | null
  is_heir: boolean | null
  relationship_to_heir: RelationshipToHeir | null
  created_at?: string
  updated_at?: string
}
