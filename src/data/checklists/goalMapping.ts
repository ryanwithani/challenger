import type { CatalogType } from './types'

/**
 * Maps each catalog type to the goal_type string used in the goals table.
 * When a checklist item is completed, the system extracts the catalog prefix
 * from the item key and looks up which goal counter to increment.
 */
export const CATEGORY_GOAL_MAP: Record<CatalogType, string> = {
  skills: 'skills_completed',
  aspirations: 'aspirations_completed',
  careers: 'careers_completed',
  parties: 'parties_hosted',
  deaths: 'deaths_collected',
  traits: 'traits_collected',
  collections: 'collections_completed',
} as const

/** Ordered list of checklist categories for tab display */
export const CHECKLIST_CATEGORIES: CatalogType[] = [
  'skills',
  'aspirations',
  'careers',
  'parties',
  'traits',
  'deaths',
  'collections',
]

/** Display labels for each category */
export const CATEGORY_LABELS: Record<CatalogType, string> = {
  skills: 'Skills',
  aspirations: 'Aspirations',
  careers: 'Careers',
  parties: 'Parties',
  traits: 'Traits',
  deaths: 'Deaths',
  collections: 'Collections',
}

/**
 * Extracts the catalog type from an item key.
 * "skills:Cooking" -> "skills"
 */
export function getCatalogType(itemKey: string): CatalogType {
  return itemKey.split(':')[0] as CatalogType
}

/**
 * Resolves the goal_type for a given item key.
 * "skills:Cooking" -> "skills_completed"
 */
export function getGoalTypeForItem(itemKey: string): string | undefined {
  const catalogType = getCatalogType(itemKey)
  return CATEGORY_GOAL_MAP[catalogType]
}
