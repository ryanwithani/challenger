// src/data/packs.ts — Single source of truth for all Sims 4 pack definitions.
// Acronyms are the canonical identifiers used across the app and in CSV data.

export type PackCategory =
  | 'base_game'
  | 'expansion_pack'
  | 'game_pack'
  | 'stuff_pack'
  | 'kit'
  | 'lto_event'

export interface PackDef {
  readonly acronym: string
  readonly name: string
  readonly category: PackCategory
}

export const PACK_CATEGORY_LABELS: Record<PackCategory, string> = {
  base_game: 'Base Game',
  expansion_pack: 'Expansion Pack',
  game_pack: 'Game Pack',
  stuff_pack: 'Stuff Pack',
  kit: 'Kit',
  lto_event: 'LTO Event',
}

export const PACKS: readonly PackDef[] = [
  // Base Game
  { acronym: 'TS4', name: 'Base Game', category: 'base_game' },

  // Expansion Packs
  { acronym: 'GTW', name: 'Get to Work', category: 'expansion_pack' },
  { acronym: 'GT', name: 'Get Together', category: 'expansion_pack' },
  { acronym: 'CL', name: 'City Living', category: 'expansion_pack' },
  { acronym: 'C&D', name: 'Cats & Dogs', category: 'expansion_pack' },
  { acronym: 'S', name: 'Seasons', category: 'expansion_pack' },
  { acronym: 'GF', name: 'Get Famous', category: 'expansion_pack' },
  { acronym: 'IL', name: 'Island Living', category: 'expansion_pack' },
  { acronym: 'DU', name: 'Discover University', category: 'expansion_pack' },
  { acronym: 'EL', name: 'Eco Lifestyle', category: 'expansion_pack' },
  { acronym: 'SE', name: 'Snowy Escape', category: 'expansion_pack' },
  { acronym: 'CLV', name: 'Cottage Living', category: 'expansion_pack' },
  { acronym: 'HSY', name: 'High School Years', category: 'expansion_pack' },
  { acronym: 'GTO', name: 'Growing Together', category: 'expansion_pack' },
  { acronym: 'HR', name: 'Horse Ranch', category: 'expansion_pack' },
  { acronym: 'FR', name: 'For Rent', category: 'expansion_pack' },
  { acronym: 'L', name: 'Lovestruck', category: 'expansion_pack' },
  { acronym: 'L&D', name: 'Life & Death', category: 'expansion_pack' },
  { acronym: 'B&H', name: 'Business & Hobbies', category: 'expansion_pack' },
  { acronym: 'EBN', name: 'Enchanted by Nature', category: 'expansion_pack' },
  { acronym: 'AA', name: 'Adventures Aplenty', category: 'expansion_pack' },

  // Game Packs
  { acronym: 'OR', name: 'Outdoor Retreat', category: 'game_pack' },
  { acronym: 'SD', name: 'Spa Day', category: 'game_pack' },
  { acronym: 'DO', name: 'Dine Out', category: 'game_pack' },
  { acronym: 'V', name: 'Vampires', category: 'game_pack' },
  { acronym: 'PH', name: 'Parenthood', category: 'game_pack' },
  { acronym: 'JA', name: 'Jungle Adventure', category: 'game_pack' },
  { acronym: 'SV', name: 'Strangerville', category: 'game_pack' },
  { acronym: 'RoM', name: 'Realm of Magic', category: 'game_pack' },
  { acronym: 'JTB', name: 'Journey to Batuu', category: 'game_pack' },
  { acronym: 'DHD', name: 'Dream Home Decorator', category: 'game_pack' },
  { acronym: 'MWS', name: 'My Wedding Stories', category: 'game_pack' },
  { acronym: 'W', name: 'Werewolves', category: 'game_pack' },

  // Stuff Packs
  { acronym: 'LP', name: 'Luxury Party', category: 'stuff_pack' },
  { acronym: 'PP', name: 'Perfect Patio', category: 'stuff_pack' },
  { acronym: 'CK', name: 'Cool Kitchen', category: 'stuff_pack' },
  { acronym: 'SS', name: 'Spooky', category: 'stuff_pack' },
  { acronym: 'MH', name: 'Movie Hangout', category: 'stuff_pack' },
  { acronym: 'RG', name: 'Romantic Garden', category: 'stuff_pack' },
  { acronym: 'KR', name: 'Kids Room', category: 'stuff_pack' },
  { acronym: 'BY', name: 'Backyard', category: 'stuff_pack' },
  { acronym: 'VG', name: 'Vintage Glamour', category: 'stuff_pack' },
  { acronym: 'BN', name: 'Bowling Night', category: 'stuff_pack' },
  { acronym: 'FS', name: 'Fitness', category: 'stuff_pack' },
  { acronym: 'TS', name: 'Toddler', category: 'stuff_pack' },
  { acronym: 'LDS', name: 'Laundry Day', category: 'stuff_pack' },
  { acronym: 'MFP', name: 'My First Pet', category: 'stuff_pack' },
  { acronym: 'MS', name: 'Moschino', category: 'stuff_pack' },
  { acronym: 'TL', name: 'Tiny Living', category: 'stuff_pack' },
  { acronym: 'NK', name: 'Nifty Knitting', category: 'stuff_pack' },
  { acronym: 'PN', name: 'Paranormal', category: 'stuff_pack' },
  { acronym: 'HCH', name: 'Home Chef Hustle', category: 'stuff_pack' },
  { acronym: 'CC', name: 'Crystal Creations', category: 'stuff_pack' },

  // Kits
  { acronym: 'BTD', name: 'Bust the Dust', category: 'kit' },
  { acronym: 'CBK', name: 'Cozy Bistro', category: 'kit' },
  { acronym: 'RRK', name: 'Riviera Retreat', category: 'kit' },
  { acronym: 'SSK', name: 'Secret Sanctuary', category: 'kit' },

  // LTO Events
  { acronym: 'RRE', name: "Reaper's Rewards", category: 'lto_event' },
  { acronym: 'CCE', name: 'Cozy Celebrations', category: 'lto_event' },
  { acronym: 'BFP', name: 'Blast from the Past', category: 'lto_event' },
  { acronym: 'NCE', name: "Nature's Calling", category: 'lto_event' },
  { acronym: 'FFE', name: 'Forever Friends', category: 'lto_event' },
] as const

