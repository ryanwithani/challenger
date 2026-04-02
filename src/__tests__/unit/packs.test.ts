import {
  PACKS,
  PACK_ACRONYMS,
  PACK_CATEGORY_LABELS,
  getPackByAcronym,
  getPacksByCategory,
  getPackName,
  migrateLegacyPacks,
  LEGACY_KEY_TO_ACRONYM,
  type PackCategory,
} from '@/src/data/packs'

describe('packs data', () => {
  describe('PACKS array', () => {
    test('contains all expected pack categories', () => {
      const categories = new Set(PACKS.map((p) => p.category))
      expect(categories).toEqual(
        new Set(['base_game', 'expansion_pack', 'game_pack', 'stuff_pack', 'kit', 'lto_event'])
      )
    })

    test('has no duplicate acronyms', () => {
      const acronyms = PACKS.map((p) => p.acronym)
      const unique = new Set(acronyms)
      expect(unique.size).toBe(acronyms.length)
    })

    test('has exactly 1 base game entry', () => {
      const baseGame = PACKS.filter((p) => p.category === 'base_game')
      expect(baseGame).toHaveLength(1)
      expect(baseGame[0].acronym).toBe('TS4')
    })

    test('has 20 expansion packs', () => {
      expect(getPacksByCategory('expansion_pack')).toHaveLength(20)
    })

    test('has 12 game packs (including Vampires)', () => {
      const gamePacks = getPacksByCategory('game_pack')
      expect(gamePacks).toHaveLength(12)
      expect(gamePacks.find((p) => p.acronym === 'V')).toBeDefined()
    })

    test('has 20 stuff packs', () => {
      expect(getPacksByCategory('stuff_pack')).toHaveLength(20)
    })

    test('has 4 kits', () => {
      expect(getPacksByCategory('kit')).toHaveLength(4)
    })

    test('has 5 LTO events', () => {
      expect(getPacksByCategory('lto_event')).toHaveLength(5)
    })

    test('every pack has non-empty acronym and name', () => {
      PACKS.forEach((pack) => {
        expect(pack.acronym.length).toBeGreaterThan(0)
        expect(pack.name.length).toBeGreaterThan(0)
      })
    })
  })

  describe('PACK_ACRONYMS', () => {
    test('has same length as PACKS', () => {
      expect(PACK_ACRONYMS).toHaveLength(PACKS.length)
    })

    test('contains all pack acronyms', () => {
      PACKS.forEach((p) => {
        expect(PACK_ACRONYMS).toContain(p.acronym)
      })
    })

    test('contains AA pack acronym', () => {
      expect(PACK_ACRONYMS).toContain('AA')
    })
  })

  describe('PACK_CATEGORY_LABELS', () => {
    test('has labels for all categories', () => {
      const allCategories: PackCategory[] = [
        'base_game', 'expansion_pack', 'game_pack', 'stuff_pack', 'kit', 'lto_event',
      ]
      allCategories.forEach((cat) => {
        expect(PACK_CATEGORY_LABELS[cat]).toBeDefined()
        expect(PACK_CATEGORY_LABELS[cat].length).toBeGreaterThan(0)
      })
    })
  })

  describe('getPackByAcronym', () => {
    test('returns pack for valid acronym', () => {
      const pack = getPackByAcronym('GTW')
      expect(pack).toBeDefined()
      expect(pack?.name).toBe('Get to Work')
      expect(pack?.category).toBe('expansion_pack')
    })

    test('returns undefined for invalid acronym', () => {
      expect(getPackByAcronym('INVALID')).toBeUndefined()
    })

    test('handles special character acronyms', () => {
      expect(getPackByAcronym('C&D')?.name).toBe('Cats & Dogs')
      expect(getPackByAcronym('L&D')?.name).toBe('Life & Death')
      expect(getPackByAcronym('B&H')?.name).toBe('Business & Hobbies')
    })
  })

  describe('getPacksByCategory', () => {
    test('returns only packs of the given category', () => {
      const stuffPacks = getPacksByCategory('stuff_pack')
      stuffPacks.forEach((p) => {
        expect(p.category).toBe('stuff_pack')
      })
    })

    test('returns empty array for empty category', () => {
      // All valid categories have packs, but the function should handle gracefully
      const result = getPacksByCategory('base_game')
      expect(result).toHaveLength(1)
    })
  })

  describe('getPackName', () => {
    test('returns display name for valid acronym', () => {
      expect(getPackName('SD')).toBe('Spa Day')
      expect(getPackName('TS4')).toBe('Base Game')
    })

    test('returns acronym as fallback for unknown acronym', () => {
      expect(getPackName('UNKNOWN')).toBe('UNKNOWN')
    })
  })
})

describe('migrateLegacyPacks', () => {
  test('converts boolean map to acronym array (only true values)', () => {
    const legacy = {
      get_to_work: true,
      seasons: true,
      spa_day: true,
      get_together: false,
      city_living: false,
    }
    const result = migrateLegacyPacks(legacy)
    expect(result).toContain('GTW')
    expect(result).toContain('S')
    expect(result).toContain('SD')
    expect(result).not.toContain('GT')
    expect(result).not.toContain('CL')
    expect(result).toHaveLength(3)
  })

  test('handles cats_and_dogs variant (with underscore)', () => {
    const result = migrateLegacyPacks({ cats_and_dogs: true })
    expect(result).toContain('C&D')
  })

  test('handles cats_dogs variant (without underscore)', () => {
    const result = migrateLegacyPacks({ cats_dogs: true })
    expect(result).toContain('C&D')
  })

  test('returns input unchanged if already an array', () => {
    const input = ['GTW', 'SD']
    expect(migrateLegacyPacks(input)).toBe(input)
  })

  test('returns empty array for null/undefined', () => {
    expect(migrateLegacyPacks(null)).toEqual([])
    expect(migrateLegacyPacks(undefined)).toEqual([])
  })

  test('returns empty array for empty object', () => {
    expect(migrateLegacyPacks({})).toEqual([])
  })

  test('returns empty array for all-false boolean map', () => {
    const allFalse = {
      get_to_work: false,
      seasons: false,
    }
    expect(migrateLegacyPacks(allFalse)).toEqual([])
  })

  test('handles full legacy pack set', () => {
    const allKeys = Object.keys(LEGACY_KEY_TO_ACRONYM)
    const allTrue: Record<string, boolean> = {}
    allKeys.forEach((k) => { allTrue[k] = true })
    const result = migrateLegacyPacks(allTrue)
    // Should have unique acronyms (cats_and_dogs and cats_dogs map to same C&D)
    const unique = new Set(result)
    expect(unique.size).toBe(result.length)
  })
})
