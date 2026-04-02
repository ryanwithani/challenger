import {
  CATALOG,
  CATALOG_BY_TYPE,
  ALL_ITEMS,
  CATALOG_SIZE,
  CHECKLIST_CATEGORIES,
  CATEGORY_GOAL_MAP,
  getCatalogType,
  getGoalTypeForItem,
} from '@/src/data/checklists'
import type { CatalogType } from '@/src/data/checklists'
import { PACK_ACRONYMS } from '@/src/data/packs'

describe('Checklist catalog', () => {
  test('CATALOG_BY_TYPE has all 7 categories', () => {
    expect(Object.keys(CATALOG_BY_TYPE)).toHaveLength(7)
    expect(Object.keys(CATALOG_BY_TYPE).sort()).toEqual([
      'aspirations', 'careers', 'collections', 'deaths', 'parties', 'skills', 'traits',
    ])
  })

  test('all items have required fields', () => {
    for (const item of ALL_ITEMS) {
      expect(item.key).toBeTruthy()
      expect(item.name).toBeTruthy()
      expect(item.category).toBeTruthy()
      // pack can be empty string for some traits
      expect(typeof item.pack).toBe('string')
    }
  })

  test('all item keys have the format "catalogType:name"', () => {
    for (const item of ALL_ITEMS) {
      const colonIndex = item.key.indexOf(':')
      expect(colonIndex).toBeGreaterThan(0)
      const prefix = item.key.substring(0, colonIndex)
      expect(CHECKLIST_CATEGORIES).toContain(prefix)
    }
  })

  test('no duplicate keys in CATALOG', () => {
    const keys = ALL_ITEMS.map(item => item.key)
    const uniqueKeys = new Set(keys)
    expect(uniqueKeys.size).toBe(keys.length)
  })

  test('CATALOG lookup matches ALL_ITEMS', () => {
    expect(Object.keys(CATALOG)).toHaveLength(ALL_ITEMS.length)
    for (const item of ALL_ITEMS) {
      expect(CATALOG[item.key]).toBe(item)
    }
  })

  test('CATALOG_SIZE matches total item count', () => {
    expect(CATALOG_SIZE).toBe(ALL_ITEMS.length)
  })

  test('CATEGORY_GOAL_MAP covers all catalog types', () => {
    for (const type of CHECKLIST_CATEGORIES) {
      expect(CATEGORY_GOAL_MAP[type]).toBeTruthy()
    }
  })

  test('all non-empty pack acronyms exist in PACKS', () => {
    const missingPacks: string[] = []
    for (const item of ALL_ITEMS) {
      if (item.pack && !PACK_ACRONYMS.includes(item.pack)) {
        missingPacks.push(`${item.key} has unknown pack "${item.pack}"`)
      }
    }
    expect(missingPacks).toEqual([])
  })

  test.each([
    ['skills', 74],
    ['aspirations', 97],
    ['careers', 91],
    ['parties', 38],
    ['traits', 402],
    ['deaths', 42],
    ['collections', 47],
  ] as [CatalogType, number][])('%s catalog has %d items', (type, expected) => {
    expect(CATALOG_BY_TYPE[type]).toHaveLength(expected)
  })

  test('getCatalogType extracts prefix correctly', () => {
    expect(getCatalogType('skills:Cooking')).toBe('skills')
    expect(getCatalogType('deaths:Fire')).toBe('deaths')
  })

  test('getGoalTypeForItem resolves goal type', () => {
    expect(getGoalTypeForItem('skills:Cooking')).toBe('skills_completed')
    expect(getGoalTypeForItem('deaths:Fire')).toBe('deaths_collected')
    expect(getGoalTypeForItem('parties:Dinner Party')).toBe('parties_hosted')
  })
})
