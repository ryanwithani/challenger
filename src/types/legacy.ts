export type StartType = 'regular' | 'extreme' | 'ultra_extreme'
export type GenderLaw = 'strict_traditional' | 'traditional' | 'matriarchy' | 'patriarchy' | 'equality' | 'strict_equality'
export type BloodlineLaw = 'strict_traditional' | 'traditional' | 'modern' | 'foster' | 'strict_foster'
export type HeirSelection = 'first_born' | 'last_born' | 'random' | 'exemplar' | 'strength'
export type SpeciesRule = 'human_only' | 'occult_allowed' | 'occult_preferred'
export type Lifespan = 'short' | 'normal' | 'long'

export interface LegacyConfigData {
    start_type: StartType
    gender_law: GenderLaw
    bloodline_law: BloodlineLaw
    heir_selection: HeirSelection
    species_rule: SpeciesRule
    lifespan: Lifespan
}

export interface StartingOption {
    value: StartType
    label: string
    description: string
    detail: string
    difficulty: 'Easy' | 'Hard' | 'Expert'
    bonus: number
}

export interface LegacyRule {
    value: string
    label: string
    desc: string
}

export interface LegacyRules {
    genderLaw: LegacyRule[]
    bloodlineLaw: LegacyRule[]
    heirSelection: LegacyRule[]
    speciesRule: LegacyRule[]
    lifespan: LegacyRule[]
}