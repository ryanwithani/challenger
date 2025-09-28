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

export const expansionPackSchema = z.object({
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

export type BasicInfoData = z.infer<typeof basicInfoSchema>
export type LegacyConfigData = z.infer<typeof legacyConfigSchema>
export type ExpansionPackData = z.infer<typeof expansionPackSchema>