// --- Derived lookups ---

const packByAcronym = new Map<string, PackDef>(
  PACKS.map((p) => [p.acronym, p])
)

export function getPackByAcronym(acronym: string): PackDef | undefined {
  return packByAcronym.get(acronym)
}

export function getPacksByCategory(category: PackCategory): PackDef[] {
  return PACKS.filter((p) => p.category === category)
}

export function getPackName(acronym: string): string {
  return packByAcronym.get(acronym)?.name ?? acronym
}

export const PACK_ACRONYMS = PACKS.map((p) => p.acronym)

export type PackAcronym = (typeof PACKS)[number]['acronym']

// --- Legacy migration (old boolean-key format → acronym array) ---

export const LEGACY_KEY_TO_ACRONYM: Record<string, string> = {
  get_to_work: 'GTW',
  get_together: 'GT',
  city_living: 'CL',
  cats_and_dogs: 'C&D',
  cats_dogs: 'C&D',
  seasons: 'S',
  get_famous: 'GF',
  island_living: 'IL',
  discover_university: 'DU',
  eco_lifestyle: 'EL',
  snowy_escape: 'SE',
  cottage_living: 'CLV',
  high_school_years: 'HSY',
  growing_together: 'GTO',
  horse_ranch: 'HR',
  for_rent: 'FR',
  lovestruck: 'L',
  life_and_death: 'L&D',
  enchanted_by_nature: 'EBN',
  businesses_and_hobbies: 'B&H',
  outdoor_retreat: 'OR',
  spa_day: 'SD',
  dine_out: 'DO',
  vampires: 'V',
  parenthood: 'PH',
  jungle_adventure: 'JA',
  strangerville: 'SV',
  realm_of_magic: 'RoM',
  journey_to_batuu: 'JTB',
  dream_home_decorator: 'DHD',
  my_wedding_stories: 'MWS',
  werewolves: 'W',
}

/**
 * Converts legacy boolean-map pack preferences to acronym array.
 * Returns the input unchanged if it's already an array.
 */
export function migrateLegacyPacks(
  value: Record<string, boolean> | string[] | unknown
): string[] {
  if (Array.isArray(value)) return value

  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const boolMap = value as Record<string, boolean>
    const acronyms = Object.entries(boolMap)
      .filter(([, enabled]) => enabled)
      .map(([key]) => LEGACY_KEY_TO_ACRONYM[key])
      .filter(Boolean)
    return [...new Set(acronyms)]
  }

  return []
}
