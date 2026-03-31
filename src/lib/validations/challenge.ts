import { z } from 'zod'

export const basicInfoSchema = z.object({
    name: z.string().min(1, 'Challenge name is required').max(100),
    description: z.string().max(500).optional(),
    challenge_type: z.enum(['custom', 'legacy', 'not_so_berry', '100_baby']),
})

export const legacyConfigSchema = z.object({
    start_type: z.enum(['regular', 'extreme', 'ultra_extreme']),
    gender_law: z.enum(['strict_traditional', 'traditional', 'matriarchy', 'patriarchy', 'equality', 'strict_equality']),
    bloodline_law: z.enum(['strict_traditional', 'traditional', 'modern', 'foster', 'strict_foster']),
    heir_selection: z.enum(['first_born', 'last_born', 'random', 'exemplar', 'strength']),
    species_rule: z.enum(['human_only', 'occult_allowed', 'occult_preferred']),
    lifespan: z.enum(['short', 'normal', 'long']),
})

export const expansionPackSchema = z.array(z.string()).default([])

export type BasicInfoData = z.infer<typeof basicInfoSchema>
export type LegacyConfigData = z.infer<typeof legacyConfigSchema>
export type ExpansionPackData = z.infer<typeof expansionPackSchema>