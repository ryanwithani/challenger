import { StartingOption, LegacyRules } from '@/src/types/legacy'

export const STARTING_OPTIONS: StartingOption[] = [
    {
        value: 'regular',
        label: 'Regular',
        description: 'Start with $1,800 on 50x50 lot',
        detail: 'Classic Legacy experience with standard starting funds',
        difficulty: 'Easy',
        bonus: 0
    },
    {
        value: 'extreme',
        label: 'Extreme',
        description: 'Start with $0 on 64x64 lot in winter',
        detail: 'No starting funds, larger lot, harsh weather conditions',
        difficulty: 'Hard',
        bonus: 1
    },
    {
        value: 'ultra_extreme',
        label: 'Ultra Extreme',
        description: 'Start with $0 and $35k debt to repay',
        detail: 'No funds plus significant debt burden to overcome',
        difficulty: 'Expert',
        bonus: 2
    }
]

export const LEGACY_RULES: LegacyRules = {
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