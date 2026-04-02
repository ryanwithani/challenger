import type { ChecklistItem, CatalogType } from './types'
import { SKILLS } from './skills'
import { ASPIRATIONS } from './aspirations'
import { CAREERS } from './careers'
import { PARTIES } from './parties'
import { TRAITS } from './traits'
import { DEATHS } from './deaths'
import { COLLECTIONS } from './collections'

export type { ChecklistItem, CatalogType }
export { CATEGORY_GOAL_MAP, CHECKLIST_CATEGORIES, CATEGORY_LABELS, getCatalogType, getGoalTypeForItem } from './goalMapping'

/** Per-category arrays for iteration and display */
export const CATALOG_BY_TYPE: Record<CatalogType, readonly ChecklistItem[]> = {
  skills: SKILLS,
  aspirations: ASPIRATIONS,
  careers: CAREERS,
  parties: PARTIES,
  traits: TRAITS,
  deaths: DEATHS,
  collections: COLLECTIONS,
}

/** Flat lookup by item key — O(1) access */
export const CATALOG: Record<string, ChecklistItem> = Object.fromEntries(
  Object.values(CATALOG_BY_TYPE)
    .flat()
    .map(item => [item.key, item])
)

/** All catalog items as a flat array */
export const ALL_ITEMS: readonly ChecklistItem[] = Object.values(CATALOG_BY_TYPE).flat()

/** Total number of items across all catalogs */
export const CATALOG_SIZE = ALL_ITEMS.length
